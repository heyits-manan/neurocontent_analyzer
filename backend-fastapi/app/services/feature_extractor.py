from typing import List


async def enrich_segments(segments: List[dict]) -> List[dict]:
    enriched_segments = []

    for segment in segments:
        issue = "Balanced section"
        suggestion = "Keep this pacing and reinforce with a visual cue."

        if segment["load"] == "high" and segment["attention"] == "low":
            issue = "Dense and dragging"
            suggestion = (
                "Break this section into smaller beats, trim sentence length, "
                "and add a recap cue before moving on."
            )
        elif segment["load"] == "high":
            issue = "Too dense"
            suggestion = "Simplify the explanation and reduce concept stacking."
        elif segment["attention"] == "low":
            issue = "Attention drop"
            suggestion = (
                "Shorten the segment and add a hook, example, or explicit takeaway."
            )
        elif segment["attention"] == "medium":
            issue = "Momentum dip"
            suggestion = "Tighten pacing and add a sharper transition."
        elif segment["cue_word_hits"] == 0:
            issue = "Weak retention"
            suggestion = "End with a stronger recap and one clear takeaway."

        enriched_segments.append(
            {
                **segment,
                "issue": issue,
                "suggestion": suggestion,
            }
        )

    return enriched_segments
