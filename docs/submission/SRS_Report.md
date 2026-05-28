# Software Requirements Specification (SRS)
## Faculty Research Management System (FRMS)

## 1. Introduction

### 1.1 Purpose
FRMS is a web-based system to manage faculty research activities, approvals, reports, analytics, and AI-assisted research operations for higher education institutions.

### 1.2 Scope
The system supports:
- User and role management
- Faculty profile management
- Publication/project/patent/grant/event records
- Multi-level approval workflow
- Report generation (PDF/Excel)
- AI-assisted research tools
- Notification and audit log tracking

### 1.3 Definitions
- FRMS: Faculty Research Management System
- RBAC: Role-Based Access Control
- API: Application Programming Interface
- JWT: JSON Web Token

## 2. Overall Description

### 2.1 Product Perspective
FRMS follows a client-server architecture:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB

### 2.2 User Classes
- Super Admin
- Admin
- HOD/Dean
- Research Coordinator
- Faculty

### 2.3 Operating Environment
- Browser-based access (desktop + mobile responsive UI)
- Deployed frontend on Vercel
- Deployed backend on Render
- MongoDB Atlas for production data

## 3. Functional Requirements

### 3.1 Authentication and Authorization
- Register, login, forgot/reset password
- JWT-based session management
- RBAC for all protected modules

### 3.2 User and Department Management
- Manage users (list, update, activate/deactivate)
- Manage departments and lookup values (designations, categories)

### 3.3 Faculty Profile
- Create/update personal research profile
- Store identifiers: ORCID, Google Scholar, Scopus

### 3.4 Research Record Modules
- CRUD operations for publications, projects, patents, grants, events
- Attach supporting files
- Track status and scores

### 3.5 Approval Workflow
- Two-step approval checks
- Pending items dashboard
- Approve/reject with reason

### 3.6 Reports
- Generate faculty-wise, department-wise, year-wise, NAAC, NBA/NIRF, API reports
- Download in PDF or Excel

### 3.7 AI Module
- Research summary from PDF
- Publication recommendation
- Trend and citation insights
- Smart semantic search
- Proposal assistant
- OCR extraction

### 3.8 Notifications and Audit
- In-app notifications for events and approvals
- Audit logs for critical admin actions

## 4. Non-Functional Requirements

### 4.1 Security
- Password hashing with bcrypt
- Protected APIs with JWT
- Role checks on protected endpoints
- Helmet + rate limiting

### 4.2 Performance
- Pagination/search-ready list endpoints
- Background scheduler for periodic jobs

### 4.3 Reliability
- Validation at API layer
- Controlled error responses
- Persistent audit trails

### 4.4 Usability
- Responsive UI for mobile and desktop
- Role-specific menus and pages
- Toast notifications and loading states

### 4.5 Maintainability
- Modular backend (routes/controllers/services/models)
- Config-driven frontend module screens

## 5. External Interface Requirements

### 5.1 User Interface
- Dashboard with charts and KPIs
- Data entry forms and module tables
- Report generation and downloads

### 5.2 API Interface
- REST APIs under `/api/*`
- Swagger docs at `/api/docs`

### 5.3 Database Interface
- MongoDB collections mapped by Mongoose models

## 6. Constraints
- Internet required for deployed usage
- AI provider configuration required for full AI capabilities
- File uploads stored under backend uploads directory path

## 7. Assumptions
- Institution defines approval policy and scoring norms
- Admin users maintain department/designation master data
- Production env vars are configured correctly

## 8. Future Enhancements
- Email/SMS notification channels
- Advanced analytics dashboards
- SSO integration
- Multi-campus tenancy support

