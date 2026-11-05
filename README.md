# PujaConnect — Online Pandit & Puja Booking Platform

Full-stack MERN app: React + Vite frontend, Node/Express + MongoDB backend, JWT auth.

## Redesign note

This version has a new visual design (CSS + HTML structure). Backend and all frontend logic (AuthContext, API calls, routes, state) are unchanged.

## Why the "name not showing after login" issue is fixed here

The whole login flow is built around **one source of truth**: `AuthContext`
(`frontend/src/context/AuthContext.jsx`).

- On login/register, the backend returns `{ token, user }`. The token is saved
  to `localStorage`, and `user` is put straight into React state — so the
  Navbar re-renders with the real name **immediately**, no page refresh needed.
- On every app load / refresh, `AuthContext` calls `GET /api/auth/me` with the
  saved token. The backend's `protect` middleware re-fetches the user **fresh
  from MongoDB** every time (not from stale token data), so the name, role,
  and profile shown are always the current, real-time record — even if it was
  changed elsewhere (profile edit, admin action).
- `Navbar.jsx` reads `user` from `useAuth()`, so any component wrapped by
  `AuthProvider` sees the same live user object.

## Project structure

```
pujaconnect/
  backend/     Express API + MongoDB models (User, Booking) + JWT auth
  frontend/    React (Vite) app
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (local MongoDB or MongoDB Atlas connection string)
npm run dev
```

Runs on **http://localhost:5000**.

Optional — create a default admin account for testing the Admin Dashboard:

```bash
node seedAdmin.js
# email: admin@pujaconnect.com  |  password: Admin@123
```

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should point to your backend, e.g. http://localhost:5000/api
npm run dev
```

Runs on **http://localhost:5173**.

## 3. Try it out

1. Go to `/register`, sign up as a **Pandit** (fill city, pooja types, price).
2. Log out, register again as a **Customer**.
3. As the customer: go to "Find a Pandit" → open the pandit's profile → **Book Now**.
4. Log back in as the pandit → accept/complete the booking from the Pandit Dashboard.
5. Log in as admin (seeded above) → verify the pandit, view platform stats.

## Key API endpoints

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET  | /api/auth/me | Logged-in (returns fresh user) |
| PUT  | /api/auth/profile | Logged-in |
| GET  | /api/pandits | Public (filters: city, poojaType, language, minExperience, search, sort) |
| GET  | /api/pandits/:id | Public |
| POST | /api/pandits/:id/reviews | Customer |
| POST | /api/pandits/availability | Pandit (block a date) |
| DELETE | /api/pandits/availability/:date | Pandit (unblock a date) |
| POST | /api/bookings | Customer (rejects on blocked date or a double-booked time slot) |
| GET  | /api/bookings/my | Logged-in (customer or pandit) |
| PUT  | /api/bookings/:id/status | Pandit / Admin / owning customer (cancel only) |
| GET  | /api/admin/stats | Admin |
| GET  | /api/admin/users | Admin |
| PUT  | /api/admin/users/:id/toggle-active | Admin |
| PUT  | /api/admin/users/:id/verify-pandit | Admin |
| GET  | /api/admin/bookings | Admin |
| GET  | /api/categories | Public (add ?all=true as admin to include inactive) |
| POST | /api/categories | Admin |
| PUT  | /api/categories/:id/toggle | Admin |
| DELETE | /api/categories/:id | Admin |

## Additional features

- **Pandit profile editing** — `/pandit/profile` lets a logged-in pandit update their bio, pricing, poojas, and languages.
- **Availability calendar** — pandits can block specific dates from the same page; blocked dates are rejected at booking time.
- **Double-booking prevention** — the backend rejects a new booking if the same pandit already has a pending/confirmed booking at the same date and time.
- **Admin: All Bookings tab** — full platform booking list with status, in the Admin Dashboard.
- **Admin: Puja Categories tab** — add, deactivate, or delete ritual categories shown platform-wide.

## Notes

- MongoDB must be running locally, or use a free MongoDB Atlas cluster and
  put its connection string in `backend/.env` as `MONGO_URI`.
- Change `JWT_SECRET` in `backend/.env` before deploying anywhere real.
