const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

const buildUrl = (path: string) =>
  `${API_BASE_URL}${API_BASE_URL.endsWith("/") ? "" : "/"}${path}`;

export type Message = {
  id: number;
  fromUserId: number;
  toUserId: number;
  subject: string;
  body: string;
  senderDeleted: boolean;
  recipientDeleted: boolean;
  senderStarred: boolean;
  recipientStarred: boolean;
  senderArchived: boolean;
  recipientArchived: boolean;
  readAt: string | null;
  createdAt: string;
  attachments: Array<{ id: number; url: string; name: string; size: number }>;
};

export type MessageDraft = {
  id: number;
  toUserId: number | null;
  subject: string;
  body: string;
  createdAt: string;
};

export type SendMessageInput = {
  toUserId: number;
  subject: string;
  body: string;
  attachments?: Array<{ url: string; name: string; size: number }>;
};

export type SaveDraftInput = {
  toUserId?: number;
  subject?: string;
  body?: string;
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

export const getMessages = async (
  userId: number,
  view: "inbox" | "sent" | "starred" = "inbox",
): Promise<Message[]> => {
  const response = await fetch(
    buildUrl(`v1/messages/${userId}?view=${view}`),
  );
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to fetch messages";
    throw new Error(detail);
  }
  return response.json();
};

export const getMessageById = async (
  userId: number,
  messageId: number,
): Promise<Message> => {
  const response = await fetch(buildUrl(`v1/messages/${userId}/${messageId}`));
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to fetch message";
    throw new Error(detail);
  }
  return response.json();
};

export const sendMessage = async (
  userId: number,
  payload: SendMessageInput,
): Promise<Message> => {
  const response = await fetch(
    buildUrl(`v1/messages/send?userId=${userId}`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toUserId: payload.toUserId,
        subject: payload.subject,
        body: payload.body,
        attachments: payload.attachments ?? [],
      }),
    },
  );
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to send message";
    throw new Error(detail);
  }
  return response.json();
};

export const markRead = async (
  userId: number,
  messageId: number,
): Promise<Message> => {
  const response = await fetch(
    buildUrl(`v1/messages/${userId}/${messageId}/read`),
    { method: "PUT" },
  );
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to mark as read";
    throw new Error(detail);
  }
  return response.json();
};

export const softDeleteMessage = async (
  userId: number,
  messageId: number,
): Promise<void> => {
  const response = await fetch(
    buildUrl(`v1/messages/${userId}/${messageId}/delete`),
    { method: "PUT" },
  );
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to delete message";
    throw new Error(detail);
  }
};

export const toggleStar = async (
  userId: number,
  messageId: number,
): Promise<void> => {
  const response = await fetch(
    buildUrl(`v1/messages/${userId}/${messageId}/star`),
    { method: "PUT" },
  );
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to toggle star";
    throw new Error(detail);
  }
};

export const toggleArchive = async (
  userId: number,
  messageId: number,
): Promise<void> => {
  const response = await fetch(
    buildUrl(`v1/messages/${userId}/${messageId}/archive`),
    { method: "PUT" },
  );
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to toggle archive";
    throw new Error(detail);
  }
};

export const getDrafts = async (userId: number): Promise<MessageDraft[]> => {
  const response = await fetch(buildUrl(`v1/messages/drafts/${userId}`));
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to fetch drafts";
    throw new Error(detail);
  }
  return response.json();
};

export const saveDraft = async (
  userId: number,
  payload: SaveDraftInput,
): Promise<MessageDraft> => {
  const response = await fetch(
    buildUrl(`v1/messages/drafts?userId=${userId}`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toUserId: payload.toUserId ?? null,
        subject: payload.subject ?? "",
        body: payload.body ?? "",
      }),
    },
  );
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to save draft";
    throw new Error(detail);
  }
  return response.json();
};

export const deleteDraft = async (
  userId: number,
  draftId: number,
): Promise<void> => {
  const response = await fetch(
    buildUrl(`v1/messages/drafts/${userId}/${draftId}`),
    { method: "DELETE" },
  );
  if (!response.ok) {
    const detail = (await parseErrorDetail(response)) ?? "Failed to delete draft";
    throw new Error(detail);
  }
};
