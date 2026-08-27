import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface LegalPage {
  id: number;
  title: string;
  slug: string;
  type: string;
  version: string;
  updatedDate: string;
  createdAt: string;
}

const columns: Column<LegalPage>[] = [
  { key: "title", label: "Title", searchable: true },
  { key: "slug", label: "Slug" },
  { key: "type", label: "Type" },
  { key: "version", label: "Version" },
  { key: "updatedDate", label: "Updated Date" },
  { key: "createdAt", label: "Created At" },
];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text", required: true, placeholder: "Page title" },
  { key: "slug", label: "Slug", type: "text", required: true, placeholder: "privacy-policy" },
  {
    key: "type",
    label: "Type",
    type: "select",
    required: true,
    placeholder: "Select type...",
    options: [
      { label: "Privacy Policy", value: "privacy_policy" },
      { label: "Terms of Use", value: "terms_of_use" },
      { label: "Accessibility", value: "accessibility" },
      { label: "Cookie Policy", value: "cookie_policy" },
    ],
  },
  { key: "version", label: "Version", type: "text", placeholder: "1.0" },
  { key: "content", label: "Content", type: "textarea", placeholder: "Page content..." },
  { key: "updatedDate", label: "Updated Date", type: "date" },
];

const LegalPagesPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<LegalPage>
      title="Legal Pages"
      apiEndpoint="/api/v1/admin/legal-pages"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search legal pages..."
      token={token}
    />
  );
};

export default LegalPagesPage;
