<<<<<<< HEAD
# GitHub-Action-Project
=======
# TaskApp — Full-Stack Docker + GitHub Actions CI/CD on EC2

A production-ready full-stack task manager:
- **Frontend**: React 18 + Vite + React Router — served by nginx
- **Backend**: Node.js + Express + MongoDB (Mongoose) — JWT auth
- **Database**: MongoDB 7
- **Infra**: Docker Compose, GitHub Actions CI/CD, AWS EC2

---

## Project structure

```
fullstack/
├── frontend/
│   ├── src/
│   │   ├── pages/        # Login, Register, Dashboard
│   │   ├── components/   # TaskCard, TaskModal
│   │   ├── context/      # AuthContext (JWT)
│   │   ├── api.js        # Axios client
│   │   └── App.jsx
│   ├── nginx.conf        # SPA routing + API proxy
│   └── Dockerfile        # Multi-stage: Vite build → nginx
│
├── backend/
│   ├── src/
│   │   ├── models/       # User, Task (Mongoose)
│   │   ├── routes/       # /api/auth, /api/tasks
│   │   ├── middleware/   # JWT auth guard
│   │   └── index.js
│   └── Dockerfile        # Multi-stage Node build
│
├── docker-compose.yml        # Production (uses pre-built images)
├── docker-compose.dev.yml    # Local dev (builds from source + hot reload)
└── .github/
    └── workflows/
        └── deploy.yml        # CI/CD: test → build → push → deploy
```

---

## API Endpoints

| Method | Endpoint             | Auth | Description           |
|--------|----------------------|------|-----------------------|
| POST   | /api/auth/register   | –    | Register new user     |
| POST   | /api/auth/login      | –    | Login, get JWT        |
| GET    | /api/auth/me         | ✅   | Get current user      |
| GET    | /api/tasks           | ✅   | List tasks (filterable) |
| POST   | /api/tasks           | ✅   | Create task           |
| PUT    | /api/tasks/:id       | ✅   | Update task           |
| DELETE | /api/tasks/:id       | ✅   | Delete task           |
| GET    | /api/health          | –    | Health check          |

---

## Run locally (dev mode — hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:5000
- Mongo:    localhost:27017

---

## Run locally (production mode)

```bash
# 1. Build images
docker compose -f docker-compose.dev.yml build

# 2. Tag them to match docker-compose.yml expectations
docker tag frontend:latest yourusername/taskapp-frontend:latest
docker tag backend:latest  yourusername/taskapp-backend:latest

# 3. Set env vars and start
DOCKERHUB_USERNAME=yourusername JWT_SECRET=mysecret docker compose up -d
```

---

## GitHub Secrets (required)

Go to: **Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret               | Value                                     |
|----------------------|-------------------------------------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username                  |
| `DOCKERHUB_TOKEN`    | Docker Hub access token                   |
| `EC2_HOST`           | EC2 public IP or domain                   |
| `EC2_USER`           | SSH username (usually `ubuntu`)           |
| `EC2_SSH_KEY`        | Full contents of your `.pem` private key  |
| `JWT_SECRET`         | Long random string (e.g. 64 char hex)     |

---

## EC2 one-time setup

SSH into your EC2 instance, then run:

```bash
# 1. Install Docker
sudo apt update && sudo apt install -y docker.io docker-compose-plugin

# 2. Start and enable Docker
sudo systemctl enable --now docker

# 3. Add your user to the docker group (no sudo needed)
sudo usermod -aG docker ubuntu
newgrp docker

# 4. Create app directory
mkdir -p ~/taskapp
```

### EC2 Security Group — required inbound rules

| Port | Protocol | Source    | Purpose           |
|------|----------|-----------|-------------------|
| 22   | TCP      | Your IP   | SSH access        |
| 80   | TCP      | 0.0.0.0/0 | HTTP (frontend)   |

---

## CI/CD Pipeline

Every push to `main` triggers 3 jobs in sequence:

```
git push → main
     │
     ▼
[1] test           npm test (backend + frontend)
     │
     ▼
[2] build-and-push  docker build → push to Docker Hub
     │              (backend:sha + backend:latest)
     │              (frontend:sha + frontend:latest)
     ▼
[3] deploy         SCP docker-compose.yml to EC2
                   SSH → docker compose pull → up -d
```

PRs only run the `test` job — `build-and-push` and `deploy` only run on `main`.

---

## Useful commands on EC2

```bash
cd ~/taskapp

# View running containers
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart a service
docker compose restart backend

# Stop everything
docker compose down

# Full reset (removes volumes too)
docker compose down -v
```
>>>>>>> fd6abca (Files added into git)
