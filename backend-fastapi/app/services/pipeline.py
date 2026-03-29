from pathlib import Path

from app.models.analysis import AnalyzeResponse
from app.services.feature_extractor import enrich_segments
from app.services.llm_service import generate_summary
from app.services.segmentation import create_segments
from app.services.transcription import mock_transcription
from app.services.tribe_service import score_segments


async def run_analysis_pipeline(video_path: str) -> AnalyzeResponse:
    resolved_path = Path(video_path)

    if not resolved_path.exists():
        raise FileNotFoundError(f"Video file does not exist at path: {video_path}")

    transcript = await mock_transcription(resolved_path)
    segments = await create_segments(transcript)
    tribe_segments = await score_segments(segments)
    enriched_segments = await enrich_segments(tribe_segments)
    summary = await generate_summary(enriched_segments)

    return AnalyzeResponse(
        video_path=str(resolved_path),
        transcript=transcript,
        segments=enriched_segments,
        summary=summary,
    )
