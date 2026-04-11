import copy
import logging
from pathlib import Path

import pandas as pd
from neuralset.events.transforms import (
    AddContextToWords,
    AddSentenceToWords,
    AddText,
    ChunkEvents,
    EventsTransform,
    ExtractAudioFromVideo,
    RemoveMissing,
)
from neuralset.events.utils import standardize_events
from tqdm import tqdm

from app.config import get_settings
from app.services.transcription import get_whisper_model


logger = logging.getLogger(__name__)


class ConfigurableExtractWordsFromAudio(EventsTransform):
    overwrite: bool = False

    @staticmethod
    def _get_transcript_from_audio(wav_filename: Path) -> pd.DataFrame:
        settings = get_settings()
        logger.info(
            "Running faster-whisper for %s with model=%s device=%s compute_type=%s",
            wav_filename.name,
            settings.whisper_model_size,
            settings.whisper_device,
            settings.whisper_compute_type,
        )
        model = get_whisper_model()
        segments, _ = model.transcribe(
            str(wav_filename),
            vad_filter=True,
            word_timestamps=True,
        )
        words = []
        for i, segment in enumerate(segments):
            sentence = segment.text.strip().replace('"', "")
            segment_words = getattr(segment, "words", None) or []

            if not segment_words and sentence:
                words.append(
                    {
                        "text": sentence,
                        "start": segment.start,
                        "duration": max(segment.end - segment.start, 0.1),
                        "sequence_id": i,
                        "sentence": sentence,
                    }
                )
                continue

            for word in segment_words:
                if word.start is None or word.end is None:
                    continue
                words.append(
                    {
                        "text": word.word.strip().replace('"', ""),
                        "start": word.start,
                        "duration": word.end - word.start,
                        "sequence_id": i,
                        "sentence": sentence,
                    }
                )

        return pd.DataFrame(words)

    def _run(self, events: pd.DataFrame) -> pd.DataFrame:
        if "Word" in events.type.unique():
            logger.warning("Words already present in the events dataframe, skipping")
            return events

        audio_events = events.loc[events.type == "Audio"]
        transcripts = {}

        for wav_filename in tqdm(
            audio_events.filepath.unique(),
            total=len(audio_events.filepath.unique()),
            desc="Extracting words from audio",
        ):
            wav_filename = Path(wav_filename)
            transcript_filename = wav_filename.with_suffix(".tsv")

            if transcript_filename.exists() and not self.overwrite:
                try:
                    transcript = pd.read_csv(transcript_filename, sep="\t")
                except pd.errors.EmptyDataError:
                    transcript = pd.DataFrame()
                    logger.warning("Empty transcript file %s", transcript_filename)
            else:
                transcript = self._get_transcript_from_audio(wav_filename)
                transcript.to_csv(transcript_filename, sep="\t", index=False)
                logger.info("Wrote transcript to %s", transcript_filename)

            transcripts[str(wav_filename)] = transcript

        all_transcripts = []
        for audio_event in audio_events.itertuples():
            transcript = copy.deepcopy(transcripts[audio_event.filepath])
            if len(transcript) == 0:
                continue

            for k, v in audio_event._asdict().items():
                if k in ("frequency", "filepath", "type", "start", "duration", "offset"):
                    continue
                transcript.loc[:, k] = v

            transcript["type"] = "Word"
            transcript["language"] = "english"
            transcript["start"] += audio_event.start + audio_event.offset
            all_transcripts.append(transcript)

        if all_transcripts:
            events = pd.concat([events, pd.concat(all_transcripts)], ignore_index=True)
        else:
            logger.warning("No transcripts found, skipping")

        return events


def build_video_events_dataframe(video_path: Path) -> pd.DataFrame:
    event = {
        "type": "Video",
        "filepath": str(video_path),
        "start": 0,
        "timeline": "default",
        "subject": "default",
    }
    transforms = [
        ExtractAudioFromVideo(),
        ChunkEvents(event_type_to_chunk="Audio", max_duration=60, min_duration=30),
        ChunkEvents(event_type_to_chunk="Video", max_duration=60, min_duration=30),
        ConfigurableExtractWordsFromAudio(),
        AddText(),
        AddSentenceToWords(max_unmatched_ratio=0.05),
        AddContextToWords(sentence_only=False, max_context_len=1024, split_field=""),
        RemoveMissing(),
    ]

    events = standardize_events(pd.DataFrame([event]))
    for transform in transforms:
        logger.info("Applying TRIBE event transform: %s", transform.__class__.__name__)
        events = transform(events)

    return standardize_events(events)
