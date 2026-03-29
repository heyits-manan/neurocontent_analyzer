from typing import List


async def score_segments(segments: List[dict]) -> List[dict]:
    profiles = [
        {"load": "high", "attention": "low"},
        {"load": "medium", "attention": "medium"},
        {"load": "low", "attention": "high"},
    ]

    scored_segments = []
    for index, segment in enumerate(segments):
        scored_segments.append(
            {
                **segment,
                **profiles[index % len(profiles)],
            }
        )

    return scored_segments

