import asyncio
import subprocess
from pathlib import Path


def _extract_audio(video_path: Path) -> Path:
    audio_path = video_path.with_suffix(".wav")

    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(video_path),
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        str(audio_path),
    ]

    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
    except FileNotFoundError as exc:
        raise RuntimeError("ffmpeg is not installed or not available in PATH") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"ffmpeg audio extraction failed: {exc.stderr.strip()}") from exc

    return audio_path


async def extract_audio(video_path: Path) -> Path:
    return await asyncio.to_thread(_extract_audio, video_path)
