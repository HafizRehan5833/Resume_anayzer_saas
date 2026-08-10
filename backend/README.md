# Recruitment AI SaaS Backend

A production-ready Recruitment AI SaaS backend built with FastAPI, PostgreSQL, LangGraph, and Groq.

## Project Overview

This backend powers an intelligent recruitment platform that allows companies to:
- Post job openings
- Manage candidate applications
- Schedule interviews
- **Automatically parse uploaded resumes using AI**
- **Match candidates to jobs and score compatibility**
- **Generate candidate summaries**
- **Generate customized interview questions**
- **Generate professional job descriptions**
- **Chat with an intelligent LangGraph-powered AI agent** that automatically routes requests to the appropriate recruitment tools

## Folder Structure

```
backend/
├── app/
│   ├── ai/               # AI models, prompts, tools, and LangGraph agents
│   ├── core/             # Configuration, logging, and security
│   ├── database/         # Database connection and async session
│   ├── dependencies/     # FastAPI dependencies (auth, database)
│   ├── middleware/       # Custom middleware (request logging)
│   ├── models/           # SQLAlchemy ORM models
│   ├── repositories/     # Database access layer (CRUD operations)
│   ├── routers/          # FastAPI endpoints (controllers)
│   ├── schemas/          # Pydantic validation schemas
│   ├── services/         # Business logic layer
│   ├── utils/            # Shared utilities (file upload, pagination, exceptions)
│   └── main.py           # Application entry point
├── alembic/              # Database migration scripts
├── tests/                # Unit and integration tests
├── .env                  # Environment variables (do not commit)
├── .env.example          # Example environment configuration
├── alembic.ini           # Alembic configuration
└── requirements.txt      # Project dependencies
```

## Installation & Setup

### 1. Virtual Environment Setup

**Windows:**
```powershell
uv venv
.venv\Scripts\activate
```

**Linux/macOS:**
```bash
uv venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
uv pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials.

```bash
cp .env.example .env
```

Make sure to provide your **Neon PostgreSQL Database URL** and **Groq API Key**.

### 4. Run Alembic Migrations

Apply the database migrations to create the tables in PostgreSQL.

```bash
uv run alembic upgrade head
```

*Note: If you make changes to the SQLAlchemy models, generate a new migration with:*
```bash
uv run alembic revision --autogenerate -m "description of changes"
```

### 5. Run the Server

Start the FastAPI development server:

```bash
uv run uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, you can explore the interactive API documentation:

- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Technology Stack

- **Framework:** FastAPI
- **Language:** Python 3.12+
- **Database:** PostgreSQL (Neon)
- **ORM:** SQLAlchemy 2.0 (Async)
- **Migrations:** Alembic
- **Authentication:** JWT, passlib, bcrypt
- **AI Integration:** LangChain, LangGraph, ChatGroq (`llama-3.3-70b-versatile`)
- **File Processing:** aiofiles, pypdf, pdfplumber
- **Validation:** Pydantic v2
