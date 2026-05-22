import { useCallback, useEffect, useState } from "react";
import { getApi } from "@/utils/api";

const notifyDevice = (notification) => {
  if (!("Notification" in window)) return;
  if (window.Notification.permission !== "granted") return;

  new window.Notification("Attendance Reminder", {
    body: notification.message,
    tag: notification.reminder_key || `notification-${notification.id}`,
  });
};

export function useNotifications() {
  const api = getApi();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("notifications/");
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      const role = localStorage.getItem("role");
      const lastSeenId = Number(localStorage.getItem("last_device_notification_id") || 0);
      const newestId = data.reduce((max, item) => Math.max(max, Number(item.id || 0)), lastSeenId);
      const webPushAvailable =
        Boolean(import.meta.env.VITE_WEB_PUSH_VAPID_PUBLIC_KEY) &&
        "serviceWorker" in navigator &&
        "PushManager" in window;

      if (role === "staff" && !webPushAvailable && "Notification" in window) {
        if (window.Notification.permission === "default") {
          window.Notification.requestPermission().catch(() => {});
        }

        data
          .filter(
            (item) =>
              Number(item.id || 0) > lastSeenId &&
              !(item.is_read || item.read) &&
              item.notification_type === "attendance_reminder"
          )
          .reverse()
          .forEach(notifyDevice);
      }

      if (newestId > lastSeenId) {
        localStorage.setItem("last_device_notification_id", String(newestId));
      }
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const generateAttendanceReminder = useCallback(
    async (kind) => {
      try {
        await api.post("attendance/generate-reminders/", { kind });
        await fetchNotifications();
      } catch (error) {
        console.error("Error generating attendance reminder:", error.response?.data || error.message);
      }
    },
    [api, fetchNotifications]
  );

  const handleMarkRead = async (id) => {
    try {
      await api.post(`notifications/${id}/mark_read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error.response?.data || error.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("notifications/mark_all_read/");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 60000);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (localStorage.getItem("role") !== "staff") return;

    const runDueReminders = () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const minutes = now.getHours() * 60 + now.getMinutes();
      const checks = [
        { kind: "clock_in", due: 9 * 60 },
        { kind: "clock_out", due: 18 * 60 },
      ];

      checks.forEach(({ kind, due }) => {
        const key = `attendance_reminder_checked:${today}:${kind}`;
        if (minutes >= due && localStorage.getItem(key) !== "1") {
          localStorage.setItem(key, "1");
          generateAttendanceReminder(kind);
        }
      });
    };

    runDueReminders();
    const interval = window.setInterval(runDueReminders, 60000);
    return () => window.clearInterval(interval);
  }, [generateAttendanceReminder]);

  const unreadCount = notifications.filter((n) => !(n.is_read || n.read)).length;

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    generateAttendanceReminder,
    handleMarkRead,
    handleMarkAllRead,
  };
}
