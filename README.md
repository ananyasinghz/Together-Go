# Together & Go

Campus carpool and event-pool web app (React + FastAPI + MongoDB).

## Run with Docker

From the project root (folder that contains `docker-compose.yml`):

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000  
- **API / docs:** http://localhost:8000 and http://localhost:8000/docs  
- **MongoDB:** `localhost:27017` (optional; exposed for local tools and pytest)

The UI is built with `REACT_APP_BACKEND_URL=http://localhost:8000` so the browser talks to the API on your machine.

Stop stacks:

```bash
docker compose down
```

Remove volumes (wipes DB data):

```bash
docker compose down -v
```

### Docker on Windows: “cannot find … dockerDesktopLinuxEngine”

The CLI is trying to talk to **Docker Desktop**, but the engine is not running (or Docker Desktop is not installed).

1. **Start Docker Desktop** from the Start menu and wait until it says the engine is running (whale icon steady in the tray).
2. If it never starts: open Docker Desktop → **Settings** → **Troubleshoot** → restart, or ensure **WSL 2** is installed/updated if Docker asks for it.
3. Confirm in a new terminal: `docker version` (both Client and Server should appear).

Then run `docker compose up --build` again from the project root.

## Run without Docker

- Backend: see `start_backend.bat` or run Uvicorn from `backend/` with a `.env` file.
- Frontend: see `start_frontend.bat` or `yarn start` in `frontend/` with `REACT_APP_BACKEND_URL` set.

More detail: `SUBMISSION.md`, `SCREENSHOTS_CHECKLIST.md`, `backend/.env.example`.
