import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  BriefcaseBusiness,
  Bell,
  BrainCircuit,
  ChartBarBig,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Home,
  Landmark,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: Home },
  { to: "/app/profile", label: "Profile", icon: UserCircle },
  { to: "/app/publications", label: "Publications", icon: BookOpen },
  { to: "/app/projects", label: "Projects", icon: BriefcaseBusiness },
  { to: "/app/patents", label: "Patents", icon: FlaskConical },
  { to: "/app/grants", label: "Grants", icon: Landmark },
  { to: "/app/events", label: "Events", icon: ChartBarBig },
  { to: "/app/approvals", label: "Approvals", icon: ClipboardCheck, roles: ["super_admin", "admin", "hod_dean", "research_coordinator"] },
  { to: "/app/reports", label: "Reports", icon: FileText, roles: ["super_admin", "admin", "hod_dean", "research_coordinator", "faculty"] },
  { to: "/app/ai", label: "AI Suite", icon: BrainCircuit, roles: ["super_admin", "admin", "hod_dean", "research_coordinator", "faculty"] },
  { to: "/app/settings", label: "Settings", icon: Settings, roles: ["super_admin", "admin", "research_coordinator"] },
  { to: "/app/audit-logs", label: "Audit Logs", icon: ShieldCheck, roles: ["super_admin", "admin"] },
  { to: "/app/users", label: "Users", icon: Users, roles: ["super_admin", "admin"] },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
];

const Sidebar = ({ mobile = false, onNavigate }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className={`${mobile ? "block h-full w-full max-w-[85vw] rounded-r-2xl" : "hidden w-72 shrink-0 rounded-r-3xl lg:block"} bg-brand-700 p-5 text-white shadow-soft`}>
      <div className="mb-8 border-b border-white/20 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">FRMS</h1>
          {mobile ? (
            <button type="button" className="rounded-lg bg-white/20 p-1.5 hover:bg-white/30" onClick={onNavigate}>
              <X size={16} />
            </button>
          ) : null}
        </div>
        <p className="text-sm text-brand-100">Faculty Research Management System</p>
      </div>

      <nav className="space-y-2">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(user?.role))
          .map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={mobile ? onNavigate : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                  active ? "bg-white text-brand-700" : "text-brand-100 hover:bg-brand-600 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
