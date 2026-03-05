# Plan: Firebase Authentication & Viewer Invites

## Overview
Add user authentication via Firebase Auth and a token-based viewer invite system. Each user's data is scoped by their Firebase UID. Viewers can access an owner's visible data without logging in.

## Database Changes

### New Tables

#### `users`
- `id` — Firebase UID (TEXT, PK)
- `email` — TEXT, NOT NULL
- `created_at` — TIMESTAMP

#### `user_fabric_type_preferences`
- `user_id` — FK to users
- `fabric_type_id` — FK to fabric_types
- `hidden` — BOOLEAN, DEFAULT false
- UNIQUE(user_id, fabric_type_id)
- No row = visible (default)

#### `viewer_tokens`
- `id` — UUID, PK
- `token` — TEXT, UNIQUE, NOT NULL (generated random string)
- `owner_id` — FK to users (the user who created the invite)
- `revoked` — BOOLEAN, DEFAULT false
- `created_at` — TIMESTAMP

### Schema Changes

#### `fabrics`
- ADD `user_id` — FK to users, NOT NULL

#### `fabric_types`
- DROP `available` column

### Data Migration
- Create a user row for your Firebase UID
- Set `user_id` on all existing fabrics to your Firebase UID

## Backend Changes

### Middleware
- **`authMiddleware`** — verifies Firebase ID token from `Authorization: Bearer <token>` header, attaches `req.user = { uid, email }`. Auto-creates user in DB on first seen UID.
- **`viewerMiddleware`** — checks for `?token=<viewer_token>` query param. If valid and not revoked, attaches `req.viewer = { ownerId }`. Sets `req.readOnly = true`.
- **`requireAuth`** — rejects unauthenticated requests (401) and non-GET viewer requests (403).
- Routes accept either auth or viewer token. Viewer token restricts to GET-only on the owner's data.

### Route Changes

#### All existing routes
- Scope queries by `req.user.uid` (or `req.viewer.ownerId` for viewers)
- Viewers: GET only, reject POST/PUT/PATCH/DELETE with 403

#### `/api/v1/fabric-types`
- `GET /` — for authenticated users: return all types with hidden status from `user_fabric_type_preferences`. For viewers: return only visible types (not hidden by owner).
- `PATCH /:id` — toggle hidden in `user_fabric_type_preferences` instead of `fabric_types.available`. Auth only, no viewers.

#### New: `/api/v1/invite`
- `POST /` — generate a viewer token for the authenticated user (auth only)
- `GET /` — get the user's current invite link/token (auth only)
- `DELETE /` — revoke the current token (auth only)

### Repository Changes
- All fabric queries add `WHERE user_id = $x`
- `fabricTypeRepository`: join with `user_fabric_type_preferences` to get per-user hidden status
- New `userRepository`: upsert user, find by UID
- New `viewerTokenRepository`: create, find by token, revoke

## Frontend Changes

### Auth Flow
- Firebase Auth SDK in frontend (email/password)
- Store Firebase ID token, attach to all API requests via `Authorization` header
- Login screen before main app navigation

### Viewer Flow
- Viewer accesses app via URL with token param (e.g., `?token=abc123`)
- Token stored in app state, attached to API requests as query param
- UI hides all edit/delete/add actions when in viewer mode

### Screens
- New: Login screen
- New: Settings/Profile screen with invite link management (generate, copy, revoke)
- Existing screens: hide mutation actions when `readOnly` mode

## Implementation Order

### Completed
1. **Database migration** — Created `users`, `user_fabric_type_preferences`, `viewer_tokens` tables. Added `user_id` to `fabrics` (nullable → NOT NULL). Dropped `available` from `fabric_types`. Migrations: `1772556860064`, `1772557280524`, `1772557297741`.
2. **Data migration** — Created owner user row with Firebase UID `wdoAZCCP1wOVp35s5tjwIBf9h0W2`, assigned all existing fabrics.
3. **Backend auth middleware** — `middleware/auth.ts`: Firebase Admin SDK verifies Bearer token, auto-creates user via `userRepository.upsert()`. Passes through (instead of rejecting) when no Bearer token, to allow viewer middleware to try next.
4. **Backend route scoping** — All fabric repository/service/router methods accept `userId`. Queries scoped with `WHERE user_id = $x`.
5. **Backend fabric_type_preferences logic** — `FabricTypeRepository.findAll(userId, options?)` JOINs with `user_fabric_type_preferences` to compute per-user `hidden` status. `fabric_count` also scoped per user. `toggleHidden(userId, fabricTypeId, hidden)` upserts into preferences table. Router uses `?hidden=false/true` query param. `FabricType` type: `available` → `hidden`. Frontend API + screen updated to match.
6. **Backend viewer middleware + invite routes** — `middleware/viewer.ts`: `viewerMiddleware` validates `?token=` query param against `viewer_tokens` table, sets `req.viewer = { ownerId }` + `req.readOnly = true`. `requireAuth` middleware rejects unauthenticated requests (401) and non-GET viewer requests (403). `routers/invite.ts`: auth-only routes for `GET/POST/DELETE /api/v1/invite`. `repositories/viewerTokenRepository.ts`: create, findByToken, findActiveByOwner, revokeAllByOwner. GET routes in fabrics/fabricTypes routers use `getUserId(req)` helper to resolve `req.user?.uid ?? req.viewer!.ownerId`.
7. **Frontend auth (Firebase client SDK, login screen)** — Installed `firebase` package. `config/firebase.ts` initializes Firebase app + auth from `EXPO_PUBLIC_` env vars. `context/AuthContext.tsx` provides `useAuth()` hook with `user`, `loading`, `login`, `signup`, `logout`. `screens/LoginScreen.tsx` with email/password, error handling, login/signup toggle. `App.tsx` wraps in `AuthProvider`, shows `LoginScreen` when unauthenticated, loading spinner while checking auth state.
8. **Frontend API layer (attach auth token)** — `api/authFetch.ts` wrapper gets Firebase ID token via `user.getIdToken()` and sets `Authorization: Bearer <token>` header. All `fetch` calls in `fabrics.ts`, `fabricTypes.ts`, `materials.ts` replaced with `authFetch`.

### Remaining
9. Frontend viewer mode (read-only UI)
10. Frontend invite management UI
