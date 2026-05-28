import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { roleLabels } from "../../config";
import { useTheme } from "../../context/ThemeContext";

const Topbar = ({ onToggleMobile }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft dark:bg-slate-900">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-lg bg-brand-50 p-2 text-brand-700 dark:bg-slate-800 dark:text-brand-100 lg:hidden"
          onClick={onToggleMobile}
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-800 dark:text-slate-100 md:text-lg">Welcome, {user?.name}</p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{roleLabels[user?.role] || user?.role}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} mode</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
