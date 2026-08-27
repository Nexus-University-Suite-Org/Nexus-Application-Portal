import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface Scholarship {
  id: number;
  title: string;
  deadline: string;
  createdAt: string;
}

const columns: Column<Scholarship>[] = [
  { key: "title", label: "Title" },
  { key: "deadline", label: "Deadline" },
  { key: "createdAt", label: "Created" },
];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "eligibility", label: "Eligibility", type: "textarea" },
  { key: "deadline", label: "Deadline", type: "date" },
];

const ScholarshipsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Scholarship>
      title="Scholarships"
      apiEndpoint="/api/v1/admin/scholarships"
      columns={columns}
      fields={fields}
      token={token}
      searchPlaceholder="Search scholarships..."
    />
  );
};

export default ScholarshipsPage;
