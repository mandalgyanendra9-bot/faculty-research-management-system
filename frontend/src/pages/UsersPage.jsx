import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import StatusBadge from "../components/ui/StatusBadge";

const roleOptions = [
  { value: "faculty", label: "Faculty" },
  { value: "hod_dean", label: "HOD / Dean" },
  { value: "research_coordinator", label: "Research Coordinator" },
];

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [roleAuditLogs, setRoleAuditLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lookups, setLookups] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [deptForm, setDeptForm] = useState({ name: "", code: "", school: "" });
  const [lookupForm, setLookupForm] = useState({ type: "designation", value: "" });
  const [roleDrafts, setRoleDrafts] = useState({});

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    }
  };

  const loadPendingUsers = async () => {
    try {
      const { data } = await api.get("/users/pending-approvals");
      setPendingUsers(data.data || []);
    } catch (_error) {
      setPendingUsers([]);
    }
  };

  const loadDepartments = async () => {
    const { data } = await api.get("/users/departments/list");
    setDepartments(data.data || []);
  };

  const loadRoleAuditLogs = async () => {
    try {
      const { data } = await api.get("/audit-logs", {
        params: { action: "role_change", module: "users", limit: 8, page: 1 },
      });
      setRoleAuditLogs(data.data || []);
    } catch (_error) {
      setRoleAuditLogs([]);
    }
  };

  const loadLookups = async () => {
    const { data } = await api.get("/users/lookups");
    setLookups(data.data || []);
  };

  useEffect(() => {
    loadUsers();
    loadPendingUsers();
    loadDepartments();
    loadLookups();
    loadRoleAuditLogs();
  }, []);

  useEffect(() => {
    const drafts = {};
    users.forEach((user) => {
      drafts[user._id] = user.role;
    });
    setRoleDrafts(drafts);
  }, [users]);

  const refreshUserData = async () => {
    await Promise.all([loadUsers(), loadPendingUsers()]);
  };

  const toggleStatus = async (id) => {
    setBusyId(id);
    try {
      await api.patch(`/users/${id}/toggle-status`);
      toast.success("User status updated");
      await refreshUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setBusyId("");
    }
  };

  const approvePendingUser = async (id) => {
    setBusyId(id);
    try {
      await api.patch(`/users/${id}/approve-faculty`);
      toast.success("Pending faculty approved");
      await refreshUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed");
    } finally {
      setBusyId("");
    }
  };

  const assignRole = async (id) => {
    const role = roleDrafts[id];
    setBusyId(id);
    try {
      await api.patch(`/users/${id}/assign-role`, { role });
      toast.success("Role updated and logged");
      await refreshUserData();
      await loadRoleAuditLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Role update failed");
    } finally {
      setBusyId("");
    }
  };

  const createDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/departments", deptForm);
      toast.success("Department created");
      setDeptForm({ name: "", code: "", school: "" });
      loadDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Department creation failed");
    }
  };

  const createLookup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/lookups", lookupForm);
      toast.success("Lookup added");
      setLookupForm((prev) => ({ ...prev, value: "" }));
      loadLookups();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lookup creation failed");
    }
  };

  const lookupSummary = useMemo(
    () => ({
      designations: lookups.filter((x) => x.type === "designation"),
      categories: lookups.filter((x) => x.type === "research_category"),
    }),
    [lookups]
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Pending Faculty Approvals</h2>
        {!pendingUsers.length ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            No pending faculty registrations.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600 dark:text-slate-300">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Requested On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user) => (
                  <tr key={user._id} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.department?.name || "-"}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        disabled={busyId === user._id}
                        onClick={() => approvePendingUser(user._id)}
                        className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {busyId === user._id ? "Approving..." : "Approve Faculty"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-600 dark:text-slate-300">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-2">{user.name}</td>
                  <td>{user.email}</td>
                  <td className="min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                        value={roleDrafts[user._id] || user.role}
                        onChange={(e) => setRoleDrafts((prev) => ({ ...prev, [user._id]: e.target.value }))}
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={busyId === user._id}
                        onClick={() => assignRole(user._id)}
                        className="rounded bg-brand-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {busyId === user._id ? "Saving..." : "Assign"}
                      </button>
                    </div>
                  </td>
                  <td>{user.department?.name || "-"}</td>
                  <td>
                    <StatusBadge status={user.isActive ? "active" : "inactive"} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800"
                      onClick={() => toggleStatus(user._id)}
                      disabled={busyId === user._id}
                    >
                      {busyId === user._id ? "Updating..." : user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4 dark:border-slate-700">
          <h3 className="mb-3 font-semibold">Manage Departments</h3>
          <form className="grid gap-2" onSubmit={createDepartment}>
            <input
              placeholder="Department Name"
              className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={deptForm.name}
              onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <input
              placeholder="Code"
              className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={deptForm.code}
              onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value }))}
              required
            />
            <input
              placeholder="School"
              className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={deptForm.school}
              onChange={(e) => setDeptForm((p) => ({ ...p, school: e.target.value }))}
            />
            <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Add Department</button>
          </form>

          <div className="mt-3 space-y-2 text-sm">
            {departments.map((dept) => (
              <div key={dept._id} className="rounded bg-slate-50 p-2 dark:bg-slate-800">
                {dept.name} ({dept.code})
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4 dark:border-slate-700">
          <h3 className="mb-3 font-semibold">Designations and Categories</h3>
          <form className="grid gap-2" onSubmit={createLookup}>
            <select
              className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={lookupForm.type}
              onChange={(e) => setLookupForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="designation">Designation</option>
              <option value="research_category">Research Category</option>
            </select>
            <input
              placeholder="Value"
              className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              value={lookupForm.value}
              onChange={(e) => setLookupForm((p) => ({ ...p, value: e.target.value }))}
              required
            />
            <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Add Lookup</button>
          </form>

          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Designations</p>
              <div className="space-y-1">
                {lookupSummary.designations.map((item) => (
                  <div key={item._id} className="rounded bg-slate-50 p-2 dark:bg-slate-800">{item.value}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Research Categories</p>
              <div className="space-y-1">
                {lookupSummary.categories.map((item) => (
                  <div key={item._id} className="rounded bg-slate-50 p-2 dark:bg-slate-800">{item.value}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-4 dark:border-slate-700">
        <h3 className="mb-3 font-semibold">Recent Role Change Audit Log</h3>
        {!roleAuditLogs.length ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent role changes logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600 dark:text-slate-300">
                  <th className="py-2">When</th>
                  <th>Actor</th>
                  <th>Target</th>
                  <th>Previous Role</th>
                  <th>New Role</th>
                </tr>
              </thead>
              <tbody>
                {roleAuditLogs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2">{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.actorEmail || log.actor?.email || "-"}</td>
                    <td>{log.details?.email || "-"}</td>
                    <td>{log.details?.previousRole || "-"}</td>
                    <td>{log.details?.newRole || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default UsersPage;
