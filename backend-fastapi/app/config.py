from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "NeuroContent Analyzer FastAPI"
    app_env: str = "development"
    whisper_model_size: str = "small"
    whisper_compute_type: str = "int8"
    whisper_device: str = "cpu"
    tribe_enabled: bool = True
    tribe_model_id: str = "facebook/tribev2"
    tribe_cache_dir: str = "./cache"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
