# Resume Analyzer SaaS — Monorepo

This repository contains a production-ready Recruitment AI SaaS with a Python/FastAPI backend and a Next.js frontend.

**What it is**
- A recruitment platform that accepts resume uploads, parses resumes with AI, matches candidates to jobs, scores candidates, generates summaries and interview questions, and exposes both REST APIs and an interactive Next.js UI.

**Technology stack**
- **Backend:** Python 3.13+, FastAPI, SQLAlchemy (async), Alembic, asyncpg/psycopg2, Uvicorn
- **AI:** LangChain / LangGraph / langchain-groq integrations, custom AI agents and prompts
- **Frontend:** Next.js (app router), React 19, Tailwind CSS

**Quick links**
- Backend entry: [backend/app/main.py](backend/app/main.py)
- Backend README: [backend/README.md](backend/README.md)
- Frontend package: [frontend/package.json](frontend/package.json)
- Frontend API helper: [frontend/lib/api.ts](frontend/lib/api.ts)

**Key features**
- Resume upload & parsing (PDF support)
- Candidate-job matching and AI scoring
- Candidate summaries, interview question generation
- Auth (JWT), user/company management, applications, interviews
- LangGraph-powered conversational agent that can call internal tools

**Repository layout (high level)**
- `backend/` — FastAPI application, database models, routers, AI integrations
- `frontend/` — Next.js app and components

**Important files & folders**
- `backend/app/ai/` — AI modules: agents, resume_parser, candidate_matcher, job_generator, interview_questions
- `backend/app/main.py` — FastAPI app, middleware, routers and lifespan setup
- `backend/pyproject.toml` & `backend/requirements.txt` — Python dependencies and metadata
- `frontend/app/` — Next.js pages and route components
- `frontend/lib/api.ts` — Client-side helper for calling the backend API (handles auth tokens)

**Environment & Secrets**
Create a `.env` in `backend/` (copy from `.env.example`) and set at minimum:

- `DATABASE_URL` — Postgres/Neon connection string
- `SECRET_KEY` — JWT signing secret
- `GROQ_API_KEY` — Groq / LLM provider API key used by AI integrations
- Optional: `UPLOAD_DIRECTORY`, `NEXT_PUBLIC_API_URL` (frontend env)

Example: copy `.env.example` to `.env` and fill values.

**Quick start — Backend (development)**
Prereqs: Python 3.13+, PostgreSQL (or Neon), Node for frontend when running both.

Windows (PowerShell):
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env with DATABASE_URL, GROQ_API_KEY, SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

macOS / Linux:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env
alembic upgrade head
uvicorn app.main:app --reload
```

API docs will be available at `http://127.0.0.1:8000/docs` and `http://127.0.0.1:8000/redoc`.

**Quick start — Frontend (development)**
```bash
cd frontend
npm install   # or pnpm install
export NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1   # or set in your environment
npm run dev
```

Open the frontend at `http://localhost:3000`.

**Database migrations**
- Migrations live under `backend/alembic/`. Use Alembic to generate and apply migrations:

```bash
cd backend
alembic revision --autogenerate -m "describe changes"
alembic upgrade head
```

**Main API endpoints (overview)**
- Health: `GET /` (see `backend/app/main.py`)
- Auth: `/auth/*` — signup, login, refresh, me, logout
- Candidates: `/candidates` — CRUD, `/candidates/upload` — resume upload
- Jobs: `/jobs` — CRUD
- Applications: `/applications` — create, update status, reject, hire
- Interviews: `/interviews` — schedule and manage
- AI: `/ai/*` — chat/agent endpoints that invoke LangGraph agents

See the FastAPI routers in `backend/app/routers/` for full details and parameter schemas.

**AI-specific modules & functions**
- `backend/app/ai/agents.py` — `run_recruitment_agent(user_message: str)` — wraps LangGraph agent invocation and returns the textual response
- `backend/app/ai/resume_parser.py` — resume parsing utilities (PDF text extraction + LLM parsing)
- `backend/app/ai/candidate_matcher.py` — candidate-job scoring logic
- `backend/app/ai/candidate_summary.py` — generates concise candidate summaries
- `backend/app/ai/job_generator.py` — generates job descriptions
- `backend/app/ai/interview_questions.py` — generates tailored interview questions

These modules call LLMs and may require the `GROQ_API_KEY` and other provider settings.

**Frontend integration notes**
- The frontend uses `frontend/lib/api.ts` to call backend APIs and manage access/refresh tokens. Set `NEXT_PUBLIC_API_URL` to point to the backend (e.g., `http://localhost:8000/api/v1`).
- Token storage: `localStorage` keys `access_token` and `refresh_token`.

**Testing**
- Backend tests are in `backend/tests/`. Use your venv and run `pytest` from the `backend` folder.
- There are Playwright tests (`test_playwright_v2.py`, `test_playwright_v3.py`) — ensure Playwright is installed and browsers are set up if you run them.

**Troubleshooting / common tips**
- If uploads fail, check `UPLOAD_DIRECTORY` and permissions; `backend/app/main.py` creates the directory at startup.
- If migrations fail due to model mismatches, regenerate with `alembic revision --autogenerate` after inspecting models under `backend/app/models/`.
- Long LLM calls may slow API responses — consider adding background tasks or job queues for heavy AI work.

**Where to look next (recommended files)**
- Read the backend overview: [backend/README.md](backend/README.md)
- App entry and routers: [backend/app/main.py](backend/app/main.py)
- AI modules: [backend/app/ai/agents.py](backend/app/ai/agents.py)
- Frontend API helper: [frontend/lib/api.ts](frontend/lib/api.ts)

If you'd like, I can:
- generate a smaller QuickStart guide tailored to your environment (Windows/macOS/Linux),
- add Dockerfiles / docker-compose for easier local setup, or
- produce OpenAPI snippets for each endpoint.
