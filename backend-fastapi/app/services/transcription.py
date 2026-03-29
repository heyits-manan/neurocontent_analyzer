import asyncio
from pathlib import Path

from faster_whisper import WhisperModel

from app.config import get_settings

_whisper_model = None


def get_whisper_model() -> WhisperModel:
    global _whisper_model

    if _whisper_model is None:
        settings = get_settings()
        print(f"Using device: {settings.whisper_device}")
        print(f"Using gemini model: {settings.gemini_model}")
        _whisper_model = WhisperModel(
            settings.whisper_model_size,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )

    return _whisper_model


def _transcribe_audio(audio_path: Path) -> list[dict]:
    model = get_whisper_model()
    segments, _ = model.transcribe(str(audio_path), vad_filter=True)

    transcript_segments = []
    for segment in segments:
        transcript_segments.append(
            {
                "text": segment.text.strip(),
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
            }
        )

    return transcript_segments


async def transcribe_audio(audio_path: Path) -> list[dict]:
    return await asyncio.to_thread(_transcribe_audio, audio_path)
