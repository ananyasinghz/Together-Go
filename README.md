## Together&GO – Project Initialization

This repository contains the **initialized scaffold** for the Together&GO system.  
At this stage, there is **no full feature implementation** – only the organized structure, Docker setup, and documentation required for development setup and screenshots.

---

### Folder Structure

- **`frontend/`**: React SPA (to be implemented – CRA/Vite + Tailwind + Shadcn UI)
  - Will host:
    - Student Browser UI
    - Admin Browser UI
  - Notes:
    - Will **store JWT in `localStorage`**
    - Will **read `BACKEND_URL` from `.env`**

- **`backend/`**: Node.js / Express API (initialized as backend service; endpoints to be added later)
  - Will implement controllers equivalent to the system design:
    - Auth, Admin, Carpool, Event Pool, Messages, Notifications
    - Real-time communication (WebSocket or Socket.io) for messages & notifications

- **`infra/`** (to be created if needed later):
  - Additional deployment scripts, k8s manifests, etc.

- **Root files**
  - `.gitignore` – ignores node_modules, build artifacts, env files, editor configs, etc.
  - `docker-compose.yml` – local development composition (backend, MongoDB; frontend placeholder)

---

### Branching Strategy – GitHub Flow

This project uses **GitHub Flow**:

1. **`main` branch**
   - Always **deployable and stable**.
   - Only receives code through **pull requests (PRs)**.

2. **Create feature branches from `main`**
   - Naming convention:
     - `feature/<short-description>`
     - `bugfix/<short-description>`
     - `chore/<short-description>`
   - Examples:
     - `feature/auth-api`
     - `feature/frontend-shell`
     - `feature/docker-setup`

3. **Typical workflow**
   - `git checkout -b feature/project-init`
   - Make commits in this branch.
   - Push to GitHub:
     - `git push origin feature/project-init`
   - Open a **Pull Request** from `feature/project-init` → `main`.
   - Get review, address comments, then **squash and merge**.

4. **What to show in screenshots (for your assignment)**
   - Screenshot of:
     - GitHub repository page showing `main` branch.
     - Branch dropdown showing at least **one feature branch** (e.g. `feature/project-init`).
     - Optionally, a PR screen from your feature branch to `main`.

---

### System Architecture – High-Level (Matching Your Diagram)

- **Client Layer (Left)**
  - `Student Browser` – React SPA
    - Pages (conceptual for now):
      - `/login`
      - `StudentDashboard` (Dashboard, Carpool, Event Pool, Chat, Notifications, Profile)
    - Behavior:
      - Stores **JWT** in `localStorage`
      - Reads `BACKEND_URL` from `.env`
  - `Admin Browser` – same React SPA / codebase
    - `AdminDashboard` (Manage students, Upload Excel, Reset passwords)

- **Backend & Realtime Layer (Center)**
  - `backend/` – Node.js / Express API (initialized only)
  - Planned controllers (routes will follow your spec later):
    - Auth, Admin, Carpool, Event Pool, Messages, Notifications
  - Realtime:
    - WebSocket / Socket.io endpoint (e.g. `/ws/{user_id}`) with a connection manager for:
      - `map user_id → socket`
      - `broadcast`
      - `send_personal_message`

- **Data & Security Layer (Right)**
  - MongoDB with collections:
    - `users`, `carpools`, `event_pools`, `messages`, `notifications`
  - Auth & Security:
    - JWT (HS256)
    - Password hashing (bcrypt)
    - Token extraction middleware
  - `.env` configuration:
    - `MONGO_URL`
    - `DB_NAME`
    - `CORS_ORIGINS`
    - `SECRET_KEY`

This README plus the folder layout should give you everything you need to **draw your final architecture diagram** exactly as specified.

---

### Quick Start – Local Development (Docker)

> **Note**: This is a scaffold; actual application code is minimal/placeholder.  
> The goal is to have containers start successfully for screenshots and initialization.

