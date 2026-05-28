# API Guide - FRMS

Base URL:
- Production: `https://faculty-research-management-system.onrender.com/api`
- Frontend env: `VITE_API_URL`

## Authentication
- `POST /auth/register`
  - Public registration ignores role self-assignment.
  - Creates inactive faculty account pending approval.
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

## User and Admin Management
- `GET /users/departments/list` (public)
- `GET /users/lookups` (public)
- `GET /users` (admin/hod)
- `GET /users/pending-approvals` (admin)
- `PATCH /users/:id/approve-faculty` (admin)
- `PATCH /users/:id/assign-role` (admin)
- `PATCH /users/:id/toggle-status` (admin)

## Research Modules
- `GET/POST/PUT/DELETE` routes for publications, projects, patents, grants, events.
- Approval workflow endpoints available for privileged roles.

## Reports
- `POST /reports/generate`
  - Types: `faculty_wise`, `department_wise`, `year_wise`, `naac`, `nba`, `nirf`, `api_score`, `faculty_api_score`
  - Formats: `pdf`, `excel`
- `GET /reports`

## AI Suite
- `/ai/research-summary`
- `/ai/publication-recommendation`
- `/ai/trend-analysis`
- `/ai/citation-insights`
- `/ai/smart-search`
- `/ai/plagiarism`
- `/ai/proposal-assistant`
- `/ai/faculty-cv`
- `/ai/chat`
- `/ai/ocr`

## Audit and Notifications
- `GET /audit-logs` (admin/super_admin)
- Notification endpoints for current user alerts.
