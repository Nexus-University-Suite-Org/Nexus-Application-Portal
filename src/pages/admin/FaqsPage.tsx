import { AdminCrudPage, Column, FieldConfig } from "@/components/admin/AdminCrudPage";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface Faq {
  id: number;
  question: string;
  category: string;
  displayOrder: number;
  createdAt: string;
}

const columns: Column<Faq>[] = [
  { key: "question", label: "Question" },
  { key: "category", label: "Category" },
  { key: "displayOrder", label: "Display Order" },
  { key: "createdAt", label: "Created" },
];

const fields: FieldConfig[] = [
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { label: "General", value: "General" },
      { label: "Admissions", value: "Admissions" },
      { label: "Finance", value: "Finance" },
      { label: "Academic", value: "Academic" },
      { label: "Student Life", value: "Student Life" },
    ],
  },
  { key: "question", label: "Question", type: "text" },
  { key: "answer", label: "Answer", type: "textarea" },
  { key: "displayOrder", label: "Display Order", type: "number" },
];

const FaqsPage = () => {
  const { token } = useAdminAuth();

  return (
    <AdminCrudPage<Faq>
      title="FAQs"
      apiEndpoint="/api/v1/admin/faqs"
      columns={columns}
      fields={fields}
      token={token}
      searchPlaceholder="Search FAQs..."
    />
  );
};

export default FaqsPage;
