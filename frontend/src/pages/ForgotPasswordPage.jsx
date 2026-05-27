import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setTokenInfo(data.data || null);
      toast.success(data.message || "Reset token generated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-brand-700">Forgot Password</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Enter your account email to generate reset token</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Generate Reset Token"}
          </button>
        </form>

        {tokenInfo?.resetToken ? (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-semibold">Dev Reset Token</p>
            <p className="break-all">{tokenInfo.resetToken}</p>
            <p className="mt-1 text-xs">Expires in {tokenInfo.expiresInMinutes} minutes.</p>
          </div>
        ) : null}

        <p className="mt-4 text-sm text-slate-600">
          Continue with token: <Link to="/reset-password" className="text-brand-600">Reset Password</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
