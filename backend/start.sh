#!/bin/sh
# Production start (Railway): bring the database up to date, then serve.
# Migrations are safe to run on every start: they only apply what's missing.
set -e
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips '*'
