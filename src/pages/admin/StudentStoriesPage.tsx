import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface StudentStory {
  id: number;
  title: string;
  author: string;
  featured: boolean;
  createdAt: string;
}

const columns: Column<StudentStory>[] = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  {
    key: "featured",
    label: "Featured",
    render: (item) => (
      <Badge variant={item.featured ? "default" : "secondary"}>
        {item.featured ? "Yes" : "No"}
      </Badge>
    ),
  },
  { key: "createdAt", label: "Created" },
];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "slug", label: "Slug", type: "text" },
  { key: "content", label: "Content", type: "textarea" },
  { key: "author", label: "Author", type: "text" },
  { key: "featured", label: "Featured", type: "switch" },
];

const StudentStoriesPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<StudentStory>
      title="Student Stories"
      apiEndpoint="/api/v1/admin/student-stories"
      columns={columns}
      fields={fields}
      token={token}
      searchPlaceholder="Search student stories..."
    />
  );
};

export default StudentStoriesPage;
