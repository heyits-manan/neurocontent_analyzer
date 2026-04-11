from fastapi import FastAPI

from app.routes.analysis import router as analysis_router


app = FastAPI(
    title="NeuroContent Analyzer FastAPI",
    version="1.0.0",
)


@app.get("/health")
async def health_check():
    return {"success": True, "message": "FastAPI backend is healthy"}


app.include_router(analysis_router)
