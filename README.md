# InstaFlow - Automated Reel Sharing Scheduler

Automatically discover and share Instagram Reels to predefined groups on a schedule.

## Architecture

```
┌──────────┐     ┌──────────┐     ┌───────────┐
│ Frontend │────▶│  Backend │────▶│Automation │
│  React   │     │ Express  │     │  Python   │
│  :3000   │     │  :5000   │     │  :8000    │
└──────────┘     └────┬─────┘     └───────────┘
                      │
                ┌─────▼──────┐
                │  Supabase  │
                │ (Postgres) │
                └────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, ShadCN UI |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Automation | Python, Playwright, FastAPI |
| Auth | JWT + bcrypt |
| Deployment | Docker, AWS, Vercel |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for development)
- Python 3.12+ (for development)
- Supabase project (cloud or self-hosted)

### Run with Docker

```bash
# Clone and enter project
cd instaflow

# Configure environment
cp .env.example .env
# Edit .env with your Supabase URL, anon key, and Instagram credentials

# Run the SQL schema (backend/src/db/schema.sql) in your Supabase SQL editor

# Start all services
docker-compose up -d

# Access the app at http://localhost
```

### Development Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Automation
cd automation
pip install -r requirements.txt
playwright install chromium
python server.py
```

## Database Schema

Run `backend/src/db/schema.sql` in your Supabase SQL editor to create all required tables:

- **users** — User accounts with hashed passwords and Instagram integration fields
- **groups** — Share target groups with aliases and active status
- **schedules** — Automation schedules with interval, active days, and selection mode
- **logs** — Execution history with status, timing, and messages

## Features

- **User Authentication** — Email/password with JWT sessions
- **Group Management** — Create and manage share targets
- **Scheduling Engine** — Configurable intervals with day selection
- **Reel Discovery** — Random, trending, and smart selection modes
- **Auto Sharing** — Playwright-based Instagram automation
- **Analytics Dashboard** — Track shares, success rates, and trends
- **Activity Logs** — Detailed execution history

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get profile
- `PUT /api/auth/profile` — Update profile

### Groups
- `GET /api/groups` — List groups
- `POST /api/groups` — Create group
- `PUT /api/groups/:id` — Update group
- `DELETE /api/groups/:id` — Delete group
- `PATCH /api/groups/:id/toggle` — Toggle active/inactive

### Schedules
- `GET /api/schedules` — List schedules
- `POST /api/schedules` — Create schedule
- `PUT /api/schedules/:id` — Update schedule
- `DELETE /api/schedules/:id` — Delete schedule
- `PATCH /api/schedules/:id/pause` — Pause/resume

### Logs
- `GET /api/logs` — List logs (filterable by status)
- `POST /api/logs` — Create log entry

### Analytics
- `GET /api/analytics/dashboard` — Dashboard stats
- `GET /api/analytics/details` — Detailed analytics
- `GET /api/analytics/admin` — Admin stats (admin only)

## Project Structure

```
instaflow/
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── config/   # Supabase client
│   │   ├── db/       # SQL schema
│   │   ├── routes/   # Express routes
│   │   ├── controllers/  # Route handlers
│   │   └── middleware/   # Auth middleware
│   └── Dockerfile
├── frontend/         # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/      # Axios client
│   │   ├── components/  # UI components
│   │   ├── pages/    # Page components
│   │   └── context/  # Auth context
│   └── Dockerfile
├── automation/       # Python Playwright service
│   ├── instagram_client.py  # Instagram automation
│   ├── engine.py     # Share engine
│   ├── server.py     # FastAPI server
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```
