# Automated Pest Tests

These tests cover the pest backend API without loading the real YOLO model or real Supabase services.

## What is covered

- local pest identification response
- empty upload validation
- premium subscription access check
- pest frequency API for farmer role
- pest frequency API for officer role

## Install

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
```

## Run

```bash
pytest
```

Or run only the pest tests:

```bash
pytest tests/test_pest_router.py
```

## Why these tests are useful

They give you a safe smoke-test layer for the final stage:

- if someone breaks the pest API contract, tests fail early
- if premium access logic changes, tests catch it
- if response structure changes, tests catch it

## Next step after this

After these backend tests are stable, the next automation layer would be:

1. React Native component tests for the pest screens
2. End-to-end mobile tests later with Detox or Maestro
