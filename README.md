Here’s a clean **README** focused on running the project on **Windows with Docker**:

```markdown
# MPLADS AI Monitoring System

AI-powered monitoring dashboard for MPLADS projects.

## Requirements (Windows)

- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) installed and **running**
- At least 8 GB RAM recommended
- WSL 2 enabled (Docker Desktop usually sets this up automatically)

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/Kumarvalavala66/SIH_2026.git
cd SIH_2026
```

### 2. Start the application

```bash
docker compose up --build
```

Wait until you see:

- `Uvicorn running on http://0.0.0.0:8000`
- nginx started successfully

### 3. Open in browser

| Service       | URL                          |
|---------------|------------------------------|
| Frontend UI   | http://localhost:3000        |
| Backend API   | http://localhost:8000        |
| API Docs      | http://localhost:8000/docs   |

---

## Useful Commands

```bash
# Stop the application
docker compose down

# Rebuild from scratch (if something breaks)
docker compose down
docker compose up --build --force-recreate

# View logs
docker compose logs -f
```

---

## Troubleshooting (Windows)

### 1. Port already in use
If port 3000 or 8000 is occupied:

```bash
# Find and kill the process using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

### 2. Docker Desktop not running
Make sure Docker Desktop is started and shows **“Engine running”**.

### 3. Slow performance
- Keep the project inside the WSL 2 filesystem (recommended)
- Or enable VirtioFS / better file sharing in Docker Desktop settings

### 4. CORS / Frontend not loading data
Make sure the backend has restarted after any code changes:

```bash
docker compose restart backend
```

---

## Project Structure

```
SIH_2026/
├── backend/          # FastAPI + SQLite + AI detection modules
├── frontend/         # React + Vite (served by Nginx)
├── docker-compose.yml
└── README.md
```

---

## Tech Stack

- **Frontend**: React + Vite + Nginx
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **AI Modules**: Rule-based + ML anomaly detection, duplicate detection, inefficiency analysis
- **Deployment**: Docker + Docker Compose
```

---

Would you like me to also give you a shorter version or add any extra section (for example “How to update the code”, “Team members”, etc.)?