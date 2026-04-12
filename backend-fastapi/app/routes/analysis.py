import logging
import tempfile
import shutil
import time
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.models.analysis import AnalyzeRequest, AnalyzeResponse
from app.services.pipeline import run_analysis_pipeline
from app.services.result_writer import (
    update_job_status,
    upload_artifact,
    write_success,
    write_failure,
)

router = APIRouter()
logger = logging.getLogger(__name__)


async def _run_analysis_background(job_id: str, video_url: str) -> None:
    """Background task: download video, run pipeline, write results to Supabase."""
    tmp_dir = None
    t_start = time.monotonic()
    try:
        # Mark as processing
        update_job_status(job_id, "processing")
        logger.info("[%s] ── Job started ──", job_id)

        # Download video to a temp directory
        tmp_dir = tempfile.mkdtemp(prefix=f"ncjob-{job_id[:8]}-")
        tmp_video_path = Path(tmp_dir) / "source_video.mp4"

        logger.info("[%s] Downloading video from signed URL...", job_id)
        t0 = time.monotonic()
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream("GET", video_url) as response:
                response.raise_for_status()
                with open(tmp_video_path, "wb") as f:
                    total = 0
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        f.write(chunk)
                        total += len(chunk)
        logger.info("[%s] Video downloaded (%.1f MB) in %.1fs", job_id, total / 1e6, time.monotonic() - t0)

        # Run the analysis pipeline
        logger.info("[%s] Starting analysis pipeline...", job_id)
        t1 = time.monotonic()
        pipeline_result = await run_analysis_pipeline(str(tmp_video_path))
        logger.info("[%s] Pipeline completed in %.1fs", job_id, time.monotonic() - t1)

        # Upload generated audio to artifacts bucket if present
        audio_storage_path = None
        audio_path = pipeline_result.get("audio_path")
        if audio_path and Path(audio_path).exists():
            logger.info("[%s] Uploading audio artifact...", job_id)
            audio_storage_path = upload_artifact(
                job_id, Path(audio_path), "audio.wav"
            )

        # Build results payload
        results_payload = {
            "segments": [
                {
                    "start": s.get("start"),
                    "end": s.get("end"),
                    "load": s.get("load"),
                    "attention": s.get("attention"),
                    "issue": s.get("issue"),
                    "suggestion": s.get("suggestion"),
                    "reason": s.get("reason"),
                    "rewrite": s.get("rewrite"),
                }
                for s in pipeline_result.get("segments", [])
            ],
            "summary": pipeline_result.get("summary", ""),
        }

        transcript_payload = [
            {"text": t.get("text"), "start": t.get("start"), "end": t.get("end")}
            for t in pipeline_result.get("transcript", [])
        ]

        # Write success to Supabase
        logger.info("[%s] Writing results to Supabase...", job_id)
        write_success(
            job_id,
            audio_storage_path=audio_storage_path,
            transcript=transcript_payload,
            results=results_payload,
        )

        elapsed = time.monotonic() - t_start
        logger.info("[%s] ── Job complete ── (total %.1fs / %.1f min)", job_id, elapsed, elapsed / 60)

    except Exception as exc:
        elapsed = time.monotonic() - t_start
        logger.exception("[%s] ── Job FAILED after %.1fs ── %s", job_id, elapsed, exc)
        try:
            write_failure(job_id, str(exc))
        except Exception:
            logger.exception("[%s] Failed to write failure status", job_id)
    finally:
        # Cleanup temp directory
        if tmp_dir:
            shutil.rmtree(tmp_dir, ignore_errors=True)


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_video(payload: AnalyzeRequest, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(
            _run_analysis_background, payload.job_id, payload.video_url
        )
        return AnalyzeResponse(job_id=payload.job_id, status="processing")
    except Exception as exc:
        logger.exception("Failed to schedule analysis task")
        raise HTTPException(status_code=500, detail="Failed to start analysis") from exc
