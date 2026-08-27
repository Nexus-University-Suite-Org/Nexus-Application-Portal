import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface Alumni {
  id: number;
  name: string;
  program: string;
  graduationYear: number;
  createdAt: string;
}

const columns: Column<Alumni>[] = [
  { key: "name", label: "Name" },
  { key: "program", label: "Program" },
  { key: "graduationYear", label: "Graduation Year" },
  { key: "createdAt", label: "Created" },
];

const fields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "program", label: "Program", type: "text" },
  { key: "graduationYear", label: "Graduation Year", type: "number" },
  { key: "bio", label: "Bio", type: "textarea" },
  { key: "imageUrl", label: "Image URL", type: "text" },
];

const AlumniPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Alumni>
      title="Alumni"
      apiEndpoint="/api/v1/admin/alumni"
      columns={columns}
      fields={fields}
      token={token}
      searchPlaceholder="Search alumni..."
    />
  );
};

export default AlumniPage;
