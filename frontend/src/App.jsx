import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LandingPage from "./pages/LandingPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import ModulePage from "./pages/ModulePage";
import FacultyProfilePage from "./pages/FacultyProfilePage";
import UsersPage from "./pages/UsersPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AIModulePage from "./pages/AIModulePage";
import SettingsPage from "./pages/SettingsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<FacultyProfilePage />} />
        <Route path="publications" element={<ModulePage moduleKey="publications" />} />
        <Route path="projects" element={<ModulePage moduleKey="projects" />} />
        <Route path="patents" element={<ModulePage moduleKey="patents" />} />
        <Route path="grants" element={<ModulePage moduleKey="grants" />} />
        <Route path="events" element={<ModulePage moduleKey="events" />} />
        <Route path="users" element={<ProtectedRoute roles={["super_admin", "admin"]}><UsersPage /></ProtectedRoute>} />
        <Route path="approvals" element={<ProtectedRoute roles={["super_admin", "admin", "hod_dean", "research_coordinator"]}><ApprovalsPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={["super_admin", "admin", "hod_dean", "research_coordinator", "faculty"]}><ReportsPage /></ProtectedRoute>} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="ai" element={<ProtectedRoute roles={["super_admin", "admin", "hod_dean", "research_coordinator", "faculty"]}><AIModulePage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute roles={["super_admin", "admin", "research_coordinator"]}><SettingsPage /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute roles={["super_admin", "admin"]}><AuditLogsPage /></ProtectedRoute>} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/publications" element={<Navigate to="/app/publications" replace />} />
      <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
      <Route path="/patents" element={<Navigate to="/app/patents" replace />} />
      <Route path="/grants" element={<Navigate to="/app/grants" replace />} />
      <Route path="/events" element={<Navigate to="/app/events" replace />} />
      <Route path="/users" element={<Navigate to="/app/users" replace />} />
      <Route path="/approvals" element={<Navigate to="/app/approvals" replace />} />
      <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
      <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
      <Route path="/ai" element={<Navigate to="/app/ai" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/audit-logs" element={<Navigate to="/app/audit-logs" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
