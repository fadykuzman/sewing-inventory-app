# Deployment Plan: Ship Sewing Inventory App to Family

## Context

The sewing inventory app (Expo frontend + Express backend + PostgreSQL) needs to be deployed to the home server at `sewing.vanillaandcaramel.com` and distributed as an Android APK to family members. The server already runs Traefik, PiHole, Immich, Jellyfin, and Paperless via Podman Compose. This plan adds the sewing app to that stack with CI/CD via GitHub Actions.

---

## Step 1: Shared Package — Add Build Step

**Files:** `shared/package.json`, `shared/tsconfig.json`

Currently `"main": "src/index.ts"` (no compiled output). For production, we need compiled JS.

- Add `"build": "tsc"` and `"prepare": "npm run build"` scripts
- Change `"main"` to `"dist/index.js"`, `"types"` to `"dist/index.d.ts"`
- `prepare` runs automatically on `npm install`, so local dev keeps working
- Add `dist/` to shared `.gitignore`

---

## Step 2: Backend Code Changes

**File:** `backend/src/index.ts`

- Make `dotenv.config()` conditional: only load `../.env` when `NODE_ENV !== 'production'`
- Default PORT to `3000`: `process.env.PORT || 3000`
- Add `GET /health` endpoint (returns `{ status: 'ok' }`)
- Make CORS configurable via `CORS_ORIGIN` env var (comma-separated origins); default to open (dev)

**File:** `backend/package.json`

- Add `"migrate:up:prod": "node-pg-migrate up --migration-file-language sql"` (reads `DATABASE_URL` from env, no `--envPath`)

---

## Step 3: Rewrite Containerfile

**File:** `infra/Containerfile`

Multi-stage build handling the monorepo workspace structure:

**Builder stage:**
1. Copy root `package.json`, `package-lock.json`
2. Copy `shared/package.json` and `backend/package.json` (not frontend)
3. Copy `tsconfig.base.json`
4. `npm ci --workspace=shared --workspace=backend`
5. Copy `shared/` source → `npm run build --workspace=shared`
6. Copy `backend/` source → `npm run build --workspace=backend`

**Runner stage:**
1. Copy root + workspace `package.json` files
2. `npm ci --workspace=shared --workspace=backend --omit=dev`
3. Copy compiled `shared/dist/` and `backend/dist/`
4. Copy `backend/migrations/` (for running migrations)
5. `WORKDIR /app/backend`, `EXPOSE 3000`, `CMD ["node", "dist/index.js"]`

---

## Step 4: Server-Side Setup

See `HOME_SERVER_SETUP.md` for full instructions. Summary:

- Create `/home/tinyhome/Services/sewing/compose.yml` with postgres + backend services
- Create `/home/tinyhome/Services/sewing/.env` with DB credentials
- Add to master compose includes in `/home/tinyhome/Services/compose.yml`
- Add Traefik route in `/home/tinyhome/Services/traefik/dynamic/services.yml`
- PiHole DNS already handled (wildcard `*.vanillaandcaramel.com`)

---

## Step 5: GitHub Actions CI/CD

**File:** `.github/workflows/deploy.yml`

**Trigger:** push to `main`

**Job 1 — build-and-push:**
- Checkout → Login to GHCR (uses `GITHUB_TOKEN`, no separate PAT needed) → Build & push image with `latest` + `sha` tags

**Job 2 — deploy (needs build-and-push):**
- Connect to Tailscale (`TAILSCALE_AUTHKEY` secret, `tag:ci`)
- SSH to server (`SERVER_TAILSCALE_IP`, `SERVER_SSH_USER`, `SERVER_SSH_KEY`)
- Pull new image
- Run migrations via disposable container (source `.env` from server for DB credentials)
- Restart sewing-backend via `podman compose`

**GitHub Secrets needed:**

| Secret | Value |
|---|---|
| `TAILSCALE_AUTHKEY` | Ephemeral reusable auth key with `tag:ci` |
| `SERVER_TAILSCALE_IP` | `100.96.26.45` |
| `SERVER_SSH_USER` | `tinyhome` |
| `SERVER_SSH_KEY` | Private ed25519 key (generate dedicated keypair) |

**Server-side prep:**
- Add the public key to `tinyhome`'s `~/.ssh/authorized_keys`
- Authenticate podman with GHCR: `podman login ghcr.io`
- Ensure Tailscale ACL allows `tag:ci` to reach the server

---

## Step 6: APK Build & Distribution Guide

**File:** `docs/APK_BUILD_GUIDE.md` (new)

Detailed markdown guide covering:
- Prerequisites (Node.js, EAS CLI, Expo account)
- One-time setup (eas.json with preview profile for APK, Android keystore)
- Build command: `EXPO_PUBLIC_API_URL=https://sewing.vanillaandcaramel.com/api/v1 eas build --platform android --profile preview --local`
- How to distribute: SCP to server, host via Traefik, or share directly
- How to update: rebuild and redistribute

**File:** `frontend/eas.json` (new)

EAS build config with `preview` profile (APK output) and `production` profile (AAB).

---

## Step 7: Update Existing Docs

- **`LOCAL_DEV_SETUP.md`** — Rewrite to match actual setup (monorepo, Expo, npm workspaces, local docker-compose for Postgres)
- **`HOME_SERVER_SETUP.md`** — Rewrite to match actual server (Podman compose pattern, Traefik routing, no Quadlet, no separate app user)
- **`docs/GOLIVE_TODOS.md`** — Update/check off completed items

---

## Implementation Order

1. Step 1 (shared build step) — must be first, backend depends on it
2. Step 2 (backend code changes)
3. Step 3 (Containerfile) — test locally with `podman build`
4. Step 5 (GitHub Actions workflow)
5. Step 4 (server-side setup) — create dirs, compose, traefik route
6. First deploy — push to main, verify pipeline
7. Step 6 (APK build guide + eas.json)
8. Step 7 (update docs)

## Verification

1. **Local**: `podman build -f infra/Containerfile -t sewing-backend:local .` succeeds
2. **Server**: `curl https://sewing.vanillaandcaramel.com/health` returns `{ "status": "ok" }`
3. **CI/CD**: Push to main triggers build → deploy → service restarts
4. **APK**: Built APK connects to `sewing.vanillaandcaramel.com` and shows fabric list
5. **Images**: Upload a fabric with photo, verify image loads via `https://sewing.vanillaandcaramel.com/uploads/fabrics/...`
