#!/bin/bash
set -e  # exit if any command fails

# Run migrations (creates tables on Render's empty database)
alembic upgrade head

# Seed exercises (idempotent — safe to run every start)
python seed.py

# Start the server, binding to Render's $PORT (fallback 8000 locally)
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}