# Yllka — Hair & Makeup

Website and small management platform for Yllka. See `CLAUDE.md` for the full
project specification and `RULES.md` for the design brief.

```
frontend/   Next.js (App Router, TypeScript, Tailwind CSS)
backend/    FastAPI, SQLAlchemy 2, Alembic, PostgreSQL
assets/     Source brand artwork (not served)
```

## Frontend

```sh
cd frontend
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000 (use --port if taken)
```

The site is available in Albanian (`/sq`, default) and English (`/en`).
Visiting `/` redirects to the visitor's saved or browser language.
UI text lives in `frontend/i18n/dictionaries/`.

Stock photos used until the real ones arrive are all listed in
`frontend/lib/placeholder-images.ts`.

## Backend

Requires Python 3.12+ and a local PostgreSQL database.

```sh
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # then set DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload   # http://localhost:8000/api/health
```

Tests use a separate database named `<your database>_test`, which must exist:

```sh
createdb yllka_test
pytest
```

## Admin account

There is no sign-up page. Create the admin (or reset their password) from
the backend folder; the password is asked for interactively:

```sh
python -m app.cli create-admin --email yllka@example.com --name "Yllka"
```

Then sign in at `/admin/login`.
