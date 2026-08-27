import { AdminCrudPage, type Column } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface NewsletterSubscription {
  id: number;
  email: string;
  doubleOptIn: boolean;
  createdAt: string;
}

const columns: Column<NewsletterSubscription>[] = [
  { key: "email", label: "Email", searchable: true },
  {
    key: "doubleOptIn",
    label: "Double Opt-In",
    render: (item) => (
      <Badge variant={item.doubleOptIn ? "default" : "secondary"}>
        {item.doubleOptIn ? "Confirmed" : "Pending"}
      </Badge>
    ),
  },
  { key: "createdAt", label: "Created At" },
];

const NewsletterPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<NewsletterSubscription>
      title="Newsletter"
      apiEndpoint="/api/v1/admin/newsletter"
      columns={columns}
      fields={[]}
      searchPlaceholder="Search newsletter subscriptions..."
      token={token}
      hideCreate
      hideEdit
    />
  );
};

export default NewsletterPage;
