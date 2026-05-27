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
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-72 bg-brand-700 p-5" onClick={(e) => e.stopPropagation()}>
            <Sidebar mobile />
          </div>
        </div>
      ) : null}

      <main className="w-full p-4 md:p-6">
        <Topbar onToggleMobile={() => setMobileOpen((prev) => !prev)} />
        <div className="rounded-2xl bg-white p-4 shadow-soft md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
