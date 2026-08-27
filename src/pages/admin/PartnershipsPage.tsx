import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface Partnership {
  id: number;
  organizationName: string;
  contactEmail: string;
  contactPerson: string;
  status: string;
  createdAt: string;
}

const columns: Column<Partnership>[] = [
  { key: "organizationName", label: "Organization", searchable: true },
  { key: "contactEmail", label: "Contact Email", searchable: true },
  { key: "contactPerson", label: "Contact Person" },
  {
    key: "status",
    label: "Status",
    render: (item) => {
      const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
        new: "default",
        contacted: "secondary",
        in_progress: "outline",
        completed: "secondary",
      };
      return <Badge variant={variants[item.status] || "default"}>{item.status.replace("_", " ")}</Badge>;
    },
  },
  { key: "createdAt", label: "Created At" },
];

const fields: FieldConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    required: true,
    placeholder: "Select status...",
    options: [
      { label: "New", value: "new" },
      { label: "Contacted", value: "contacted" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
    ],
  },
];

const PartnershipsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Partnership>
      title="Partnerships"
      apiEndpoint="/api/v1/admin/partnerships"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search partnerships..."
      token={token}
      hideCreate
    />
  );
};

export default PartnershipsPage;
