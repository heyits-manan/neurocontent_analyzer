# NeuroContent Analyzer

NeuroContent Analyzer is a full-stack application for uploading educational videos and running them through an advanced AI diagnostic pipeline to receive segment-level coaching on cognitive load, attention, and pacing.

## Monorepo Structure

```text
neuro-analyzer/
  frontend/            # Next.js frontend (React)
  backend-express/     # Express API (TypeScript) - Handles file uploads and job orchestration
  backend-fastapi/     # FastAPI (Python) - Executes the core AI/ML diagnostic pipeline
```

## Architecture & AI Pipeline

1. **Upload & Orchestration:** The frontend uploads a video to the Express backend (written in strict TypeScript). Express stores the file locally, initializes a tracking job via UUID, and exposes endpoints for the frontend to poll status.
2. **Audio Extraction:** Express triggers the FastAPI service, which uses `ffmpeg` to extract the audio track.
3. **Transcription:** Audio is transcribed locally using `faster-whisper`.
4. **Diagnostic Scoring:** The timeline is segmented and assessed for cognitive load and user attention using heuristic NLP (words-per-second, cue words) merged with the **[facebookresearch/tribev2](https://github.com/facebookresearch/tribev2)** model.
5. **LLM Coaching:** If configured, the segment diagnostics are passed to the **Google Gemini 2.5 Flash** API to generate actionable coaching feedback, rewrite suggestions, and an overall summary.
6. **Results:** The frontend renders the processed segments interactively.

## Setup

### 1. Backend FastAPI (Python AI Service)

```bash
cd backend-fastapi
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # Then edit .env to configure your models
uvicorn app.main:app --reload --port 8000
```

**Prerequisites & Configuration:**
- Install `ffmpeg` and ensure it is available on your system `PATH`.
- The first run will automatically download the required Whisper model and the `tribev2` model.
- Default Whisper config (e.g., CPU vs CUDA) is controlled in `backend-fastapi/.env`.
- To enable the advanced segment coaching and summaries, you **must** set your `GEMINI_API_KEY` in `backend-fastapi/.env`.

### 2. Backend Express (TypeScript API Service)

```bash
cd backend-express
npm install
cp .env.example .env
npm run dev              # Starts the server using tsx with hot-reloading
```

### 3. Frontend (Next.js Application)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Default Service URLs

- Frontend: `http://localhost:3000`
- Express API: `http://localhost:5001`
- FastAPI Pipeline: `http://localhost:8000`

## MVP Flow

1. Open the home page.
2. Upload a video file.
3. Click `Process Analysis`.
4. View the results page to explore the transcript segments, identified diagnostics (attention/load), and generated coaching suggestions.

## Notes

- Uploaded videos are persistently stored in `backend-express/uploads/`.
- Job metadata is stored in a structured local JSON file (`src/data/jobs.json`) for lightweight persistence without needing a database.
