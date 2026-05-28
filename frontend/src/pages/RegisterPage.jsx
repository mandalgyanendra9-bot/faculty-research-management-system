import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoadingLookups(true);
      try {
        const [departmentsRes, designationsRes] = await Promise.all([
          api.get("/users/departments/list"),
          api.get("/users/lookups", { params: { type: "designation" } }),
        ]);
        setDepartments(departmentsRes.data.data || []);
        setDesignations((designationsRes.data.data || []).map((item) => item.value));
      } catch (_error) {
        setDepartments([]);
        setDesignations([]);
      } finally {
        setLoadingLookups(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department || undefined,
        designation: form.designation || undefined,
      };
      const result = await register(payload);

      if (result.status === "active") {
        navigate("/app/dashboard", { replace: true });
        return;
      }

      setSuccessMessage("Registration submitted. Please wait for admin approval.");
      setForm({
        name: "",
        email: "",
        password: "",
        department: "",
        designation: "",
      });
      navigate("/pending-approval", { replace: true });
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
            <label className="mb-1 block text-sm font-medium">Department</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              disabled={loadingLookups || !departments.length}
            >
              <option value="">
                {loadingLookups
                  ? "Loading departments..."
                  : departments.length
                    ? "Select"
                    : "No departments available"}
              </option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Designation</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.designation}
              onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))}
              disabled={loadingLookups || !designations.length}
            >
              <option value="">
                {loadingLookups
                  ? "Loading designations..."
                  : designations.length
                    ? "Select"
                    : "No designations available"}
              </option>
              {designations.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
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

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-brand-600">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
