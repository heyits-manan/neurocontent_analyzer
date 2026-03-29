from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "NeuroContent Analyzer FastAPI"
    app_env: str = "development"
    whisper_model_size: str = "small"
    whisper_compute_type: str = "int8"
    whisper_device: str = "cpu"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
