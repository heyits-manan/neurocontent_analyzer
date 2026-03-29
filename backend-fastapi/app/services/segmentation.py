from typing import List


async def create_segments(transcript_segments: List[dict]) -> List[dict]:
    if transcript_segments:
        return [
            {
                "start": int(segment["start"]),
                "end": max(int(segment["end"]), int(segment["start"]) + 1),
                "text": segment["text"],
            }
            for segment in transcript_segments
        ]

    return [
        {
            "start": 0,
            "end": 10,
            "text": "No transcription segments were produced.",
        }
    ]
