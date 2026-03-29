from typing import List


async def create_segments(transcript: str) -> List[dict]:
    transcript_parts = [
        "The opening introduces too many ideas at once.",
        "The middle section uses examples but pacing is inconsistent.",
        "The closing summary is concise but misses a memorable recap.",
    ]

    segments = []
    for index, content in enumerate(transcript_parts):
        start = index * 10
        end = start + 10
        segments.append(
            {
                "start": start,
                "end": end,
                "text": f"{content} Source transcript: {transcript}",
            }
        )

    return segments

