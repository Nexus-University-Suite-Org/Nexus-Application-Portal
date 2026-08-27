import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface Application {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  programChoice1: string;
  status: string;
  reviewStatus: string;
  createdAt: string;
}

const columns: Column<Application>[] = [
  { key: "firstName", label: "First Name", searchable: true },
  { key: "lastName", label: "Last Name", searchable: true },
  { key: "email", label: "Email", searchable: true },
  { key: "programChoice1", label: "Program" },
  {
    key: "status",
    label: "Status",
    render: (item) => (
      <Badge
        variant={
          item.status === "ADMITTED"
            ? "default"
            : item.status === "REJECTED"
            ? "destructive"
            : item.status === "WAITLISTED"
            ? "secondary"
            : "outline"
        }
      >
        {item.status}
      </Badge>
    ),
  },
  {
    key: "reviewStatus",
    label: "Review Status",
    render: (item) => (
      <Badge
        variant={
          item.reviewStatus === "admitted"
            ? "default"
            : item.reviewStatus === "rejected"
            ? "destructive"
            : item.reviewStatus === "waitlisted"
            ? "secondary"
            : "outline"
        }
      >
        {item.reviewStatus}
      </Badge>
    ),
  },
  { key: "createdAt", label: "Created At" },
];

const fields: FieldConfig[] = [
  { key: "firstName", label: "First Name", type: "text" },
  { key: "lastName", label: "Last Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phoneNumber", label: "Phone Number", type: "text" },
  {
    key: "gender",
    label: "Gender",
    type: "select",
    options: [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
    ],
    placeholder: "Select gender",
  },
  { key: "programChoice1", label: "Program Choice", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "Submitted", value: "SUBMITTED" },
      { label: "Admitted", value: "ADMITTED" },
      { label: "Rejected", value: "REJECTED" },
      { label: "Waitlisted", value: "WAITLISTED" },
    ],
    placeholder: "Select status",
  },
  {
    key: "reviewStatus",
    label: "Review Status",
    type: "select",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Admitted", value: "admitted" },
      { label: "Rejected", value: "rejected" },
      { label: "Waitlisted", value: "waitlisted" },
    ],
    placeholder: "Select review status",
  },
];

const ApplicationsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Application>
      title="Applications"
      apiEndpoint="/api/v1/applications"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search applications by name or email..."
      token={token}
      hideCreate
      hideEdit
    />
  );
};

export default ApplicationsPage;
