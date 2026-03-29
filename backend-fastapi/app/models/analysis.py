from typing import List

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    video_path: str = Field(..., min_length=1)


class TranscriptSegment(BaseModel):
    text: str
    start: float
    end: float


class SegmentAnalysis(BaseModel):
    start: int
    end: int
    load: str
    attention: str
    issue: str
    suggestion: str


class AnalyzeResponse(BaseModel):
    video_path: str
    audio_path: str
    transcript: List[TranscriptSegment]
    segments: List[SegmentAnalysis]
    summary: str
