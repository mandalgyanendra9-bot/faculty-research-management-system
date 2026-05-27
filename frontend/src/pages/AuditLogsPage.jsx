import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import StatusBadge from "../components/ui/StatusBadge";

const actionOptions = [
  "",
  "login",
  "approve",
  "reject",
  "delete",
  "report_export",
  "ai_usage",
  "ai_provider_update",
];

const moduleOptions = [
  "",
  "auth",
  "publication",
  "project",
  "patent",
  "grant",
  "event",
  "reports",
  "settings",
  "ai",
];

const PAGE_SIZE = 15;

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    action: "",
    module: "",
    user: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const fetchLogs = async (page = 1, activeFilters = appliedFilters) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/audit-logs", {
        params: {
          ...activeFilters,
          page,
          limit: PAGE_SIZE,
        },
      });

      setLogs(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch audit logs";
      setError(message);
      toast.error(message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const applyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    const initial = { action: "", module: "", user: "", dateFrom: "", dateTo: "", search: "" };
    setFilters(initial);
    setAppliedFilters(initial);
  };

  const from = useMemo(() => (pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0), [pagination]);
  const to = useMemo(
    () => (pagination.total ? Math.min(pagination.page * pagination.limit, pagination.total) : 0),
    [pagination]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Audit Logs</h2>
        <p className="text-sm text-slate-500">Track critical admin and system actions for accountability and compliance.</p>
      </div>

      <form className="grid gap-3 rounded-xl border p-4 md:grid-cols-3 xl:grid-cols-6" onSubmit={applyFilters}>
        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.action}
          onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
        >
          {actionOptions.map((option) => (
            <option key={option || "all-actions"} value={option}>
              {option ? option.replace(/_/g, " ") : "All Actions"}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.module}
          onChange={(e) => setFilters((prev) => ({ ...prev, module: e.target.value }))}
        >
          {moduleOptions.map((option) => (
            <option key={option || "all-modules"} value={option}>
              {option ? option : "All Modules"}
            </option>
          ))}
        </select>

        <input
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="User email"
          value={filters.user}
          onChange={(e) => setFilters((prev) => ({ ...prev, user: e.target.value }))}
        />

        <input
          type="date"
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.dateFrom}
          onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
        />

        <input
          type="date"
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.dateTo}
          onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
        />

        <input
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="Search action/module/user"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />

        <div className="flex gap-2 md:col-span-3 xl:col-span-6">
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Apply Filters</button>
          <button type="button" className="rounded-lg bg-slate-100 px-4 py-2 text-sm" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <p>
          Showing {from} to {to} of {pagination.total} logs
        </p>
        <p>Page {pagination.page} of {pagination.pages}</p>
      </div>

      {loading ? <p className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-500">Loading audit logs...</p> : null}
      {!loading && error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-2">Date/Time</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Module</th>
                  <th className="px-3 py-2">IP Address</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t align-top">
                    <td className="px-3 py-2 text-slate-700">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-slate-700">{log.actor?.name || "-"}<div className="text-xs text-slate-500">{log.actorEmail || "-"}</div></td>
                    <td className="px-3 py-2 text-slate-700">{log.actorRole || "-"}</td>
                    <td className="px-3 py-2 text-slate-700">{log.action}</td>
                    <td className="px-3 py-2 text-slate-700">{log.module}</td>
                    <td className="px-3 py-2 text-slate-700">{log.ipAddress || "-"}</td>
                    <td className="px-3 py-2"><StatusBadge status={log.status || "success"} /></td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      <pre className="max-w-xs whitespace-pre-wrap break-all">{JSON.stringify(log.details || {}, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!logs.length ? <p className="p-6 text-center text-slate-500">No audit logs found.</p> : null}
          </div>

          <div className="space-y-3 md:hidden">
            {logs.map((log) => (
              <div key={log._id} className="rounded-xl border p-3 text-sm">
                <p className="font-medium text-slate-800">{log.action} <span className="text-xs text-slate-500">({log.module})</span></p>
                <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                <p className="mt-1 text-slate-700">User: {log.actor?.name || "-"} ({log.actorEmail || "-"})</p>
                <p className="text-slate-700">Role: {log.actorRole || "-"}</p>
                <p className="text-slate-700">IP: {log.ipAddress || "-"}</p>
                <div className="mt-1"><StatusBadge status={log.status || "success"} /></div>
                <p className="mt-2 text-xs text-slate-600 break-all">{JSON.stringify(log.details || {})}</p>
              </div>
            ))}
            {!logs.length ? <p className="rounded-xl border p-4 text-center text-slate-500">No audit logs found.</p> : null}
          </div>
        </>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm disabled:opacity-50"
          disabled={loading || pagination.page <= 1}
          onClick={() => fetchLogs(pagination.page - 1, appliedFilters)}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm disabled:opacity-50"
          disabled={loading || pagination.page >= pagination.pages}
          onClick={() => fetchLogs(pagination.page + 1, appliedFilters)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuditLogsPage;
