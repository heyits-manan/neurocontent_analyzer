from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analysis import router as analysis_router


app = FastAPI(
    title="NeuroContent Analyzer FastAPI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"success": True, "message": "FastAPI backend is healthy"}


app.include_router(analysis_router)

