# Faculty Research Management System (FRMS)

A production-ready MERN stack application for colleges and universities to manage faculty research data, publications, patents, projects, grants, approvals, analytics, and accreditation-ready reports (NAAC/NBA/NIRF/API).

## Tech Stack
- Frontend: React.js + Tailwind CSS + Recharts
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- File Upload: Multer + Cloudinary (production) with local fallback
- Reports: PDFKit + ExcelJS
- Role Control: Super Admin, Admin, HOD/Dean, Faculty, Research Coordinator

## Project Structure

```text
faculty-research-management-system/
  backend/
    src/
      config/
      controllers/
      middlewares/
      models/
      routes/
      seeds/
      services/
      uploads/
  frontend/
    src/
      api/
      components/
      config/
      context/
      pages/
```

## Core Features
- Authentication with login/register/forgot password/reset password
- Role-based protected APIs and frontend routes
- Faculty profile management with IDs (Google Scholar, ORCID, Scopus)
- Publication, Project, Patent, Grant, Event management with document upload
- Two-level approval workflow (HOD verification + Admin final approval)
- Pending approvals dashboard
- Research score engine and faculty ranking
- Dashboard analytics with charts and KPI cards
- PDF and Excel report generation:
  - Faculty-wise
  - Department-wise
  - Year-wise
  - NAAC Criterion III
  - NBA
  - NIRF
  - API score
  - Faculty API score
- Notification center
  - Pending approvals for reviewers
  - Approval/rejection updates for submitters
  - Project deadline reminders (within 30 days)
  - Missing document alerts
- User activation/deactivation
- Department and lookup (designation/research category) management
- Faculty-accessible self-service reports (faculty-wise/year-wise/API score)
- AI Research Intelligence Suite:
  - AI research summary from uploaded PDF
  - Publication recommendation (journals/conferences/domains)
  - Research trend analysis and topic growth
  - Citation insights and growth prediction
  - Semantic smart search
  - Plagiarism report support and high-similarity flagging
  - AI proposal assistant
  - Auto-generated faculty CV (PDF)
  - In-app AI chat assistant
  - Research score prediction and department forecast
  - OCR extraction with form auto-fill hints
- Gemini/OpenAI provider toggle with automatic fallback
- Swagger API docs for all modules at `/api/docs`
- Background scheduler jobs:
  - Citation analytics recomputation
  - Trend snapshot refresh
  - Project deadline reminder notifications
  - Missing document alerts
- Admin audit logs:
  - Login
  - Approve/reject
  - Delete
  - Report export
  - AI module usage
- Production security middleware:
  - Helmet
  - API rate limiting

## Roles
- `super_admin`
- `admin`
- `hod_dean`
- `faculty`
- `research_coordinator`

## Setup Instructions

### 1) Environment
Copy `.env.example` to `.env` and update values.

### 2) Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3) Seed Database
```bash
cd backend
npm run seed
```

### 4) Run Backend
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

Public `/api/auth/register` behavior:
- Ignores privileged role assignment from public clients
- Creates `faculty` users only
- Sets new public registrations as inactive (pending admin activation)
- Allows privileged user creation only for authenticated `super_admin`/`admin`

### 5) Run Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## Demo Credentials (All Roles)
- Super Admin
  - Email: `mandalgyanendra9@gmail.com`
  - Password: `Admin@123`
- Admin
  - Email: `admin.user@frms.com`
  - Password: `AdminUser@123`
- HOD/Dean
  - Email: `hod.cse@frms.com`
  - Password: `Hod@12345`
- Research Coordinator
  - Email: `coordinator@frms.com`
  - Password: `Coord@123`
- Faculty
  - Email: `faculty1@frms.com`
  - Password: `Faculty@123`

## Key API Route Groups
- `/api/auth`
- `/api/users`
- `/api/faculty`
- `/api/publications`
- `/api/projects`
- `/api/patents`
- `/api/grants`
- `/api/events`
- `/api/approvals`
- `/api/reports`
- `/api/dashboard`
- `/api/notifications`
- `/api/ai`
- `/api/settings`
- `/api/audit-logs`
- `/api/docs`

