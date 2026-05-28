# Software Requirements Specification (SRS) - FRMS

## 1. Introduction
- Project: Faculty Research Management System (FRMS)
- Objective: Digitize faculty research submission, approval, analytics, and accreditation reporting workflows.
- Stakeholders: Faculty, HOD/Dean, Research Coordinator, Admin, Super Admin, Accreditation Committee.

## 2. Scope
- Manage research records: publications, projects, patents, grants, events.
- Role-based approval workflow with audit logs.
- AI-assisted modules: summary, recommendations, analytics, smart search, plagiarism, proposal assistant, CV, chat, OCR.
- Institution-ready report exports (PDF/Excel) for NAAC/NBA/NIRF and internal assessments.

## 3. Functional Requirements
- FR-1: Public registration creates `faculty` user with pending approval (`isActive=false`).
- FR-2: Only admin/super_admin can approve faculty accounts.
- FR-3: Only admin/super_admin can assign elevated roles.
- FR-4: Faculty can create/update own records while pending approval state rules apply.
- FR-5: HOD/Dean and Admin roles can verify/approve/reject submissions.
- FR-6: System generates reports (`faculty_wise`, `department_wise`, `year_wise`, `naac`, `nba`, `nirf`, `api_score`, `faculty_api_score`) in PDF/Excel.
- FR-7: AI module supports all tabbed features exposed in frontend.
- FR-8: All critical actions are logged in audit logs.
- FR-9: Document uploads support production cloud storage (Cloudinary) with local fallback.

## 4. Non-Functional Requirements
- NFR-1: Responsive UI for desktop/mobile.
- NFR-2: Secure JWT auth, role-based authorization, and validation.
- NFR-3: Scalable deployment on Vercel (frontend) and Render (backend).
- NFR-4: Maintainability via modular controllers/services/routes.

## 5. Constraints
- Internet latency and Render cold starts can delay initial API response.
- AI feature quality depends on configured provider and uploaded input quality.

## 6. Assumptions
- MongoDB is available and reachable in production.
- Environment variables are configured correctly (`VITE_API_URL`, JWT, DB, Cloudinary).
