## Together&GO – Vision Document

### Project Name & Overview

**Together&GO** is a comprehensive carpooling and event coordination platform designed specifically for students. It enables students to organize shared rides, coordinate event attendance, communicate in real-time, and manage their social activities efficiently within their campus community.

### Problem it Solves

Students face several challenges in their daily campus life:
- **Transportation costs**: Individual rides (Uber, taxis) are expensive for students
- **Event coordination**: Difficulty finding others attending the same events
- **Communication gaps**: No centralized platform for student-to-student communication
- **Time management**: Wasting time searching for carpool partners or event groups
- **Safety concerns**: Need for verified, trusted connections within the student community

Together&GO solves these by providing a secure, student-only platform for carpooling, event pooling, real-time messaging, and notifications.

### Target Users (Personas)

1. **Student Rider (Primary)**
   - Age: 18-25
   - Needs: Affordable transportation, event coordination, social connections
   - Tech-savvy, uses mobile apps daily
   - Values: Cost savings, convenience, safety

2. **Student Driver**
   - Age: 18-25
   - Has access to a vehicle
   - Wants to: Share costs, meet new people, help peers
   - Values: Flexibility, earning gas money, community building

3. **Admin (University Staff)**
   - Age: 25-60
   - Role: Manage student accounts, upload student data, monitor platform
   - Needs: Bulk user management, password resets, system oversight
   - Values: Security, efficiency, student safety

### Vision Statement

"Together&GO empowers students to build a connected, cost-effective, and sustainable campus community by making carpooling and event coordination seamless, safe, and accessible to all."

### Key Features / Goals

1. **Carpool Management**
   - Create and join carpools
   - Request/approve ride sharing
   - Real-time location sharing (future)

2. **Event Pool Coordination**
   - Discover events
   - Join event groups
   - Coordinate attendance with peers

3. **Real-time Communication**
   - In-app messaging
   - Group chats for carpools/events
   - WebSocket-based notifications

4. **User Management**
   - Student authentication (JWT)
   - Admin dashboard for user management
   - Excel-based bulk student upload

5. **Notifications System**
   - Real-time alerts for carpool requests
   - Event reminders
   - Message notifications

### Success Metrics

- **User Adoption**: 500+ active students within first semester
- **Carpool Creation**: 100+ active carpools per week
- **Event Participation**: 80% of listed events have at least 5 participants
- **User Engagement**: Average 3+ logins per week per active user
- **Cost Savings**: Students save average $50/month on transportation
- **System Performance**: 99% uptime, <2s page load times

### Assumptions & Constraints

**Assumptions:**
- Students have smartphones and internet access
- University provides student email/ID verification
- Students are willing to share rides with verified peers
- Campus has sufficient student population to sustain platform

**Constraints:**
- Must be student-only (verified through university email/ID)
- Limited to single university initially (can scale later)
- Must comply with university data privacy policies
- Budget constraints: Free tier hosting initially
- Development timeline: MVP in 3 months

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

### Local Development Tools (Documented for Your Assignment)

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