## Deployment Guide

### Backend on Render
1. Push repository to GitHub.
2. In Render, create a new `Web Service` from repo.
3. Use root directory `backend`.
4. Build command: `npm install`
5. Start command: `npm run start`
6. Set environment variables from `.env.example` (production values).
7. Set `CLIENT_URL` to deployed Vercel frontend URL.
8. Optional: use `render.yaml` included in project root for IaC setup.

### Profile Photo Migration
Use the migration script to backfill existing faculty and user profile photo fields safely before or after deployment.

What the migration does:
- Scans `users` and `facultyprofiles` for legacy image fields such as `avatar`, `profileImage`, `photoUrl`, `profileImageUrl`, and `/uploads/...` values.
- Keeps `profilePhotoUrl` as the canonical field.
- Preserves full `http` / `https` URLs as-is.
- Leaves `/uploads/...` values intact so the backend-root resolver can still resolve them correctly in the frontend.
- Copies legacy photo fields into `profilePhotoUrl` only when the canonical field is missing.

Safe usage:
- Dry run first to review the candidate count and ensure nothing is written.
- The script logs how many records were checked, backfilled, and updated.
- It is idempotent for the supported fields, so rerunning it will not keep changing already-normalized records.
- Rollback is safe because the migration does not delete old fields; if you ever need to revert the data layer, restore from a database backup or reset `profilePhotoUrl` from your backup snapshot.

CLI examples:
```bash
npm run migrate:profile-photos -- --dry-run
```
```bash
npm run migrate:profile-photos
```

### Frontend on Vercel
1. Import repository in Vercel.
2. Set project root to `frontend`.
3. Vercel config file is included at `frontend/vercel.json`.
4. Add environment variable:
   - `VITE_API_URL=https://<render-backend-domain>/api`
5. Deploy and verify login/report download flows.

### MongoDB Atlas
1. Create cluster in MongoDB Atlas.
2. Create DB user and allow network access from Render.
3. Set backend `MONGO_URI` to Atlas connection string.
4. Run backend seed once using deployed shell or local with Atlas URI:
   - `cd backend && npm run seed`
   - For production-safe admin upsert only (without wiping data): `npm run seed:admin`

## Environment Variables

### Backend
- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `API_BASE_URL`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `ENABLE_SCHEDULER`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_EMBEDDING_MODEL`
- `PLAGIARISM_THRESHOLD`

### Frontend
- `VITE_API_URL`

### Optional Cloudinary (Backend)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- When set, faculty profile photos and other uploads are sent to Cloudinary in production and the returned `secure_url` is stored as `profilePhotoUrl`.

## Screenshots
- Add final UI captures to `docs/screenshots/` and update image links below.

![Login](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)
![AI Suite](docs/screenshots/ai-suite.png)
![Audit Logs](docs/screenshots/audit-logs.png)

## Notes
- Local upload files are served from `/uploads/*`.
- If Cloudinary env vars are set, uploaded/generated files use Cloudinary URLs, including faculty profile photos.
- Report files are generated at `/uploads/reports/*`.
- For image fields, the frontend resolves `/uploads/...` against the backend root so production URLs work on Render and Vercel.
- Rejection reason is mandatory when rejecting approvals.
- Faculty can edit/delete only their own pending entries.
- AI module works in two modes:
  - `OpenAI` or `Gemini` (selected in Settings)
  - Automatic provider fallback if the primary provider fails
  - No API key mode falls back to local heuristic AI utilities
- API docs available at `/api/docs` and JSON spec at `/api/docs.json`.
- Scheduler auto-runs unless `ENABLE_SCHEDULER=false`.
- Backend smoke and load checks:
  - `cd backend && npm run qa:register`
  - `cd backend && npm run qa:smoke`
- Profile photo migration:
  - `cd backend && npm run migrate:profile-photos -- --dry-run`
  - `cd backend && npm run migrate:profile-photos`
  - `cd backend && npm run load:check`
