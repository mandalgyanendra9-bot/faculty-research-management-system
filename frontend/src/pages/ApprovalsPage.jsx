import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const ApprovalsPage = () => {
  const [data, setData] = useState(null);
  const [module, setModule] = useState("publications");

  const load = async () => {
    try {
      const { data: res } = await api.get("/approvals/pending");
      setData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch approvals");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (item, status) => {
    let reason = "";
    if (status === "rejected") {
      reason = window.prompt("Enter rejection reason");
      if (!reason) return;
    }

    try {
      await api.patch(`/${module}/${item._id}/approval`, { status, rejectionReason: reason });
      toast.success("Approval status updated");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const records = data?.[module] || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold">Pending Approvals</h2>
        <select className="rounded-lg border px-3 py-2" value={module} onChange={(e) => setModule(e.target.value)}>
          <option value="publications">Publications</option>
          <option value="projects">Projects</option>
          <option value="patents">Patents</option>
          <option value="grants">Grants</option>
          <option value="events">Events</option>
        </select>
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        {Object.entries(data?.counts || {}).map(([key, count]) => (
          <div key={key} className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
            <p className="font-semibold capitalize">{key}</p>
            <p>{count}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {records.length ? (
          records.map((item) => (
            <div key={item._id} className="rounded-lg border p-3">
              <p className="font-medium">{item.title || item.projectTitle || item.patentTitle || item.grantProposal || item.eventName}</p>
              <p className="text-xs text-slate-500">Submitted by: {item.submittedBy?.name}</p>
              <div className="mt-2 flex gap-2">
                <button className="rounded bg-emerald-100 px-3 py-1 text-sm text-emerald-700" onClick={() => updateStatus(item, "approved")}>Approve</button>
                <button className="rounded bg-rose-100 px-3 py-1 text-sm text-rose-700" onClick={() => updateStatus(item, "rejected")}>Reject</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500">No pending records in this module.</p>
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
