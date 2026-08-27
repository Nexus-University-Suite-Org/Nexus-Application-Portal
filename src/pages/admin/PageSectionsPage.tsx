import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface PageSection {
  id: number;
  pageKey: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  createdAt: string;
}

const columns: Column<PageSection>[] = [
  { key: "pageKey", label: "Page Key", searchable: true },
  { key: "sectionKey", label: "Section Key", searchable: true },
  { key: "title", label: "Title" },
  { key: "subtitle", label: "Subtitle" },
  { key: "createdAt", label: "Created At" },
];

const fields: FieldConfig[] = [
  { key: "pageKey", label: "Page Key", type: "text", required: true, placeholder: "e.g. home" },
  { key: "sectionKey", label: "Section Key", type: "text", required: true, placeholder: "e.g. hero" },
  { key: "title", label: "Title", type: "text", placeholder: "Section title" },
  { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Section subtitle" },
  { key: "body", label: "Body", type: "textarea", placeholder: "Section content..." },
  { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://example.com/image.jpg" },
];

const PageSectionsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<PageSection>
      title="Page Sections"
      apiEndpoint="/api/v1/admin/page-sections"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search page sections..."
      token={token}
    />
  );
};

export default PageSectionsPage;
