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
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
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
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

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
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 font-semibold text-slate-700">Year-wise Publications</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.yearWisePublications}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1d6fa3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="mb-3 font-semibold text-slate-700">Department Output</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview.departmentWiseResearchOutput}
                  dataKey="output"
                  nameKey="department"
                  outerRadius={90}
                  fill="#f59e0b"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold text-slate-700">Top Performing Departments</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {overview.topPerformingDepartments.map((dept) => (
            <div key={dept.department} className="rounded-lg bg-brand-50 p-3">
              <p className="font-medium text-brand-700">{dept.department}</p>
              <p className="text-sm text-slate-600">Output: {dept.output}</p>
            </div>
          ))}
        </div>
      </section>

      {ranking.length ? (
        <section className="rounded-xl border p-4">
          <h3 className="mb-3 font-semibold text-slate-700">Faculty Research Score Ranking</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Faculty</th>
                  <th className="py-2">Department</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {ranking.slice(0, 10).map((item, idx) => (
                  <tr key={item.facultyId} className="border-b">
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
