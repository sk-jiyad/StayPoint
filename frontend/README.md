# StayPoint — Frontend

React + Vite SPA for the StayPoint backend. Talks to the Spring Boot API under `/api`.

## Run locally

The frontend expects the backend running on `http://localhost:1004`.

```bash
# 1. Backend (from the repo's StayPoint/ folder) — needs MySQL + StayPoint/.env
cd ../StayPoint
./mvnw spring-boot:run

# 2. Frontend (this folder)
npm install
npm run dev
```

Open **http://localhost:3000**.

## How it connects

- API calls go through `src/lib/api.js` using the base URL `VITE_API_BASE_URL` (default `/api`).
- In dev, `vite.config.js` proxies `/api` → `http://localhost:1004`, so the browser stays
  same-origin and there are no CORS issues. For a deployed build, set `VITE_API_BASE_URL`
  to the backend's full URL (and allow that origin in the backend's `CORS_ALLOWED_ORIGINS`).
- Auth state (JWT + user) lives in `src/lib/auth.jsx` (`AuthProvider` / `useAuth`), persisted
  in `localStorage`. The token is attached as `Authorization: Bearer <jwt>` automatically.

## Pages

| Route | Page | Backend calls |
|---|---|---|
| `/` | Landing | — |
| `/explore` | Browse PGs | `GET /api/pgs` |
| `/pg/:id` | PG details | `GET /api/pgs/{id}` |
| `/add-pg` | List a PG (owners only) | `POST /api/pgs` |
| `/login` | Login / Signup | `POST /api/auth/login`, `POST /api/auth/register` |

## Not yet backed by the API (placeholders)

Photos, maps/geo, ratings & reviews, and the college/gender/distance filters have no backend
support yet — they're shown as placeholders or omitted. Extending the backend to store these
is the natural next step.
