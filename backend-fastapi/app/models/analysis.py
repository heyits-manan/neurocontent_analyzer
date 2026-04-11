from typing import List, Optional

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    job_id: str = Field(..., min_length=1)
    video_url: str = Field(..., min_length=1)


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
    reason: Optional[str] = None
    rewrite: Optional[str] = None


class AnalyzeResponse(BaseModel):
    job_id: str
    status: str
