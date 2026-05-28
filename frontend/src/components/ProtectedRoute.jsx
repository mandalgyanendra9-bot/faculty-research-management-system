import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div className="space-y-2">
          <p className="text-base font-semibold text-brand-700">Loading FRMS workspace...</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            If backend is on Render free tier, first request may take a few seconds (cold start).
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
