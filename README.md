# Task Manager (Full Stack)

Production-ready full-stack Task Manager with:

- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL (Neon)
- Frontend: React (Vite) + TypeScript + TailwindCSS + React Query + React Hook Form + Zod
- Realtime: Socket.io
- Auth: JWT in **HttpOnly cookies**

## Live URLs

- Frontend (Vercel): https://task-manager-xi-ochre.vercel.app
- Backend (Render): https://task-manager-2-zcjc.onrender.com

## Setup instructions (Local Development)

Prerequisites:

- Node.js 20+ (recommended)
- A PostgreSQL database (Neon recommended)

### 1) Backend

Create `backend/.env` from `backend/.env.example`.

Mandatory env vars:

- `DATABASE_URL` (Neon: include `?sslmode=require`)
- `JWT_ACCESS_SECRET`
- `CORS_ORIGINS` (comma-separated list)
- `COOKIE_SECURE` (`false` locally, `true` in production)

Run:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2) Frontend

Run:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

> In local dev, Vite proxies `/api/*` and `/socket.io/*` to `http://localhost:4000`.

## API Contract documentation

Base URL: `/api/v1`

Auth:

- `POST /auth/register`
  - Body: `{ email, password, name }`
  - Sets an HttpOnly cookie
- `POST /auth/login`
  - Body: `{ email, password }`
  - Sets an HttpOnly cookie
- `POST /auth/logout`
  - Clears the cookie

Users:

- `GET /users/me`
- `PATCH /users/me`
  - Body: `{ name }`
- `GET /users` (minimal list for assignee picker)

Tasks:

- `GET /tasks`
  - Query (optional): `status`, `priority`, `sortDueDate=asc|desc`
- `GET /tasks/dashboard`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

Notifications:

- `GET /notifications`
- `PATCH /notifications/:id/read`

## Architecture Overview & Design Decisions

### Why PostgreSQL + Prisma

- PostgreSQL provides strong relational guarantees, indexing, and transactional integrity.
- Prisma provides type-safe DB access and a straightforward migration workflow.

### Backend architecture

The backend uses a layered architecture per module:

- **Routes**: mount endpoints + middleware
- **Controllers**: HTTP layer (req/res)
- **Services**: business rules (authorization, side effects)
- **Repositories**: Prisma DB access
- **DTO validation**: Zod schemas for body/query validation

### JWT + cookies

- JWT is stored in an **HttpOnly cookie**.
- CORS is enabled with `credentials: true`.
- Production requires `SameSite=None; Secure` cookies, so `COOKIE_SECURE=true` and `CORS_ORIGINS` must include the Vercel domain.

### Frontend architecture

- **React Router** for routing
- **React Query** for server-state caching/invalidation
- **React Hook Form + Zod** for robust forms

## Socket.io integration (real-time)

- Socket.io is initialized on the backend using the same HTTP server.
- Backend emits:
  - `task:created`, `task:updated`, `task:deleted`
  - `notification` (per-user)
- Frontend listens and invalidates React Query caches (`tasks`, `dashboard`, `notifications`).

## Trade-offs / assumptions

- Real-time UX uses cache invalidation (simple and consistent) instead of optimistic updates.
- `GET /users` returns a minimal public list for assignee selection (id/name/email).
- Cross-site cookie auth requires careful CORS + cookie flags in production.

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
