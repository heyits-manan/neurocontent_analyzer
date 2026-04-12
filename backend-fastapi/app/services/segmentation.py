import math
from typing import List


TARGET_WINDOW_SECONDS = 30
MAX_WINDOW_WORDS = 120


async def create_segments(transcript_segments: List[dict]) -> List[dict]:
    # Filter out segments with NaN start/end (can come from TRIBE events pipeline)
    clean_segments = [
        s for s in transcript_segments
        if not math.isnan(s.get("start", 0)) and not math.isnan(s.get("end", 0))
    ]

    if clean_segments:
        grouped_segments = []
        current_window = []
        current_start = clean_segments[0]["start"]

        for transcript_segment in clean_segments:
            candidate_segments = current_window + [transcript_segment]
            candidate_start = current_start if current_window else transcript_segment["start"]
            candidate_end = transcript_segment["end"]
            candidate_duration = max(candidate_end - candidate_start, 1)
            candidate_word_count = sum(
                len(segment["text"].split()) for segment in candidate_segments
            )

            should_flush_window = (
                current_window
                and (
                    candidate_duration >= TARGET_WINDOW_SECONDS
                    or candidate_word_count >= MAX_WINDOW_WORDS
                )
            )

            if should_flush_window:
                grouped_segments.append(_build_segment_window(current_window))
                current_window = [transcript_segment]
                current_start = transcript_segment["start"]
                continue

            current_window = candidate_segments

        if current_window:
            grouped_segments.append(_build_segment_window(current_window))

        return grouped_segments

    return [
        {
            "start": 0,
            "end": 10,
            "text": "No transcription segments were produced.",
            "word_count": 0,
            "duration": 10,
            "sentence_count": 1,
            "words_per_second": 0,
            "avg_sentence_length": 0,
            "cue_word_hits": 0,
        }
    ]


def _safe_int(value, fallback: int = 0) -> int:
    """Convert a float to int, treating NaN/Inf as the fallback."""
    try:
        if math.isnan(value) or math.isinf(value):
            return fallback
        return int(round(value))
    except (TypeError, ValueError):
        return fallback


def _build_segment_window(transcript_window: List[dict]) -> dict:
    text = " ".join(segment["text"].strip() for segment in transcript_window if segment["text"].strip())
    start = _safe_int(transcript_window[0]["start"], 0)
    end = max(_safe_int(transcript_window[-1]["end"], start + 1), start + 1)
    duration = max(end - start, 1)
    word_count = len(text.split())
    sentence_count = max(_count_sentences(text), 1)
    cue_word_hits = _count_cue_words(text)

    return {
        "start": start,
        "end": end,
        "text": text,
        "word_count": word_count,
        "duration": duration,
        "sentence_count": sentence_count,
        "words_per_second": round(word_count / duration, 2),
        "avg_sentence_length": round(word_count / sentence_count, 2),
        "cue_word_hits": cue_word_hits,
    }


def _count_sentences(text: str) -> int:
    sentence_endings = [".", "!", "?"]
    return sum(text.count(character) for character in sentence_endings)


def _count_cue_words(text: str) -> int:
    cue_words = [
        "remember",
        "key point",
        "in summary",
        "to recap",
        "important",
        "takeaway",
    ]
    normalized_text = text.lower()
    return sum(normalized_text.count(cue_word) for cue_word in cue_words)
