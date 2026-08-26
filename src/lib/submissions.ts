const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";

const buildUrl = (path: string) =>
  `${API_BASE_URL}${API_BASE_URL.endsWith("/") ? "" : "/"}${path}`;

export type ContactPayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export type PartnershipPayload = {
  name: string;
  email: string;
  organization?: string;
  partnershipGoal: string;
  message: string;
};

type SubjectGradeEntry = {
  subject: string;
  grade: string;
};

export type ApplicationSubmissionInput = {
  email: string;
  otherNames: string;
  gender: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  maritalStatus: string;
  nationality: string;
  address: string;
  postalAddress: string;
  city: string;
  postalCode: string;
  country: string;
  districtOfOrigin: string;
  hasNationalIdOrPassport: "yes" | "no";
  birthCertificateOrNationalIdDetails: string;
  passportPhotoUploaded: boolean;
  passportPhotoUrl: string;
  guardianName: string;
  guardianType: string;
  guardianPhone: string;
  nextOfKinRelationship: string;
  isUgandan: "yes" | "no";
  applicationType: string;
  entryScheme: string;
  program: string;
  startDate: string;
  previousInstitution: string;
  highestQualification: string;
  academicCredentialLevel: string;
  academicCredentialsDetails: string;
  birthCertificateUrl: string;
  uceIndexNumber: string;
  uceYearOfSitting: string;
  uceSecondSitting: boolean;
  uceSecondIndexNumber: string;
  uceSecondYearOfSitting: string;
  uceTotalAggregates: string;
  uceDivision: "" | "1" | "2" | "3" | "4" | "U";
  oLevelSchoolName: string;
  uaceIndexNumber: string;
  uaceYearOfSitting: string;
  uaceSecondSitting: boolean;
  uaceSecondIndexNumber: string;
  uaceSecondYearOfSitting: string;
  uaceTotalPoints: string;
  uacePrincipalSubjects: SubjectGradeEntry[];
  uaceGeneralPaperGrade: string;
  uaceIctOrSubMathSubject: string;
  uaceIctOrSubMathGrade: string;
  oLevelResultSlipUrl: string;
  aLevelResultSlipUrl: string;
  academicTranscriptUrl: string;
  nationalIdOrPassportUrl: string;
  countryIdDocumentUrl: string;
  refereeLetterUrl: string;
  personalStatementAttachmentUrl: string;
  oLevelSubjects: SubjectGradeEntry[];
  certificateSubjects: SubjectGradeEntry[];
  gpa: string;
  personalStatement: string;
  howDidYouHear: string;
  documentsConfirmed: boolean;
  transcriptUploaded: boolean;
  idUploaded: boolean;
  countryIdUploaded: boolean;
  recommendationUploaded: boolean;
  statementUploaded: boolean;
  applicationFeePaid: boolean;
  paymentMethod: string;
  paymentReference: string;
  interviewPreference: string;
  termsAccepted: boolean;
  emailVerified: boolean;
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

export const submitContactSubmission = async (
  payload: ContactPayload,
): Promise<unknown> => {
  let response: Response;
  try {
    response = await fetch(buildUrl("contact"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        subject: payload.subject ?? "",
        message: payload.message,
      }),
    });
  } catch {
    throw new Error(
      "Could not reach the contact API. The backend service is not connected yet.",
    );
  }

  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ??
      "Could not submit contact message.";
    throw new Error(detail);
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return data;
};

export const submitApplicationSubmission = async (
  payload: ApplicationSubmissionInput,
): Promise<{ id: string }> => {
  const url = buildUrl("applications");
  console.log("[SUBMIT] POST", url);
  console.log("[SUBMIT] payload:", JSON.stringify(payload, null, 2));
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("[SUBMIT] fetch failed:", e);
    throw new Error(
      "Could not reach the applications API. The backend service is not connected yet.",
    );
  }

  console.log("[SUBMIT] response status:", response.status, response.statusText);

  if (!response.ok) {
    let bodyText = "";
    try { bodyText = await response.text(); } catch {}
    console.error("[SUBMIT] error body:", bodyText);
    const detail =
      (await parseErrorDetail(response)) ??
      "Could not submit your application. Please try again.";
    throw new Error(detail);
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  console.log("[SUBMIT] success response:", data);
  if (!data || typeof data !== "object" || !("id" in data)) {
    throw new Error("Application service returned an invalid response.");
  }
  return data as { id: string };
};

export const submitPartnershipSubmission = async (
  payload: PartnershipPayload,
) => {
  let response: Response;
  try {
    response = await fetch(buildUrl("partnership-discussions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: payload.name,
        email: payload.email,
        organization: payload.organization || "",
        partnership_goal: payload.partnershipGoal,
        message: payload.message,
      }),
    });
  } catch {
    throw new Error(
      "Could not reach the partnerships API. The backend service is not connected yet.",
    );
  }

  if (!response.ok) {
    const detail =
      (await parseErrorDetail(response)) ??
      "Could not submit partnership request.";
    throw new Error(detail);
  }

  let result: unknown = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }
  return result;
};
