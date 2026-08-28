import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

const columns: Column<AdminUser>[] = [
  { key: "email", label: "Email", searchable: true },
  { key: "fullName", label: "Full Name", searchable: true },
  { key: "createdAt", label: "Created At" },
];

const fields: FieldConfig[] = [
  { key: "email", label: "Email", type: "text", required: true, placeholder: "admin@example.com" },
  { key: "password", label: "Password", type: "text", required: true, placeholder: "••••••••" },
  { key: "fullName", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
];

const AdminUsersPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<AdminUser>
      title="Admin Users"
      apiEndpoint="/api/v1/admin/users"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search admin users..."
      token={token}
      hideCreate
      hideEdit
      hideDelete
      clientSideSearch
    />
  );
};

export default AdminUsersPage;
