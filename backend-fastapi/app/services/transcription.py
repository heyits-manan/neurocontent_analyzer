from pathlib import Path


async def mock_transcription(video_path: Path) -> str:
    filename = video_path.stem.replace("-", " ")
    return (
        f"Mock Whisper transcript for {filename}. "
        "This lesson introduces a dense concept, moves quickly into examples, "
        "and finishes with a summary that could use stronger reinforcement."
    )

