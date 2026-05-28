import StatusBadge from "./StatusBadge";
import Skeleton from "./Skeleton";

const DataTable = ({ columns, rows, loading = false, onEdit, onDelete, onApprove }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-11" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 font-semibold capitalize">
                {col.replace(/([A-Z])/g, " $1")}
              </th>
            ))}
            <th className="px-3 py-2 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="border-b border-slate-200 dark:border-slate-700">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-slate-700 dark:text-slate-200">
                  {col === "approvalStatus" ? (
                    <StatusBadge status={row[col]} />
                  ) : typeof row[col] === "object" ? (
                    row[col]?.name || "-"
                  ) : (
                    String(row[col] ?? "-")
                  )}
                </td>
              ))}
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  {onEdit ? (
                    <button
                      className="rounded bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-slate-700 dark:text-brand-100"
                      onClick={() => onEdit(row)}
                    >
                      Edit
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button
                      className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                      onClick={() => onDelete(row)}
                    >
                      Delete
                    </button>
                  ) : null}
                  {onApprove ? (
                    <button
                      className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                      onClick={() => onApprove(row)}
                    >
                      Review
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length ? <p className="py-6 text-center text-slate-500 dark:text-slate-400">No data found.</p> : null}
    </div>
  );
};

export default DataTable;
