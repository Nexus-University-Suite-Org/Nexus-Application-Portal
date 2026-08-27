import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface NewsArticle {
  id: number;
  title: string;
  category: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

const columns: Column<NewsArticle>[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  {
    key: "featured",
    label: "Featured",
    render: (item) => (
      <Badge variant={item.featured ? "default" : "secondary"}>
        {item.featured ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    key: "published",
    label: "Published",
    render: (item) => (
      <Badge variant={item.published ? "default" : "secondary"}>
        {item.published ? "Yes" : "No"}
      </Badge>
    ),
  },
  { key: "createdAt", label: "Created" },
];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "excerpt", label: "Excerpt", type: "textarea" },
  { key: "content", label: "Content", type: "textarea" },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { label: "News", value: "News" },
      { label: "Announcement", value: "Announcement" },
      { label: "Event", value: "Event" },
      { label: "Tutorial", value: "Tutorial" },
    ],
  },
  { key: "imageUrl", label: "Image URL", type: "text" },
  { key: "featured", label: "Featured", type: "switch" },
  { key: "published", label: "Published", type: "switch" },
];

const NewsArticlesPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<NewsArticle>
      title="News Articles"
      apiEndpoint="/api/v1/admin/news"
      columns={columns}
      fields={fields}
      token={token}
      searchPlaceholder="Search articles..."
    />
  );
};

export default NewsArticlesPage;
