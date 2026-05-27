import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "faculty",
    department: "",
    designation: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/users/departments/list");
        setDepartments(data.data || []);
      } catch (_error) {
        setDepartments([]);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-brand-700">Create FRMS Account</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">For faculty and research administration users</p>

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="faculty">Faculty</option>
              <option value="research_coordinator">Research Coordinator</option>
              <option value="hod_dean">HOD/Dean</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Department</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
            >
              <option value="">Select</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Designation</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.designation}
              onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-brand-600">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
