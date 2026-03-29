# NeuroContent Analyzer

NeuroContent Analyzer is a full-stack MVP for uploading a video, triggering a mock AI analysis pipeline, and reviewing segment-level feedback.

## Monorepo Structure

```text
neuro-analyzer/
  frontend/            # Next.js frontend
  backend-express/     # Express API and job orchestration
  backend-fastapi/     # FastAPI mock AI pipeline
```

## Architecture

1. The frontend uploads a video to the Express backend.
2. Express stores the file locally, creates a job, and exposes job/result APIs.
3. Express calls the FastAPI service over HTTP for analysis.
4. FastAPI returns mocked segment analysis.
5. The frontend renders the processing result list.

## Setup

### 1. Backend FastAPI

```bash
cd backend-fastapi
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Whisper prerequisites:

- Install `ffmpeg` and ensure it is available on your `PATH`.
- The first transcription run will download the selected Whisper model.
- Default model config is controlled through `backend-fastapi/.env`.

### 2. Backend Express

```bash
cd backend-express
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Default Service URLs

- Frontend: `http://localhost:3000`
- Express API: `http://localhost:5001`
- FastAPI: `http://localhost:8000`

## MVP Flow

1. Open the home page.
2. Upload a video file.
3. Click `Process Analysis`.
4. View the results page for segment issues and suggestions.

## Notes

- All AI steps are mocked intentionally.
- Uploaded videos are stored in `backend-express/uploads/`.
- Job metadata is stored in a local JSON file for simplicity.

