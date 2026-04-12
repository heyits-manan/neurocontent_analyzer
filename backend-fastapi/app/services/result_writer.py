import logging
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.supabase_client import supabase, ARTIFACTS_BUCKET

logger = logging.getLogger(__name__)


def _sanitize_for_json(obj: Any) -> Any:
    """Recursively replace NaN/Inf floats with None (JSON doesn't support them)."""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize_for_json(item) for item in obj]
    return obj


def update_job_status(job_id: str, status: str, **fields: Any) -> None:
    """Update a job row in Supabase Postgres."""
    payload: Dict[str, Any] = _sanitize_for_json({"status": status, **fields})

    result = supabase.table("jobs").update(payload).eq("id", job_id).execute()

    if not result.data:
        logger.warning(f"Job {job_id} update returned no data (may not exist)")


def upload_artifact(job_id: str, local_path: Path, artifact_name: str) -> str:
    """Upload a local file to the artifacts bucket and return the storage path."""
    storage_path = f"{job_id}/{artifact_name}"

    with open(local_path, "rb") as f:
        file_bytes = f.read()

    result = supabase.storage.from_(ARTIFACTS_BUCKET).upload(
        storage_path,
        file_bytes,
        file_options={"content-type": "audio/wav", "upsert": "true"},
    )

    logger.info(f"Uploaded artifact to {ARTIFACTS_BUCKET}/{storage_path}")
    return storage_path


def write_success(
    job_id: str,
    audio_storage_path: Optional[str],
    transcript: List[dict],
    results: dict,
) -> None:
    """Mark a job as completed and persist all results."""
    update_job_status(
        job_id,
        "completed",
        audio_storage_path=audio_storage_path,
        transcript_json=transcript,
        results_json=results,
        error=None,
        processed_at=datetime.now(timezone.utc).isoformat(),
    )
    logger.info(f"Job {job_id} marked as completed")


def write_failure(job_id: str, error_message: str) -> None:
    """Mark a job as failed with an error message."""
    update_job_status(
        job_id,
        "failed",
        error=error_message,
    )
    logger.error(f"Job {job_id} marked as failed: {error_message}")
