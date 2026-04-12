import logging
import sys

from fastapi import FastAPI

from app.routes.analysis import router as analysis_router

# Configure root logger so all app.services.* loggers actually output
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
# Quieten noisy third-party loggers
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("hf_xet").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="NeuroContent Analyzer FastAPI",
    version="1.0.0",
)


@app.get("/health")
async def health_check():
    return {"success": True, "message": "FastAPI backend is healthy"}


app.include_router(analysis_router)
