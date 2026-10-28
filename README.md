# TaskFlow — MERN Task Management App

Plan projects, track tasks, hit deadlines. Built with MongoDB, Express, React (Vite) and Node.

## Features
- Register / login with JWT, protected routes (frontend + backend)
- Dashboard: totals, completion %, recent tasks, upcoming deadlines, project summary
- Tasks: create, edit, delete, complete; priority, status, due date, project; search, filter, sort, pagination
- Projects: color, progress bar, per-project task list
- Profile: change name and password, logout
- Every record is scoped to the logged-in user **in the database query** (`{ _id, user: req.user._id }`)

## Run locally (Windows + VS Code)
1. Install Node.js LTS and either MongoDB Community (service running on port 27017) or create a free MongoDB Atlas cluster and copy its connection string.
2. Backend:
   ```
   cd server
   copy .env.example .env      (then edit JWT_SECRET, and MONGO_URI if using Atlas)
   npm install
   npm run seed                (optional: demo@taskflow.dev / Demo@1234)
   npm run dev                 (http://localhost:5000)
   ```
3. Frontend (second terminal):
   ```
   cd client
   copy .env.example .env
   npm install
   npm run dev                 (http://localhost:5173)
   ```

## Authentication flow (interview answer)
1. **Register**: server validates input, bcrypt hashes the password, saves the user, returns a signed JWT.
2. **Login**: server finds the user, compares the password with bcrypt, returns a JWT (valid 7 days).
3. The React app stores the token in `localStorage` and an Axios interceptor adds `Authorization: Bearer <token>` to every request.
4. `protect` middleware verifies the token signature and expiry, loads the user and sets `req.user`. Bad or expired token -> 401.
5. Every controller filters by `req.user._id`, so one user can never read or change another user's data (not found -> 404).
6. On a 401 the frontend clears the token and sends the user to login. `ProtectedRoute` guards private pages.
7. **Logout** deletes the token on the client (JWTs are stateless).

Trade-off to mention: localStorage is simple but readable by JavaScript (XSS risk); httpOnly cookies are the more hardened option.

## Deployment
- **Database**: MongoDB Atlas (allow your host's IPs, or 0.0.0.0/0 for a demo).
- **Backend** (Render/Railway): root `server`, start `npm start`, env vars `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL=https://your-frontend.vercel.app`.
- **Frontend** (Vercel/Netlify): root `client`, build `npm run build`, output `dist`, env `VITE_API_URL=https://your-backend.onrender.com/api`. Add a rewrite of all paths to `/index.html` so React Router refreshes work (Vercel: `vercel.json` with `{"rewrites":[{"source":"/(.*)","destination":"/"}]}`).

## API
Auth: `POST /api/auth/register|login|logout`, `GET /api/auth/me`
Tasks: `GET|POST /api/tasks`, `GET|PUT|DELETE /api/tasks/:id`, `PATCH /api/tasks/:id/status`
Projects: `GET|POST /api/projects`, `GET|PUT|DELETE /api/projects/:id`
Profile: `GET|PATCH /api/users/me`
Task list query params: `search, status, priority, project, due (overdue|today|week|none), sort, page, limit`
