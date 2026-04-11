# Repository Guidelines

## Project Structure & Module Organization
This monorepo has three services. `frontend/` contains the Next.js UI (`app/`, `components/`, `lib/`). `backend-express/` handles uploads, job orchestration, and local storage through `src/controllers/`, `src/routes/`, `src/services/`, and `src/middlewares/`. `backend-fastapi/` contains the AI pipeline in `app/routes/`, `app/services/`, and `app/models/`. Uploaded files live in `backend-express/uploads/`. Keep changes scoped to the service you are modifying.

## Build, Test, and Development Commands
- `cd frontend && npm run dev` — starts the Next.js app on the local dev server.
- `cd frontend && npm run build` — creates a production build.
- `cd frontend && npm run lint` — runs the frontend linter.
- `cd backend-express && npm run dev` — runs the Express API with live reload.
- `cd backend-express && npm run build` — compiles TypeScript to `dist/`.
- `cd backend-fastapi && uvicorn app.main:app --reload --port 8000` — starts the FastAPI service.

Install dependencies per service before running commands: `npm install` in Node apps, and a virtualenv plus `pip install -r requirements.txt` in `backend-fastapi/`.

## Coding Style & Naming Conventions
Use TypeScript in `frontend/` and `backend-express/`, Python in `backend-fastapi/`. Follow the existing style: 2-space indentation in TS/TSX, 4-space indentation in Python, double quotes in TS imports/strings, and small focused modules. Use `PascalCase` for React components (`UploadForm.tsx`), `camelCase` for functions and variables, and descriptive file names like `jobRoutes.ts` or `analysisService.ts`.

## Testing Guidelines
There is no dedicated automated test suite yet. For frontend changes, run `cd frontend && npm run lint`. For backend changes, do a manual smoke test: start all three services, call `GET /health` on Express and FastAPI, then verify the upload → process → results flow. Add tests only if you introduce a testing framework already consistent with the touched service.

## Commit & Pull Request Guidelines
Follow the repository’s commit style: Conventional Commits such as `feat(frontend): ...`, `fix(fastapi): ...`, or `docs: ...`. Keep commits focused and explain the user-facing or architectural impact. Pull requests should include: a short summary, affected service(s), setup or env changes, and screenshots or recordings for UI updates.

## Configuration & Security Tips
Do not commit secrets, model caches, or uploaded media. Keep local configuration in untracked `.env` files, and document new variables in `README.md`. FastAPI depends on external tools and models such as `ffmpeg`, Whisper, TRIBE, and optional Gemini credentials, so note any new runtime dependency in your PR.
