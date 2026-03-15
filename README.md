# Proxydeck

Web dashboard for Caddy and Traefik. Single app: Elysia (Bun) backend serves the React (Vite) UI from `frontend/dist`. One origin, one process in production and recommended dev workflow.

## Requirements

Bun, Node (for frontend build), PostgreSQL. Caddy or Traefik optional (auto-detected).

## Quick start

```bash
cp .env.sample .env
# Edit .env and set BETTER_AUTH_SECRET (e.g. openssl rand -base64 32)

# Optional: run Postgres via Docker for local dev
docker compose -f docker-compose-dev.yml up -d

bun install
cd frontend && npm install && cd ..
bun run db:migrate
bun run build
bun run start
```

Open **http://localhost:3000** and sign up (first user only).

## Development (single app, one origin)

Run one command; UI and API are both on port 3000 so auth and cookies work correctly:

```bash
bun run dev
```

This builds the frontend once, then runs the backend with hot reload and watches the frontend for changes (rebuilds on save). Open **http://localhost:3000**.

Optional: `bun run dev:ui` starts only the Vite dev server (port 5173, proxies /api to 3000). Use only if you need HMR and are not testing auth; run the backend separately on 3000.

## Env

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret (≥32 chars) |
| `BETTER_AUTH_URL` | App base URL |
| `CADDY_ADMIN` | Caddy admin API (default `http://localhost:2019`) |
| `TRAEFIK_API_URL` | Traefik API (default `http://localhost:8080`) |
| `TRAEFIK_DYNAMIC_CONFIG` | Traefik dynamic config path |
| `PROXY_LOG_FILE` | Optional proxy log path |

## Docker

```bash
docker build -t proxydeck .
docker run -p 3000:3000 -e DATABASE_URL=... -e BETTER_AUTH_SECRET=... proxydeck
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | **Recommended.** Build UI once, then run backend + UI watch. Single origin http://localhost:3000. |
| `bun run dev:server` | Backend only with hot reload (after `bun run build:ui` once) |
| `bun run build` / `bun run build:ui` | Build frontend (output: frontend/dist) |
| `bun run dev:ui` | Vite dev server only (port 5173; separate origin, use for UI-only work) |
| `bun run start` | Run backend (serves frontend/dist; run build first) |
| `bun run db:migrate` | Apply schema (db/schema.sql) |
