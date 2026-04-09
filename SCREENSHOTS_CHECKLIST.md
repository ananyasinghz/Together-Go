# Evidence and screenshots checklist (submission)

Use this list when capturing images for your report. Replace placeholders with your own repo URL and dates.

## 1. Integration, regression, and mutation testing

### Integration + regression (automated)

- **MongoDB:** Running locally or in CI; tests use database name `together_go_test` (see [`tests/conftest.py`](tests/conftest.py)).
- **Run from repository root:**

```powershell
pip install -r backend/requirements.txt
$env:MONGO_URL = "mongodb://127.0.0.1:27017"
$env:DB_NAME = "together_go_test"
python -m pytest tests/ -v --tb=short
```

- **Screenshot:** Terminal showing all tests **passed** (integration suite).
- **Regression:** Re-run the same command after changes; screenshot a second green run if your rubric asks for “regression” evidence.

### Coverage (optional but recommended)

```powershell
python -m pytest tests/ -v --cov=server --cov=auth_utils --cov-report=term-missing
```

- **Screenshot:** Terminal showing coverage summary for `server` and `auth_utils`.

### Mutation testing (`auth_utils` only)

Mutation is configured in [`setup.cfg`](setup.cfg) to run only [`tests/test_auth_utils.py`](tests/test_auth_utils.py) so it stays fast.

**Linux / macOS / GitHub Codespaces (recommended for clean UTF-8 output):**

```bash
cd /path/to/together\&go
python -m mutmut run --simple-output
# or explicitly:
python -m mutmut run --simple-output --paths-to-mutate backend/auth_utils.py \
  --runner "python -m pytest tests/test_auth_utils.py -q"
python -m mutmut results
```

**Windows:** If the console throws `UnicodeEncodeError`, set UTF-8 before running, e.g. in PowerShell:

```powershell
$env:PYTHONIOENCODING = "utf-8"
python -m mutmut run --simple-output --paths-to-mutate backend/auth_utils.py --runner "python -m pytest tests/test_auth_utils.py -q"
python -m mutmut results
```

- **Screenshot:** `mutmut results` (or `mutmut html` output) showing killed vs survived mutants.

## 2. Version management and system building

### Git / GitHub

- **Screenshot:** GitHub repository home page (after you push).
- **Screenshot:** Commit history (Network / commits page) with clear messages.
- **Optional:** Create a release tag, e.g. `git tag v1.0.0` then push tags; screenshot the Releases page.

### CI (GitHub Actions)

After pushing [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

- **Screenshot:** Actions tab showing a **green** workflow run for `CI` (backend-tests + frontend-build).

### Local system build

- **Screenshot:** `pip install -r backend/requirements.txt` completing successfully.
- **Screenshot:** Backend start, e.g. `uvicorn server:app --reload --app-dir backend` (or your course’s command) showing the server listening.
- **Screenshot:** From `frontend/`: `yarn install` and `yarn build` completing successfully; optional Explorer view of `frontend/build/`.

### Environment template

- **Screenshot:** [`backend/.env.example`](backend/.env.example) open in the editor (no real secrets).

## 3. Screenshots of developed functionality (manual UI)

Run backend + frontend with valid `.env` / `REACT_APP_BACKEND_URL`. Capture consistent window size (e.g. 1280×720).

| # | Feature | What to show |
|---|---------|----------------|
| 1 | Login | Login page; successful login as student |
| 2 | Login | Successful login as admin (or note admin dashboard) |
| 3 | Admin | User list |
| 4 | Admin | Excel upload success message |
| 5 | Admin | Password reset flow / confirmation |
| 6 | Student | Dashboard tab |
| 7 | Student | Carpool: create listing |
| 8 | Student | Carpool: browse / join request |
| 9 | Student | Carpool: creator accept or reject requests |
| 10 | Student | Event pool: create / join / accept |
| 11 | Student | Notifications (list and/or toast) |
| 12 | Student | Group chat |
| 13 | Student | Profile / change password |

**Tip:** Use two profiles or incognito windows to show **requester** vs **creator** in the same flow.

## 4. Tools and technologies

See the updated **Appendix** in [`SUBMISSION.md`](SUBMISSION.md) for the full table (React, FastAPI, MongoDB, pytest, mutmut, GitHub Actions, etc.).
