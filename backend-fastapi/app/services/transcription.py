import asyncio
import os
from pathlib import Path

from faster_whisper import WhisperModel


_whisper_model = None


def get_whisper_model() -> WhisperModel:
    global _whisper_model

    if _whisper_model is None:
        model_size = os.getenv("WHISPER_MODEL_SIZE", "small")
        device = os.getenv("WHISPER_DEVICE", "auto")
        compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
        _whisper_model = WhisperModel(model_size, device=device, compute_type=compute_type)

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
