import os
from pathlib import Path

# We don't import from app.config so this can run standalone during docker build
WHISPER_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
TRIBE_MODEL = os.getenv("TRIBE_MODEL_ID", "facebook/tribev2")
CACHE_DIR = os.getenv("TRIBE_CACHE_DIR", "./cache")

def download_whisper():
    # Whisper uses the default HuggingFace cache structure
    # e.g., ~/.cache/huggingface/hub/models--Systran--faster-whisper-small
    hf_cache_dir = Path("~/.cache/huggingface/hub").expanduser()
    expected_whisper_folder = hf_cache_dir / f"models--Systran--faster-whisper-{WHISPER_SIZE}"

    if expected_whisper_folder.exists():
        print(f"✅ Whisper model ({WHISPER_SIZE}) already exists in cache. Skipping download.")
        return

    print(f"\n1. Downloading Whisper model ({WHISPER_SIZE})...")
    from faster_whisper import WhisperModel
    
    # This triggers the download
    WhisperModel(model_size_or_path=WHISPER_SIZE, device="cpu", compute_type="int8")
    print("✅ Whisper downloaded successfully.")


def download_tribe():
    # TRIBE uses our custom cache folder, mapped internally to huggingface folder structure
    # e.g., ./cache/models--facebook--tribev2
    cache_path = Path(CACHE_DIR)
    expected_tribe_folder = cache_path / f"models--{TRIBE_MODEL.replace('/', '--')}"

    if expected_tribe_folder.exists():
        print(f"✅ TRIBE v2 model ({TRIBE_MODEL}) already exists in {cache_path}. Skipping download.")
        return

    print(f"\n2. Downloading TRIBE v2 model ({TRIBE_MODEL})...")
    from tribev2.demo_utils import TribeModel
    
    cache_path.mkdir(parents=True, exist_ok=True)
    
    # This triggers the download
    TribeModel.from_pretrained(TRIBE_MODEL, cache_folder=str(cache_path))
    print(f"✅ TRIBE downloaded successfully to {cache_path.resolve()}")


if __name__ == "__main__":
    print("Checking and downloading models if missing...")
    download_whisper()
    download_tribe()
    print("Model check complete.")
