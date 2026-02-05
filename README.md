# Together&GO

## Project Overview
Together&GO is a web-based community coordination platform designed to help students and young individuals organize group activities and shared transportation efficiently. The platform enables users to create, discover, and join events as well as offer or participate in carpools, all through a single, centralized system. Together&GO aims to simplify coordination, reduce communication overhead, and encourage collaborative participation within a trusted community.

---

## Problem It Solves
Students often face challenges when coordinating events or shared travel due to fragmented communication tools, lack of centralized information, and inefficient planning methods. Informal platforms such as messaging apps do not provide structured workflows for event management or carpool matching. Together&GO addresses this problem by offering a dedicated platform that brings event planning and carpool coordination together in a structured, accessible, and user-friendly manner.

---

## Target Users (Personas)
- **College and University Students:** Individuals who regularly attend events and require shared transportation.
- **Student Communities and Clubs:** Groups that organize activities, meetings, or social events.
- **Young Professionals:** Users seeking convenient group travel or participation in community activities.

---

## Vision Statement
To create a simple, secure, and community-driven platform that enables people to participate and travel together with ease, efficiency, and confidence.

---

## Key Features / Goals
- Secure user authentication and profile management.
- Creation and management of events.
- Ability to browse, join, and leave events.
- Carpool creation and participation for shared travel.
- Search and filter functionality for events.
- Personalized dashboard for managing user activities.
- Reliable data storage with controlled access.

---

## Success Metrics
- Users can successfully register, log in, and navigate the platform.
- Events and carpools can be created and joined without errors.
- At least 80% of test users can use the system without external assistance.
- The application remains stable and responsive during testing.
- All core functionalities meet the defined requirements within the project timeline.

---

## Assumptions & Constraints
### Assumptions
- Users have access to a web browser and stable internet connectivity.
- Users are willing to create accounts and provide basic information.
- The development team has access to required tools and learning resources.

### Constraints
- The project must be completed within an academic timeline.
- Development is limited to student-level resources and experience.
- Only free or open-source technologies are used.
- User data security and privacy must be maintained throughout the system.

---

## Together&GO – Project Initialization

This repository contains the **initialized scaffold** for the Together&GO system.  
At this stage, there is **no full feature implementation** – only the organized structure, Docker setup, and documentation required for development setup and screenshots.

---

### Folder Structure

- **`frontend/`**: React SPA (initialized with Vite + React + Tailwind CSS)
  - Structure:
    - `src/` – React components and app logic
    - `package.json` – dependencies (React, Vite, Tailwind, React Router)
    - `Dockerfile` – Docker configuration for frontend container
    - `vite.config.js` – Vite configuration
    - `tailwind.config.js` – Tailwind CSS configuration
  - Will host:
    - Student Browser UI
    - Admin Browser UI
  - Notes:
    - Will **store JWT in `localStorage`**
    - Will **read `VITE_BACKEND_URL` from `.env`**

- **`backend/`**: Node.js / Express API (initialized with minimal server)
  - Structure:
    - `src/` – Express server code
    - `package.json` – dependencies
    - `Dockerfile` – Docker configuration for backend container
  - Will implement controllers equivalent to the system design:
    - Auth, Admin, Carpool, Event Pool, Messages, Notifications
    - Real-time communication (WebSocket or Socket.io) for messages & notifications

- **`infra/`** (to be created if needed later):
  - Additional deployment scripts, k8s manifests, etc.

- **Root files**
  - `.gitignore` – ignores node_modules, build artifacts, env files, editor configs, etc.
  - `docker-compose.yml` – local development composition (frontend, backend, MongoDB)
  - `README.md` – this file

**Note on Dockerfile locations**: Each service (`frontend/` and `backend/`) has its own `Dockerfile` in its respective folder. This is the **correct structure** for a multi-service monorepo. The `docker-compose.yml` references each Dockerfile using the `context` directive (e.g., `context: ./backend`), which tells Docker where to find the Dockerfile and build context for that service.

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

---

### System Architecture – High-Level 

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

#### 2. Create you `.env` files

**Backend env file**: `backend/.env`

```bash
MONGO_URL=mongodb://mongo:27017
DB_NAME=togethergo
CORS_ORIGINS=http://localhost:5173
SECRET_KEY=change-me-in-prod
PORT=4000
```

**Frontend env file** (optional, defaults work): `frontend/.env`

```bash
VITE_BACKEND_URL=http://localhost:4000
```

> You can later add `JWT_EXPIRES_IN`, `REDIS_URL`, etc., as needed.

#### 3. Start local stack with Docker

From the project root:

```bash
docker-compose up --build
```

This will:

- Start **MongoDB** on an internal Docker network (port `27017`).
- Start the **backend** Node/Express service on port `4000`.
- Start the **frontend** React/Vite dev server on port `5173`.

Once up:

- **Frontend** should be reachable at: `http://localhost:5173`
- **Backend** should be reachable at: `http://localhost:4000/health`
- **MongoDB** will be available to the backend at `mongodb://mongo:27017/togethergo` (via `MONGO_URL`).

**Screenshots to take for your assignment:**
- Docker Desktop showing all three containers running (`togethergo-frontend`, `togethergo-backend`, `togethergo-mongo`)
- Browser showing `http://localhost:5173` with the React app
- Browser showing `http://localhost:4000/health` with JSON response

To stop:

```bash
docker-compose down
```

---

### Local Development Tools 

**Frontend – React**

- Current stack (initialized):
  - React 18 + Vite (fast dev server)
  - Tailwind CSS (configured)
  - React Router (for future routing)
  - Shadcn UI components (to be added later)
- Running locally (without Docker):
  - `cd frontend`
  - `npm install`
  - `npm run dev`
  - App will run on `http://localhost:5173`
- Running with Docker:
  - Included in `docker-compose.yml` as `frontend` service
  - Automatically starts on port `5173` when you run `docker-compose up`

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



