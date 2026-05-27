const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();
  const classes =
    normalized === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "active"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "rejected"
      ? "bg-rose-100 text-rose-700"
      : normalized === "inactive"
      ? "bg-rose-100 text-rose-700"
      : normalized === "pending"
      ? "bg-amber-100 text-amber-700"
      : normalized === "success"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "failed"
      ? "bg-rose-100 text-rose-700"
      : "bg-slate-100 text-slate-700";

  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${classes}`}>{status}</span>;
};

export default StatusBadge;
