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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/profile", label: "Profile", icon: UserCircle },
  { to: "/publications", label: "Publications", icon: BookOpen },
  { to: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { to: "/patents", label: "Patents", icon: FlaskConical },
  { to: "/grants", label: "Grants", icon: Landmark },
  { to: "/events", label: "Events", icon: ChartBarBig },
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck, roles: ["super_admin", "admin", "hod_dean", "research_coordinator"] },
  { to: "/reports", label: "Reports", icon: FileText, roles: ["super_admin", "admin", "hod_dean", "research_coordinator", "faculty"] },
  { to: "/ai", label: "AI Suite", icon: BrainCircuit, roles: ["super_admin", "admin", "hod_dean", "research_coordinator", "faculty"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["super_admin", "admin", "research_coordinator"] },
  { to: "/audit-logs", label: "Audit Logs", icon: ShieldCheck, roles: ["super_admin", "admin"] },
  { to: "/users", label: "Users", icon: Users, roles: ["super_admin", "admin"] },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const Sidebar = ({ mobile = false }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className={`${mobile ? "block" : "hidden lg:block"} w-72 shrink-0 rounded-r-3xl bg-brand-700 p-5 text-white shadow-soft`}>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-xl font-bold tracking-wide">FRMS</h1>
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
