import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, Check, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/storage";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  submitApplicationSubmission,
  type ApplicationSubmissionInput,
} from "@/lib/submissions";

const currentYear = new Date().getFullYear();

const applicationSteps = [
  {
    number: "01",
    title: "Create Your Account",
    desc: "Register on our admissions portal with your email. You'll receive a confirmation link to activate your account.",
  },
  {
    number: "02",
    title: "Complete Profile",
    desc: "Provide your personal and contact details exactly as they appear on official documents.",
  },
  {
    number: "03",
    title: "A Level Qualifications",
    desc: "Submit your O-Level and A-Level results.",
  },
  {
    number: "04",
    title: "Upload Documents",
    desc: "Confirm all required documents are ready and uploaded.",
  },
  {
    number: "05",
    title: "Pay Application Fee",
    desc: "Confirm payment details and provide your transaction reference.",
  },
  {
    number: "06",
    title: "Review & Submit",
    desc: "Review all details and submit your application for admissions processing.",
  },
] as const;

type ApplicationStartData = {
  hasSecondSittingUce: boolean;
  secondSittingUceIndexNumber: string | number | readonly string[];
  secondSittingUceYearOfSitting: string | number | readonly string[];
  hasSecondSittingUace: boolean;
  secondSittingUaceIndexNumber: string | number | readonly string[];
  secondSittingUaceYearOfSitting: string | number | readonly string[];
  email: string;
  otherNames: string;
  gender: "" | "Male" | "Female" | "Other";
  password: string;
  confirmPassword: string;
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
  hasNationalIdOrPassport: "" | "yes" | "no";
  birthCertificateOrNationalIdDetails: string;
  passportPhotoUploaded: boolean;
  passportPhotoUrl: string;
  guardianName: string;
  guardianType: "" | "Parent" | "Guardian" | "Sponsor" | "Other";
  guardianPhone: string;
  nextOfKinRelationship: string;
  isUgandan: "" | "yes" | "no";
  applicationType: string;
  entryScheme: string;
  program: string;
  programChoice2: string;
  programChoice3: string;
  programChoice4: string;
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
  uacePrincipalSubjects: { subject: string; grade: string }[];
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
  oLevelSubjects: { subject: string; grade: string }[];
  certificateSubjects: { subject: string; grade: string }[];
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
};

type ProgrammeOption = {
  code: string;
  name: string;
  faculty: string;
  cutoffScore: number;
};

const fallbackProgramOptions = [
  "Bachelor of Science in Computer Science",
  "Bachelor of Information Technology",
  "Bachelor of Software Engineering",
  "Bachelor of Data Science and Analytics",
  "Bachelor of Medicine and Bachelor of Surgery",
  "Bachelor of Dental Surgery",
  "Bachelor of Pharmacy",
  "Bachelor of Nursing Science",
  "Bachelor of Public Health",
  "Bachelor of Laws",
  "Bachelor of Business Administration",
  "Bachelor of Commerce",
  "Bachelor of Procurement and Supply Chain Management",
  "Bachelor of Arts",
  "Bachelor of Arts with Education",
  "Bachelor of Science with Education",
  "Bachelor of Journalism and Communication",
  "Bachelor of Social Work and Social Administration",
  "Bachelor of Development Studies",
  "Bachelor of Fine Art",
  "Bachelor of Music",
  "Bachelor of Architecture",
  "Bachelor of Quantity Surveying",
  "Bachelor of Civil Engineering",
  "Bachelor of Electrical Engineering",
  "Bachelor of Mechanical Engineering",
  "Bachelor of Agricultural Engineering",
  "Bachelor of Agriculture",
  "Bachelor of Animal Science",
  "Bachelor of Veterinary Medicine",
  "Bachelor of Environmental Science",
  "Bachelor of Forestry",
  "Bachelor of Statistics",
  "Bachelor of Actuarial Science",
  "Bachelor of Economics",
  "Bachelor of Tourism and Hospitality Management",
  "Bachelor of Records and Archives Management",
  "Bachelor of Library and Information Science",
  "Bachelor of Industrial and Fine Arts",
  "Bachelor of Urban and Regional Planning",
  "Bachelor of Population Studies",
  "Bachelor of Education (Early Childhood)",
  "Bachelor of Sports Science",
  "Bachelor of Performing Arts",
];

const applicationTypeOptions = [
  "Direct Entry (A-Level)",
  "Diploma Holder",
  "Mature Age",
  "International",
  "Degree Holder",
  "Other",
];

const entrySchemeOptions = [
  "Private Sponsorship",
  "International Applicants Scheme",
  "Mature Age Entry Scheme",
  "Diploma Entry Scheme",
  "Degree Entry Scheme",
];

const guardianTypeOptions = ["Parent", "Guardian", "Sponsor", "Other"];

const relationshipOptions = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Spouse",
  "Aunt",
  "Uncle",
  "Grandparent",
  "Guardian",
  "Sponsor",
  "Other",
];

const qualifications = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Other",
];

const academicCredentialOptions = [
  "Uganda Certificate of Education (UCE)",
  "Uganda Advanced Level Certificate of Education (UACE)",
  "Certificate",
  "Diploma",
  "Degree",
  "Other / Equivalent",
];

const uaceSubjectOptions = [
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Economics",
  "History",
  "Geography",
  "Literature in English",
  "Christian Religious Education",
  "Islamic Religious Education",
  "Divinity",
  "Entrepreneurship",
  "Computer Studies",
  "Fine Art",
  "Agriculture",
  "Kiswahili",
  "French",
  "Luganda",
  "General Paper",
  "ICT",
  "Subsidiary Mathematics",
];

const oLevelSubjectOptions = [
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Geography",
  "History",
  "Christian Religious Education",
  "Islamic Religious Education",
  "Fine Art",
  "Commerce",
  "Agriculture",
  "Entrepreneurship",
  "Computer Studies",
  "Literature in English",
  "Luganda",
  "French",
  "Kiswahili",
];

const uaceGradeOptions = ["A", "B", "C", "D", "E"];

const oLevelGradeOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const uacePrincipalGradeToPoints: Record<string, number> = {
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
};

const uaceSubsidiaryGradeToPoints: Record<string, number> = {
  A: 1,
  B: 1,
  C: 1,
  D: 1,
  E: 1,
};

const certificateGradeOptions = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "P",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

const documentUploadSteps = [
  [
    {
      field: "passportPhotoUrl",
      label: "Passport-size Photograph",
      hint: "JPEG or PNG under 100KB.",
      accept: "image/*",
      maxBytes: 100 * 1024,
      preview: true,
    },
    {
      field: "birthCertificateUrl",
      label: "Birth Certificate",
      hint: "Certified copy or scan under 1MB.",
      accept: "image/*,application/pdf",
      maxBytes: 1024 * 1024,
      preview: false,
    },
    {
      field: "oLevelResultSlipUrl",
      label: "O-Level Result Slip / Certificate",
      hint: "Upload the official or certified result document.",
      accept: "image/*,application/pdf",
      maxBytes: 1024 * 1024,
      preview: false,
    },
    {
      field: "aLevelResultSlipUrl",
      label: "A-Level Result Slip / Certificate",
      hint: "Required for direct entry and UACE applicants.",
      accept: "image/*,application/pdf",
      maxBytes: 1024 * 1024,
      preview: false,
    },
  ],
  [
    {
      field: "academicTranscriptUrl",
      label: "Academic Transcript",
      hint: "Required for diploma and degree holders.",
      accept: "image/*,application/pdf",
      maxBytes: 1024 * 1024,
      preview: false,
    },
    {
      field: "nationalIdOrPassportUrl",
      label: "National ID / Passport",
      hint: "Upload your main identity document.",
      accept: "image/*,application/pdf",
      maxBytes: 1024 * 1024,
      preview: false,
    },
    {
      field: "countryIdDocumentUrl",
      label: "Country ID / National Document",
      hint: "Required for non-Ugandan applicants.",
      accept: "image/*,application/pdf",
      maxBytes: 1024 * 1024,
      preview: false,
    },
  ],
  [
    {
      field: "refereeLetterUrl",
      label: "Recommendation / Referee Letter",
      hint: "Sometimes required for specific entry types.",
      accept: "image/*,application/pdf",
      maxBytes: 1024 * 1024,
      preview: false,
    },
    {
      field: "personalStatementAttachmentUrl",
      label: "Personal Statement Attachment",
      hint: "Optional supporting file if you have one.",
      accept: "image/*,application/pdf",
      maxBytes: 1024 * 1024,
      preview: false,
    },
  ],
] as const;

type DocumentUploadField =
  (typeof documentUploadSteps)[number][number]["field"];

type DocumentUploadConfig = (typeof documentUploadSteps)[number][number];

const hearAboutOptions = [
  "University Website",
  "Social Media",
  "Education Fair",
  "Recommendation",
  "Publication",
  "Other",
];

const eastAfricanNationalities = [
  "uganda",
  "kenya",
  "tanzania",
  "rwanda",
  "burundi",
  "south sudan",
];

const nationalityOptions = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

// Email verification moves to the platform API (Spring Boot identity module).
const OTP_API_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";

const APPLICATION_DRAFT_STORAGE_KEY = "application_start_draft_v1";
const APPLICANT_ID_STORAGE_KEY = "nexus_applicant_id";

const initialFormData: ApplicationStartData = {
  email: "",
  otherNames: "",
  gender: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  maritalStatus: "",
  nationality: "",
  address: "",
  postalAddress: "",
  city: "",
  postalCode: "",
  country: "",
  districtOfOrigin: "",
  hasNationalIdOrPassport: "",
  birthCertificateOrNationalIdDetails: "",
  passportPhotoUploaded: false,
  passportPhotoUrl: "",
  guardianName: "",
  guardianType: "",
  guardianPhone: "",
  nextOfKinRelationship: "",
  isUgandan: "",
  applicationType: "",
  entryScheme: "",
  program: "",
  programChoice2: "",
  programChoice3: "",
  programChoice4: "",
  startDate: "",
  previousInstitution: "",
  highestQualification: "",
  academicCredentialLevel: "Uganda Advanced Level Certificate of Education (UACE)",
  academicCredentialsDetails: "",
  birthCertificateUrl: "",
  uceIndexNumber: "",
  uceYearOfSitting: "",
  uceSecondSitting: false,
  uceSecondIndexNumber: "",
  uceSecondYearOfSitting: "",
  uceTotalAggregates: "",
  uceDivision: "",
  oLevelSchoolName: "",
  uaceIndexNumber: "",
  uaceYearOfSitting: "",
  uaceSecondSitting: false,
  uaceSecondIndexNumber: "",
  uaceSecondYearOfSitting: "",
  uaceTotalPoints: "",
  uacePrincipalSubjects: [
    { subject: "", grade: "" },
    { subject: "", grade: "" },
    { subject: "", grade: "" },
  ],
  uaceGeneralPaperGrade: "",
  uaceIctOrSubMathSubject: "",
  uaceIctOrSubMathGrade: "",
  oLevelResultSlipUrl: "",
  aLevelResultSlipUrl: "",
  academicTranscriptUrl: "",
  nationalIdOrPassportUrl: "",
  countryIdDocumentUrl: "",
  refereeLetterUrl: "",
  personalStatementAttachmentUrl: "",
  oLevelSubjects: Array.from({ length: 5 }, () => ({ subject: "", grade: "" })),
  certificateSubjects: Array.from({ length: 3 }, () => ({
    subject: "",
    grade: "",
  })),
  gpa: "",
  personalStatement: "",
  howDidYouHear: "",
  documentsConfirmed: false,
  transcriptUploaded: false,
  idUploaded: false,
  countryIdUploaded: false,
  recommendationUploaded: false,
  statementUploaded: false,
  applicationFeePaid: false,
  paymentMethod: "",
  paymentReference: "",
  interviewPreference: "",
  termsAccepted: false,
  hasSecondSittingUce: false,
  secondSittingUceIndexNumber: "",
  secondSittingUceYearOfSitting: "",
  hasSecondSittingUace: false,
  secondSittingUaceIndexNumber: "",
  secondSittingUaceYearOfSitting: "",
};

