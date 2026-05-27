const StatCard = ({ label, value, helper, accent = "blue" }) => {
  const accentClasses = {
    blue: "from-brand-50 to-brand-100 text-brand-700",
    amber: "from-amber-50 to-amber-100 text-amber-700",
    emerald: "from-emerald-50 to-emerald-100 text-emerald-700",
    rose: "from-rose-50 to-rose-100 text-rose-700",
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${accentClasses[accent] || accentClasses.blue}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {helper ? <p className="mt-1 text-xs opacity-75">{helper}</p> : null}
    </div>
  );
};

export default StatCard;
