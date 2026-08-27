import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: number;
  title: string;
  eventDate: string;
  published: boolean;
  createdAt: string;
}

const columns: Column<Event>[] = [
  { key: "title", label: "Title" },
  { key: "eventDate", label: "Event Date" },
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
  { key: "description", label: "Description", type: "textarea" },
  { key: "eventDate", label: "Event Date", type: "date" },
  { key: "imageUrl", label: "Image URL", type: "text" },
  { key: "published", label: "Published", type: "switch" },
];

const EventsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Event>
      title="Events"
      apiEndpoint="/api/v1/admin/events"
      columns={columns}
      fields={fields}
      token={token}
      searchPlaceholder="Search events..."
    />
  );
};

export default EventsPage;
