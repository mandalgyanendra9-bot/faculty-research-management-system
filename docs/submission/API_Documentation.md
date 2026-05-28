# API Documentation - FRMS

## Base URL

- Production: `https://faculty-research-management-system.onrender.com/api`
- Local: `http://localhost:5000/api`

## Swagger

- UI: `/api/docs`
- JSON: `/api/docs.json`

## Authentication

- JWT Bearer token in `Authorization` header:
  - `Authorization: Bearer <token>`

## Core Endpoint Groups

1. Auth
   - `POST /auth/register`
   - `POST /auth/login`
   - `POST /auth/forgot-password`
   - `POST /auth/reset-password`
   - `GET /auth/me`

2. User and Master Data
   - `GET /users`
   - `PUT /users/{id}`
   - `PATCH /users/{id}/toggle-status`
   - `GET /users/departments/list`
   - `POST /users/departments`
   - `GET /users/lookups`
   - `POST /users/lookups`

3. Faculty
   - `GET /faculty/me`
   - `PUT /faculty/me`
   - `GET /faculty`
   - `GET /faculty/{userId}`

4. Research Modules
   - `GET|POST /publications`
   - `GET|PUT|DELETE /publications/{id}`
   - `PATCH /publications/{id}/approval`
   - Similar CRUD + approval APIs for:
     - `/projects`
     - `/patents`
     - `/grants`
     - `/events`

5. Approvals
   - `GET /approvals/pending`

6. Reports
   - `GET /reports`
   - `POST /reports/generate`

7. Dashboard
   - `GET /dashboard/overview`
   - `GET /dashboard/faculty-ranking`

8. Notifications
   - `GET /notifications`
   - `PATCH /notifications/{id}/read`
   - `PATCH /notifications/mark-all-read`

9. AI Module
   - `POST /ai/research-summary`
   - `POST /ai/publication-recommendation`
   - `GET /ai/trend-analysis`
   - `GET /ai/citation-insights`
   - `POST /ai/smart-search`
   - `GET|POST /ai/plagiarism`
   - `POST /ai/proposal-assistant`
   - `GET /ai/faculty-cv`
   - `POST /ai/chat`
   - `POST /ai/score-prediction`
   - `POST /ai/ocr`
   - `POST /ai/semantic-index/sync`

10. Settings and Audit
    - `GET|PUT /settings/ai-provider`
    - `GET /audit-logs`

## Public Registration Notes

- Public registration does not allow role self-assignment.
- Public users are created as `faculty`.
- Public registrations are marked pending (`isActive=false`) until admin activation.

## Response Pattern

Typical success response:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Typical error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

