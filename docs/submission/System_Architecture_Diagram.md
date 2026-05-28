# System Architecture Diagram - FRMS

```mermaid
flowchart LR
  U["Users (Faculty / HOD / Admin / Super Admin / Coordinator)"]
  V["Frontend (React + Vite + Tailwind)"]
  A["API Layer (Node.js + Express)"]
  M["Middleware (JWT Auth, RBAC, Validation, Rate Limit, Helmet, CORS)"]
  C["Controllers + Services"]
  D[("MongoDB (Mongoose Models)")]
  F["File Storage (Multer Uploads /uploads)"]
  R["Report Engine (PDFKit + ExcelJS)"]
  AI["AI Services (OpenAI/Gemini + Local fallback)"]
  S["Scheduler / Cron Jobs"]
  N["Notifications Service"]
  L["Audit Logging Service"]
  SW["Swagger Docs (/api/docs, /api/docs.json)"]

  U --> V
  V -->|"REST /api/*"| A
  A --> M
  M --> C
  C --> D
  C --> F
  C --> R
  C --> AI
  C --> N
  C --> L
  A --> SW
  S --> C
  S --> D

  subgraph Deploy["Deployment"]
    FE["Vercel (Frontend)"]
    BE["Render (Backend)"]
    DB["MongoDB Atlas"]
  end

  V -. hosted on .-> FE
  A -. hosted on .-> BE
  D -. hosted on .-> DB
```

## High-Level Flow

1. User interacts with React frontend.
2. Frontend calls backend REST APIs.
3. Backend middleware validates token and role.
4. Controllers process requests and update MongoDB.
5. Optional modules generate reports, AI insights, notifications, and audit logs.
6. Scheduler performs periodic analytics and reminder jobs.

