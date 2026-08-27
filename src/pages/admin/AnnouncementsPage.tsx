import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface Announcement {
  id: number;
  title: string;
  authorId: number;
  courseId: number;
  isSystemWide: boolean;
  body: string;
  createdAt: string;
}

const columns: Column<Announcement>[] = [
  { key: "title", label: "Title", searchable: true },
  { key: "authorId", label: "Author ID" },
  { key: "courseId", label: "Course ID" },
  {
    key: "isSystemWide",
    label: "System Wide",
    render: (item) => (
      <Badge variant={item.isSystemWide ? "default" : "secondary"}>
        {item.isSystemWide ? "Yes" : "No"}
      </Badge>
    ),
  },
  { key: "createdAt", label: "Created At" },
];

const fields: FieldConfig[] = [
  { key: "authorId", label: "Author ID", type: "number", required: true },
  { key: "title", label: "Title", type: "text", required: true, placeholder: "Announcement title" },
  { key: "body", label: "Body", type: "textarea", required: true, placeholder: "Announcement content..." },
  { key: "courseId", label: "Course ID", type: "number", placeholder: "Leave empty for system-wide" },
  { key: "isSystemWide", label: "System Wide", type: "switch" },
];

const AnnouncementsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Announcement>
      title="Announcements"
      apiEndpoint="/api/v1/announcements"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search announcements..."
      token={token}
    />
  );
};

export default AnnouncementsPage;
