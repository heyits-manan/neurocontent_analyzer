# NeuroContent Analyzer

NeuroContent Analyzer is a full-stack AI application for analyzing educational videos. It combines Whisper transcription, TRIBE v2 multimodal scoring, and Gemini-generated feedback to identify segments that may feel too dense, lose attention, or need clearer delivery.

## What It Does

- Upload a video from a Next.js frontend
- Store and orchestrate processing through an Express backend
- Extract audio and transcribe speech with Whisper in FastAPI
- Segment the transcript into analysis windows
- Score segments for cognitive load and attention using heuristics plus TRIBE v2
- Generate improvement suggestions and rewrite directions with Gemini
- Display transcript segments and analysis results in the frontend

## Monorepo Structure

```text
neuro-analyzer/
  frontend/            # Next.js frontend
  backend-express/     # Express API for upload, jobs, and orchestration
  backend-fastapi/     # FastAPI AI pipeline
```

## Architecture

1. The frontend uploads a video to the Express backend.
2. Express stores the uploaded file locally and creates a processing job.
3. Express calls the FastAPI service with the stored video path.
4. FastAPI:
   - extracts audio with `ffmpeg`
   - transcribes speech with `faster-whisper`
   - segments the transcript into time windows
   - scores segments using heuristics and TRIBE v2
   - generates feedback with Gemini when configured
5. Express stores the transcript and results.
6. The frontend fetches and renders transcript segments, load/attention labels, and improvement suggestions.

## Tech Stack

- Frontend: Next.js, React
- Backend API: Express.js
- AI Service: FastAPI
- Transcription: Whisper via `faster-whisper`
- Multimodal scoring: TRIBE v2
- LLM feedback: Gemini

## Setup

Run each service in a separate terminal.

### 1. FastAPI

```bash
cd backend-fastapi
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

FastAPI requirements:
- `ffmpeg` must be installed and available on your `PATH`
- the first Whisper run downloads the configured Whisper model
- the first TRIBE run may download TRIBE assets/model files

Recommended `.env` values:

```env
WHISPER_MODEL_SIZE=small
WHISPER_COMPUTE_TYPE=int8
WHISPER_DEVICE=cpu
TRIBE_ENABLED=true
TRIBE_MODEL_ID=facebook/tribev2
TRIBE_CACHE_DIR=./cache
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

FastAPI environment variables:

- `WHISPER_MODEL_SIZE`: Whisper model variant to load, for example `small`
- `WHISPER_COMPUTE_TYPE`: Whisper compute mode, for example `int8`
- `WHISPER_DEVICE`: device for Whisper inference, usually `cpu` or `cuda`
- `TRIBE_ENABLED`: enables or disables TRIBE scoring, `true` or `false`
- `TRIBE_MODEL_ID`: Hugging Face model id for TRIBE, currently `facebook/tribev2`
- `TRIBE_CACHE_DIR`: local cache directory for downloaded TRIBE assets
- `GEMINI_API_KEY`: Google Gemini API key for segment feedback generation
- `GEMINI_MODEL`: Gemini model name, for example `gemini-2.5-flash`

If `GEMINI_API_KEY` is not set, the app still works and falls back to heuristic suggestions.

### 2. Express Backend

```bash
cd backend-express
npm install
cp .env.example .env
npm run dev
```

Typical `.env` values:

```env
PORT=5001
FASTAPI_URL=http://localhost:8000
FRONTEND_ORIGINS=http://localhost:3000
UPLOAD_DIR=uploads
```

Express environment variables:

- `PORT`: port used by the Express backend
- `FASTAPI_URL`: base URL of the FastAPI service that handles AI processing
- `FRONTEND_ORIGINS`: comma-separated browser origins allowed to call the Express backend
- `UPLOAD_DIR`: local folder where uploaded videos are stored

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Typical `.env.local` value:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
```

Frontend environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: base URL for the Express backend used by the browser

## Local URLs

- Frontend: `http://localhost:3000`
- Express API: `http://localhost:5001`
- FastAPI: `http://localhost:8000`

## Usage

1. Open the frontend.
2. Upload a video file.
3. Click `Process Analysis`.
4. Review:
   - transcript segments with timestamps
   - segment-level `load` and `attention`
   - issue explanations
   - suggestions
   - rewrite directions

## Current Output

For each processed segment, the app can return:

- `start`
- `end`
- `load`
- `attention`
- `issue`
- `reason`
- `suggestion`
- `rewrite`

## Notes

- Uploaded videos are stored locally in `backend-express/uploads/`.
- Job state is stored locally in a JSON file for MVP simplicity.
- Whisper is used as the explicit transcript layer for the UI.
- TRIBE v2 is used as a multimodal diagnostic layer.
- Gemini is used as the recommendation layer.

## Troubleshooting

### FastAPI returns `500` / Express returns `502`

Usually means the AI pipeline failed upstream. Check:

- FastAPI terminal logs
- `ffmpeg` installation
- Whisper model download/setup
- Gemini API key
- TRIBE installation/model loading

### `ERR_EMPTY_RESPONSE` from `/process/:jobId`

Usually means the Express process restarted or the request died mid-processing. Restart the backend and retry.

### TRIBE does not seem to run

Confirm:

- `TRIBE_ENABLED=true`
- TRIBE dependency is installed in the FastAPI virtual environment
- the FastAPI logs do not show fallback behavior

### No Gemini suggestions

Set `GEMINI_API_KEY` in `backend-fastapi/.env` and restart FastAPI.

## Status

This project is currently an MVP focused on end-to-end processing and multimodal analysis flow rather than production scalability.
