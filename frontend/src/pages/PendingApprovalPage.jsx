import { Link } from "react-router-dom";
import { Clock3 } from "lucide-react";

const PendingApprovalPage = () => (
  <div className="grid min-h-screen place-items-center px-4">
    <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 shadow-soft dark:border-amber-900/60 dark:bg-slate-900">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
        <Clock3 size={22} />
      </div>
      <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100">Registration Pending Approval</h1>
      <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
        Your FRMS account is created successfully and is waiting for admin approval. You will be able to login once your account is activated.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/login" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Go to Login
        </Link>
        <Link to="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Back to Home
        </Link>
      </div>
    </div>
  </div>
);

export default PendingApprovalPage;
