import asyncio
from pathlib import Path
from typing import List

import numpy as np

from app.config import get_settings


_tribe_model = None


async def score_segments(video_path: Path, segments: List[dict]) -> List[dict]:
    tribe_metrics = await _predict_tribe_metrics(video_path, segments)

    scored_segments = []
    for index, segment in enumerate(segments):
        heuristic_load = _classify_load(segment)
        heuristic_attention = _classify_attention(segment)
        metric = tribe_metrics[index] if index < len(tribe_metrics) else None

        load = heuristic_load
        attention = heuristic_attention
        tribe_signal_strength = None
        tribe_signal_variation = None
        tribe_source = "heuristic"

        if metric is not None:
            tribe_signal_strength = metric["signal_strength"]
            tribe_signal_variation = metric["signal_variation"]
            load = _merge_load_signal(heuristic_load, metric)
            attention = _merge_attention_signal(heuristic_attention, metric)
            tribe_source = "tribe_v2"

        scored_segments.append(
            {
                **segment,
                "load": load,
                "attention": attention,
                "tribe_source": tribe_source,
                "tribe_signal_strength": tribe_signal_strength,
                "tribe_signal_variation": tribe_signal_variation,
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


async def _predict_tribe_metrics(video_path: Path, segments: List[dict]) -> List[dict]:
    settings = get_settings()

    if not settings.tribe_enabled:
        return []

    try:
        return await asyncio.to_thread(_run_tribe_prediction, video_path, segments)
    except Exception:
        return []


def _run_tribe_prediction(video_path: Path, segments: List[dict]) -> List[dict]:
    model = _get_tribe_model()
    if model is None:
        return []

    events_df = model.get_events_dataframe(video_path=str(video_path))
    preds, tribe_segments = model.predict(events=events_df)
    preds_array = np.asarray(preds)

    if preds_array.ndim != 2 or preds_array.shape[0] == 0:
        return []

    aligned_metrics = []
    tribe_ranges = _extract_tribe_ranges(tribe_segments, preds_array.shape[0])

    for segment in segments:
        overlap_indexes = [
            index
            for index, tribe_range in enumerate(tribe_ranges)
            if _ranges_overlap(
                segment["start"],
                segment["end"],
                tribe_range["start"],
                tribe_range["end"],
            )
        ]

        if not overlap_indexes:
            aligned_metrics.append(None)
            continue

        window = preds_array[overlap_indexes, :]
        signal_strength = float(np.mean(np.abs(window)))
        signal_variation = float(np.std(window))

        aligned_metrics.append(
            {
                "signal_strength": round(signal_strength, 4),
                "signal_variation": round(signal_variation, 4),
            }
        )

    valid_strengths = [metric["signal_strength"] for metric in aligned_metrics if metric]
    valid_variations = [metric["signal_variation"] for metric in aligned_metrics if metric]

    if not valid_strengths or not valid_variations:
        return []

    strength_thresholds = _compute_thresholds(valid_strengths)
    variation_thresholds = _compute_thresholds(valid_variations)

    normalized_metrics = []
    for metric in aligned_metrics:
        if metric is None:
            normalized_metrics.append(None)
            continue

        normalized_metrics.append(
            {
                **metric,
                "strength_band": _bucketize(metric["signal_strength"], strength_thresholds),
                "variation_band": _bucketize(metric["signal_variation"], variation_thresholds),
            }
        )

    return normalized_metrics


def _get_tribe_model():
    global _tribe_model

    if _tribe_model is not None:
        return _tribe_model

    try:
        from tribev2 import TribeModel
    except ImportError:
        return None

    settings = get_settings()
    _tribe_model = TribeModel.from_pretrained(
        settings.tribe_model_id,
        cache_folder=settings.tribe_cache_dir,
    )
    return _tribe_model


def _extract_tribe_ranges(tribe_segments, default_length: int) -> List[dict]:
    ranges = []

    for index in range(default_length):
        segment = tribe_segments[index] if index < len(tribe_segments) else None

        if segment is None:
            ranges.append({"start": float(index), "end": float(index + 1)})
            continue

        if isinstance(segment, dict):
            start = segment.get("start") or segment.get("onset") or segment.get("t_start") or index
            end = segment.get("end") or segment.get("offset") or segment.get("t_end") or (index + 1)
        else:
            start = getattr(segment, "start", getattr(segment, "onset", index))
            end = getattr(segment, "end", getattr(segment, "offset", index + 1))

        ranges.append({"start": float(start), "end": float(end)})

    return ranges


def _ranges_overlap(start_a: float, end_a: float, start_b: float, end_b: float) -> bool:
    return max(start_a, start_b) < min(end_a, end_b)


def _compute_thresholds(values: List[float]) -> tuple[float, float]:
    sorted_values = sorted(values)
    low_index = max(int(len(sorted_values) * 0.33) - 1, 0)
    high_index = max(int(len(sorted_values) * 0.66) - 1, 0)
    return sorted_values[low_index], sorted_values[high_index]


def _bucketize(value: float, thresholds: tuple[float, float]) -> str:
    low_threshold, high_threshold = thresholds
    if value <= low_threshold:
        return "low"
    if value <= high_threshold:
        return "medium"
    return "high"


def _merge_load_signal(heuristic_load: str, metric: dict) -> str:
    if metric["strength_band"] == "high" or metric["variation_band"] == "high":
        return "high"
    if heuristic_load == "high":
        return "high"
    if metric["strength_band"] == "medium" or heuristic_load == "medium":
        return "medium"
    return "low"


def _merge_attention_signal(heuristic_attention: str, metric: dict) -> str:
    if metric["variation_band"] == "low" and metric["strength_band"] == "high":
        return "low"
    if heuristic_attention == "low":
        return "low"
    if metric["variation_band"] == "medium" or heuristic_attention == "medium":
        return "medium"
    return "high"