#### Prerequisites

- **Docker Desktop** installed and running.
- **Git** installed.
- **Node.js 18+** (only needed if you want to run backend or frontend directly without Docker).

#### 1. Clone and enter the repository

```bash
git clone <your-github-repo-url> together-go
cd together-go
```

#### 2. Create your `.env` files

- Backend env file: `backend/.env`

```bash
MONGO_URL=mongodb://mongo:27017
DB_NAME=togethergo
CORS_ORIGINS=http://localhost:5173
SECRET_KEY=change-me-in-prod
PORT=4000
```

> You can later add `JWT_EXPIRES_IN`, `REDIS_URL`, etc., as needed.

#### 3. Start local stack with Docker

From the project root:

```bash
docker-compose up --build
```

This will:

- Start **MongoDB** on an internal Docker network.
- Start the **backend** Node/Express service (placeholder server).
- Optionally start a placeholder **frontend** service (if you later add a Dockerfile and app).

Once up:

- Backend (placeholder) should be reachable at: `http://localhost:4000/health`
- MongoDB will be available to the backend at `mongodb://mongo:27017/togethergo` (via `MONGO_URL`).

To stop:

```bash
docker-compose down
```

---

### Local Development Tools (Documented for Your Assignment)

**Frontend – React**

- Planned stack:
  - React SPA (CRA or Vite)
  - Tailwind CSS
  - Shadcn UI components
- Running locally (once implemented):
  - `cd frontend`
  - `npm install`
  - `npm run dev` (or `npm start` if CRA)
  - App will run on e.g. `http://localhost:5173` or `http://localhost:3000`

**Backend – Node.js / Express**

- Current state:
  - Minimal Express server (e.g. `/health` endpoint) for Docker and local testing.
  - Future:
    - Implement controllers for:
      - `/api/auth/*`
      - `/api/admin/*`
      - `/api/carpools/*`
      - `/api/event-pools/*`
      - `/api/messages/*`
      - `/api/notifications/*`
- Running locally without Docker:
  - `cd backend`
  - `npm install`
  - `npm run dev` (or `npm start`, depending on your chosen script)
  - API available at `http://localhost:4000`

**Database – MongoDB**

- Local via Docker:
  - Defined in `docker-compose.yml` as service `mongo`
  - Default dev URI (from backend container): `mongodb://mongo:27017/togethergo`
- Local via standalone install (optional):
  - `mongodb://localhost:27017/togethergo`

**Docker Container(s)**

- **Backend service**:
  - Built from `backend/Dockerfile`
  - Exposes port `4000`
- **MongoDB service**:
  - Uses official `mongo` image
  - Exposes port `27017` (can be mapped to host if you want)
- **Frontend service (optional, later)**:
  - Will be built from `frontend/Dockerfile`
  - Will expose `3000` or `5173`

**Cloud / Localhost**

- **Localhost**:
  - Docker composition intended for local dev and screenshots.
  - URL examples:
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:4000/api/...`
    - WebSocket: `ws://localhost:4000/ws/{user_id}`
    - MongoDB: `mongodb://localhost:27017/togethergo`

- **Cloud (future)**:
  - Same Docker images can be deployed to:
    - Render, Railway, Fly.io, AWS ECS, Azure Container Apps, etc.

---

### Git & GitHub – Commands You Should Use

After this scaffold is in place in your local folder:

```bash
git init
git add .
git commit -m "chore: initialize Together&GO scaffold"

git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

Then create a **feature branch** to show in your screenshots:

```bash
git checkout -b feature/project-init
# (Optionally make a tiny change, e.g. update README)
git commit -am "docs: adjust README"
git push -u origin feature/project-init
```

Now you can:

- Take screenshots of:
  - GitHub repo showing `main` and `feature/project-init` branches.
  - PR from `feature/project-init` into `main` (optional, but recommended).

This completes the **project initialization** requirements without building the full application.

