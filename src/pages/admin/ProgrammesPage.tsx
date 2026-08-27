import { AdminCrudPage, type Column, type FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

interface Programme {
  id: number;
  code: string;
  name: string;
  faculty: string;
  minimumUcePasses: number;
  cutoffScore: number;
  essentialSubjects: string;
  relevantSubjects: string;
  desirableSubjects: string;
  entryRequirements: string;
  isActive: boolean;
  capacity: number;
  intakeYear: string;
}

const columns: Column<Programme>[] = [
  { key: "code", label: "Code", searchable: true },
  { key: "name", label: "Name", searchable: true },
  { key: "faculty", label: "Faculty" },
  { key: "cutoffScore", label: "Cutoff Score" },
  {
    key: "isActive",
    label: "Status",
    render: (item) => (
      <Badge variant={item.isActive ? "default" : "secondary"}>
        {item.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

const fields: FieldConfig[] = [
  { key: "code", label: "Code", type: "text", required: true, placeholder: "e.g. BSC-CS" },
  { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Bachelor of Science in Computer Science" },
  { key: "faculty", label: "Faculty", type: "text", required: true, placeholder: "e.g. Faculty of Science" },
  { key: "minimumUcePasses", label: "Minimum UCE Passes", type: "number", placeholder: "e.g. 5" },
  { key: "cutoffScore", label: "Cutoff Score", type: "number", placeholder: "e.g. 20" },
  { key: "essentialSubjects", label: "Essential Subjects", type: "text", placeholder: "e.g. Mathematics, Physics" },
  { key: "relevantSubjects", label: "Relevant Subjects", type: "text", placeholder: "e.g. Chemistry, Computer Science" },
  { key: "desirableSubjects", label: "Desirable Subjects", type: "text", placeholder: "e.g. Further Mathematics" },
  { key: "entryRequirements", label: "Entry Requirements", type: "textarea", placeholder: "Detailed entry requirements..." },
  { key: "isActive", label: "Active", type: "switch" },
  { key: "capacity", label: "Capacity", type: "number", placeholder: "e.g. 100" },
  { key: "intakeYear", label: "Intake Year", type: "text", placeholder: "e.g. 2026" },
];

const ProgrammesPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Programme>
      title="Programmes"
      apiEndpoint="/api/v1/programmes"
      columns={columns}
      fields={fields}
      searchPlaceholder="Search programmes by code or name..."
      token={token}
    />
  );
};

export default ProgrammesPage;
