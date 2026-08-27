import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId: number;
  link: string;
  createdAt: string;
}

const columns: Column<Notification>[] = [
  { key: "userId", label: "User ID" },
  { key: "type", label: "Type" },
  { key: "title", label: "Title", searchable: true },
  { key: "message", label: "Message" },
  {
    key: "read",
    label: "Read",
    render: (item) => (
      <Badge variant={item.read ? "default" : "secondary"}>
        {item.read ? "Read" : "Unread"}
      </Badge>
    ),
  },
  { key: "createdAt", label: "Created At" },
];

const fields: FieldConfig[] = [
  { key: "userId", label: "User ID", type: "number" },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "Announcement", value: "announcement" },
      { label: "Warning", value: "warning" },
      { label: "Success", value: "success" },
      { label: "Info", value: "info" },
    ],
    placeholder: "Select type",
  },
  { key: "title", label: "Title", type: "text" },
  { key: "message", label: "Message", type: "textarea" },
  { key: "relatedId", label: "Related ID", type: "number" },
  { key: "link", label: "Link", type: "text", placeholder: "https://..." },
];

const NotificationsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Notification>
      title="Notifications"
      apiEndpoint="/api/v1/notifications"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search notifications..."
      token={token}
      hideCreate
      hideEdit
    />
  );
};

export default NotificationsPage;
