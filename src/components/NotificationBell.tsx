import { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/notifications";

const DEMO_USER_ID = 1;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNotifications(DEMO_USER_ID)
      .then(setNotifications)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getNotifications(DEMO_USER_ID)
        .then(setNotifications)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(DEMO_USER_ID);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-accent hover:opacity-80"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">
                No notifications
              </p>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition cursor-pointer ${
                    !notif.read ? "bg-accent/5" : ""
                  }`}
                  onClick={() => {
                    if (!notif.read) handleMarkRead(notif.id);
                  }}
                >
                  <p
                    className={`text-xs ${
                      !notif.read ? "font-semibold" : ""
                    }`}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-border text-center">
            <a
              href="/notifications"
              className="text-xs text-accent hover:opacity-80"
              onClick={() => setOpen(false)}
            >
              View all
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
