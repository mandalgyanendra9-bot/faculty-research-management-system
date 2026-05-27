import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import StatusBadge from "../components/ui/StatusBadge";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lookups, setLookups] = useState([]);
  const [deptForm, setDeptForm] = useState({ name: "", code: "", school: "" });
  const [lookupForm, setLookupForm] = useState({ type: "designation", value: "" });

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    }
  };

  const loadDepartments = async () => {
    const { data } = await api.get("/users/departments/list");
    setDepartments(data.data || []);
  };

  const loadLookups = async () => {
    const { data } = await api.get("/users/lookups");
    setLookups(data.data || []);
  };

  useEffect(() => {
    loadUsers();
    loadDepartments();
    loadLookups();
  }, []);

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      toast.success("User status updated");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
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

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-600">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="py-2">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.department?.name || "-"}</td>
                  <td>
                    <StatusBadge status={user.isActive ? "active" : "inactive"} />
                  </td>
                  <td>
                    <button
                      className="rounded bg-slate-100 px-2 py-1 text-xs"
                      onClick={() => toggleStatus(user._id)}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 font-semibold">Manage Departments</h3>
          <form className="grid gap-2" onSubmit={createDepartment}>
            <input
              placeholder="Department Name"
              className="rounded-lg border px-3 py-2"
              value={deptForm.name}
              onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <input
              placeholder="Code"
              className="rounded-lg border px-3 py-2"
              value={deptForm.code}
              onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value }))}
              required
            />
            <input
              placeholder="School"
              className="rounded-lg border px-3 py-2"
              value={deptForm.school}
              onChange={(e) => setDeptForm((p) => ({ ...p, school: e.target.value }))}
            />
            <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Add Department</button>
          </form>

          <div className="mt-3 space-y-2 text-sm">
            {departments.map((dept) => (
              <div key={dept._id} className="rounded bg-slate-50 p-2">
                {dept.name} ({dept.code})
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="mb-3 font-semibold">Designations & Research Categories</h3>
          <form className="grid gap-2" onSubmit={createLookup}>
            <select
              className="rounded-lg border px-3 py-2"
              value={lookupForm.type}
              onChange={(e) => setLookupForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="designation">Designation</option>
              <option value="research_category">Research Category</option>
            </select>
            <input
              placeholder="Value"
              className="rounded-lg border px-3 py-2"
              value={lookupForm.value}
              onChange={(e) => setLookupForm((p) => ({ ...p, value: e.target.value }))}
              required
            />
            <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Add Lookup</button>
          </form>

          <div className="mt-3 space-y-2 text-sm">
            {lookups.map((item) => (
              <div key={item._id} className="rounded bg-slate-50 p-2">
                <span className="mr-2 rounded bg-brand-100 px-2 py-1 text-xs text-brand-700">{item.type}</span>
                {item.value}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsersPage;
