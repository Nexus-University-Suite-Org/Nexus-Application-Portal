import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

const columns: Column<Contact>[] = [
  { key: "name", label: "Name", searchable: true },
  { key: "email", label: "Email", searchable: true },
  { key: "subject", label: "Subject" },
  {
    key: "status",
    label: "Status",
    render: (item) => (
      <Badge variant={item.status === "new" ? "default" : item.status === "replied" ? "secondary" : "outline"}>
        {item.status}
      </Badge>
    ),
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
      { label: "Read", value: "read" },
      { label: "Replied", value: "replied" },
    ],
  },
];

const ContactsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Contact>
      title="Contacts"
      apiEndpoint="/api/v1/admin/contacts"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search contacts..."
      token={token}
      hideCreate
      clientSideSearch
    />
  );
};

export default ContactsPage;
