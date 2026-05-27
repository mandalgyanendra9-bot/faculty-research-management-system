import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: "", newPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", form);
      toast.success("Password reset successful");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-brand-700">Reset Password</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Use the reset token and set a new password</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Reset Token</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.token}
              onChange={(e) => setForm((prev) => ({ ...prev, token: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">New Password</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Back to <Link to="/login" className="text-brand-600">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
