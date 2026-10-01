import { apiUrl } from "@/lib/apiUrl";

export type Notification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  courseId: number | null;
  createdAt: string;
};

const parseErrorDetail = async (response: Response) => {
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (data && typeof data === "object") {
    const parsed = data as { detail?: string; message?: string };
    return parsed.detail ?? parsed.message ?? null;
  }
  return null;
};

export const getNotifications = async (
  userId: number,
  isRead?: boolean,
): Promise<Notification[]> => {
  const params = new URLSearchParams({ userId: String(userId) });
  if (isRead !== undefined) {
    params.set("isRead", String(isRead));
  }
  const response = await fetch(apiUrl(`notifications?${params}`));
  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ?? "Failed to fetch notifications";
    throw new Error(detail);
  }
  return response.json();
};

export const markNotificationRead = async (
  id: number,
): Promise<Notification> => {
  const response = await fetch(apiUrl(`notifications/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ?? "Failed to mark as read";
    throw new Error(detail);
  }
  return response.json();
};

export const markAllNotificationsRead = async (
  userId: number,
): Promise<void> => {
  const response = await fetch(
    apiUrl("notifications/mark-all-read"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    },
  );
  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ?? "Failed to mark all as read";
    throw new Error(detail);
  }
};

export const deleteNotification = async (id: number): Promise<void> => {
  const response = await fetch(apiUrl(`notifications/${id}`), {
    method: "DELETE",
  });
  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ?? "Failed to delete notification";
    throw new Error(detail);
  }
};

export const getAnnouncements = async (
  courseId?: number,
): Promise<Announcement[]> => {
  const params = courseId ? `?courseId=${courseId}` : "";
  const response = await fetch(apiUrl(`announcements${params}`));
  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ?? "Failed to fetch announcements";
    throw new Error(detail);
  }
  return response.json();
};
