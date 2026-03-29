from fastapi import APIRouter, HTTPException

from app.models.analysis import AnalyzeRequest, AnalyzeResponse
from app.services.pipeline import run_analysis_pipeline

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_video(payload: AnalyzeRequest):
    try:
        return await run_analysis_pipeline(payload.video_path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Analysis pipeline failed") from exc

