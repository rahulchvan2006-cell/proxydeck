# Proxydeck

![Proxydeck](frontend/public/logo.svg)

Web dashboard for Caddy/Traefik. Bun + React, one origin. Needs: Bun, Node, PostgreSQL.

```bash
cp .env.sample .env   # BETTER_AUTH_SECRET, DATABASE_URL
bun install && cd frontend && npm install && cd ..
bun run db:migrate && bun run build && bun run start
```

`bun run dev` → http://localhost:3000

**Production (Docker):**

```bash
curl -fsSL https://raw.githubusercontent.com/zhravan/proxydeck/main/bootstrap.sh | bash
```

Or clone and run: `git clone https://github.com/zhravan/proxydeck.git && cd proxydeck && ./install.sh`

Set `BETTER_AUTH_SECRET` in `.env`. Either set `DATABASE_URL` (your Postgres; no Postgres container) or leave unset and use bundled Postgres (script will prompt for `POSTGRES_PASSWORD` and run `docker compose --profile db up -d`).

### .env

| Variable | Meaning |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (optional: omit to use bundled Postgres with `--profile db`) |
| `POSTGRES_PASSWORD` | Used when running bundled Postgres (`docker compose --profile db`) |
| `BETTER_AUTH_SECRET` | Auth signing secret (e.g. `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | App base URL (default `http://localhost:3000`) |
| `PORT` | Server port (default 3000) |
| `CADDY_ADMIN` | Caddy admin API (optional) |
| `TRAEFIK_API_URL` | Traefik API URL (optional) |
| `TRAEFIK_DYNAMIC_CONFIG` | Traefik dynamic config path (optional) |
| `PROXY_LOG_FILE` | Proxy log file path (optional) |
