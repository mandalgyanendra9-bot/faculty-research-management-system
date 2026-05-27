const swaggerUi = require("swagger-ui-express");

const buildSpec = () => ({
  openapi: "3.0.3",
  info: {
    title: "FRMS API",
    version: "1.0.0",
    description: "Faculty Research Management System backend APIs",
  },
  servers: [{ url: process.env.API_BASE_URL || "http://localhost:5000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Faculty" },
    { name: "Publications" },
    { name: "Projects" },
    { name: "Patents" },
    { name: "Grants" },
    { name: "Events" },
    { name: "Approvals" },
    { name: "Reports" },
    { name: "Dashboard" },
    { name: "Notifications" },
    { name: "AI" },
    { name: "Settings" },
    { name: "Audit Logs" },
  ],
  paths: {
    "/api/health": { get: { tags: ["Health"], summary: "API health check" } },

    "/api/auth/register": { post: { tags: ["Auth"], summary: "Register user" } },
    "/api/auth/login": { post: { tags: ["Auth"], summary: "Login" } },
    "/api/auth/forgot-password": { post: { tags: ["Auth"], summary: "Forgot password" } },
    "/api/auth/reset-password": { post: { tags: ["Auth"], summary: "Reset password" } },
    "/api/auth/me": { get: { tags: ["Auth"], summary: "Current user" } },

    "/api/users": { get: { tags: ["Users"], summary: "List users" } },
    "/api/users/{id}": { put: { tags: ["Users"], summary: "Update user" } },
    "/api/users/{id}/toggle-status": { patch: { tags: ["Users"], summary: "Activate/deactivate user" } },
    "/api/users/departments/list": { get: { tags: ["Users"], summary: "List departments" } },
    "/api/users/departments": { post: { tags: ["Users"], summary: "Create department" } },
    "/api/users/departments/{id}": {
      put: { tags: ["Users"], summary: "Update department" },
      delete: { tags: ["Users"], summary: "Delete department" },
    },
    "/api/users/lookups": {
      get: { tags: ["Users"], summary: "List lookup values" },
      post: { tags: ["Users"], summary: "Create lookup value" },
    },
    "/api/users/lookups/{id}": {
      put: { tags: ["Users"], summary: "Update lookup value" },
      delete: { tags: ["Users"], summary: "Delete lookup value" },
    },

    "/api/faculty/me": {
      get: { tags: ["Faculty"], summary: "Get my faculty profile" },
      put: { tags: ["Faculty"], summary: "Update my faculty profile" },
    },
    "/api/faculty": { get: { tags: ["Faculty"], summary: "List faculty profiles" } },
    "/api/faculty/{userId}": { get: { tags: ["Faculty"], summary: "Get faculty profile by user id" } },

    "/api/publications": {
      get: { tags: ["Publications"], summary: "List publications" },
      post: { tags: ["Publications"], summary: "Create publication" },
    },
    "/api/publications/{id}": {
      get: { tags: ["Publications"], summary: "Get publication" },
      put: { tags: ["Publications"], summary: "Update publication" },
      delete: { tags: ["Publications"], summary: "Delete publication" },
    },
    "/api/publications/{id}/approval": { patch: { tags: ["Publications"], summary: "Approve/reject publication" } },

    "/api/projects": {
      get: { tags: ["Projects"], summary: "List projects" },
      post: { tags: ["Projects"], summary: "Create project" },
    },
    "/api/projects/{id}": {
      get: { tags: ["Projects"], summary: "Get project" },
      put: { tags: ["Projects"], summary: "Update project" },
      delete: { tags: ["Projects"], summary: "Delete project" },
    },
    "/api/projects/{id}/approval": { patch: { tags: ["Projects"], summary: "Approve/reject project" } },

    "/api/patents": {
      get: { tags: ["Patents"], summary: "List patents" },
      post: { tags: ["Patents"], summary: "Create patent" },
    },
    "/api/patents/{id}": {
      get: { tags: ["Patents"], summary: "Get patent" },
      put: { tags: ["Patents"], summary: "Update patent" },
      delete: { tags: ["Patents"], summary: "Delete patent" },
    },
    "/api/patents/{id}/approval": { patch: { tags: ["Patents"], summary: "Approve/reject patent" } },

    "/api/grants": {
      get: { tags: ["Grants"], summary: "List grants" },
      post: { tags: ["Grants"], summary: "Create grant" },
    },
    "/api/grants/{id}": {
      get: { tags: ["Grants"], summary: "Get grant" },
      put: { tags: ["Grants"], summary: "Update grant" },
      delete: { tags: ["Grants"], summary: "Delete grant" },
    },
    "/api/grants/{id}/approval": { patch: { tags: ["Grants"], summary: "Approve/reject grant" } },

    "/api/events": {
      get: { tags: ["Events"], summary: "List events" },
      post: { tags: ["Events"], summary: "Create event" },
    },
    "/api/events/{id}": {
      get: { tags: ["Events"], summary: "Get event" },
      put: { tags: ["Events"], summary: "Update event" },
      delete: { tags: ["Events"], summary: "Delete event" },
    },
    "/api/events/{id}/approval": { patch: { tags: ["Events"], summary: "Approve/reject event" } },

    "/api/approvals/pending": { get: { tags: ["Approvals"], summary: "Pending approvals dashboard" } },

    "/api/reports": { get: { tags: ["Reports"], summary: "List reports" } },
    "/api/reports/generate": { post: { tags: ["Reports"], summary: "Generate report (PDF/Excel)" } },

    "/api/dashboard/overview": { get: { tags: ["Dashboard"], summary: "Dashboard overview" } },
    "/api/dashboard/faculty-ranking": { get: { tags: ["Dashboard"], summary: "Faculty ranking" } },

    "/api/notifications": { get: { tags: ["Notifications"], summary: "List my notifications" } },
    "/api/notifications/{id}/read": { patch: { tags: ["Notifications"], summary: "Mark notification read" } },
    "/api/notifications/mark-all-read": { patch: { tags: ["Notifications"], summary: "Mark all notifications read" } },

    "/api/ai/research-summary": { post: { tags: ["AI"], summary: "Generate AI summary from PDF" } },
    "/api/ai/publication-recommendation": { post: { tags: ["AI"], summary: "AI publication recommendations" } },
    "/api/ai/trend-analysis": { get: { tags: ["AI"], summary: "AI trend analysis" } },
    "/api/ai/citation-insights": { get: { tags: ["AI"], summary: "AI citation insights" } },
    "/api/ai/smart-search": { post: { tags: ["AI"], summary: "Semantic smart search" } },
    "/api/ai/plagiarism": {
      post: { tags: ["AI"], summary: "Upload plagiarism report" },
      get: { tags: ["AI"], summary: "List plagiarism reports" },
    },
    "/api/ai/proposal-assistant": { post: { tags: ["AI"], summary: "Generate proposal draft" } },
    "/api/ai/faculty-cv": { get: { tags: ["AI"], summary: "Generate own faculty CV" } },
    "/api/ai/faculty-cv/{facultyId}": { get: { tags: ["AI"], summary: "Generate faculty CV by id" } },
    "/api/ai/chat": { post: { tags: ["AI"], summary: "AI assistant chat" } },
    "/api/ai/score-prediction": { post: { tags: ["AI"], summary: "Predict research score" } },
    "/api/ai/ocr": { post: { tags: ["AI"], summary: "OCR extract and autofill hints" } },
    "/api/ai/semantic-index/sync": { post: { tags: ["AI"], summary: "Sync semantic index" } },

    "/api/settings/ai-provider": {
      get: { tags: ["Settings"], summary: "Get AI provider configuration" },
      put: { tags: ["Settings"], summary: "Update AI provider configuration" },
    },

    "/api/audit-logs": { get: { tags: ["Audit Logs"], summary: "List admin audit logs" } },
  },
});

const setupSwagger = (app) => {
  const spec = buildSpec();
  app.get("/api/docs.json", (_req, res) => res.json(spec));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));
};

module.exports = { setupSwagger };
