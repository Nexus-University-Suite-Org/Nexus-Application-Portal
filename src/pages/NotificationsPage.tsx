import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Megaphone,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "@/lib/notifications";

const DEMO_USER_ID = 1;

const typeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "announcement":
      return <Megaphone className="w-4 h-4" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    getNotifications(DEMO_USER_ID, showUnreadOnly ? false : undefined)
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [showUnreadOnly]);

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

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-light">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              {showUnreadOnly ? "Show All" : "Unread Only"}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-sm text-accent hover:opacity-80 transition"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`group flex items-start gap-3 p-4 rounded-lg border transition hover:bg-muted/50 ${
                  !notif.read
                    ? "border-accent/30 bg-accent/5"
                    : "border-border"
                }`}
              >
                <div className="mt-0.5 shrink-0">{typeIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !notif.read ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1 rounded hover:bg-muted text-xs text-accent"
                      title="Mark as read"
                    >
                      Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1 rounded hover:bg-muted"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NotificationsPage;
