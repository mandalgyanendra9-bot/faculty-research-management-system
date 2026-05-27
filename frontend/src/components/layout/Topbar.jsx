import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { roleLabels } from "../../config";

const Topbar = ({ onToggleMobile }) => {
  const { user, logout } = useAuth();

  return (
    <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-soft">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg bg-brand-50 p-2 text-brand-700 lg:hidden"
          onClick={onToggleMobile}
        >
          <Menu size={18} />
        </button>

        <div>
          <p className="text-lg font-semibold text-slate-800">Welcome, {user?.name}</p>
          <p className="text-sm text-slate-500">{roleLabels[user?.role] || user?.role}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
      >
        <LogOut size={16} />
        Logout
      </button>
    </header>
  );
};

export default Topbar;