type ApplicationDraftPayload = {
  formData: Omit<ApplicationStartData, "password" | "confirmPassword">;
  activeStep: number;
  furthestStep: number;
  otpVerified: boolean;
};

const ApplicationStartPage = () => {
  const [formData, setFormData] =
    useState<ApplicationStartData>(initialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string>("");
  const [applicationId, setApplicationId] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpStatus, setOtpStatus] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [academicSubStep, setAcademicSubStep] = useState(0);
  const [documentSubStep, setDocumentSubStep] = useState(0);
  const [programmes, setProgrammes] = useState<ProgrammeOption[]>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState<
    Partial<
      Record<
        DocumentUploadField,
        { uploading: boolean; fileName: string; fileSize: number }
      >
    >
  >({});
  const [documentUploadErrors, setDocumentUploadErrors] = useState<
    Record<string, string>
  >({});
  const programmeNames = programmes.length > 0
    ? programmes.map((p) => p.name)
    : fallbackProgramOptions;

  const isUaceSelected = formData.academicCredentialLevel.includes("UACE");
  const isUceSelected = formData.academicCredentialLevel.includes("UCE") && !formData.academicCredentialLevel.includes("UACE");
  const isDirectEntry = formData.applicationType === "Direct Entry (A-Level)";
  const shouldCaptureUceAndUace = isDirectEntry || isUceSelected || isUaceSelected;
  const academicStepLabels = [
    "Application Setup",
    "UCE / O-Level Details",
    "UACE / A-Level Details",
    "Qualification Record",
  ];
  const documentStepLabels = [
    "Photo & Results",
    "Identity Documents",
    "Supporting Files",
  ];

  const updateUploadField = <K extends DocumentUploadField>(
    field: K,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleDocumentUpload = async (
    config: DocumentUploadConfig,
    file: File,
  ) => {
    if (file.size > config.maxBytes) {
      setDocumentUploadErrors((prev) => ({
        ...prev,
        [config.field]:
          config.field === "passportPhotoUrl"
            ? "Passport photo must be under 100KB."
            : "This file must be under 1MB.",
      }));
      return;
    }

    setDocumentUploadErrors((prev) => {
      const next = { ...prev };
      delete next[config.field];
      return next;
    });

    setUploadingDocuments((prev) => ({
      ...prev,
      [config.field]: {
        uploading: true,
        fileName: file.name,
        fileSize: file.size,
      },
    }));

    try {
      const uploadPath = `applications/${config.field}`;
      const { url: downloadUrl } = await uploadFile(uploadPath, file);
      updateUploadField(config.field, downloadUrl);

      if (config.field === "passportPhotoUrl") {
        updateField("passportPhotoUploaded", true);
      }
      if (config.field === "academicTranscriptUrl") {
        updateField("transcriptUploaded", true);
      }
      if (config.field === "nationalIdOrPassportUrl") {
        updateField("idUploaded", true);
      }
      if (config.field === "countryIdDocumentUrl") {
        updateField("countryIdUploaded", true);
      }
      if (config.field === "refereeLetterUrl") {
        updateField("recommendationUploaded", true);
      }
      if (config.field === "personalStatementAttachmentUrl") {
        updateField("statementUploaded", true);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.";
      setDocumentUploadErrors((prev) => ({
        ...prev,
        [config.field]: message,
      }));
    } finally {
      setUploadingDocuments((prev) => ({
        ...prev,
        [config.field]: {
          uploading: false,
          fileName: prev[config.field]?.fileName ?? file.name,
          fileSize: prev[config.field]?.fileSize ?? file.size,
        },
      }));
    }
  };

  const handleDocumentSelection = (
    config: DocumentUploadConfig,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void handleDocumentUpload(config, file);
    event.target.value = "";
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderUploadCard = (config: DocumentUploadConfig) => {
    const uploadedUrl = formData[config.field];
    const meta = uploadingDocuments[config.field];
    const fileError = documentUploadErrors[config.field];
    const validationError = errors[config.field];
    const isImagePreview =
      config.preview ||
      /\.(png|jpe?g|webp|gif)$/i.test(meta?.fileName ?? "") ||
      /\.(png|jpe?g|webp|gif)$/i.test(uploadedUrl ?? "");

    return (
      <div
        key={config.field}
        className="rounded-[18px] border border-border bg-background/80 p-4 space-y-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-sm uppercase tracking-[0.16em] text-foreground">
              {config.label}
            </p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {config.hint}
            </p>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {config.maxBytes === 100 * 1024 ? "<100KB" : "<1MB"}
          </span>
        </div>

        <input
          type="file"
          accept={config.accept}
          onChange={(e) => handleDocumentSelection(config, e)}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-[10px] file:border-0 file:bg-accent file:px-4 file:py-2 file:text-xs file:font-body file:uppercase file:tracking-[0.16em] file:text-accent-foreground hover:file:opacity-90"
          disabled={Boolean(uploadingDocuments[config.field]?.uploading)}
        />

        {meta?.uploading ? (
          <p className="text-xs text-accent">Uploading file...</p>
        ) : null}

        {uploadedUrl ? (
          <div className="space-y-3">
            {isImagePreview ? (
              <img
                src={uploadedUrl}
                alt={config.label}
                className="h-40 w-full rounded-[14px] object-cover border border-border"
              />
            ) : (
              <div className="rounded-[14px] border border-border bg-secondary/20 p-4 text-sm text-foreground">
                <p className="font-medium">File uploaded</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {meta?.fileName || "Document file"}
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{meta?.fileName || "Uploaded file"}</span>
              {meta?.fileSize ? (
                <span>{formatFileSize(meta.fileSize)}</span>
              ) : null}
            </div>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-accent"
            >
              View uploaded file
            </a>
            <button
              type="button"
              onClick={() => {
                updateUploadField(config.field as DocumentUploadField, "");
                if (config.field === "passportPhotoUrl") {
                  updateField("passportPhotoUploaded", false);
                }
                setDocumentUploadErrors((prev) => {
                  const next = { ...prev };
                  delete next[config.field];
                  return next;
                });
                setUploadingDocuments((prev) => {
                  const next = { ...prev };
                  delete next[config.field];
                  return next;
                });
              }}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-destructive ml-4"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No file uploaded yet.</p>
        )}

        {fileError || validationError ? (
          <p className="text-xs text-destructive">
            {fileError ?? validationError}
          </p>
        ) : null}
      </div>
    );
  };

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await fetch("/api/v1/programmes");
        if (res.ok) {
          const data = (await res.json()) as ProgrammeOption[];
          setProgrammes(data);
        }
      } catch {
        // fallback to static list
      }
    };
    fetchProgrammes();
  }, []);

  useEffect(() => {
    if (activeStep !== 2) {
      setAcademicSubStep(0);
    }
    if (activeStep !== 3) {
      setDocumentSubStep(0);
    }
  }, [activeStep]);

  useEffect(() => {
    const principalPoints = formData.uacePrincipalSubjects
      .map((entry) => uacePrincipalGradeToPoints[entry.grade.trim()] ?? 0)
      .reduce((sum, points) => sum + points, 0);

    const gpPoints =
      uaceSubsidiaryGradeToPoints[formData.uaceGeneralPaperGrade.trim()] ?? 0;
    const ictOrSubMathPoints =
      uaceSubsidiaryGradeToPoints[formData.uaceIctOrSubMathGrade.trim()] ?? 0;

    const hasAnyUaceGrade =
      formData.uacePrincipalSubjects.some((entry) => entry.grade.trim()) ||
      Boolean(formData.uaceGeneralPaperGrade.trim()) ||
      Boolean(formData.uaceIctOrSubMathGrade.trim());

    const calculatedTotal = hasAnyUaceGrade
      ? String(Math.min(20, principalPoints + gpPoints + ictOrSubMathPoints))
      : "";

    setFormData((prev) =>
      prev.uaceTotalPoints === calculatedTotal
        ? prev
        : { ...prev, uaceTotalPoints: calculatedTotal },
    );
  }, [
    formData.uaceGeneralPaperGrade,
    formData.uaceIctOrSubMathGrade,
    formData.uacePrincipalSubjects,
  ]);

  useEffect(() => {
    const numericGrades = formData.oLevelSubjects
      .map((entry) => Number(entry.grade.trim()))
      .filter((grade) => Number.isInteger(grade) && grade >= 1 && grade <= 9)
      .sort((a, b) => a - b);

    if (!numericGrades.length) {
      setFormData((prev) =>
        prev.uceTotalAggregates === "" && prev.uceDivision === ""
          ? prev
          : { ...prev, uceTotalAggregates: "", uceDivision: "" },
      );
      return;
    }

    const gradesForAggregate =
      numericGrades.length >= 8 ? numericGrades.slice(0, 8) : numericGrades;
    const aggregate = gradesForAggregate.reduce((sum, grade) => sum + grade, 0);

    const derivedDivision: "1" | "2" | "3" | "4" | "U" =
      aggregate <= 32
        ? "1"
        : aggregate <= 45
          ? "2"
          : aggregate <= 57
            ? "3"
            : aggregate <= 69
              ? "4"
              : "U";

    setFormData((prev) =>
      prev.uceTotalAggregates === String(aggregate) &&
      prev.uceDivision === derivedDivision
        ? prev
        : {
            ...prev,
            uceTotalAggregates: String(aggregate),
            uceDivision: derivedDivision,
          },
    );
  }, [formData.oLevelSubjects]);

  const updateSubjectGradeList = (
    key: "uacePrincipalSubjects" | "oLevelSubjects" | "certificateSubjects",
    index: number,
    field: "subject" | "grade",
    value: string,
  ) => {
    setFormData((prev) => {
      const nextList = [...prev[key]];
      if (!nextList[index]) return prev;
      nextList[index] = {
        ...nextList[index],
        [field]: value,
      };
      return {
        ...prev,
        [key]: nextList,
      };
    });
  };

  const addSubjectGradeRow = (
    key: "oLevelSubjects" | "certificateSubjects",
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], { subject: "", grade: "" }],
    }));
  };

  const removeSubjectGradeRow = (
    key: "oLevelSubjects" | "certificateSubjects",
    index: number,
  ) => {
    setFormData((prev) => {
      const nextList = prev[key].filter((_, rowIndex) => rowIndex !== index);
      return {
        ...prev,
        [key]: nextList.length ? nextList : [{ subject: "", grade: "" }],
      };
    });
  };

  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(APPLICATION_DRAFT_STORAGE_KEY);
      if (!rawDraft) {
        setDraftHydrated(true);
        return;
      }

      const parsed = JSON.parse(rawDraft) as Partial<ApplicationDraftPayload>;
      if (!parsed.formData) {
        setDraftHydrated(true);
        return;
      }

      const safeActiveStep = Math.max(
        0,
        Math.min(Number(parsed.activeStep ?? 0), applicationSteps.length - 1),
      );
      const safeFurthestStep = Math.max(
        safeActiveStep,
        Math.min(
          Number(parsed.furthestStep ?? safeActiveStep),
          applicationSteps.length - 1,
        ),
      );

      setFormData((prev) => ({
        ...prev,
        ...parsed.formData,
        password: "",
        confirmPassword: "",
      }));
      setActiveStep(safeActiveStep);
      setFurthestStep(safeFurthestStep);
      setOtpVerified(Boolean(parsed.otpVerified));
      setOtpSent(Boolean(parsed.otpVerified));
      setSubmissionStatus(
        "Saved draft restored. Continue from where you left off.",
      );
    } catch {
      localStorage.removeItem(APPLICATION_DRAFT_STORAGE_KEY);
    } finally {
      setDraftHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    if (!draftHydrated || submitted) return;

    const {
      password: _password,
      confirmPassword: _confirmPassword,
      ...safeForm
    } = formData;

    const payload: ApplicationDraftPayload = {
      formData: safeForm,
      activeStep,
      furthestStep,
      otpVerified,
    };

    try {
      localStorage.setItem(
        APPLICATION_DRAFT_STORAGE_KEY,
        JSON.stringify(payload),
      );
    } catch {
      // Ignore storage failures (private mode/quota), form still works normally.
    }
  }, [
    activeStep,
    draftHydrated,
    formData,
    furthestStep,
    otpVerified,
    submitted,
  ]);

  const updateField = <K extends keyof ApplicationStartData>(
    key: K,
    value: ApplicationStartData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateStepFields = (step: number) => {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.email.trim()) nextErrors.email = "Email is required.";
      if (!formData.gender) {
        nextErrors.gender = "Gender is required.";
      }
      if (!formData.dateOfBirth.trim()) {
        nextErrors.dateOfBirth = "Date of birth is required.";
      }
      if (!formData.password.trim()) {
        nextErrors.password = "Password is required.";
      } else if (formData.password.trim().length < 6) {
        nextErrors.password = "Password must be at least 6 characters.";
      }
      if (!formData.confirmPassword.trim()) {
        nextErrors.confirmPassword = "Please confirm your password.";
      } else if (formData.confirmPassword !== formData.password) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
      if (!otpVerified) {
        nextErrors.otp = "Please verify your email with the OTP code.";
      }
    }

    if (step === 1) {
      if (!formData.firstName.trim())
        nextErrors.firstName = "First name is required.";
      if (!formData.lastName.trim())
        nextErrors.lastName = "Last name is required.";
      if (!formData.phone.trim())
        nextErrors.phone = "Phone number is required.";
      if (!formData.maritalStatus.trim())
        nextErrors.maritalStatus = "Marital status is required.";
      if (!formData.nationality.trim())
        nextErrors.nationality = "Nationality is required.";
      if (!formData.address.trim()) nextErrors.address = "Address is required.";
      if (!formData.city.trim()) nextErrors.city = "City is required.";
      if (!formData.country.trim()) nextErrors.country = "Country is required.";
      if (formData.isUgandan === "yes" && !formData.districtOfOrigin.trim()) {
        nextErrors.districtOfOrigin =
          "District of origin is required for Ugandan applicants.";
      }
      if (!formData.hasNationalIdOrPassport) {
        nextErrors.hasNationalIdOrPassport =
          "Please specify whether you have a National ID or Passport.";
      }
      if (
        formData.hasNationalIdOrPassport === "yes" &&
        !formData.birthCertificateOrNationalIdDetails.trim()
      ) {
        nextErrors.birthCertificateOrNationalIdDetails =
          "NIN is required when you have a National ID or Passport.";
      } else if (
        formData.hasNationalIdOrPassport === "yes" &&
        !/^[A-Za-z0-9]{14}$/.test(
          formData.birthCertificateOrNationalIdDetails.trim(),
        )
      ) {
        nextErrors.birthCertificateOrNationalIdDetails =
          "NIN must be exactly 14 alphanumeric characters.";
      }
      if (!formData.guardianName.trim())
        nextErrors.guardianName = "Guardian name is required.";
      if (!formData.guardianType) {
        nextErrors.guardianType = "Please select Parent/Guardian type.";
      }
      if (!formData.guardianPhone.trim())
        nextErrors.guardianPhone = "Guardian phone is required.";
      if (!formData.nextOfKinRelationship.trim()) {
        nextErrors.nextOfKinRelationship =
          "Relationship to next of kin is required.";
      }
      if (!formData.isUgandan) {
        nextErrors.isUgandan =
          "Please specify whether the applicant is Ugandan.";
      }
    }

    if (step === 2) {
      if (!formData.applicationType.trim()) {
        nextErrors.applicationType = "Please select your application type.";
      }
      if (!formData.entryScheme.trim()) {
        nextErrors.entryScheme = "Please select your entry scheme.";
      }
      if (!formData.program.trim())
        nextErrors.program = "Please select a 1st choice programme.";
      if (!formData.programChoice2.trim())
        nextErrors.programChoice2 = "Please select a 2nd choice programme.";
      if (!formData.programChoice3.trim())
        nextErrors.programChoice3 = "Please select a 3rd choice programme.";
      if (!formData.programChoice4.trim())
        nextErrors.programChoice4 = "Please select a 4th choice programme.";
      if (!formData.startDate.trim())
        nextErrors.startDate = "Please select a start date.";
      if (!formData.previousInstitution.trim()) {
        nextErrors.previousInstitution = "Previous institution is required.";
      }
      if (!formData.academicCredentialLevel.trim()) {
        nextErrors.academicCredentialLevel =
          "Please select your academic credential level.";
      }
      if (!formData.academicCredentialsDetails.trim()) {
        nextErrors.academicCredentialsDetails =
          "Please enter your academic results or transcript details.";
      }

      if (isUceSelected || isUaceSelected) {
        if (!formData.uceIndexNumber.trim()) {
          nextErrors.uceIndexNumber = "UCE index number is required.";
        }
        if (!formData.uceYearOfSitting.trim()) {
          nextErrors.uceYearOfSitting = "UCE year of sitting is required.";
        }
        if (formData.uceSecondSitting) {
          if (!formData.uceSecondIndexNumber.trim()) {
            nextErrors.uceSecondIndexNumber =
              "Second sitting UCE index number is required.";
          }
          if (!formData.uceSecondYearOfSitting.trim()) {
            nextErrors.uceSecondYearOfSitting =
              "Second sitting UCE year is required.";
          }
        }

        if (!formData.uceTotalAggregates.trim()) {
          nextErrors.uceTotalAggregates =
            "Enter O-Level grades to auto-calculate total aggregates.";
        } else if (!/^\d+$/.test(formData.uceTotalAggregates.trim())) {
          nextErrors.uceTotalAggregates =
            "UCE total aggregates must be a numeric value.";
        }

        if (!formData.uceDivision) {
          nextErrors.uceDivision =
            "Please select UCE division (1, 2, 3, 4, or U).";
        }

        if (!formData.oLevelSchoolName.trim()) {
          nextErrors.oLevelSchoolName =
            "Please provide your O-Level school name.";
        }

        const completedOLevelRows = formData.oLevelSubjects.filter(
          (entry) => entry.subject.trim() && entry.grade.trim(),
        );
        if (completedOLevelRows.length < 5) {
          nextErrors.oLevelSubjects =
            "Provide at least five O-Level subjects with grades.";
        }

        const hasInvalidOLevelRows = formData.oLevelSubjects.some(
          (entry) =>
            Boolean(entry.subject.trim()) !== Boolean(entry.grade.trim()),
        );

        if (hasInvalidOLevelRows) {
          nextErrors.oLevelSubjects =
            "Each O-Level subject row must have both subject and grade.";
        }

        const hasInvalidOLevelGrades = completedOLevelRows.some(
          (entry) => !oLevelGradeOptions.includes(entry.grade.trim()),
        );

        if (hasInvalidOLevelGrades) {
          nextErrors.oLevelSubjects = "O-Level grades must be between 1 and 9.";
        }
      }

      if (isUaceSelected) {
        if (!formData.uaceIndexNumber.trim()) {
          nextErrors.uaceIndexNumber = "UACE index number is required.";
        }
        if (!formData.uaceYearOfSitting.trim()) {
          nextErrors.uaceYearOfSitting = "UACE year of sitting is required.";
        }
        if (formData.uaceSecondSitting) {
          if (!formData.uaceSecondIndexNumber.trim()) {
            nextErrors.uaceSecondIndexNumber =
              "Second sitting UACE index number is required.";
          }
          if (!formData.uaceSecondYearOfSitting.trim()) {
            nextErrors.uaceSecondYearOfSitting =
              "Second sitting UACE year is required.";
          }
        }

        if (!formData.uaceTotalPoints.trim()) {
          nextErrors.uaceTotalPoints =
            "Enter UACE grades to auto-calculate total points.";
        } else if (!/^\d+$/.test(formData.uaceTotalPoints.trim())) {
          nextErrors.uaceTotalPoints =
            "UACE total points must be a numeric value.";
        }

        const completedPrincipalCount = formData.uacePrincipalSubjects.filter(
          (entry) => entry.subject.trim() && entry.grade.trim(),
        ).length;

        if (completedPrincipalCount !== 3) {
          nextErrors.uacePrincipalSubjects =
            "Enter exactly 3 UACE principal subjects with grades.";
        }

        formData.uacePrincipalSubjects.forEach((entry, index) => {
          if (!entry.subject.trim()) {
            nextErrors[`uacePrincipalSubject${index}`] =
              `Principal subject ${index + 1} is required.`;
          }
          if (!entry.grade.trim()) {
            nextErrors[`uacePrincipalGrade${index}`] =
              `Grade for principal subject ${index + 1} is required.`;
          } else if (!uaceGradeOptions.includes(entry.grade.trim())) {
            nextErrors[`uacePrincipalGrade${index}`] =
              "UACE principal grades must be between A and E.";
          }
        });

        if (!formData.uaceGeneralPaperGrade.trim()) {
          nextErrors.uaceGeneralPaperGrade =
            "General Paper grade is required for UACE applicants.";
        } else if (
          !uaceGradeOptions.includes(formData.uaceGeneralPaperGrade.trim())
        ) {
          nextErrors.uaceGeneralPaperGrade =
            "General Paper grade must be between A and E.";
        }

        if (!formData.uaceIctOrSubMathSubject.trim()) {
          nextErrors.uaceIctOrSubMathSubject =
            "Select ICT or Subsidiary Mathematics for UACE applicants.";
        }

        if (!formData.uaceIctOrSubMathGrade.trim()) {
          nextErrors.uaceIctOrSubMathGrade =
            "Grade for ICT/Subsidiary Mathematics is required.";
        } else if (
          !uaceGradeOptions.includes(formData.uaceIctOrSubMathGrade.trim())
        ) {
          nextErrors.uaceIctOrSubMathGrade =
            "ICT/Subsidiary Mathematics grade must be between A and E.";
        }
      }

      const hasCertificateRows = formData.certificateSubjects.some(
        (entry) => entry.subject.trim() || entry.grade.trim(),
      );
      if (hasCertificateRows) {
        const hasInvalidCertificateRows = formData.certificateSubjects.some(
          (entry) =>
            Boolean(entry.subject.trim()) !== Boolean(entry.grade.trim()),
        );
        if (hasInvalidCertificateRows) {
          nextErrors.certificateSubjects =
            "Each certificate subject row must have both subject and grade.";
        }
      }

    }

    if (step === 3) {
      const needsTranscript =
        /Diploma|Degree/i.test(formData.applicationType) ||
        /Diploma|Degree/i.test(formData.academicCredentialLevel);
      const needsALevelSlip = shouldCaptureUceAndUace;

      if (!formData.passportPhotoUrl.trim()) {
        nextErrors.passportPhotoUrl =
          "Upload a passport-size photo under 100KB.";
      }
      if (!formData.birthCertificateUrl.trim()) {
        nextErrors.birthCertificateUrl =
          "Birth certificate upload is required.";
      }
      if (!formData.oLevelResultSlipUrl.trim()) {
        nextErrors.oLevelResultSlipUrl =
          "Upload your O-Level result slip or certificate.";
      }
      if (needsALevelSlip && !formData.aLevelResultSlipUrl.trim()) {
        nextErrors.aLevelResultSlipUrl =
          "Upload your A-Level result slip or certificate.";
      }
      if (needsTranscript && !formData.academicTranscriptUrl.trim()) {
        nextErrors.academicTranscriptUrl =
          "Academic transcript upload is required for diploma or degree entry.";
      }
      if (
        formData.hasNationalIdOrPassport === "yes" &&
        !formData.nationalIdOrPassportUrl.trim()
      ) {
        nextErrors.nationalIdOrPassportUrl =
          "Upload your National ID or Passport.";
      }
      if (
        formData.isUgandan === "no" &&
        !formData.countryIdDocumentUrl.trim()
      ) {
        nextErrors.countryIdDocumentUrl =
          "Upload your country ID or national document.";
      }
    }

    if (step === 4) {
      if (!formData.applicationFeePaid) {
        nextErrors.applicationFeePaid =
          "Confirm that payment was completed externally using your PRN.";
      }
      if (!formData.paymentMethod.trim()) {
        nextErrors.paymentMethod = "Select the channel used for PRN payment.";
      }
      if (!formData.paymentReference.trim()) {
        nextErrors.paymentReference = "Generate a PRN before proceeding.";
      }
    }

    if (step === 5 && !formData.termsAccepted) {
      nextErrors.termsAccepted = "You must accept terms before submitting.";
    }

    return nextErrors;
  };

  const validateStep = (step: number) => {
    const nextErrors = validateStepFields(step);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const academicSubStepErrorKeys: Record<number, string[]> = {
    0: ["applicationType", "entryScheme", "program", "programChoice2", "programChoice3", "programChoice4", "startDate", "previousInstitution"],
    1: [
      "academicCredentialLevel", "academicCredentialsDetails",
      "uceIndexNumber", "uceYearOfSitting", "uceSecondIndexNumber", "uceSecondYearOfSitting",
      "uaceIndexNumber", "uaceYearOfSitting", "uaceSecondIndexNumber", "uaceSecondYearOfSitting",
      "oLevelSchoolName", "oLevelSubjects", "uceTotalAggregates", "uceDivision",
    ],
    2: [
      "uacePrincipalSubjects",
      "uacePrincipalSubject0", "uacePrincipalSubject1", "uacePrincipalSubject2",
      "uacePrincipalGrade0", "uacePrincipalGrade1", "uacePrincipalGrade2",
      "uaceGeneralPaperGrade", "uaceIctOrSubMathSubject", "uaceIctOrSubMathGrade",
      "uaceTotalPoints",
    ],
    3: ["certificateSubjects"],
  };

  const documentSubStepErrorKeys: Record<number, string[]> = {
    0: ["passportPhotoUrl", "birthCertificateUrl", "oLevelResultSlipUrl", "aLevelResultSlipUrl"],
    1: ["academicTranscriptUrl", "nationalIdOrPassportUrl", "countryIdDocumentUrl"],
    2: [],
  };

  const findFirstFailingSubStep = (errors: Record<string, string>): number => {
    for (let sub = 0; sub < academicStepLabels.length; sub++) {
      if (academicSubStepErrorKeys[sub].some((key) => errors[key])) return sub;
    }
    return 0;
  };

  const findFirstFailingDocumentSubStep = (errors: Record<string, string>): number => {
    for (let sub = 0; sub < 3; sub++) {
      if (documentSubStepErrorKeys[sub].some((key) => errors[key])) return sub;
    }
    return 0;
  };

  const handleNext = () => {
    console.log("[NEXT] activeStep:", activeStep, "academicSubStep:", academicSubStep, "documentSubStep:", documentSubStep);

    if (activeStep === 2 && academicSubStep < academicStepLabels.length - 1) {
      const allErrors = validateStepFields(activeStep);
      const currentSubKeys = academicSubStepErrorKeys[academicSubStep];
      const currentSubErrors = currentSubKeys.filter((key) => allErrors[key]);
      console.log("[NEXT] step2 sub-step:", academicSubStep, "checking keys:", currentSubKeys, "errors found:", currentSubErrors, "allErrors:", Object.keys(allErrors));
      if (currentSubErrors.length > 0) {
        console.log("[NEXT] BLOCKED — current sub-step has errors:", currentSubErrors.map((k) => `${k}: ${allErrors[k]}`));
        setErrors((prev) => ({ ...prev, ...allErrors }));
        return;
      }
      setErrors((prev) => {
        const next = { ...prev };
        currentSubKeys.forEach((key) => delete next[key]);
        return next;
      });
      console.log("[NEXT] advancing sub-step", academicSubStep, "->", academicSubStep + 1);
      setAcademicSubStep((prev) => prev + 1);
      return;
    }

    if (activeStep === 3 && documentSubStep < documentStepLabels.length - 1) {
      console.log("[NEXT] advancing document sub-step", documentSubStep, "->", documentSubStep + 1);
      setDocumentSubStep((prev) => prev + 1);
      return;
    }

    if (!validateStep(activeStep)) {
      console.log("[NEXT] step", activeStep, "validation FAILED — errors:", Object.entries(errors).map(([k, v]) => `${k}: ${v}`));
      if (activeStep === 2) {
        const stepErrors = validateStepFields(activeStep);
        console.log("[NEXT] jumping to failing academic sub-step:", findFirstFailingSubStep(stepErrors));
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        setAcademicSubStep(findFirstFailingSubStep(stepErrors));
      }
      if (activeStep === 3) {
        const stepErrors = validateStepFields(activeStep);
        console.log("[NEXT] jumping to failing document sub-step:", findFirstFailingDocumentSubStep(stepErrors));
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        setDocumentSubStep(findFirstFailingDocumentSubStep(stepErrors));
      }
      return;
    }

    const nextStep = Math.min(activeStep + 1, applicationSteps.length - 1);
    console.log("[NEXT] advancing step", activeStep, "->", nextStep);
    setFurthestStep((prev) => Math.max(prev, nextStep));
    setActiveStep(nextStep);
  };

  const handlePrevious = () => {
    if (activeStep === 2 && academicSubStep > 0) {
      setAcademicSubStep((prev) => prev - 1);
      return;
    }
    if (activeStep === 3 && documentSubStep > 0) {
      setDocumentSubStep((prev) => prev - 1);
      return;
    }
    if (activeStep === 3) {
      setActiveStep(2);
      setAcademicSubStep(academicStepLabels.length - 1);
      return;
    }
    setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const generatePrn = () => {
    const initials = `${formData.firstName}${formData.lastName}`
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 4)
      .padEnd(4, "X");
    const stamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    const prn = `PRN-${initials}-${stamp}-${random}`;

    updateField("paymentReference", prn);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.paymentReference;
      return next;
    });
  };

  const nationalityLower = formData.nationality.trim().toLowerCase();
  const isEastAfricanApplicant =
    formData.isUgandan === "yes" ||
    eastAfricanNationalities.some(
      (country) =>
        nationalityLower === country || nationalityLower.includes(country),
    );
  const paymentFeeSummary = isEastAfricanApplicant
    ? "UGX 50,000 + bank/service charges (typically UGX 2,750-5,000)."
    : "USD 75 (or equivalent, e.g. UGX 281,250 in some schemes).";
  const handleSubmit = async () => {
    const valid = validateStep(5);
    console.log("[SUBMIT] validateStep(5) =", valid, "errors:", errors);
    if (!valid) return;
    setSubmittingApplication(true);
    setSubmissionStatus("");
    try {
      const ugandanStatus = formData.isUgandan === "no" ? "no" : "yes";
      const needsTranscript =
        /Diploma|Degree/i.test(formData.applicationType) ||
        /Diploma|Degree/i.test(formData.academicCredentialLevel);
      const needsALevelSlip = shouldCaptureUceAndUace;
      const documentsReady = Boolean(
        formData.passportPhotoUrl.trim() &&
        formData.birthCertificateUrl.trim() &&
        formData.oLevelResultSlipUrl.trim() &&
        (formData.hasNationalIdOrPassport !== "yes" ||
          formData.nationalIdOrPassportUrl.trim()) &&
        (!needsALevelSlip || formData.aLevelResultSlipUrl.trim()) &&
        (!needsTranscript || formData.academicTranscriptUrl.trim()) &&
        (formData.isUgandan !== "no" || formData.countryIdDocumentUrl.trim()),
      );

      const payload: ApplicationSubmissionInput = {
        email: formData.email.trim().toLowerCase(),
        otherNames: formData.otherNames.trim(),
        gender: formData.gender,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality.trim(),
        address: formData.address.trim(),
        postalAddress: formData.postalAddress.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
        districtOfOrigin: formData.districtOfOrigin.trim(),
        hasNationalIdOrPassport:
          formData.hasNationalIdOrPassport === "yes" ? "yes" : "no",
        birthCertificateOrNationalIdDetails:
          formData.hasNationalIdOrPassport === "yes"
            ? formData.birthCertificateOrNationalIdDetails.trim()
            : "",
        passportPhotoUploaded: Boolean(formData.passportPhotoUrl.trim()),
        passportPhotoUrl: formData.passportPhotoUrl.trim(),
        guardianName: formData.guardianName.trim(),
        guardianType: formData.guardianType,
        guardianPhone: formData.guardianPhone.trim(),
        nextOfKinRelationship: formData.nextOfKinRelationship.trim(),
        isUgandan: ugandanStatus,
        applicationType: formData.applicationType,
        entryScheme: formData.entryScheme,
        program: formData.program,
        programChoice2: formData.programChoice2,
        programChoice3: formData.programChoice3,
        programChoice4: formData.programChoice4,
        startDate: formData.startDate,
        previousInstitution: formData.previousInstitution.trim(),
        highestQualification: formData.highestQualification,
        academicCredentialLevel: formData.academicCredentialLevel,
        academicCredentialsDetails: formData.academicCredentialsDetails.trim(),
        birthCertificateUrl: formData.birthCertificateUrl.trim(),
        uceIndexNumber: formData.uceIndexNumber.trim(),
        uceYearOfSitting: formData.uceYearOfSitting.trim(),
        uceSecondSitting: formData.uceSecondSitting,
        uceSecondIndexNumber: formData.uceSecondIndexNumber.trim(),
        uceSecondYearOfSitting: formData.uceSecondYearOfSitting.trim(),
        uceTotalAggregates: formData.uceTotalAggregates.trim(),
        uceDivision: formData.uceDivision,
        oLevelSchoolName: formData.oLevelSchoolName.trim(),
        uaceIndexNumber: formData.uaceIndexNumber.trim(),
        uaceYearOfSitting: formData.uaceYearOfSitting.trim(),
        uaceSecondSitting: formData.uaceSecondSitting,
        uaceSecondIndexNumber: formData.uaceSecondIndexNumber.trim(),
        uaceSecondYearOfSitting: formData.uaceSecondYearOfSitting.trim(),
        uaceTotalPoints: formData.uaceTotalPoints.trim(),
        uacePrincipalSubjects: formData.uacePrincipalSubjects,
        uaceGeneralPaperGrade: formData.uaceGeneralPaperGrade,
        uaceIctOrSubMathSubject: formData.uaceIctOrSubMathSubject,
        uaceIctOrSubMathGrade: formData.uaceIctOrSubMathGrade,
        oLevelResultSlipUrl: formData.oLevelResultSlipUrl.trim(),
        aLevelResultSlipUrl: formData.aLevelResultSlipUrl.trim(),
        academicTranscriptUrl: formData.academicTranscriptUrl.trim(),
        nationalIdOrPassportUrl: formData.nationalIdOrPassportUrl.trim(),
        countryIdDocumentUrl: formData.countryIdDocumentUrl.trim(),
        refereeLetterUrl: formData.refereeLetterUrl.trim(),
        personalStatementAttachmentUrl:
          formData.personalStatementAttachmentUrl.trim(),
        oLevelSubjects: formData.oLevelSubjects,
        certificateSubjects: formData.certificateSubjects,
        gpa: formData.gpa.trim(),
        personalStatement: formData.personalStatement.trim(),
        howDidYouHear: formData.howDidYouHear,
        documentsConfirmed: documentsReady,
        transcriptUploaded: Boolean(formData.academicTranscriptUrl.trim()),
        idUploaded:
          formData.hasNationalIdOrPassport === "yes"
            ? Boolean(formData.nationalIdOrPassportUrl.trim())
            : false,
        countryIdUploaded: Boolean(formData.countryIdDocumentUrl.trim()),
        recommendationUploaded: Boolean(formData.refereeLetterUrl.trim()),
        statementUploaded: Boolean(
          formData.personalStatementAttachmentUrl.trim(),
        ),
        applicationFeePaid: formData.applicationFeePaid,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference.trim(),
        interviewPreference: formData.interviewPreference,
        termsAccepted: formData.termsAccepted,
        emailVerified: otpVerified,
        password: formData.password,
      };

      console.log("[SUBMIT] sending payload with keys:", Object.keys(payload));
      const submission = await submitApplicationSubmission(payload);
      console.log("[SUBMIT] success, id:", submission.id);
      localStorage.removeItem(APPLICATION_DRAFT_STORAGE_KEY);
      localStorage.setItem(APPLICANT_ID_STORAGE_KEY, String(submission.id));
      setApplicationId(submission.id);
      setSubmitted(true);
      toast(
        <div className="flex items-start gap-3">
          <img
            src="/institute-icon.svg"
            alt="Nexus University"
            className="w-10 h-10 rounded-lg object-contain shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground mb-1">
              Application Submitted
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your application has been received. A confirmation will be sent to your email.
            </p>
            {submission.id && (
              <p className="text-xs text-muted-foreground mt-2">
                Reference: <span className="font-mono text-foreground">{submission.id}</span>
              </p>
            )}
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        </div>,
        {
          duration: 10000,
          className: "border-green-200 bg-green-50/80",
        },
      );
    } catch (error) {
      console.error("[SUBMIT] caught error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save application. Please try again.";
      setSubmissionStatus(message);
      toast.error("Submission Failed", {
        description: message,
        duration: 6000,
      });
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleSendOtp = async () => {
    const email = formData.email.trim().toLowerCase();
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required." }));
      return;
    }

    setSendingOtp(true);
    setOtpStatus("");
    setOtpVerified(false);

    try {
      const res = await fetch(`${OTP_API_BASE}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !payload.ok) {
        setOtpStatus(payload.error ?? "Failed to send OTP.");
        return;
      }

      setOtpSent(true);
      setOtpStatus(payload.message ?? "OTP sent. Check your email.");
      setResendCooldown(60);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP.";
      setOtpStatus(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = formData.email.trim().toLowerCase();
    const code = otpCode.trim();

    if (!code) {
      setErrors((prev) => ({ ...prev, otp: "Enter the 4-digit OTP code." }));
      return;
    }

    setVerifyingOtp(true);
    setOtpStatus("");

    try {
      const res = await fetch(`${OTP_API_BASE}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        verified?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !payload.ok || !payload.verified) {
        setOtpVerified(false);
        setOtpStatus(payload.error ?? "Invalid OTP.");
        return;
      }

      setOtpVerified(true);
      setOtpStatus(payload.message ?? "Email verified successfully.");
      setErrors((prev) => {
        const next = { ...prev };
        delete next.otp;
        return next;
      });
    } catch (error) {
      setOtpVerified(false);
      const message =
        error instanceof Error ? error.message : "Failed to verify OTP.";
      setOtpStatus(message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const completedSteps = useMemo(
    () => applicationSteps.map((_, index) => index < furthestStep),
    [furthestStep],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 sm:px-6 md:px-16 pt-32 md:pt-36 pb-20 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/admissions/how-to-apply"
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.18em] uppercase text-accent mb-8"
          >
            <ArrowLeft size={14} />
            Back to How to Apply
          </Link>

          <div className="mb-12">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
              Application Portal
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-light text-foreground leading-[0.95] mb-6">
              Start Your Application
            </h1>
            <p className="font-body text-muted-foreground leading-relaxed max-w-2xl">
              Complete every section to submit a full application. You can only
              move to the next step once the current step is valid.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
            <aside className="border border-border rounded-[20px] md:rounded-[24px] p-4 sm:p-5 bg-secondary/10 h-fit">
              <p className="font-body text-[11px] tracking-[0.2em] uppercase text-accent mb-4">
                Process Tracker
              </p>
              <div className="space-y-3">
                {applicationSteps.map((step, index) => {
                  const isComplete = completedSteps[index];
                  const isActive = index === activeStep;
                  const isLocked = index > furthestStep;

                  return (
                    <button
                      key={step.number}
                      onClick={() => {
                        if (isLocked) return;
                        setActiveStep(index);
                        if (index === 2) setAcademicSubStep(0);
                        if (index === 3) setDocumentSubStep(0);
                      }}
                      disabled={isLocked}
                      className={`w-full text-left rounded-[14px] border px-4 py-3 transition-colors duration-300 ${
                        isActive
                          ? "border-accent/40 bg-accent/10"
                          : isLocked
                            ? "border-border/60 opacity-55 cursor-not-allowed"
                            : "border-border hover:border-accent/25"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                            isComplete
                              ? "border-accent bg-accent text-accent-foreground"
                              : isActive
                                ? "border-accent text-accent"
                                : "border-border text-muted-foreground"
                          }`}
                        >
                          {isComplete ? <Check size={14} /> : step.number}
                        </div>
                        <p className="font-body text-xs tracking-[0.08em] uppercase text-foreground flex items-center gap-2">
                          {step.title}
                          {isLocked ? (
                            <Lock size={12} className="text-muted-foreground" />
                          ) : null}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="border border-border rounded-[20px] md:rounded-[24px] p-4 sm:p-6 md:p-10 bg-background">
              {submitted ? (
                <div className="flex flex-col items-center text-center py-8 sm:py-12">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-600 text-white rounded-full p-1.5">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="/institute-icon.svg"
                      alt="University Logo"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain"
                    />
                    <p className="font-heading text-sm sm:text-base tracking-[0.25em] uppercase text-foreground">
                      Nexus University
                    </p>
                  </div>

                  <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-3">
                    Application Submitted
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6 max-w-lg">
                    Thank you, <span className="text-foreground font-medium">{formData.firstName || "Applicant"}</span>. Your application has been received and is being processed.
                  </p>

                  {applicationId ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] border border-border bg-secondary/30 mb-6">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Reference</span>
                      <span className="font-mono text-sm text-foreground font-medium">{applicationId}</span>
                    </div>
                  ) : null}

                  <p className="font-body text-xs text-muted-foreground leading-relaxed mb-8 max-w-md">
                    A confirmation will be sent to <span className="text-foreground">{formData.email || "your email"}</span>. This application is now locked — no further edits can be made unless the admissions office reopens it.
                  </p>

                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-[14px] font-body text-xs tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors"
                  >
                    Back to Home
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <>
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
                    Step {applicationSteps[activeStep].number}
                  </p>
                  <h2 className="font-heading text-3xl md:text-4xl font-light text-foreground mb-6">
                    {applicationSteps[activeStep].title}
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                    {applicationSteps[activeStep].desc}
                  </p>

                  <div className="space-y-6 mb-10">
                    {activeStep === 0 && (
                      <>
                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Email *
                          </label>
                          <input
                            value={formData.email}
                            onChange={(e) => {
                              updateField("email", e.target.value);
                              setOtpSent(false);
                              setOtpVerified(false);
                              setOtpCode("");
                              setOtpStatus("");
                            }}
                            className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                            type="email"
                            placeholder="you@example.com"
                            disabled={otpVerified}
                          />
                          {errors.email && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Gender *
                            </label>
                            <select
                              value={formData.gender}
                              onChange={(e) =>
                                updateField(
                                  "gender",
                                  e.target.value as
                                    | ""
                                    | "Male"
                                    | "Female"
                                    | "Other",
                                )
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors.gender && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.gender}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Date of Birth *
                            </label>
                            <input
                              value={formData.dateOfBirth}
                              onChange={(e) =>
                                updateField("dateOfBirth", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="date"
                            />
                            {errors.dateOfBirth && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.dateOfBirth}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Marital Status *
                            </label>
                            <select
                              value={formData.maritalStatus}
                              onChange={(e) =>
                                updateField("maritalStatus", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                            >
                              <option value="">Select marital status</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Separated">Separated</option>
                            </select>
                            {errors.maritalStatus && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.maritalStatus}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Password *
                            </label>
                            <input
                              value={formData.password}
                              onChange={(e) =>
                                updateField("password", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="password"
                              placeholder="At least 6 characters"
                            />
                            {errors.password && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.password}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Confirm Password *
                            </label>
                            <input
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                updateField("confirmPassword", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="password"
                              placeholder="Re-enter password"
                            />
                            {errors.confirmPassword && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="border border-border rounded-[14px] p-5 space-y-4 bg-secondary/10">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10">
                              {otpVerified ? (
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                Email Verification
                              </p>
                              {otpSent && !otpVerified && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Code sent to {formData.email}
                                </p>
                              )}
                            </div>
                          </div>

                          {!otpVerified && (
                            <>
                              <div className="space-y-3">
                                <div className="flex items-stretch gap-2">
                                  <input
                                    value={otpCode}
                                    onChange={(e) =>
                                      setOtpCode(
                                        e.target.value.replace(/\D/g, "").slice(0, 4),
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && otpSent && otpCode.length === 4) {
                                        handleVerifyOtp();
                                      }
                                    }}
                                    placeholder="0000"
                                    className="flex-1 sm:flex-none sm:w-[200px] border border-border rounded-[10px] px-4 py-2.5 bg-transparent font-mono text-lg tracking-[0.4em] text-center placeholder:text-muted-foreground/40 placeholder:tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-accent/30 transition-shadow"
                                    disabled={!otpSent}
                                    autoComplete="one-time-code"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={!otpSent || verifyingOtp || otpCode.length < 4}
                                    className="px-5 py-2.5 rounded-[10px] bg-accent text-accent-foreground font-body text-xs tracking-[0.16em] uppercase disabled:opacity-40 hover:bg-accent/90 transition-colors"
                                  >
                                    {verifyingOtp ? (
                                      <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Verifying
                                      </span>
                                    ) : (
                                      "Verify"
                                    )}
                                  </button>
                                </div>

                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || resendCooldown > 0}
                                    className="text-xs text-accent underline underline-offset-2 disabled:opacity-40 disabled:no-underline hover:text-accent/80 transition-colors"
                                  >
                                    {sendingOtp
                                      ? "Sending..."
                                      : resendCooldown > 0
                                        ? `Resend in ${resendCooldown}s`
                                        : otpSent
                                          ? "Resend code"
                                          : "Send verification code"}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}

                          {otpVerified && (
                            <div className="flex items-center gap-2 py-1">
                              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <p className="text-xs text-green-600 font-medium">
                                Email verified successfully
                              </p>
                            </div>
                          )}

                          {errors.otp && (
                            <p className="text-xs text-destructive flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" />
                                <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                              </svg>
                              {errors.otp}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {activeStep === 1 && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              First Name *
                            </label>
                            <input
                              value={formData.firstName}
                              onChange={(e) =>
                                updateField("firstName", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                            />
                            {errors.firstName && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.firstName}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Other Names
                            </label>
                            <input
                              value={formData.otherNames}
                              onChange={(e) =>
                                updateField("otherNames", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                              placeholder="Middle/additional names"
                            />
                            {errors.otherNames && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.otherNames}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Last Name *
                            </label>
                            <input
                              value={formData.lastName}
                              onChange={(e) =>
                                updateField("lastName", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                            />
                            {errors.lastName && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.lastName}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Phone Number *
                            </label>
                            <input
                              value={formData.phone}
                              onChange={(e) =>
                                updateField("phone", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="tel"
                            />
                            {errors.phone && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.phone}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Nationality / Citizenship *
                            </label>
                            <input
                              value={formData.nationality}
                              onChange={(e) =>
                                updateField("nationality", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                              list="nationality-options"
                              placeholder="Start typing your nationality"
                            />
                            <datalist id="nationality-options">
                              {nationalityOptions.map((nationality) => (
                                <option key={nationality} value={nationality} />
                              ))}
                            </datalist>
                            <p className="text-xs text-muted-foreground mt-2">
                              Choose from the list or type your nationality
                              manually if it is not shown.
                            </p>
                            {errors.nationality && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.nationality}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Is the Applicant Ugandan? *
                          </label>
                          <select
                            value={formData.isUgandan}
                            onChange={(e) =>
                              updateField(
                                "isUgandan",
                                e.target.value as "" | "yes" | "no",
                              )
                            }
                            className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                          >
                            <option value="">Select an option</option>
                            <option value="yes">Yes, Ugandan</option>
                            <option value="no">No, non-Ugandan</option>
                          </select>
                          {errors.isUgandan && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.isUgandan}
                            </p>
                          )}
                        </div>

                        {formData.isUgandan === "yes" ? (
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              District of Origin *
                            </label>
                            <input
                              value={formData.districtOfOrigin}
                              onChange={(e) =>
                                updateField("districtOfOrigin", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                              placeholder="Enter district of origin"
                            />
                            {errors.districtOfOrigin && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.districtOfOrigin}
                              </p>
                            )}
                          </div>
                        ) : null}

                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Do You Have a National ID or Passport? *
                          </label>
                          <select
                            value={formData.hasNationalIdOrPassport}
                            onChange={(e) => {
                              const value = e.target.value as "" | "yes" | "no";
                              updateField("hasNationalIdOrPassport", value);
                              if (value === "no") {
                                updateField(
                                  "birthCertificateOrNationalIdDetails",
                                  "",
                                );
                                updateField("nationalIdOrPassportUrl", "");
                              }
                            }}
                            className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                          >
                            <option value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                          {errors.hasNationalIdOrPassport && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.hasNationalIdOrPassport}
                            </p>
                          )}
                        </div>

                        {formData.hasNationalIdOrPassport === "yes" ? (
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              NIN *
                            </label>
                            <input
                              value={
                                formData.birthCertificateOrNationalIdDetails
                              }
                              onChange={(e) =>
                                updateField(
                                  "birthCertificateOrNationalIdDetails",
                                  e.target.value
                                    .replace(/[^a-zA-Z0-9]/g, "")
                                    .toUpperCase()
                                    .slice(0, 14),
                                )
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                              placeholder="Enter National Identification Number"
                              maxLength={14}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              NIN must be 14 letters/numbers (no spaces or
                              symbols).
                            </p>
                            {errors.birthCertificateOrNationalIdDetails && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.birthCertificateOrNationalIdDetails}
                              </p>
                            )}
                          </div>
                        ) : null}

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Upload your passport-size photograph in the document
                          upload step. The portal will enforce the file size
                          limit there.
                        </p>

                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Address *
                          </label>
                          <input
                            value={formData.address}
                            onChange={(e) =>
                              updateField("address", e.target.value)
                            }
                            className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                            type="text"
                          />
                          {errors.address && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Postal Address (Optional)
                          </label>
                          <input
                            value={formData.postalAddress}
                            onChange={(e) =>
                              updateField("postalAddress", e.target.value)
                            }
                            className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                            type="text"
                            placeholder="P.O. Box / mailing address"
                          />
                          {errors.postalAddress && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.postalAddress}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              City *
                            </label>
                            <input
                              value={formData.city}
                              onChange={(e) =>
                                updateField("city", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                            />
                            {errors.city && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.city}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Postal Code (Optional)
                            </label>
                            <input
                              value={formData.postalCode}
                              onChange={(e) =>
                                updateField("postalCode", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                            />
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Country *
                            </label>
                            <input
                              value={formData.country}
                              onChange={(e) =>
                                updateField("country", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                            />
                            {errors.country && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.country}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Parent/Guardian Name *
                            </label>
                            <input
                              value={formData.guardianName}
                              onChange={(e) =>
                                updateField("guardianName", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                            />
                            {errors.guardianName && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.guardianName}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Parent/Guardian Type *
                            </label>
                            <select
                              value={formData.guardianType}
                              onChange={(e) =>
                                updateField(
                                  "guardianType",
                                  e.target.value as
                                    | ""
                                    | "Parent"
                                    | "Guardian"
                                    | "Sponsor"
                                    | "Other",
                                )
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                            >
                              <option value="">Select type</option>
                              {guardianTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            {errors.guardianType && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.guardianType}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Guardian Phone *
                            </label>
                            <input
                              value={formData.guardianPhone}
                              onChange={(e) =>
                                updateField("guardianPhone", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="tel"
                            />
                            {errors.guardianPhone && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.guardianPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Relationship to Next of Kin *
                          </label>
                          <select
                            value={formData.nextOfKinRelationship}
                            onChange={(e) =>
                              updateField(
                                "nextOfKinRelationship",
                                e.target.value,
                              )
                            }
                            className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                          >
                            <option value="">Select relationship</option>
                            {relationshipOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground mt-2">
                            Tell us how the applicant is related to the next of
                            kin.
                          </p>
                          {errors.nextOfKinRelationship && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.nextOfKinRelationship}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {activeStep === 2 && (
                      <>
                        <div className="mb-6 rounded-[18px] border border-border bg-secondary/10 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-body text-[11px] tracking-[0.24em] uppercase text-accent">
                                Part {academicSubStep + 1}/{academicStepLabels.length}
                              </p>
                              <p className="font-body text-sm text-foreground mt-1">
                                {academicStepLabels[academicSubStep]}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {academicStepLabels.map((label, index) => (
                                <span
                                  key={label}
                                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${
                                    index === academicSubStep
                                      ? "border-accent bg-accent/10 text-accent"
                                      : "border-border text-muted-foreground"
                                  }`}
                                >
                                  {index + 1}/{academicStepLabels.length} {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            academicSubStep === 0 ? "space-y-4" : "hidden"
                          }
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                Application Type
                              </label>
                              <select
                                value={formData.applicationType}
                                onChange={(e) =>
                                  updateField("applicationType", e.target.value)
                                }
                                className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              >
                                <option value="">
                                  Select application type
                                </option>
                                {applicationTypeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              {errors.applicationType && (
                                <p className="text-xs text-destructive mt-2">
                                  {errors.applicationType}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                Entry Scheme
                              </label>
                              <select
                                value={formData.entryScheme}
                                onChange={(e) =>
                                  updateField("entryScheme", e.target.value)
                                }
                                className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              >
                                <option value="">Select entry scheme</option>
                                {entrySchemeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              {errors.entryScheme && (
                                <p className="text-xs text-destructive mt-2">
                                  {errors.entryScheme}
                                </p>
                              )}
                            </div>
                          </div>

                          {shouldCaptureUceAndUace ? (
                            <div className="space-y-4 border border-border rounded-[14px] p-4 bg-secondary/10">
                              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                UNEB Index Details
                              </p>
                              <div className="space-y-4 border border-border rounded-[12px] p-4 bg-background/50">
                                <p className="font-body text-xs uppercase tracking-[0.2em] text-accent">
                                  Section A: UACE Details
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                      UACE Index Number
                                    </label>
                                    <input
                                      value={formData.uaceIndexNumber}
                                      onChange={(e) =>
                                        updateField(
                                          "uaceIndexNumber",
                                          e.target.value,
                                        )
                                      }
                                      className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                      type="text"
                                      placeholder="e.g. U0123/002"
                                    />
                                    {errors.uaceIndexNumber && (
                                      <p className="text-xs text-destructive mt-2">
                                        {errors.uaceIndexNumber}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                      UACE Year of Sitting
                                    </label>
                                    <input
                                      value={formData.uaceYearOfSitting}
                                      onChange={(e) =>
                                        updateField(
                                          "uaceYearOfSitting",
                                          e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 4),
                                        )
                                      }
                                      className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                      type="text"
                                      inputMode="numeric"
                                      placeholder="YYYY"
                                    />
                                    {errors.uaceYearOfSitting && (
                                      <p className="text-xs text-destructive mt-2">
                                        {errors.uaceYearOfSitting}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <label className="inline-flex items-start gap-3 font-body text-sm text-foreground">
                                  <input
                                    type="checkbox"
                                    checked={formData.hasSecondSittingUace}
                                    onChange={(e) =>
                                      updateField(
                                        "hasSecondSittingUace",
                                        e.target.checked,
                                      )
                                    }
                                    className="mt-1"
                                  />
                                  I sat UACE in more than one sitting.
                                </label>

                                {formData.hasSecondSittingUace ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Second Sitting UACE Index Number
                                      </label>
                                      <input
                                        value={
                                          formData.secondSittingUaceIndexNumber
                                        }
                                        onChange={(e) =>
                                          updateField(
                                            "secondSittingUaceIndexNumber",
                                            e.target.value,
                                          )
                                        }
                                        className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                        type="text"
                                      />
                                      {errors.secondSittingUaceIndexNumber && (
                                        <p className="text-xs text-destructive mt-2">
                                          {errors.secondSittingUaceIndexNumber}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Second Sitting UACE Year
                                      </label>
                                      <input
                                        value={
                                          formData.secondSittingUaceYearOfSitting
                                        }
                                        onChange={(e) =>
                                          updateField(
                                            "secondSittingUaceYearOfSitting",
                                            e.target.value
                                              .replace(/\D/g, "")
                                              .slice(0, 4),
                                          )
                                        }
                                        className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="YYYY"
                                      />
                                      {errors.secondSittingUaceYearOfSitting && (
                                        <p className="text-xs text-destructive mt-2">
                                          {
                                            errors.secondSittingUaceYearOfSitting
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              <div className="space-y-4 border border-border rounded-[12px] p-4 bg-background/50">
                                <p className="font-body text-xs uppercase tracking-[0.2em] text-accent">
                                  Section B: UCE Details
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                      UCE Index Number
                                    </label>
                                    <input
                                      value={formData.uceIndexNumber}
                                      onChange={(e) =>
                                        updateField(
                                          "uceIndexNumber",
                                          e.target.value,
                                        )
                                      }
                                      className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                      type="text"
                                      placeholder="e.g. U0123/001"
                                    />
                                    {errors.uceIndexNumber && (
                                      <p className="text-xs text-destructive mt-2">
                                        {errors.uceIndexNumber}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                      UCE Year of Sitting
                                    </label>
                                    <input
                                      value={formData.uceYearOfSitting}
                                      onChange={(e) =>
                                        updateField(
                                          "uceYearOfSitting",
                                          e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 4),
                                        )
                                      }
                                      className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                      type="text"
                                      inputMode="numeric"
                                      placeholder="YYYY"
                                    />
                                    {errors.uceYearOfSitting && (
                                      <p className="text-xs text-destructive mt-2">
                                        {errors.uceYearOfSitting}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <label className="inline-flex items-start gap-3 font-body text-sm text-foreground">
                                  <input
                                    type="checkbox"
                                    checked={formData.hasSecondSittingUce}
                                    onChange={(e) =>
                                      updateField(
                                        "hasSecondSittingUce",
                                        e.target.checked,
                                      )
                                    }
                                    className="mt-1"
                                  />
                                  I sat UCE in more than one sitting.
                                </label>

                                {formData.hasSecondSittingUce ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Second Sitting UCE Index Number
                                      </label>
                                      <input
                                        value={
                                          formData.secondSittingUceIndexNumber
                                        }
                                        onChange={(e) =>
                                          updateField(
                                            "secondSittingUceIndexNumber",
                                            e.target.value,
                                          )
                                        }
                                        className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                        type="text"
                                      />
                                      {errors.secondSittingUceIndexNumber && (
                                        <p className="text-xs text-destructive mt-2">
                                          {errors.secondSittingUceIndexNumber}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Second Sitting UCE Year
                                      </label>
                                      <input
                                        value={
                                          formData.secondSittingUceYearOfSitting
                                        }
                                        onChange={(e) =>
                                          updateField(
                                            "secondSittingUceYearOfSitting",
                                            e.target.value
                                              .replace(/\D/g, "")
                                              .slice(0, 4),
                                          )
                                        }
                                        className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="YYYY"
                                      />
                                      {errors.secondSittingUceYearOfSitting && (
                                        <p className="text-xs text-destructive mt-2">
                                          {errors.secondSittingUceYearOfSitting}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : null}

                          <div className="space-y-4">
                            <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Course Selection (select up to 4 choices)
                            </p>
                            {[
                              { field: "program" as const, label: "1st Choice (Required)" },
                              { field: "programChoice2" as const, label: "2nd Choice" },
                              { field: "programChoice3" as const, label: "3rd Choice" },
                              { field: "programChoice4" as const, label: "4th Choice" },
                            ].map(({ field, label }) => (
                              <div key={field}>
                                <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                  {label}
                                </label>
                                <SearchableSelect
                                  value={formData[field]}
                                  onValueChange={(val) => updateField(field, val)}
                                  options={programmeNames}
                                  placeholder="Type to search programmes..."
                                  className="mt-2"
                                />
                                {errors[field] && (
                                  <p className="text-xs text-destructive mt-2">
                                    {errors[field]}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Preferred Start Date
                            </label>
                            <select
                              value={formData.startDate}
                              onChange={(e) =>
                                updateField("startDate", e.target.value)
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                            >
                              <option value="">Select date</option>
                              <option value={`June ${currentYear}`}>
                                {`June ${currentYear}`}
                              </option>
                              <option value={`September ${currentYear}`}>
                                {`September ${currentYear}`}
                              </option>
                              <option value={`January ${currentYear + 1}`}>
                                {`January ${currentYear + 1}`}
                              </option>
                            </select>
                            {errors.startDate && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.startDate}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Previous Institution
                            </label>
                            <input
                              value={formData.previousInstitution}
                              onChange={(e) =>
                                updateField(
                                  "previousInstitution",
                                  e.target.value,
                                )
                              }
                              className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              type="text"
                            />
                            {errors.previousInstitution && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.previousInstitution}
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          className={
                            academicSubStep === 1 ? "space-y-4" : "hidden"
                          }
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                Academic Credential Level
                              </label>
                              <select
                                value={formData.academicCredentialLevel}
                                onChange={(e) =>
                                  updateField(
                                    "academicCredentialLevel",
                                    e.target.value,
                                  )
                                }
                                className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                              >
                                <option value="">
                                  Select credential level
                                </option>
                                {academicCredentialOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <p className="text-xs text-muted-foreground mt-2">
                                For Uganda applicants, choose UCE, UACE,
                                Diploma, Degree, or an equivalent result.
                              </p>
                              {errors.academicCredentialLevel && (
                                <p className="text-xs text-destructive mt-2">
                                  {errors.academicCredentialLevel}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                Academic Results / Transcript Details
                              </label>
                              <input
                                value={formData.academicCredentialsDetails}
                                onChange={(e) =>
                                  updateField(
                                    "academicCredentialsDetails",
                                    e.target.value,
                                  )
                                }
                                className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                type="text"
                                placeholder="Example: UCE - 8 passes, UACE - 2 principal passes, Diploma transcript attached"
                              />
                              <p className="text-xs text-muted-foreground mt-2">
                                UCE: minimum of five passes. UACE: at least two
                                principal passes. Diploma/Degree holders should
                                provide certified transcript details.
                              </p>
                              {errors.academicCredentialsDetails && (
                                <p className="text-xs text-destructive mt-2">
                                  {errors.academicCredentialsDetails}
                                </p>
                              )}
                            </div>
                          </div>

                          {(isUceSelected || isUaceSelected) ? (
                            <div className="space-y-6 border border-border rounded-[14px] p-4 bg-secondary/10">
                              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                {isUceSelected ? "UCE" : "O-Level"} Details
                              </p>

                              <div>
                                <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                  O-Level School Name
                                </label>
                                <input
                                  value={formData.oLevelSchoolName}
                                  onChange={(e) =>
                                    updateField(
                                      "oLevelSchoolName",
                                      e.target.value,
                                    )
                                  }
                                  className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                  type="text"
                                  placeholder="Enter your O-Level school name"
                                />
                                {errors.oLevelSchoolName && (
                                  <p className="text-xs text-destructive mt-2">
                                    {errors.oLevelSchoolName}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-3">
                                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                  O-Level Subjects And Grades
                                </p>
                                {formData.oLevelSubjects.map((entry, index) => (
                                  <div
                                    key={`olevel-${index}`}
                                    className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px_auto] gap-3"
                                  >
                                    <input
                                      value={entry.subject}
                                      onChange={(e) =>
                                        updateSubjectGradeList(
                                          "oLevelSubjects",
                                          index,
                                          "subject",
                                          e.target.value,
                                        )
                                      }
                                      list="olevel-subject-options"
                                      className="w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                      type="text"
                                      placeholder="Search/select O-Level subject"
                                    />
                                    <select
                                      value={entry.grade}
                                      onChange={(e) =>
                                        updateSubjectGradeList(
                                          "oLevelSubjects",
                                          index,
                                          "grade",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                    >
                                      <option value="">Grade</option>
                                      {oLevelGradeOptions.map((grade) => (
                                        <option
                                          key={`olevel-${index}-${grade}`}
                                          value={grade}
                                        >
                                          {grade}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeSubjectGradeRow(
                                          "oLevelSubjects",
                                          index,
                                        )
                                      }
                                      className="px-3 py-2 border border-border rounded-[10px] font-body text-xs uppercase tracking-[0.16em]"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    addSubjectGradeRow("oLevelSubjects")
                                  }
                                  className="px-4 py-2 rounded-[10px] border border-accent/40 text-accent font-body text-xs tracking-[0.16em] uppercase"
                                >
                                  Add O-Level Subject
                                </button>
                                {errors.oLevelSubjects && (
                                  <p className="text-xs text-destructive mt-2">
                                    {errors.oLevelSubjects}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    UCE Total Aggregates *
                                  </label>
                                  <input
                                    value={formData.uceTotalAggregates}
                                    className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-secondary/10 font-body text-sm"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Auto-calculated from O-Level grades"
                                    readOnly
                                  />
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Derived from best O-Level grades using the
                                    UCE aggregate system.
                                  </p>
                                  {errors.uceTotalAggregates && (
                                    <p className="text-xs text-destructive mt-2">
                                      {errors.uceTotalAggregates}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    UCE Division *
                                  </label>
                                  <input
                                    value={formData.uceDivision}
                                    className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-secondary/10 font-body text-sm"
                                    type="text"
                                    placeholder="Auto-calculated"
                                    readOnly
                                  />
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Automatically assigned as 1, 2, 3, 4, or U.
                                  </p>
                                  {errors.uceDivision && (
                                    <p className="text-xs text-destructive mt-2">
                                      {errors.uceDivision}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          <datalist id="olevel-subject-options">
                            {oLevelSubjectOptions.map((subject) => (
                              <option key={subject} value={subject} />
                            ))}
                          </datalist>
                        </div>

                        <div
                          className={
                            academicSubStep === 2 ? "space-y-4" : "hidden"
                          }
                        >
                          <div className="space-y-6 border border-border rounded-[14px] p-4 bg-secondary/10">
                              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                UACE / A-Level Details
                              </p>

                              <div className="space-y-4">
                                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                  UACE Principal Subjects (3)
                                </p>
                                {formData.uacePrincipalSubjects.map(
                                  (entry, index) => (
                                    <div
                                      key={`uace-principal-${index}`}
                                      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px] gap-3"
                                    >
                                      <div>
                                        <input
                                          value={entry.subject}
                                          onChange={(e) =>
                                            updateSubjectGradeList(
                                              "uacePrincipalSubjects",
                                              index,
                                              "subject",
                                              e.target.value,
                                            )
                                          }
                                          list="uace-subject-options"
                                          className="w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                          type="text"
                                          placeholder={`Principal subject ${index + 1}`}
                                        />
                                        {errors[
                                          `uacePrincipalSubject${index}`
                                        ] && (
                                          <p className="text-xs text-destructive mt-2">
                                            {
                                              errors[
                                                `uacePrincipalSubject${index}`
                                              ]
                                            }
                                          </p>
                                        )}
                                      </div>
                                      <div>
                                        <select
                                          value={entry.grade}
                                          onChange={(e) =>
                                            updateSubjectGradeList(
                                              "uacePrincipalSubjects",
                                              index,
                                              "grade",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                        >
                                          <option value="">Grade</option>
                                          {uaceGradeOptions.map((grade) => (
                                            <option key={grade} value={grade}>
                                              {grade}
                                            </option>
                                          ))}
                                        </select>
                                        {errors[
                                          `uacePrincipalGrade${index}`
                                        ] && (
                                          <p className="text-xs text-destructive mt-2">
                                            {
                                              errors[
                                                `uacePrincipalGrade${index}`
                                              ]
                                            }
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ),
                                )}
                                {errors.uacePrincipalSubjects && (
                                  <p className="text-xs text-destructive mt-1">
                                    {errors.uacePrincipalSubjects}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    General Paper Grade
                                  </label>
                                  <select
                                    value={formData.uaceGeneralPaperGrade}
                                    onChange={(e) =>
                                      updateField(
                                        "uaceGeneralPaperGrade",
                                        e.target.value,
                                      )
                                    }
                                    className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                  >
                                    <option value="">Select grade</option>
                                    {uaceGradeOptions.map((grade) => (
                                      <option key={`gp-${grade}`} value={grade}>
                                        {grade}
                                      </option>
                                    ))}
                                  </select>
                                  {errors.uaceGeneralPaperGrade && (
                                    <p className="text-xs text-destructive mt-2">
                                      {errors.uaceGeneralPaperGrade}
                                    </p>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                      ICT or Sub Math
                                    </label>
                                    <select
                                      value={formData.uaceIctOrSubMathSubject}
                                      onChange={(e) =>
                                        updateField(
                                          "uaceIctOrSubMathSubject",
                                          e.target.value,
                                        )
                                      }
                                      className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                    >
                                      <option value="">Select subject</option>
                                      <option value="ICT">ICT</option>
                                      <option value="Subsidiary Mathematics">
                                        Subsidiary Mathematics
                                      </option>
                                    </select>
                                    {errors.uaceIctOrSubMathSubject && (
                                      <p className="text-xs text-destructive mt-2">
                                        {errors.uaceIctOrSubMathSubject}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                      Grade
                                    </label>
                                    <select
                                      value={formData.uaceIctOrSubMathGrade}
                                      onChange={(e) =>
                                        updateField(
                                          "uaceIctOrSubMathGrade",
                                          e.target.value,
                                        )
                                      }
                                      className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                    >
                                      <option value="">Select grade</option>
                                      {uaceGradeOptions.map((grade) => (
                                        <option
                                          key={`sub-${grade}`}
                                          value={grade}
                                        >
                                          {grade}
                                        </option>
                                      ))}
                                    </select>
                                    {errors.uaceIctOrSubMathGrade && (
                                      <p className="text-xs text-destructive mt-2">
                                        {errors.uaceIctOrSubMathGrade}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                  UACE Total Points *
                                </label>
                                <input
                                  value={formData.uaceTotalPoints}
                                  className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-secondary/10 font-body text-sm"
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Auto-calculated from UACE grades"
                                  readOnly
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                  Calculated out of 20 from principal and
                                  subsidiary grades.
                                </p>
                                {errors.uaceTotalPoints && (
                                  <p className="text-xs text-destructive mt-2">
                                    {errors.uaceTotalPoints}
                                  </p>
                                )}
                              </div>
                            </div>

                          <datalist id="uace-subject-options">
                            {uaceSubjectOptions.map((subject) => (
                              <option key={subject} value={subject} />
                            ))}
                          </datalist>
                        </div>

                        <div
                          className={
                            academicSubStep === 3 ? "space-y-4" : "hidden"
                          }
                        >
                          <div className="space-y-3 border border-border rounded-[14px] p-4 bg-secondary/10">
                            <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Certificate Subjects And Grades (If Applicable)
                            </p>
                            {formData.certificateSubjects.map(
                              (entry, index) => (
                                <div
                                  key={`certificate-${index}`}
                                  className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px_auto] gap-3"
                                >
                                  <input
                                    value={entry.subject}
                                    onChange={(e) =>
                                      updateSubjectGradeList(
                                        "certificateSubjects",
                                        index,
                                        "subject",
                                        e.target.value,
                                      )
                                    }
                                    list="certificate-subject-options"
                                    className="w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                    type="text"
                                    placeholder="Search/select certificate subject"
                                  />
                                  <select
                                    value={entry.grade}
                                    onChange={(e) =>
                                      updateSubjectGradeList(
                                        "certificateSubjects",
                                        index,
                                        "grade",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                                  >
                                    <option value="">Grade</option>
                                    {certificateGradeOptions.map((grade) => (
                                      <option
                                        key={`certificate-${index}-${grade}`}
                                        value={grade}
                                      >
                                        {grade}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeSubjectGradeRow(
                                        "certificateSubjects",
                                        index,
                                      )
                                    }
                                    className="px-3 py-2 border border-border rounded-[10px] font-body text-xs uppercase tracking-[0.16em]"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ),
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                addSubjectGradeRow("certificateSubjects")
                              }
                              className="px-4 py-2 rounded-[10px] border border-accent/40 text-accent font-body text-xs tracking-[0.16em] uppercase"
                            >
                              Add Certificate Subject
                            </button>
                            {errors.certificateSubjects && (
                              <p className="text-xs text-destructive mt-2">
                                {errors.certificateSubjects}
                              </p>
                            )}
                          </div>

                          <datalist id="certificate-subject-options">
                            {[
                              ...new Set([
                                ...uaceSubjectOptions,
                                ...oLevelSubjectOptions,
                              ]),
                            ].map((subject) => (
                              <option key={subject} value={subject} />
                            ))}
                          </datalist>
                        </div>
                      </>
                    )}

                    {activeStep === 3 && (
                      <>
                        <div className="mb-6 rounded-[18px] border border-border bg-secondary/10 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-body text-[11px] tracking-[0.24em] uppercase text-accent">
                                Part {documentSubStep + 1}/3
                              </p>
                              <p className="font-body text-sm text-foreground mt-1">
                                {documentStepLabels[documentSubStep]}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {documentStepLabels.map((label, index) => (
                                <span
                                  key={label}
                                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${
                                    index === documentSubStep
                                      ? "border-accent bg-accent/10 text-accent"
                                      : "border-border text-muted-foreground"
                                  }`}
                                >
                                  {index + 1}/{documentStepLabels.length} {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            documentSubStep === 0 ? "space-y-4" : "hidden"
                          }
                        >
                          {documentUploadSteps[0].map(renderUploadCard)}
                        </div>

                        <div
                          className={
                            documentSubStep === 1 ? "space-y-4" : "hidden"
                          }
                        >
                          {documentUploadSteps[1]
                            .filter((config) =>
                              config.field === "nationalIdOrPassportUrl"
                                ? formData.hasNationalIdOrPassport === "yes"
                                : true,
                            )
                            .map(renderUploadCard)}
                        </div>

                        <div
                          className={
                            documentSubStep === 2 ? "space-y-4" : "hidden"
                          }
                        >
                          {documentUploadSteps[2].map(renderUploadCard)}
                        </div>
                      </>
                    )}

                    {activeStep === 4 && (
                      <div className="space-y-4">
                        <div className="rounded-[18px] border border-border bg-secondary/10 p-4 space-y-3">
                          <p className="font-body text-xs uppercase tracking-[0.2em] text-accent">
                            {`Application Fee (${currentYear - 1}/${currentYear} Typical)`}
                          </p>
                          <p className="font-body text-sm text-foreground leading-relaxed">
                            {paymentFeeSummary}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Payment is completed outside this form (bank or
                            mobile money/URA flow). This page simulates PRN
                            generation and external confirmation.
                          </p>
                        </div>

                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Payment Reference Number (PRN)
                          </label>
                          <div className="mt-2 flex flex-wrap gap-3">
                            <input
                              value={formData.paymentReference}
                              readOnly
                              className="w-full sm:flex-1 sm:min-w-[220px] border border-border rounded-[12px] px-4 py-3 bg-secondary/10 font-body text-sm"
                              type="text"
                              placeholder="Generate PRN"
                            />
                            <button
                              type="button"
                              onClick={generatePrn}
                              className="px-4 py-3 rounded-[12px] border border-accent/40 text-accent font-body text-xs tracking-[0.16em] uppercase"
                            >
                              {formData.paymentReference
                                ? "Regenerate PRN"
                                : "Generate PRN"}
                            </button>
                          </div>
                          {errors.paymentReference && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.paymentReference}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            External Payment Channel
                          </label>
                          <select
                            value={formData.paymentMethod}
                            onChange={(e) =>
                              updateField("paymentMethod", e.target.value)
                            }
                            className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                          >
                            <option value="">Select channel</option>
                            <option value="Bank (PRN/URA)">
                              Bank (PRN/URA)
                            </option>
                            <option value="Mobile Money (PRN/URA)">
                              Mobile Money (PRN/URA)
                            </option>
                            <option value="Other Authorized Channel">
                              Other Authorized Channel
                            </option>
                          </select>
                          {errors.paymentMethod && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.paymentMethod}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Interview Preference (Optional)
                          </label>
                          <select
                            value={formData.interviewPreference}
                            onChange={(e) =>
                              updateField("interviewPreference", e.target.value)
                            }
                            className="mt-2 w-full border border-border rounded-[12px] px-4 py-3 bg-transparent font-body text-sm"
                          >
                            <option value="">No preference</option>
                            <option value="Online">Online</option>
                            <option value="In-person">In-person</option>
                          </select>
                        </div>

                        <label className="inline-flex items-start gap-3 font-body text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={formData.applicationFeePaid}
                            onChange={(e) =>
                              updateField(
                                "applicationFeePaid",
                                e.target.checked,
                              )
                            }
                            className="mt-1"
                          />
                          I have paid externally using the generated PRN, and I
                          understand status update is normally done by the
                          payment platform integration.
                        </label>
                        {errors.applicationFeePaid && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.applicationFeePaid}
                          </p>
                        )}
                      </div>
                    )}

                    {activeStep === 5 && (
                      <div className="space-y-4">
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                          Review completed details and submit your application.
                          Admission decisions are sent via email.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-body text-foreground">
                          <p>
                            <span className="text-muted-foreground">
                              Applicant:
                            </span>{" "}
                            {formData.firstName} {formData.lastName}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Email:
                            </span>{" "}
                            {formData.email}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              1st Choice:
                            </span>{" "}
                            {formData.program}
                          </p>
                          {formData.programChoice2 && (
                            <p>
                              <span className="text-muted-foreground">
                                2nd Choice:
                              </span>{" "}
                              {formData.programChoice2}
                            </p>
                          )}
                          {formData.programChoice3 && (
                            <p>
                              <span className="text-muted-foreground">
                                3rd Choice:
                              </span>{" "}
                              {formData.programChoice3}
                            </p>
                          )}
                          {formData.programChoice4 && (
                            <p>
                              <span className="text-muted-foreground">
                                4th Choice:
                              </span>{" "}
                              {formData.programChoice4}
                            </p>
                          )}
                          <p>
                            <span className="text-muted-foreground">
                              Start Date:
                            </span>{" "}
                            {formData.startDate}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Payment Channel:
                            </span>{" "}
                            {formData.paymentMethod || "Not selected"}
                          </p>
                          <p>
                            <span className="text-muted-foreground">PRN:</span>{" "}
                            {formData.paymentReference || "Not provided"}
                          </p>
                        </div>
                        <div className="rounded-[18px] border border-border bg-secondary/10 p-4 space-y-3">
                          <p className="font-body text-xs uppercase tracking-[0.2em] text-accent">
                            Declaration
                          </p>
                          <p className="font-body text-sm text-foreground leading-relaxed">
                            I declare that the information provided in this
                            application is true and complete to the best of my
                            knowledge. I understand that submitting forged,
                            misleading, or incomplete documents may result in
                            rejection, withdrawal of admission, or other
                            disciplinary and legal action in line with the
                            institution's regulations.
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            After final submission and payment confirmation,
                            this application is locked and cannot be edited.
                          </p>
                        </div>
                        <label className="inline-flex items-start gap-3 font-body text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={formData.termsAccepted}
                            onChange={(e) =>
                              updateField("termsAccepted", e.target.checked)
                            }
                            className="mt-1"
                          />
                          I confirm that the information and attached documents
                          are accurate, authentic, and complete.
                        </label>
                        {errors.termsAccepted && (
                          <p className="text-xs text-destructive">
                            {errors.termsAccepted}
                          </p>
                        )}
                        {submissionStatus && (
                          <p className="text-xs text-destructive mt-2">
                            {submissionStatus}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <button
                      onClick={handlePrevious}
                      disabled={activeStep === 0}
                      className="w-full sm:w-auto px-6 py-3 border border-border rounded-[14px] font-body text-xs tracking-[0.2em] uppercase text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {activeStep < applicationSteps.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-[14px] font-body text-xs tracking-[0.2em] uppercase"
                      >
                        Next Step
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-0.5 transition-transform duration-300"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submittingApplication}
                        className="w-full sm:w-auto px-6 py-3 bg-accent text-accent-foreground rounded-[14px] font-body text-xs tracking-[0.2em] uppercase"
                      >
                        {submittingApplication
                          ? "Submitting..."
                          : "Submit Application"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApplicationStartPage;
