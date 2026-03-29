from typing import List

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    video_path: str = Field(..., min_length=1)


class SegmentAnalysis(BaseModel):
    start: int
    end: int
    load: str
    attention: str
    issue: str
    suggestion: str


class AnalyzeResponse(BaseModel):
    video_path: str
    transcript: str
    segments: List[SegmentAnalysis]
    summary: str

