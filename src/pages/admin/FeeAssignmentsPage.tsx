import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface FeeAssignment {
  id: number;
  itemName: string;
  category: string;
  yearLevel: string;
  semester: string;
  academicYear: string;
  amount: number;
  currency: string;
  college: string;
  notes: string;
}

const columns: Column<FeeAssignment>[] = [
  { key: "itemName", label: "Item Name", searchable: true },
  { key: "category", label: "Category" },
  { key: "yearLevel", label: "Year Level" },
  { key: "semester", label: "Semester" },
  { key: "academicYear", label: "Academic Year" },
  { key: "amount", label: "Amount" },
  { key: "currency", label: "Currency" },
  { key: "college", label: "College" },
];

const fields: FieldConfig[] = [
  { key: "itemName", label: "Item Name", type: "text", required: true, placeholder: "e.g. Tuition Fee" },
  {
    key: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [
      { label: "Tuition", value: "Tuition" },
      { label: "Lab", value: "Lab" },
      { label: "Library", value: "Library" },
      { label: "Hostel", value: "Hostel" },
      { label: "Other", value: "Other" },
    ],
    placeholder: "Select category",
  },
  {
    key: "yearLevel",
    label: "Year Level",
    type: "select",
    required: true,
    options: [
      { label: "Year 1", value: "Year 1" },
      { label: "Year 2", value: "Year 2" },
      { label: "Year 3", value: "Year 3" },
    ],
    placeholder: "Select year level",
  },
  {
    key: "semester",
    label: "Semester",
    type: "select",
    required: true,
    options: [
      { label: "Semester 1", value: "Semester 1" },
      { label: "Semester 2", value: "Semester 2" },
    ],
    placeholder: "Select semester",
  },
  { key: "academicYear", label: "Academic Year", type: "text", required: true, placeholder: "e.g. 2025/2026" },
  { key: "amount", label: "Amount", type: "number", required: true, placeholder: "e.g. 50000" },
  { key: "currency", label: "Currency", type: "text", placeholder: "e.g. NGN" },
  { key: "college", label: "College", type: "text", placeholder: "e.g. Faculty of Science" },
  { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
];

const FeeAssignmentsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<FeeAssignment>
      title="Fee Assignments"
      apiEndpoint="/api/v1/fees"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search fee assignments..."
      token={token}
    />
  );
};

export default FeeAssignmentsPage;
