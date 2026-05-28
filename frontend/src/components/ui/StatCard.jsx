const StatCard = ({ label, value, helper, accent = "blue" }) => {
  const accentClasses = {
    blue: "from-brand-50 to-brand-100 text-brand-700 dark:from-slate-800 dark:to-slate-700 dark:text-brand-100",
    amber: "from-amber-50 to-amber-100 text-amber-700 dark:from-slate-800 dark:to-slate-700 dark:text-amber-200",
    emerald: "from-emerald-50 to-emerald-100 text-emerald-700 dark:from-slate-800 dark:to-slate-700 dark:text-emerald-200",
    rose: "from-rose-50 to-rose-100 text-rose-700 dark:from-slate-800 dark:to-slate-700 dark:text-rose-200",
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-gradient-to-br p-4 dark:border-slate-700 ${accentClasses[accent] || accentClasses.blue}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {helper ? <p className="mt-1 text-xs opacity-75">{helper}</p> : null}
    </div>
  );
};

export default StatCard;
