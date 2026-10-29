import { apiUrl } from "@/lib/apiUrl";

export type FeeAssignment = {
  id: number;
  college: string;
  program: string;
  academicYear: string;
  amount: number;
  description: string;
  createdAt: string;
  // Fields actually returned by the deployed backend.
  itemName?: string;
  category?: string;
  yearLevel?: string;
  semester?: string;
  currency?: string;
  notes?: string;
};

export type StudentFee = {
  id: number;
  studentId: number;
  feeAssignmentId: number;
  amount: number;
  paidAmount: number;
  balance: number;
  status: string;
  dueDate: string;
  createdAt: string;
};

const parseErrorDetail = async (response: Response) => {
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (data && typeof data === "object") {
    const parsed = data as { detail?: string; message?: string };
    return parsed.detail ?? parsed.message ?? null;
  }
  return null;
};

export const getFeeAssignments = async (
  college?: string,
  academicYear?: string,
): Promise<FeeAssignment[]> => {
  const params = new URLSearchParams();
  if (college) params.set("college", college);
  if (academicYear) params.set("academicYear", academicYear);
  const qs = params.toString();
  const response = await fetch(
    apiUrl(`fees${qs ? `?${qs}` : ""}`),
  );
  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ?? "Failed to fetch fee assignments";
    throw new Error(detail);
  }
  return response.json();
};

export const getStudentFees = async (
  studentId: number,
  status?: string,
): Promise<StudentFee[]> => {
  const params = new URLSearchParams({ studentId: String(studentId) });
  if (status) params.set("status", status);
  const response = await fetch(
    apiUrl(`student-fees?${params}`),
  );
  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ?? "Failed to fetch student fees";
    throw new Error(detail);
  }
  return response.json();
};

export const recordPayment = async (
  feeId: number,
  amount: number,
  method: string,
  reference: string,
): Promise<StudentFee> => {
  const response = await fetch(
    apiUrl(`student-fees/${feeId}/payments`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, method, reference }),
    },
  );
  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ?? "Failed to record payment";
    throw new Error(detail);
  }
  return response.json();
};
