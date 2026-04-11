FROM python:3.11-slim

# Install system dependencies (ffmpeg for audio extraction)
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for layer caching
COPY requirements.txt .

# Install torch first (tribev2 has a stale torch<2.7 pin)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install tribev2 without its strict torch constraint
RUN pip install --no-cache-dir --no-deps "tribev2 @ git+https://github.com/facebookresearch/tribev2.git"

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Provide the `uvx` CLI used by the TRIBE-style WhisperX transcription step
RUN pip install --no-cache-dir uv

# Copy application code
COPY . .

# Run the model download script so models are baked into the Docker image
RUN python scripts/download_models.py

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
