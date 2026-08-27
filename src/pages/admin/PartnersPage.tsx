import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface Partner {
  id: number;
  name: string;
  websiteUrl: string;
  createdAt: string;
}

const columns: Column<Partner>[] = [
  { key: "name", label: "Name" },
  { key: "websiteUrl", label: "Website" },
  { key: "createdAt", label: "Created" },
];

const fields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "logoUrl", label: "Logo URL", type: "text" },
  { key: "websiteUrl", label: "Website URL", type: "text" },
];

const PartnersPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Partner>
      title="Partners"
      apiEndpoint="/api/v1/admin/partners"
      columns={columns}
      fields={fields}
      token={token}
      searchPlaceholder="Search partners..."
    />
  );
};

export default PartnersPage;
