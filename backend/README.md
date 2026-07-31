# AI Interview Intelligence System - FastAPI Backend

Production-ready FastAPI backend for Candidate-focused AI Interview Intelligence System powered by Neon PostgreSQL and Google Gemini API.

## Features
- Candidate Authentication (JWT, Passlib, Argon2)
- Candidate Profile & Resume Parsing (Gemini AI)
- Adaptive AI Interview Question Generation & Answer Evaluation
- AI Bottleneck Detection Service (11 bottleneck categories)
- Real-time WebSocket support for live transcripts & timer sync
- Neon PostgreSQL integration with SQLAlchemy 2.0 & Alembic migrations
- Structured error handling and security safeguards (No API keys exposed)

## Quick Start Commands

```bash
# 1. Virtual environment & dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Environment setup
cp .env.example .env
# Fill in DATABASE_URL and GEMINI_API_KEY in .env

# 3. Database migrations
alembic revision --autogenerate -m "Initial candidate tables"
alembic upgrade head

# 4. Run FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
