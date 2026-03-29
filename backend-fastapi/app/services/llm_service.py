import asyncio
import json
from typing import List

from pydantic import BaseModel, Field
import requests
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)


class SegmentFeedback(BaseModel):
    issue: str = Field(description="Short label for the main problem in this teaching segment.")
    reason: str = Field(description="Brief explanation of why the segment needs improvement.")
    suggestion: str = Field(description="Concrete action the creator should take to improve the segment.")
    rewrite: str = Field(description="A short improved rewrite or direction for the segment.")

def _generate_feedback_for_segment(segment: dict) -> SegmentFeedback:
    settings = get_settings()

    if not settings.gemini_api_key:
        return SegmentFeedback(
            issue=segment["issue"],
            reason=(
                "Gemini feedback is not configured, so this explanation is based on "
                "the current heuristic analysis."
            ),
            suggestion=segment["suggestion"],
            rewrite=(
                "Reduce the information density, add a clearer transition, and end "
                "with one explicit takeaway."
            ),
        )

    prompt = f"""
You are improving an educational video segment for clarity, pacing, and retention.

Return structured feedback for this segment.

Segment timing: {segment["start"]}s to {segment["end"]}s
Transcript:
{segment["text"]}

Diagnostics:
- cognitive load: {segment["load"]}
- attention: {segment["attention"]}
- heuristic issue: {segment["issue"]}
- heuristic suggestion: {segment["suggestion"]}
- words per second: {segment.get("words_per_second", 0)}
- average sentence length: {segment.get("avg_sentence_length", 0)}
- cue word hits: {segment.get("cue_word_hits", 0)}

Keep the feedback concise, practical, and written for a course creator.
""".strip()

    logger.info(f"Generating feedback for segment {segment['start']}-{segment['end']} using Gemini")
    try:
        response_text = _call_gemini(
            api_key=settings.gemini_api_key,
            model=settings.gemini_model,
            prompt=prompt,
            response_schema=SegmentFeedback.model_json_schema(),
        )
        logger.debug(f"Gemini feedback response: {response_text}")
        return SegmentFeedback.model_validate_json(response_text)
    except Exception as e:
        logger.exception(f"Failed to generate feedback for segment {segment['start']}-{segment['end']}")
        raise


async def enrich_with_llm_feedback(segments: List[dict]) -> List[dict]:
    enriched_segments = []

    for segment in segments:
        feedback = await asyncio.to_thread(_generate_feedback_for_segment, segment)
        enriched_segments.append(
            {
                **segment,
                "issue": feedback.issue,
                "reason": feedback.reason,
                "suggestion": feedback.suggestion,
                "rewrite": feedback.rewrite,
            }
        )

    return enriched_segments


def _generate_summary_with_gemini(segments: List[dict]) -> str:
    settings = get_settings()

    if not settings.gemini_api_key:
        return _generate_fallback_summary(segments)

    prompt_lines = [
        "Summarize the most important improvement priorities for this educational video in 2-3 sentences.",
        "Focus on teaching clarity, pacing, and retention.",
        "Segment findings:",
    ]

    prompt_lines.extend(
        [
            (
                f"- {segment['start']}s to {segment['end']}s | "
                f"load={segment['load']} | attention={segment['attention']} | "
                f"issue={segment['issue']} | suggestion={segment['suggestion']}"
            )
            for segment in segments
        ]
    )

    logger.info("Generating overall summary with Gemini")
    try:
        summary = _call_gemini(
            api_key=settings.gemini_api_key,
            model=settings.gemini_model,
            prompt="\n".join(prompt_lines),
        ).strip()
        logger.debug(f"Gemini summary response: {summary}")
        return summary
    except Exception as e:
        logger.exception("Failed to generate summary with Gemini")
        raise


def _generate_fallback_summary(segments: List[dict]) -> str:
    high_load_count = sum(1 for segment in segments if segment["load"] == "high")
    low_attention_count = sum(1 for segment in segments if segment["attention"] == "low")
    medium_attention_count = sum(1 for segment in segments if segment["attention"] == "medium")

    return (
        "Heuristic summary: "
        f"{high_load_count} segment(s) need simplification, "
        f"{low_attention_count} segment(s) show a clear attention drop, and "
        f"{medium_attention_count} segment(s) would benefit from tighter pacing."
    )


async def generate_summary(segments: List[dict]) -> str:
    return await asyncio.to_thread(_generate_summary_with_gemini, segments)


def _call_gemini(
    api_key: str,
    model: str,
    prompt: str,
    response_schema: dict | None = None,
) -> str:
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt,
                    }
                ]
            }
        ]
    }

    if response_schema is not None:
        payload["generationConfig"] = {
            "responseMimeType": "application/json",
            "responseJsonSchema": response_schema,
        }

    logger.debug(f"Sending request to Gemini API ({model})")
    response = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        },
        data=json.dumps(payload),
        timeout=60,
    )
    
    if not response.ok:
        logger.error(f"Gemini API returned {response.status_code}")
        logger.error(f"Response body: {response.text}")
        response.raise_for_status()
        
    response_payload = response.json()

    return response_payload["candidates"][0]["content"]["parts"][0]["text"]
