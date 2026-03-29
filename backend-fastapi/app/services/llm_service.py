from typing import List


async def generate_summary(segments: List[dict]) -> str:
    high_load_count = sum(1 for segment in segments if segment["load"] == "high")
    high_attention_count = sum(1 for segment in segments if segment["attention"] == "high")

    return (
        "Mock LLM summary: "
        f"{high_load_count} segment(s) need simplification and "
        f"{high_attention_count} segment(s) could benefit from stronger retention cues."
    )

