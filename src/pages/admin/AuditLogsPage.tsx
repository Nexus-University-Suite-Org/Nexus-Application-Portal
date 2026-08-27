import { AdminCrudPage, type Column } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  userName: string;
  createdAt: string;
}

const columns: Column<AuditLog>[] = [
  { key: "action", label: "Action", searchable: true },
  { key: "entity", label: "Entity", searchable: true },
  { key: "entityId", label: "Entity ID" },
  { key: "userName", label: "User", searchable: true },
  { key: "createdAt", label: "Created At" },
];

const AuditLogsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<AuditLog>
      title="Audit Logs"
      apiEndpoint="/api/v1/activities"
      columns={columns}
      fields={[]}
      searchPlaceholder="Search audit logs..."
      token={token}
      hideCreate
      hideEdit
      hideDelete
    />
  );
};

export default AuditLogsPage;
