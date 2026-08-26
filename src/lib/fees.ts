const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

const buildUrl = (path: string) =>
  `${API_BASE_URL}${API_BASE_URL.endsWith("/") ? "" : "/"}${path}`;

export type FeeAssignment = {
  id: number;
  college: string;
  program: string;
  academicYear: string;
  amount: number;
  description: string;
  createdAt: string;
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
    buildUrl(`v1/fees${qs ? `?${qs}` : ""}`),
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
    buildUrl(`v1/student-fees?${params}`),
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
    buildUrl(`v1/student-fees/${feeId}/payments`),
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
