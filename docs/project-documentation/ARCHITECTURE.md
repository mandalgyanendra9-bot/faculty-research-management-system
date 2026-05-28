# System Architecture - FRMS

## High-Level Architecture

```mermaid
flowchart LR
  U["Users (Faculty/Admin/HOD/Coordinator)"] --> FE["Frontend (React + Vite, Vercel)"]
  FE --> API["Backend API (Node.js + Express, Render)"]
  API --> DB["MongoDB"]
  API --> FS["Cloudinary / Local Uploads"]
  API --> AI["AI Services (LLM/OCR/Semantic)"]
  API --> RPT["PDF/Excel Report Engine"]
```

## Key Components
- Frontend:
  - Public pages: landing, register, login, pending approval.
  - Protected app: dashboard, modules, approvals, reports, AI suite, user management.
  - API base via `import.meta.env.VITE_API_URL` with Render fallback.
- Backend:
  - Auth + RBAC middlewares.
  - Domain controllers for records, approvals, reports, AI, users.
  - Audit and notification services.
  - Storage abstraction for Cloudinary/local file URLs.
- Data:
  - MongoDB collections for users, research records, reports, lookups, audit logs, notifications.

## Security
- JWT-based auth.
- Role-based access control at route level.
- Register endpoint protects against role self-assignment.
- Audit trail for approvals, role changes, and exports.
