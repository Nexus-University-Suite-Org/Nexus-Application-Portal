import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface FacultyMember {
  id: number;
  name: string;
  title: string;
  department: string;
  bio: string;
  email: string;
  specialization: string;
  displayOrder: number;
}

const columns: Column<FacultyMember>[] = [
  { key: "name", label: "Name", searchable: true },
  { key: "title", label: "Title" },
  { key: "department", label: "Department", searchable: true },
  { key: "email", label: "Email" },
  { key: "displayOrder", label: "Display Order" },
];

const fields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Dr. John Smith" },
  { key: "title", label: "Title", type: "text", placeholder: "e.g. Professor" },
  { key: "department", label: "Department", type: "text", required: true, placeholder: "e.g. Computer Science" },
  { key: "bio", label: "Bio", type: "textarea", placeholder: "Short biography..." },
  { key: "email", label: "Email", type: "text", placeholder: "email@university.edu" },
  { key: "specialization", label: "Specialization", type: "text", placeholder: "e.g. Artificial Intelligence" },
  { key: "displayOrder", label: "Display Order", type: "number", placeholder: "0" },
];

const FacultyPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<FacultyMember>
      title="Faculty Members"
      apiEndpoint="/api/v1/admin/faculty"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search faculty by name or department..."
      token={token}
    />
  );
};

export default FacultyPage;
