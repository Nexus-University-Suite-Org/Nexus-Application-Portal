import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface QuickLink {
  id: number;
  title: string;
  url: string;
  icon: string;
  displayOrder: number;
  createdAt: string;
}

const columns: Column<QuickLink>[] = [
  { key: "title", label: "Title", searchable: true },
  { key: "url", label: "URL" },
  { key: "icon", label: "Icon" },
  { key: "displayOrder", label: "Display Order" },
  { key: "createdAt", label: "Created At" },
];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text", required: true, placeholder: "Link title" },
  { key: "url", label: "URL", type: "text", required: true, placeholder: "https://example.com" },
  { key: "icon", label: "Icon", type: "text", placeholder: "e.g. ExternalLink" },
  { key: "displayOrder", label: "Display Order", type: "number", placeholder: "0" },
];

const QuickLinksPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<QuickLink>
      title="Quick Links"
      apiEndpoint="/api/v1/admin/quick-links"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search quick links..."
      token={token}
    />
  );
};

export default QuickLinksPage;
