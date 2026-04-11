from pathlib import Path

from app.services.feature_extractor import enrich_segments
from app.services.llm_service import enrich_with_llm_feedback, generate_summary
from app.services.segmentation import create_segments
from app.services.tribe_service import extract_transcript_from_video, score_segments
import logging

logger = logging.getLogger(__name__)


async def run_analysis_pipeline(video_path: str) -> dict:
    """Run the full analysis pipeline and return a dict of results.

    Returns a dict with keys: audio_path, transcript, segments, summary.
    The caller is responsible for persisting results and uploading artifacts.
    """
    resolved_path = Path(video_path)

    if not resolved_path.exists():
        raise FileNotFoundError(f"Video file does not exist at path: {video_path}")

    logger.info(f"Starting pipeline for video: {video_path}")
    transcript, events_df = await extract_transcript_from_video(resolved_path)
    logger.info(f"Transcription complete: {len(transcript)} segments")

    segments = await create_segments(transcript)
    logger.info(f"Segmentation complete: {len(segments)} blocks")

    tribe_segments = await score_segments(resolved_path, segments, events_df=events_df)
    heuristic_segments = await enrich_segments(tribe_segments)

    logger.info("Enriching segments with LLM feedback")
    enriched_segments = await enrich_with_llm_feedback(heuristic_segments)

    logger.info("Generating LLM summary")
    summary = await generate_summary(enriched_segments)

    logger.info("Pipeline complete")

    return {
        "audio_path": None,
        "transcript": transcript,
        "segments": enriched_segments,
        "summary": summary,
    }
