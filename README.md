# Task Manager (Full Stack)

Production-ready full-stack Task Manager with:

- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL (Neon)
- Frontend: React (Vite) + TypeScript + TailwindCSS + React Query + React Hook Form + Zod
- Realtime: Socket.io
- Auth: JWT in **HttpOnly cookies** (cross-site compatible)

## Live URLs (fill after deployment)

- Frontend (Vercel): <ADD_FRONTEND_URL>
- Backend (Railway): <ADD_BACKEND_URL>

## Why PostgreSQL + Prisma

- PostgreSQL provides strong relational guarantees, indexing, and transactional integrity.
- Prisma offers type-safe queries, migrations, and a clean developer experience in TypeScript.
- The task/notification/user domain fits relational modeling well (foreign keys, enums, and user/task relations).

## Architecture overview

Backend is organized in modules with clear separation:

- **Routes**: wire endpoints + middleware
- **Controllers**: HTTP translation layer (req/res)
- **Services**: business logic (authorization rules, side-effects)
- **Repositories**: database access via Prisma
- **DTO Validation**: Zod schemas for request bodies/queries

Frontend uses:

- **React Router** for routing
- **React Query** for server-state caching + invalidation
- **React Hook Form** for forms
- **Zod** for validation

## Real-time (Socket.io) integration

- Backend emits global task events:
  - `task:created`
  - `task:updated`
  - `task:deleted`
- Backend emits per-user notifications to a private room (userId-based):
  - `notification`
- Frontend listens for these events and invalidates React Query caches (`tasks`, `dashboard`, `notifications`) so all connected clients update instantly.

## Local development

### 1) Backend

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Create `backend/.env` from `backend/.env.example`.

Backend runs on `http://localhost:4000`.

### 2) Frontend

```bash
npm install
npm run dev
```

Create `frontend/.env` from `frontend/.env.example` (optional for local dev).

Frontend runs on `http://localhost:5173`.

> In local dev, Vite proxies `/api/*` and `/socket.io/*` to `http://localhost:4000`.

## API overview

Base URL: `/api/v1`

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /users/me`
- `PATCH /users/me`
- `GET /users` (minimal public list for assignee picker)
- `GET /tasks`
- `GET /tasks/dashboard`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `GET /notifications`
- `PATCH /notifications/:id/read`

## Deployment (Vercel + Railway + Neon)

### Backend on Railway

1. Create a new Railway project from the `backend` folder.
2. Set environment variables (see `backend/.env.example`).
3. Ensure the build/start commands are:
   - Build: `npm run build`
   - Start: `npm run start`
4. Add Neon `DATABASE_URL`.
5. Run migrations (Railway deploy command or one-off run):
   - `npm run prisma:migrate`

**Important env settings**

- `NODE_ENV=production`
- `COOKIE_SECURE=true`
- `CORS_ORIGINS=https://<your-vercel-app>.vercel.app`

### Frontend on Vercel

Deploy the `frontend` folder.

Set env vars:

- `VITE_API_BASE_URL=https://<your-railway-backend-domain>/api/v1`
- `VITE_SOCKET_URL=https://<your-railway-backend-domain>`

**Recommended (simpler): Vercel rewrites proxy**

If you use `frontend/vercel.json` rewrites, you can keep:

- `VITE_API_BASE_URL=/api/v1`
- `VITE_SOCKET_URL=` (empty)

and Vercel will proxy requests to Railway.

IMPORTANT: `frontend/vercel.json` contains `REPLACE_WITH_RAILWAY_DOMAIN`.
Replace it with your actual Railway public domain (e.g. `https://your-app.up.railway.app`) before deploying.

### Cookies / CORS notes

- Auth uses **HttpOnly cookies**.
- For cross-site deployments, cookies must be `SameSite=None; Secure`.
- Backend must send `Access-Control-Allow-Credentials: true` and allow the Vercel origin.

## Trade-offs / assumptions

- Assignee selection uses a minimal `GET /users` endpoint returning only `id/name/email` for authenticated users.
- Realtime updates are handled via query invalidation (robust and simple) rather than optimistic UI.
- Local dev uses a Vite proxy for `/api` and `/socket.io` to simplify cookies and CORS.

## Scripts

Backend:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm test`

Frontend:

- `npm run dev`
- `npm run build`
- `npm run preview`
