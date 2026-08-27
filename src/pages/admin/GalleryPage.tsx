import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface GalleryItem {
  id: number;
  alt: string;
  category: string;
  span: string;
  createdAt: string;
}

const columns: Column<GalleryItem>[] = [
  { key: "alt", label: "Alt" },
  { key: "category", label: "Category" },
  { key: "span", label: "Span" },
  { key: "createdAt", label: "Created" },
];

const fields: FieldConfig[] = [
  { key: "src", label: "Image URL", type: "text" },
  { key: "alt", label: "Alt Text", type: "text" },
  { key: "caption", label: "Caption", type: "text" },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { label: "Campus", value: "Campus" },
      { label: "Events", value: "Events" },
      { label: "Students", value: "Students" },
      { label: "Faculty", value: "Faculty" },
    ],
  },
  { key: "span", label: "Span", type: "text" },
];

const GalleryPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<GalleryItem>
      title="Gallery"
      apiEndpoint="/api/v1/admin/gallery"
      columns={columns}
      fields={fields}
      token={token}
      searchPlaceholder="Search gallery items..."
    />
  );
};

export default GalleryPage;
