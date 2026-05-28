import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/client";
import StatCard from "../components/ui/StatCard";
import Skeleton from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [overview, setOverview] = useState(null);
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: overviewData }, rankingRes] = await Promise.all([
        api.get("/dashboard/overview"),
        ["super_admin", "admin", "hod_dean", "research_coordinator"].includes(user?.role)
          ? api.get("/dashboard/faculty-ranking")
          : Promise.resolve({ data: { data: [] } }),
      ]);

      setOverview(overviewData.data);
      setRanking(rankingRes.data.data || []);
    };

    loadData().catch(() => {
      setOverview(null);
      setRanking([]);
    });
  }, [user?.role]);

  if (!overview) {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28" />
          ))}
        </section>
        <section className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </section>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const chartAxisColor = isDark ? "#94a3b8" : "#475569";
  const chartGridColor = isDark ? "#334155" : "#dbe6f2";
  const tooltipStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: 10,
    color: isDark ? "#e2e8f0" : "#1f2937",
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Faculty" value={overview.totalFaculty} accent="blue" />
        <StatCard label="Publications" value={overview.totalPublications} accent="emerald" />
        <StatCard label="Patents" value={overview.totalPatents} accent="amber" />
        <StatCard label="Projects" value={overview.totalProjects} accent="blue" />
        <StatCard label="Pending Approvals" value={overview.pendingApprovals} accent="rose" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="mb-3 font-semibold text-slate-700 dark:text-slate-100">Year-wise Publications</h3>
          <div className="h-60 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.yearWisePublications}>
                <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: chartAxisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartAxisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? "rgba(148,163,184,0.1)" : "rgba(29,111,163,0.08)" }} />
                <Bar dataKey="count" fill="#1d6fa3" radius={[8, 8, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="mb-3 font-semibold text-slate-700 dark:text-slate-100">Department Output</h3>
          <div className="h-60 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview.departmentWiseResearchOutput}
                  dataKey="output"
                  nameKey="department"
                  outerRadius={100}
                  fill="#f59e0b"
                  stroke={isDark ? "#1e293b" : "#ffffff"}
                  strokeWidth={2}
                  label
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: chartAxisColor }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 className="mb-3 font-semibold text-slate-700 dark:text-slate-100">Top Performing Departments</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {overview.topPerformingDepartments.map((dept) => (
            <div key={dept.department} className="rounded-lg bg-brand-50 p-3 dark:bg-slate-800">
              <p className="font-medium text-brand-700 dark:text-brand-100">{dept.department}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Output: {dept.output}</p>
            </div>
          ))}
        </div>
      </section>

      {ranking.length ? (
        <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="mb-3 font-semibold text-slate-700 dark:text-slate-100">Faculty Research Score Ranking</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600 dark:text-slate-300">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Faculty</th>
                  <th className="py-2">Department</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {ranking.slice(0, 10).map((item, idx) => (
                  <tr key={item.facultyId} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2">#{idx + 1}</td>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.department}</td>
                    <td className="py-2 font-semibold text-brand-700">{item.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default DashboardPage;
