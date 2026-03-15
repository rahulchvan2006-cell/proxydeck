# Proxydeck

Web dashboard for Caddy and Traefik. Elysia (Bun) + React SSR.

## Requirements

Bun, PostgreSQL. Caddy or Traefik optional (auto-detected).

## Quick start

```bash
cp .env.sample .env
# Edit .env and set BETTER_AUTH_SECRET (e.g. openssl rand -base64 32)

# Optional: run Postgres via Docker for local dev
docker compose -f docker-compose-dev.yml up -d

bun install
bun run db:migrate
bun run build:client
bun run start
```

Open http://localhost:3000 and sign up (first user only).

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
| `bun run dev` | Dev server with hot reload |
| `bun run build:client` | Build React bundle |
| `bun run start` | Run server (run build:client first) |
| `bun run db:migrate` | Apply schema (db/schema.sql) |
