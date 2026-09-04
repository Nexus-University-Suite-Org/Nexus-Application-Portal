const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";

const buildUrl = (path: string) =>
  `${API_BASE_URL}${API_BASE_URL.endsWith("/") ? "" : "/"}${path}`;

export type SchemeProgram = {
  id: number;
  programName: string;
  programCode: string;
  programType: string;
};

export type AdmissionScheme = {
  id: number;
  schemeName: string;
  category: string;
  academicYear: string;
  intakeMonth: string;
  description: string;
  appOpenDate: string | null;
  appCloseDate: string | null;
  capacity: number | null;
  applicationFees: string;
  serviceFee: number | null;
  status: string;
  daysLeft: number | null;
  programCount: number;
  programs: SchemeProgram[];
  createdAt: string;
  updatedAt: string;
};

export type ApplicationFees = {
  ugandan?: number;
  eastAfrican?: number;
  nonEastAfrican?: number;
};

export const parseFees = (raw: string | null | undefined): ApplicationFees => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const formatMoney = (value?: number | null): string =>
  value == null
    ? "—"
    : `UGX ${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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

export const fetchRunningSchemes = async (): Promise<AdmissionScheme[]> => {
  const response = await fetch(buildUrl("schemes/running"));
  if (!response.ok) {
    throw new Error(
      (await parseErrorDetail(response)) ?? "Could not load running admissions.",
    );
  }
  return (await response.json()) as AdmissionScheme[];
};

export const fetchSchemesByProgram = async (
  programId: number,
): Promise<AdmissionScheme[]> => {
  const response = await fetch(buildUrl(`schemes?programId=${programId}`));
  if (!response.ok) {
    throw new Error(
      (await parseErrorDetail(response)) ?? "Could not load admission schemes.",
    );
  }
  return (await response.json()) as AdmissionScheme[];
};
