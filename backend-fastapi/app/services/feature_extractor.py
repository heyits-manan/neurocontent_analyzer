from typing import List


async def enrich_segments(segments: List[dict]) -> List[dict]:
    enriched_segments = []

    for segment in segments:
        issue = "Balanced section"
        suggestion = "Keep this pacing and reinforce with a visual cue."

        if segment["load"] == "high":
            issue = "Too dense"
            suggestion = "Simplify the explanation and reduce concept stacking."
        elif segment["attention"] == "medium":
            issue = "Momentum dip"
            suggestion = "Tighten pacing and add a sharper transition."
        elif segment["attention"] == "high":
            issue = "Weak retention"
            suggestion = "End with a stronger recap and one clear takeaway."

        enriched_segments.append(
            {
                "start": segment["start"],
                "end": segment["end"],
                "load": segment["load"],
                "attention": segment["attention"],
                "issue": issue,
                "suggestion": suggestion,
            }
        )

    return enriched_segments

