from typing import List


async def generate_summary(segments: List[dict]) -> str:
    high_load_count = sum(1 for segment in segments if segment["load"] == "high")
    low_attention_count = sum(1 for segment in segments if segment["attention"] == "low")
    medium_attention_count = sum(1 for segment in segments if segment["attention"] == "medium")

    return (
        "Mock LLM summary: "
        f"{high_load_count} segment(s) need simplification, "
        f"{low_attention_count} segment(s) show a clear attention drop, and "
        f"{medium_attention_count} segment(s) would benefit from tighter pacing."
    )
