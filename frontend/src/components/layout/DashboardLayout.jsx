import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {mobileOpen ? (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="w-full p-3 md:p-6">
        <Topbar onToggleMobile={() => setMobileOpen((prev) => !prev)} />
        <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-slate-900 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
