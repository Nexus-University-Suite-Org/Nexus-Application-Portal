import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface StudentStory {
  id: number;
  title: string;
  studentName: string;
  author: string;
  program: string;
  graduationYear: number;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
}

const columns: Column<StudentStory>[] = [
  {
    key: "imageUrl",
    label: "Image",
    render: (item) => (
      item.imageUrl
        ? <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
        : <span className="text-xs text-muted-foreground">No image</span>
    ),
  },
  { key: "title", label: "Title" },
  { key: "studentName", label: "Student" },
  { key: "program", label: "Program" },
  { key: "graduationYear", label: "Year" },
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
  { key: "title", label: "Title", type: "text", required: true, placeholder: "e.g. From Street Vendor to Business Owner" },
  { key: "studentName", label: "Student Name", type: "text", required: true, placeholder: "e.g. Mary Nakato" },
  { key: "program", label: "Program", type: "text", placeholder: "e.g. Tailoring & Design" },
  { key: "graduationYear", label: "Graduation Year", type: "number", placeholder: "e.g. 2025" },
  { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://example.com/photo.jpg" },
  { key: "author", label: "Author / Attribution", type: "text", placeholder: "e.g. Nexus University" },
  { key: "content", label: "Full Story", type: "textarea", required: true },
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
