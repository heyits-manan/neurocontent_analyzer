from typing import List


async def score_segments(segments: List[dict]) -> List[dict]:
    scored_segments = []
    for segment in segments:
        load = _classify_load(segment)
        attention = _classify_attention(segment)

        scored_segments.append(
            {
                **segment,
                "load": load,
                "attention": attention,
            }
        )

    return scored_segments


def _classify_load(segment: dict) -> str:
    if segment["words_per_second"] >= 2.8 or segment["avg_sentence_length"] >= 24:
        return "high"
    if segment["words_per_second"] >= 1.9 or segment["avg_sentence_length"] >= 16:
        return "medium"
    return "low"


def _classify_attention(segment: dict) -> str:
    if segment["duration"] >= 35 and segment["cue_word_hits"] == 0:
        return "low"
    if segment["duration"] >= 22 or segment["cue_word_hits"] == 0:
        return "medium"
    return "high"
