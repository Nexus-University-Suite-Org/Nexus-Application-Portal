import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: number;
  name: string;
  code: string;
  college: string;
  level: string;
  duration: string;
  credits: number;
  imageUrl: string;
  published: boolean;
}

const columns: Column<Course>[] = [
  { key: "name", label: "Name", searchable: true },
  { key: "code", label: "Code", searchable: true },
  { key: "college", label: "College" },
  { key: "level", label: "Level" },
  { key: "duration", label: "Duration" },
  { key: "credits", label: "Credits" },
  {
    key: "published",
    label: "Published",
    render: (item) => (
      <Badge variant={item.published ? "default" : "secondary"}>
        {item.published ? "Published" : "Draft"}
      </Badge>
    ),
  },
];

const fields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Introduction to Computer Science" },
  { key: "code", label: "Code", type: "text", required: true, placeholder: "e.g. CS101" },
  {
    key: "college",
    label: "College",
    type: "select",
    required: true,
    options: [
      { label: "Faculty of Science", value: "Faculty of Science" },
      { label: "Faculty of Arts", value: "Faculty of Arts" },
      { label: "Faculty of Engineering", value: "Faculty of Engineering" },
    ],
    placeholder: "Select college",
  },
  {
    key: "level",
    label: "Level",
    type: "select",
    required: true,
    options: [
      { label: "Certificate", value: "Certificate" },
      { label: "Diploma", value: "Diploma" },
      { label: "Degree", value: "Degree" },
    ],
    placeholder: "Select level",
  },
  { key: "duration", label: "Duration", type: "text", placeholder: "e.g. 4 Years" },
  { key: "credits", label: "Credits", type: "number", placeholder: "e.g. 120" },
  { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
  { key: "published", label: "Published", type: "switch" },
];

const CoursesPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Course>
      title="Courses"
      apiEndpoint="/api/v1/admin/courses"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search courses by name or code..."
      token={token}
    />
  );
};

export default CoursesPage;
