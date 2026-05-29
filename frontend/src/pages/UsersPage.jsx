import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client";
import Modal from "../components/ui/Modal";
import ProfileAvatar from "../components/ui/ProfileAvatar";
import StatusBadge from "../components/ui/StatusBadge";
import { roleLabels } from "../config";

const roleOptions = [
  { value: "faculty", label: "Faculty" },
  { value: "hod_dean", label: "HOD / Dean" },
  { value: "research_coordinator", label: "Research Coordinator" },
];

const formatRoleLabel = (role) =>
  roleLabels[role] || role?.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) || "-";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [roleAuditLogs, setRoleAuditLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lookups, setLookups] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [profileBusyId, setProfileBusyId] = useState("");
  const [deptForm, setDeptForm] = useState({ name: "", code: "", school: "" });
  const [lookupForm, setLookupForm] = useState({ type: "designation", value: "" });
  const [roleDrafts, setRoleDrafts] = useState({});
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileDialogLoading, setProfileDialogLoading] = useState(false);
  const [profileDialogError, setProfileDialogError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

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
      drafts[user._id] = roleOptions.some((option) => option.value === user.role) ? user.role : "";
    });
    setRoleDrafts(drafts);
  }, [users]);

  const refreshUserData = async () => {
    await Promise.all([loadUsers(), loadPendingUsers()]);
  };

  const openProfile = async (user) => {
    setSelectedUser(user);
    setSelectedProfile(null);
    setProfileDialogError("");
    setProfileDialogOpen(true);
    setProfileDialogLoading(true);
    setProfileBusyId(user._id);

    try {
      const { data } = await api.get(`/faculty/${user._id}`);
      setSelectedProfile(data.data);
    } catch (error) {
      setProfileDialogError(error.response?.data?.message || "Failed to load profile details");
    } finally {
      setProfileDialogLoading(false);
      setProfileBusyId("");
    }
  };

  const closeProfile = () => {
    setProfileDialogOpen(false);
    setSelectedProfile(null);
    setSelectedUser(null);
    setProfileDialogError("");
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
    if (!role) {
      toast.error("Select a role before assigning");
      return;
    }
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

  const profileUser = selectedProfile?.user || selectedUser;
  const profilePhotoUrl =
    selectedProfile?.profileImageUrl ||
    selectedProfile?.profilePhotoUrl ||
    selectedUser?.profileImageUrl ||
    selectedUser?.profilePhotoUrl ||
    selectedUser?.facultyProfile?.profileImageUrl ||
    selectedUser?.facultyProfile?.profilePhotoUrl ||
    "";
  const profileCounts = selectedProfile?.counts || { publications: 0, projects: 0, patents: 0 };
  const listText = (value) => (Array.isArray(value) ? (value.length ? value.join(", ") : "-") : value || "-");

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
          <table className="min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-600 dark:text-slate-300">
                <th className="py-2">Name</th>
                <th>Avatar / Profile Photo</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Assign Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{user.name}</td>
                  <td>
                    <ProfileAvatar
                      name={user.name}
                      photoUrl={user.profileImageUrl || user.profilePhotoUrl || user.facultyProfile?.profileImageUrl || user.facultyProfile?.profilePhotoUrl}
                    />
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {formatRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="min-w-[250px]">
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                        value={roleDrafts[user._id] ?? ""}
                        onChange={(e) => setRoleDrafts((prev) => ({ ...prev, [user._id]: e.target.value }))}
                      >
                        <option value="" disabled>
                          Select role
                        </option>
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={busyId === user._id || !roleDrafts[user._id]}
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800"
                        onClick={() => openProfile(user)}
                        disabled={profileBusyId === user._id}
                      >
                        {profileBusyId === user._id && profileDialogOpen ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                        View Profile
                      </button>
                      <button
                        type="button"
                        className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800"
                        onClick={() => toggleStatus(user._id)}
                        disabled={busyId === user._id}
                      >
                        {busyId === user._id ? "Updating..." : user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {profileDialogOpen ? (
        <Modal title="User Profile Details" onClose={closeProfile}>
          {profileDialogLoading ? (
            <div className="grid place-items-center gap-3 py-10 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={24} className="animate-spin" />
              Loading profile details...
            </div>
          ) : profileDialogError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
              {profileDialogError}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 md:flex-row md:items-center">
                <ProfileAvatar name={profileUser?.name} photoUrl={profilePhotoUrl} className="h-20 w-20" textClassName="text-lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Profile Preview</p>
                  <h4 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-100">{profileUser?.name || "-"}</h4>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{profileUser?.email || "-"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-900/30 dark:text-brand-100">
                      {formatRoleLabel(profileUser?.role)}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {profileUser?.department?.name || "No department"}
                    </span>
                    {profileUser?.designation ? (
                      <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {profileUser.designation}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Publications</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{profileCounts.publications}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Projects</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{profileCounts.projects}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Patents</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{profileCounts.patents}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <h5 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Faculty Details</h5>
                  <dl className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Employee ID</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{selectedProfile?.employeeId || "-"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Qualification</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{selectedProfile?.qualification || "-"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Department</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{profileUser?.department?.name || "-"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Designation</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{profileUser?.designation || "-"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Research Interests</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{listText(selectedProfile?.researchInterests)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <h5 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Research IDs</h5>
                  <dl className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Google Scholar</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{selectedProfile?.googleScholarId || "-"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">ORCID</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{selectedProfile?.orcidId || "-"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Scopus</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{selectedProfile?.scopusId || "-"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Research Areas</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{listText(selectedProfile?.areaOfExpertise)}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-36 shrink-0 text-slate-500 dark:text-slate-400">Bio</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-100">{selectedProfile?.bio || "-"}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {!selectedProfile?.qualification &&
              !selectedProfile?.employeeId &&
              !selectedProfile?.googleScholarId &&
              !selectedProfile?.orcidId &&
              !selectedProfile?.scopusId &&
              !selectedProfile?.researchInterests?.length ? (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">No faculty profile data yet</p>
                    <p className="mt-1">This account has not uploaded a faculty profile, so only the core user details are available.</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Modal>
      ) : null}

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
