import logging
import tempfile
import shutil
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
    try:
        # Mark as processing
        update_job_status(job_id, "processing")

        # Download video to a temp directory
        tmp_dir = tempfile.mkdtemp(prefix=f"ncjob-{job_id}-")
        tmp_video_path = Path(tmp_dir) / "source_video.mp4"

        logger.info(f"[{job_id}] Downloading video from signed URL")
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream("GET", video_url) as response:
                response.raise_for_status()
                with open(tmp_video_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        f.write(chunk)

        logger.info(f"[{job_id}] Video downloaded to {tmp_video_path}")

        # Run the analysis pipeline
        pipeline_result = await run_analysis_pipeline(str(tmp_video_path))

        # Upload generated audio to artifacts bucket if present
        audio_storage_path = None
        audio_path = pipeline_result.get("audio_path")
        if audio_path and Path(audio_path).exists():
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
        write_success(
            job_id,
            audio_storage_path=audio_storage_path,
            transcript=transcript_payload,
            results=results_payload,
        )

        logger.info(f"[{job_id}] Analysis complete and results persisted")

    except Exception as exc:
        logger.exception(f"[{job_id}] Analysis background task failed")
        try:
            write_failure(job_id, str(exc))
        except Exception:
            logger.exception(f"[{job_id}] Failed to write failure status")
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
