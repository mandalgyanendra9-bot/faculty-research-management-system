import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch notifications");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  const markAll = async () => {
    await api.patch("/notifications/mark-all-read");
    toast.success("All notifications marked as read");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button className="rounded bg-brand-600 px-3 py-2 text-sm text-white" onClick={markAll}>
          Mark All Read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map((item) => (
          <div key={item._id} className={`rounded-lg border p-3 ${item.isRead ? "bg-white" : "bg-brand-50"}`}>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-slate-600">{item.message}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
            {!item.isRead ? (
              <button className="mt-2 rounded bg-slate-100 px-2 py-1 text-xs" onClick={() => markRead(item._id)}>
                Mark read
              </button>
            ) : null}
          </div>
        ))}
        {!notifications.length ? <p className="text-slate-500">No notifications yet.</p> : null}
      </div>
    </div>
  );
};

export default NotificationsPage;
