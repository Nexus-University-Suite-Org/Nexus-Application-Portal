import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { studyLinks } from "@/lib/studyLinks";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Cpu,
  FileCheck2,
  FileText,
  FlaskConical,
  Globe2,
  GraduationCap,
  HelpCircle,
  Landmark,
  Layers3,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useContentCollection } from "@/hooks/useContentCollection";

const currentYear = new Date().getFullYear();

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const admissionStatsFallback = [
  { label: "Programs", value: "143+" },
  { label: "Annual Intakes", value: "3" },
  { label: "Scholarship Tracks", value: "18" },
  { label: "Application Support", value: "24/7" },
];

const pathwaysFallback = [
  {
    title: "Undergraduate Entry",
    detail:
      "Direct entry through national qualifications, diploma progression, or equivalent international certification.",
  },
  {
    title: "Postgraduate Entry",
    detail:
      "Coursework and research programs with faculty review, proposal assessment, and supervisor matching.",
  },
  {
    title: "Mature Age Entry",
    detail:
      "Alternative pathway with aptitude evaluation, interview panel, and prior-learning consideration.",
  },
  {
    title: "International Entry",
    detail:
      "Credential equivalency support, visa guidance, and orientation for global applicants.",
  },
];

const applicationJourneyFallback = [
  "Choose a program and confirm eligibility.",
  "Create your applicant profile and verify email.",
  "Complete the online form and upload documents.",
  "Pay the application fee and submit.",
  "Track review status and interview invites.",
  "Receive admission decision and complete enrollment.",
];

const entryRequirementsFallback = [
  {
    title: "Undergraduate",
    items: [
      "Certified secondary education results or equivalent.",
      "Program-specific subject requirements.",
      "Valid ID or passport copy.",
    ],
  },
  {
    title: "Postgraduate",
    items: [
      "Recognized bachelor's degree transcript.",
      "Curriculum vitae and statement of purpose.",
      "Two academic or professional referees.",
    ],
  },
  {
    title: "International",
    items: [
      "Equivalent qualification assessment.",
      "Proof of language proficiency where required.",
      "Passport biodata page and permit documentation.",
    ],
  },
];

const importantDatesFallback = [
  { phase: "Application Portal Opens", date: `02 April ${currentYear}` },
  { phase: "Priority Scholarship Deadline", date: `30 May ${currentYear}` },
  { phase: "General Application Deadline", date: `21 June ${currentYear}` },
  { phase: "Admission Decision Release", date: `18 July ${currentYear}` },
  {
    phase: "Registration & Orientation",
    date: `11-22 August ${currentYear}`,
  },
];

const requiredDocumentsFallback = [
  "Academic transcripts and result slips",
  "National ID or passport",
  "Recent passport-size photo",
  "Program-specific portfolio or proposal (where applicable)",
  "Proof of application fee payment",
  "Recommendation letters for postgraduate study",
];

const financeOptionsFallback = [
  "Flexible installment schedules for tuition payments",
  "Merit and need-based scholarships",
  "Student loan guidance and documentation support",
  "Employer sponsorship coordination for professional programs",
];

const admissionFaqsFallback = [
  {
    question: "Can I apply to multiple programs in one intake?",
    answer:
      "Yes. You can submit up to three program choices and rank them by preference in your application profile.",
  },
  {
    question: "How long does application review take?",
    answer:
      "Most applications are reviewed within 10 to 15 working days after complete documentation and payment confirmation.",
  },
  {
    question: "Can I edit my form after submission?",
    answer:
      "Minor edits can be requested through the admissions helpdesk before the deadline. Major changes require a fresh submission.",
  },
  {
    question: "Do you accept transfer students?",
    answer:
      "Yes. Credit transfer is available subject to departmental review and equivalency approval.",
  },
];

const sectionLinks = [
  { id: "pathways", label: "Pathways" },
  { id: "journey", label: "Application Steps" },
  { id: "requirements", label: "Requirements" },
  { id: "finance", label: "Fees & Funding" },
  { id: "faq", label: "FAQ" },
  { id: "support", label: "Support" },
];

const pathwayIcons = [GraduationCap, Layers3, Landmark, ShieldCheck];

type ApplicationData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  programLevel: string;
  preferredProgram: string;
  intake: string;
  statement: string;
  agreePolicy: boolean;
};

const initialApplicationData: ApplicationData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nationality: "",
  programLevel: "",
  preferredProgram: "",
  intake: "",
  statement: "",
  agreePolicy: false,
};

const intakeOptions = [
  `April ${currentYear}`,
  `August ${currentYear}`,
  `January ${currentYear + 1}`,
];
const levelOptions = ["Undergraduate", "Postgraduate", "Mature Age Entry"];
const programOptions = [
  "BSc Computer Science",
  "BA Mass Communication",
  "BBA",
  "MSc Data Science",
  "MBA",
  "MA Public Policy",
];

const registrarStatsFallback = [
  { label: "Students Served", value: "32,000+" },
  { label: "Services", value: "18" },
  { label: "Average Turnaround", value: "48hrs" },
  { label: "Support Channels", value: "5" },
];

const registrarServicesFallback = [
  {
    title: "Academic Records",
    description:
      "Transcript requests, result statements, and verification letters for institutional and employer use.",
  },
  {
    title: "Registration Services",
    description:
      "Course registration guidance, late registration support, and semester status changes.",
  },
  {
    title: "Examinations Support",
    description:
      "Examination schedules, special exam requests, and controlled assessment policy support.",
  },
  {
    title: "Graduation Clearance",
    description:
      "Clearance workflow, name verification, and completion audits before graduation lists are published.",
  },
  {
    title: "Credit Transfer",
    description:
      "Guidance for transfer credits, exemptions, and progression alignment with department approval.",
  },
  {
    title: "Policy & Appeals",
    description:
      "Academic policy clarifications, progression appeals, and official review mechanisms.",
  },
];

const registrarDeadlinesFallback = [
  {
    title: "Semester Registration Closes",
    date: `05 September ${currentYear}`,
  },
  {
    title: "Course Add/Drop Window Ends",
    date: `15 September ${currentYear}`,
  },
  { title: "Exam Card Verification", date: `28 October ${currentYear}` },
  {
    title: "Provisional Results Released",
    date: `20 December ${currentYear}`,
  },
  {
    title: "Graduation Clearance Deadline",
    date: `10 February ${currentYear + 1}`,
  },
];

const registrarPoliciesFallback = [
  "Students must complete registration within published timelines to maintain active status.",
  "All record amendment requests require valid identity documentation and proof of claim.",
  "Examination adjustments must be submitted with supporting documents before deadlines.",
  "Appeals are reviewed by faculty boards and communicated through official channels.",
];

const institutesStatsFallback = [
  { label: "Research Institutes", value: "12" },
  { label: "Active Projects", value: "96" },
  { label: "Industry Partners", value: "70+" },
  { label: "Innovation Grants", value: "$8.4M" },
];

const institutesListFallback = [
  {
    name: "Institute for Sustainable Cities",
    summary:
      "Urban resilience, transport intelligence, and climate-ready infrastructure for rapidly growing regions.",
  },
  {
    name: "Institute of Digital Health Systems",
    summary:
      "AI-enabled diagnostics, telemedicine platforms, and health data innovation for equitable care delivery.",
  },
  {
    name: "Institute for Advanced Agritech",
    summary:
      "Precision agriculture, food security analytics, and field-tested solutions for resilient production.",
  },
  {
    name: "Institute of Policy and Governance",
    summary:
      "Evidence-driven policy design, public leadership development, and governance transformation labs.",
  },
  {
    name: "Institute of Creative Media Futures",
    summary:
      "Immersive storytelling, digital journalism, and media entrepreneurship with global collaboration.",
  },
  {
    name: "Institute for Frontier Engineering",
    summary:
      "Smart manufacturing, robotics systems, and applied engineering for industry modernization.",
  },
];

const institutesPillarsFallback = [
  { title: "Discovery Research", detail: "Interdisciplinary teams advancing new knowledge through rigorous fundamental and applied science." },
  { title: "Innovation Translation", detail: "From prototypes to deployable products through incubation, testing, and commercialization pathways." },
  { title: "Global Collaboration", detail: "Cross-border research networks with universities, NGOs, governments, and private industry." },
  { title: "Tech Infrastructure", detail: "Modern labs, high-performance computing, and digital platforms powering frontier research." },
];

const pillarIconMap: Record<string, typeof FlaskConical> = {
  "Discovery Research": FlaskConical,
  "Innovation Translation": Lightbulb,
  "Global Collaboration": Globe2,
  "Tech Infrastructure": Cpu,
};

const institutesMilestonesFallback = [
  { year: "2023", event: "Launch of multidisciplinary innovation cluster" },
  {
    year: "2024",
    event: "First pan-African research commercialization summit",
  },
  { year: "2025", event: "75+ funded projects across all institute verticals" },
  {
    year: String(currentYear),
    event: "Global partnership framework expanded to 20 countries",
  },
];

const StudyItemPage = () => {
  const { slug } = useParams();
  const item = studyLinks.find((entry) => entry.slug === slug);
  const isJoinAdmissions = item?.slug === "join-admissions";
  const isAcademicRegistrar = item?.slug === "academic-registrar";
  const isInstitutes = item?.slug === "institutes";
  const isHowToApply = item?.slug === "how-to-apply";
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);
  const [applicationStep, setApplicationStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>(
    initialApplicationData,
  );
  const [formError, setFormError] = useState("");

  const { data: pageSections } = useContentCollection<PageSection>("page_sections", []);

  const getCmsData = (pageKey: string, sectionKey: string, fallback: unknown) => {
    const sections = pageSections.filter(s => s.page_key === pageKey && s.section_key === sectionKey);
    return sections.length > 0 ? parseJson(sections[0].body, fallback) : fallback;
  };

  const admissionStats = getCmsData("join_admissions", "stats", admissionStatsFallback) as { label: string; value: string }[];
  const pathways = getCmsData("join_admissions", "pathways", pathwaysFallback) as { title: string; detail: string }[];
  const applicationJourney = getCmsData("join_admissions", "application_journey", applicationJourneyFallback) as string[];
  const entryRequirements = getCmsData("join_admissions", "entry_requirements", entryRequirementsFallback) as { title: string; items: string[] }[];
  const importantDates = getCmsData("join_admissions", "important_dates", importantDatesFallback) as { phase: string; date: string }[];
  const requiredDocuments = getCmsData("join_admissions", "required_documents", requiredDocumentsFallback) as string[];
  const financeOptions = getCmsData("join_admissions", "finance_options", financeOptionsFallback) as string[];
  const admissionFaqs = getCmsData("join_admissions", "faqs", admissionFaqsFallback) as { question: string; answer: string }[];
  const registrarStats = getCmsData("academic_registrar", "stats", registrarStatsFallback) as { label: string; value: string }[];
  const registrarServices = getCmsData("academic_registrar", "services", registrarServicesFallback) as { title: string; description: string }[];
  const registrarDeadlines = getCmsData("academic_registrar", "deadlines", registrarDeadlinesFallback) as { title: string; date: string }[];
  const registrarPolicies = getCmsData("academic_registrar", "policies", registrarPoliciesFallback) as string[];
  const institutesStats = getCmsData("institutes", "stats", institutesStatsFallback) as { label: string; value: string }[];
  const institutesList = getCmsData("institutes", "list", institutesListFallback) as { name: string; summary: string }[];
  const institutesPillars = getCmsData("institutes", "pillars", institutesPillarsFallback) as { title: string; detail: string; icon?: string }[];
  const institutesMilestones = getCmsData("institutes", "milestones", institutesMilestonesFallback) as { year: string; event: string }[];

  const updateApplicationData = <K extends keyof ApplicationData>(
    field: K,
    value: ApplicationData[K],
  ) => {
    setApplicationData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (
        !applicationData.firstName.trim() ||
        !applicationData.lastName.trim() ||
        !applicationData.email.trim() ||
        !applicationData.phone.trim()
      ) {
        return "Please complete all personal details before continuing.";
      }
      if (!applicationData.email.includes("@")) {
        return "Please enter a valid email address.";
      }
    }

    if (step === 2) {
      if (
        !applicationData.programLevel ||
        !applicationData.preferredProgram ||
        !applicationData.intake
      ) {
        return "Please select your program level, preferred program, and intake.";
      }
    }

    if (step === 3) {
      if (
        !applicationData.statement.trim() ||
        applicationData.statement.length < 80
      ) {
        return "Please provide a short statement of at least 80 characters.";
      }
      if (!applicationData.agreePolicy) {
        return "You must accept the admissions policy declaration.";
      }
    }

    return "";
  };

  const handleNextStep = () => {
    const validationMessage = validateStep(applicationStep);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError("");
    setApplicationStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePreviousStep = () => {
    setFormError("");
    setApplicationStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitApplication = () => {
    const validationMessage = validateStep(3);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError("");
    setFormSubmitted(true);
  };

  const startNewApplication = () => {
    setApplicationData(initialApplicationData);
    setApplicationStep(1);
    setFormSubmitted(false);
    setFormError("");
  };

  if (!item) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 md:pt-36 px-6 md:px-12 lg:px-16 pb-20 relative overflow-hidden">
        {(isJoinAdmissions || isInstitutes) && (
          <>
            <div className="absolute top-16 left-[-8rem] w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
            <div className="absolute top-[38rem] right-[-10rem] w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground)/0.03)_1px,transparent_0)] bg-[length:26px_26px]" />
          </>
        )}

        <section className="relative max-w-6xl mx-auto">
          <Link
            to="/study"
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-accent transition-colors duration-300 mb-6"
          >
            Back to Study at University Application Portal
          </Link>

          {isJoinAdmissions ? (
            <div className="border border-border/60 rounded-[28px] bg-gradient-to-br from-background via-background to-secondary/30 p-7 md:p-10 lg:p-12 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
              <p className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase text-accent mb-5 border border-accent/35 px-3 py-1.5 rounded-[999px]">
                <Sparkles size={12} /> {`Admissions ${currentYear}`}
              </p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-foreground leading-[0.95] mb-5 max-w-5xl">
                Join Institute University
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-4xl leading-relaxed mb-7">
                Everything you need to apply with confidence: entry pathways,
                deadlines, requirements, scholarships, payment options, and
                direct support from admissions.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#journey"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-accent text-accent-foreground font-body text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors duration-300"
                >
                  Start Application Steps <ArrowRight size={14} />
                </a>
                <a
                  href="#requirements"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] border border-accent/35 text-accent font-body text-xs tracking-[0.15em] uppercase hover:bg-accent/10 transition-colors duration-300"
                >
                  Check Requirements <FileText size={14} />
                </a>
              </div>
            </div>
          ) : isAcademicRegistrar ? (
            <div className="border border-border/60 rounded-[28px] bg-gradient-to-br from-background via-background to-secondary/30 p-7 md:p-10 lg:p-12 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
              <p className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase text-accent mb-5 border border-accent/35 px-3 py-1.5 rounded-[999px]">
                <Sparkles size={12} /> Registrar Services Hub
              </p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-foreground leading-[0.95] mb-5 max-w-5xl">
                Academic Registrar Office
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-4xl leading-relaxed mb-7">
                A centralized, student-first service center for records,
                registration, examination workflows, progression support, and
                graduation clearance.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#registrar-services"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-accent text-accent-foreground font-body text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors duration-300"
                >
                  Explore Services <ArrowRight size={14} />
                </a>
                <a
                  href="#registrar-contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] border border-accent/35 text-accent font-body text-xs tracking-[0.15em] uppercase hover:bg-accent/10 transition-colors duration-300"
                >
                  Contact Office <Phone size={14} />
                </a>
              </div>
            </div>
          ) : isInstitutes ? (
            <div className="border border-border/60 rounded-[28px] bg-gradient-to-br from-background via-background to-secondary/30 p-7 md:p-10 lg:p-12 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
              <p className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase text-accent mb-5 border border-accent/35 px-3 py-1.5 rounded-[999px]">
                <Sparkles size={12} /> Institute Ecosystem
              </p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-foreground leading-[0.95] mb-5 max-w-5xl">
                Institutes of Excellence
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-4xl leading-relaxed mb-7">
                A powerful ecosystem where breakthrough research, advanced
                technology, and real-world partnerships converge to shape the
                future across Africa and beyond.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#institutes-showcase"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-accent text-accent-foreground font-body text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors duration-300"
                >
                  Explore Institutes <ArrowRight size={14} />
                </a>
                <a
                  href="#institutes-partner"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] border border-accent/35 text-accent font-body text-xs tracking-[0.15em] uppercase hover:bg-accent/10 transition-colors duration-300"
                >
                  Become a Partner <Building2 size={14} />
                </a>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-foreground leading-[0.95] mb-5 max-w-5xl">
                {item.title}
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-4xl leading-relaxed">
                {item.summary}
              </p>
            </>
          )}
        </section>

        {isJoinAdmissions ? (
          <>
            <section className="relative max-w-6xl mx-auto mt-7 flex flex-wrap gap-2.5">
              {sectionLinks.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-[10px] md:text-xs tracking-[0.14em] uppercase font-body border border-border/60 text-foreground px-3.5 py-2 rounded-[999px] hover:border-accent/40 hover:text-accent hover:bg-accent/10 transition-all duration-300"
                >
                  {section.label}
                </a>
              ))}
            </section>

            <section className="relative max-w-6xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {admissionStats.map((stat) => (
                <article
                  key={stat.label}
                  className="group border border-border/60 rounded-[20px] p-5 bg-gradient-to-br from-background to-secondary/20 transition-all duration-400 hover:border-accent/45 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
                >
                  <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <p className="font-heading text-3xl md:text-4xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
                    {stat.value}
                  </p>
                </article>
              ))}
            </section>

            <section
              id="pathways"
              className="relative max-w-6xl mx-auto mt-10 border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/90 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap size={18} className="text-accent" />
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                  Admission Pathways
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pathways.map((pathway, index) => {
                  const PathwayIcon = pathwayIcons[index % pathwayIcons.length];

                  return (
                    <article
                      key={pathway.title}
                      className="group border border-border/50 rounded-[20px] p-5 bg-gradient-to-br from-background to-secondary/10 transition-all duration-400 hover:border-accent/40 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                    >
                      <div className="w-10 h-10 rounded-[12px] border border-accent/30 bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/18 transition-colors duration-300">
                        <PathwayIcon size={16} className="text-accent" />
                      </div>
                      <h2 className="font-heading text-2xl font-light text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                        {pathway.title}
                      </h2>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {pathway.detail}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section
              id="journey"
              className="relative max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6"
            >
              <article className="lg:col-span-3 border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                  Step-by-Step
                </p>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground leading-[0.95] mb-6">
                  Application Journey
                </h2>
                <div className="relative space-y-4 before:content-[''] before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-[1px] before:bg-border/80">
                  {applicationJourney.map((step, index) => (
                    <div
                      key={step}
                      className="relative flex items-start gap-4 border border-border/50 rounded-[18px] p-4 bg-background/90"
                    >
                      <span className="relative z-10 w-8 h-8 rounded-full border border-accent/50 bg-accent/12 text-accent flex items-center justify-center font-body text-xs shrink-0">
                        {index + 1}
                      </span>
                      <p className="font-body text-sm md:text-base text-foreground leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="lg:col-span-2 border border-border/60 rounded-[24px] p-6 md:p-8 bg-gradient-to-br from-background to-secondary/25">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                  Important Dates
                </p>
                <div className="space-y-4">
                  {importantDates.map((dateItem) => (
                    <div
                      key={dateItem.phase}
                      className="border border-border/50 rounded-[16px] p-4 bg-background/80"
                    >
                      <p className="font-body text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
                        {dateItem.phase}
                      </p>
                      <p className="font-heading text-xl font-light text-foreground">
                        {dateItem.date}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section
              id="finance"
              className="relative max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <article className="border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck2 size={18} className="text-accent" />
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                    Required Documents
                  </p>
                </div>
                <ul className="space-y-3">
                  {requiredDocuments.map((doc) => (
                    <li key={doc} className="flex items-start gap-3">
                      <BadgeCheck
                        size={16}
                        className="text-accent mt-0.5 shrink-0"
                      />
                      <span className="font-body text-sm text-foreground leading-relaxed">
                        {doc}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet size={18} className="text-accent" />
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                    Fees & Funding
                  </p>
                </div>
                <ul className="space-y-3">
                  {financeOptions.map((itemText) => (
                    <li key={itemText} className="flex items-start gap-3">
                      <ArrowRight
                        size={14}
                        className="text-accent mt-1 shrink-0"
                      />
                      <span className="font-body text-sm text-foreground leading-relaxed">
                        {itemText}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section
              id="requirements"
              className="relative max-w-6xl mx-auto mt-10 border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <FileText size={18} className="text-accent" />
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                  Entry Requirements by Level
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {entryRequirements.map((group) => (
                  <article
                    key={group.title}
                    className="border border-border/50 rounded-[20px] p-5 bg-gradient-to-br from-background to-secondary/15"
                  >
                    <h3 className="font-heading text-2xl font-light text-foreground mb-3">
                      {group.title}
                    </h3>
                    <ul className="space-y-2">
                      {group.items.map((requirement) => (
                        <li
                          key={requirement}
                          className="flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          <span className="font-body text-sm text-muted-foreground leading-relaxed">
                            {requirement}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="faq"
              className="relative max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <article className="border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-5">
                  <HelpCircle size={18} className="text-accent" />
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                    Frequently Asked Questions
                  </p>
                </div>
                <div className="space-y-4">
                  {admissionFaqs.map((faq, index) => (
                    <article
                      key={faq.question}
                      className="border border-border/50 rounded-[16px] bg-background"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqIndex((currentIndex) =>
                            currentIndex === index ? -1 : index,
                          )
                        }
                        className="w-full px-4 py-4 text-left flex items-center justify-between gap-3"
                        aria-expanded={openFaqIndex === index}
                      >
                        <h3 className="font-body text-sm uppercase tracking-[0.08em] text-foreground">
                          {faq.question}
                        </h3>
                        <ChevronDown
                          size={16}
                          className={`text-muted-foreground transition-transform duration-300 ${
                            openFaqIndex === index
                              ? "rotate-180 text-accent"
                              : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ${
                          openFaqIndex === index
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <p className="overflow-hidden px-4 pb-4 font-body text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </article>

              <article
                id="support"
                className="border border-border/60 rounded-[24px] p-6 md:p-8 bg-gradient-to-br from-background to-secondary/25"
              >
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                  Need Help?
                </p>
                <h2 className="font-heading text-4xl font-light text-foreground leading-[0.95] mb-5">
                  Admissions Support Desk
                </h2>
                <div className="space-y-3 mb-6">
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <Mail size={14} className="text-accent" />{" "}
                    admissions@institute.ac.ug
                  </p>
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <Phone size={14} className="text-accent" /> +256 700 123 456
                  </p>
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <MapPin size={14} className="text-accent" /> Registrar
                    Block, Main Campus
                  </p>
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <CalendarDays size={14} className="text-accent" />{" "}
                    Monday-Friday, 8:00 AM - 5:00 PM
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    to="/study/how-to-apply"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-[16px] font-body text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Start Application <ArrowRight size={14} />
                  </Link>
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-accent/40 text-accent rounded-[16px] font-body text-xs tracking-[0.15em] uppercase hover:bg-accent/10 transition-all duration-300 hover:-translate-y-0.5">
                    Download Guide <FileText size={14} />
                  </button>
                </div>
              </article>
            </section>
          </>
        ) : isAcademicRegistrar ? (
          <>
            <section className="relative max-w-6xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {registrarStats.map((stat) => (
                <article
                  key={stat.label}
                  className="group border border-border/60 rounded-[20px] p-5 bg-gradient-to-br from-background to-secondary/20 transition-all duration-400 hover:border-accent/45 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
                >
                  <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <p className="font-heading text-3xl md:text-4xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
                    {stat.value}
                  </p>
                </article>
              ))}
            </section>

            <section
              id="registrar-services"
              className="relative max-w-6xl mx-auto mt-10 border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <Landmark size={18} className="text-accent" />
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                  Core Services
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registrarServices.map((service) => (
                  <article
                    key={service.title}
                    className="group border border-border/50 rounded-[20px] p-5 bg-gradient-to-br from-background to-secondary/10 transition-all duration-400 hover:border-accent/40 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                  >
                    <div className="w-10 h-10 rounded-[12px] border border-accent/30 bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/18 transition-colors duration-300">
                      <FileText size={16} className="text-accent" />
                    </div>
                    <h2 className="font-heading text-2xl font-light text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                      {service.title}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="relative max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
              <article className="lg:col-span-3 border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                  Office Workflow
                </p>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground leading-[0.95] mb-6">
                  How requests are processed
                </h2>
                <div className="space-y-4">
                  {[
                    "Submit request through portal, office desk, or official email.",
                    "Verification of identity and supporting documentation.",
                    "Faculty or department review where needed.",
                    "Registrar processing and approval with quality checks.",
                    "Notification to student and digital/physical collection.",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="flex items-start gap-4 border border-border/50 rounded-[18px] p-4 bg-background/90"
                    >
                      <span className="w-8 h-8 rounded-full border border-accent/50 bg-accent/12 text-accent flex items-center justify-center font-body text-xs shrink-0">
                        {index + 1}
                      </span>
                      <p className="font-body text-sm md:text-base text-foreground leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="lg:col-span-2 border border-border/60 rounded-[24px] p-6 md:p-8 bg-gradient-to-br from-background to-secondary/25">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                  Key Deadlines
                </p>
                <div className="space-y-4">
                  {registrarDeadlines.map((deadline) => (
                    <div
                      key={deadline.title}
                      className="border border-border/50 rounded-[16px] p-4 bg-background/80"
                    >
                      <p className="font-body text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
                        {deadline.title}
                      </p>
                      <p className="font-heading text-xl font-light text-foreground">
                        {deadline.date}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="relative max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <article className="border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-accent" />
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                    Policy Highlights
                  </p>
                </div>
                <ul className="space-y-3">
                  {registrarPolicies.map((policy) => (
                    <li key={policy} className="flex items-start gap-3">
                      <BadgeCheck
                        size={16}
                        className="text-accent mt-0.5 shrink-0"
                      />
                      <span className="font-body text-sm text-foreground leading-relaxed">
                        {policy}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays size={18} className="text-accent" />
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                    Quick Actions
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Request a transcript",
                    "Check registration status",
                    "Apply for course add/drop",
                    "Start graduation clearance",
                  ].map((action) => (
                    <button
                      key={action}
                      className="w-full text-left border border-border/50 rounded-[14px] px-4 py-3 font-body text-sm text-foreground hover:border-accent/45 hover:bg-accent/8 transition-all duration-300 inline-flex items-center justify-between"
                    >
                      {action}
                      <ArrowRight size={14} className="text-accent" />
                    </button>
                  ))}
                </div>
              </article>
            </section>

            <section
              id="registrar-contact"
              className="relative max-w-6xl mx-auto mt-10 border border-border/60 rounded-[24px] p-6 md:p-8 bg-gradient-to-br from-background to-secondary/25"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                    Contact Registrar Office
                  </p>
                  <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground leading-[0.95] mb-4">
                    Talk to our academic support team
                  </h2>
                  <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                    Visit, call, or email for transcript requests, registration
                    support, and official records services.
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <Mail size={14} className="text-accent" />
                    registrar@institute.ac.ug
                  </p>
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <Phone size={14} className="text-accent" />
                    +256 700 987 654
                  </p>
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <MapPin size={14} className="text-accent" />
                    Academic Registry, Administration Block
                  </p>
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <CalendarDays size={14} className="text-accent" />
                    Monday-Friday, 8:00 AM - 5:00 PM
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/study/how-to-apply"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-accent text-accent-foreground font-body text-xs tracking-[0.14em] uppercase hover:bg-accent/90 transition-colors duration-300"
                    >
                      Open Application Portal <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : isInstitutes ? (
          <>
            <section className="relative max-w-6xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {institutesStats.map((stat) => (
                <article
                  key={stat.label}
                  className="group border border-border/60 rounded-[20px] p-5 bg-gradient-to-br from-background to-secondary/20 transition-all duration-400 hover:border-accent/45 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
                >
                  <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <p className="font-heading text-3xl md:text-4xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
                    {stat.value}
                  </p>
                </article>
              ))}
            </section>

            <section
              id="institutes-showcase"
              className="relative max-w-6xl mx-auto mt-10 border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <Building2 size={18} className="text-accent" />
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                  Institute Showcase
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutesList.map((institute) => (
                  <article
                    key={institute.name}
                    className="group border border-border/50 rounded-[20px] p-5 bg-gradient-to-br from-background to-secondary/10 transition-all duration-500 hover:border-accent/45 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]"
                  >
                    <p className="font-body text-[10px] tracking-[0.16em] uppercase text-accent mb-2">
                      Research Institute
                    </p>
                    <h2 className="font-heading text-2xl font-light text-foreground mb-3 leading-tight group-hover:text-accent transition-colors duration-300">
                      {institute.name}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {institute.summary}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="relative max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
              <article className="lg:col-span-3 border border-border/60 rounded-[24px] p-6 md:p-8 bg-background/95 backdrop-blur-sm">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                  Strategic Pillars
                </p>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground leading-[0.95] mb-6">
                  Built for future-defining impact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {institutesPillars.map((pillar) => {
                    const PillarIcon = pillarIconMap[pillar.title] || FlaskConical;
                    return (
                    <article
                      key={pillar.title}
                      className="group border border-border/50 rounded-[18px] p-4 bg-background/90"
                    >
                      <div className="w-9 h-9 rounded-[11px] border border-accent/30 bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/18 transition-colors duration-300">
                        <PillarIcon size={15} className="text-accent" />
                      </div>
                      <h3 className="font-heading text-2xl font-light text-foreground mb-2">
                        {pillar.title}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {pillar.detail}
                      </p>
                    </article>
                    );
                  })}
                </div>
              </article>

              <article className="lg:col-span-2 border border-border/60 rounded-[24px] p-6 md:p-8 bg-gradient-to-br from-background to-secondary/25">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                  Milestones
                </p>
                <div className="space-y-4">
                  {institutesMilestones.map((milestone) => (
                    <div
                      key={milestone.year}
                      className="border border-border/50 rounded-[16px] p-4 bg-background/80"
                    >
                      <p className="font-heading text-xl font-light text-accent mb-1">
                        {milestone.year}
                      </p>
                      <p className="font-body text-sm text-foreground leading-relaxed">
                        {milestone.event}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section
              id="institutes-partner"
              className="relative max-w-6xl mx-auto mt-10 border border-border/60 rounded-[24px] p-6 md:p-8 bg-gradient-to-br from-background to-secondary/25"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                    Collaborate With Us
                  </p>
                  <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground leading-[0.95] mb-4">
                    Partner with our institutes
                  </h2>
                  <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                    Co-create research, pilot innovation, and build impact
                    programs with our institute network across public and
                    private sectors.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <Mail size={14} className="text-accent" />
                    institutes@institute.ac.ug
                  </p>
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <Phone size={14} className="text-accent" />
                    +256 700 654 321
                  </p>
                  <p className="font-body text-sm text-foreground inline-flex items-center gap-2">
                    <MapPin size={14} className="text-accent" />
                    Institute Cluster, Innovation District
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Link
                      to="/study/how-to-apply"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-accent text-accent-foreground font-body text-xs tracking-[0.14em] uppercase hover:bg-accent/90 transition-colors duration-300"
                    >
                      Start Application <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/study/recent-announcements"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] border border-accent/35 text-accent font-body text-xs tracking-[0.14em] uppercase hover:bg-accent/10 transition-colors duration-300"
                    >
                      View Announcements <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : isHowToApply ? (
          <>
            <section className="relative max-w-6xl mx-auto mt-8 border border-border/60 rounded-[28px] bg-gradient-to-br from-background via-background to-secondary/25 p-6 md:p-9">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                    Online Application Portal
                  </p>
                  <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground leading-[0.95] mb-4">
                    Apply in 3 guided steps
                  </h2>
                  <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                    Complete your profile, choose your program, and submit your
                    statement. You can finish in under 10 minutes.
                  </p>

                  <div className="space-y-3">
                    {[1, 2, 3].map((stepNumber) => (
                      <div
                        key={stepNumber}
                        className={`flex items-center gap-3 border rounded-[14px] px-3 py-2.5 transition-all duration-300 ${
                          applicationStep === stepNumber
                            ? "border-accent/50 bg-accent/10"
                            : "border-border/60"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-body ${
                            applicationStep >= stepNumber
                              ? "bg-accent text-accent-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {stepNumber}
                        </span>
                        <span className="font-body text-xs uppercase tracking-[0.12em] text-foreground">
                          {stepNumber === 1 && "Personal Details"}
                          {stepNumber === 2 && "Program Selection"}
                          {stepNumber === 3 && "Statement & Submit"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 border border-border/60 rounded-[22px] p-5 md:p-6 bg-background/90">
                  {formSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-full bg-accent/15 mx-auto flex items-center justify-center mb-4">
                        <CheckCircle2 size={28} className="text-accent" />
                      </div>
                      <h3 className="font-heading text-3xl font-light text-foreground mb-3">
                        Application Submitted
                      </h3>
                      <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto mb-6">
                        Thank you, {applicationData.firstName}. Your application
                        for {applicationData.preferredProgram} has been
                        received. Admissions will contact you via{" "}
                        {applicationData.email}.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={startNewApplication}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] border border-accent/40 text-accent font-body text-xs tracking-[0.14em] uppercase hover:bg-accent/10 transition-colors duration-300"
                        >
                          Start New Application
                        </button>
                        <Link
                          to="/study/join-admissions"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-accent text-accent-foreground font-body text-xs tracking-[0.14em] uppercase hover:bg-accent/90 transition-colors duration-300"
                        >
                          Back to Admissions <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      {applicationStep === 1 && (
                        <div>
                          <h3 className="font-heading text-3xl font-light text-foreground mb-5">
                            Personal details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="space-y-2">
                              <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                First Name
                              </span>
                              <input
                                value={applicationData.firstName}
                                onChange={(event) =>
                                  updateApplicationData(
                                    "firstName",
                                    event.target.value,
                                  )
                                }
                                className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Last Name
                              </span>
                              <input
                                value={applicationData.lastName}
                                onChange={(event) =>
                                  updateApplicationData(
                                    "lastName",
                                    event.target.value,
                                  )
                                }
                                className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Email
                              </span>
                              <input
                                type="email"
                                value={applicationData.email}
                                onChange={(event) =>
                                  updateApplicationData(
                                    "email",
                                    event.target.value,
                                  )
                                }
                                className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Phone Number
                              </span>
                              <input
                                value={applicationData.phone}
                                onChange={(event) =>
                                  updateApplicationData(
                                    "phone",
                                    event.target.value,
                                  )
                                }
                                className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              />
                            </label>
                            <label className="space-y-2 md:col-span-2">
                              <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Nationality
                              </span>
                              <input
                                value={applicationData.nationality}
                                onChange={(event) =>
                                  updateApplicationData(
                                    "nationality",
                                    event.target.value,
                                  )
                                }
                                className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      {applicationStep === 2 && (
                        <div>
                          <h3 className="font-heading text-3xl font-light text-foreground mb-5">
                            Program selection
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="space-y-2">
                              <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Program Level
                              </span>
                              <select
                                value={applicationData.programLevel}
                                onChange={(event) =>
                                  updateApplicationData(
                                    "programLevel",
                                    event.target.value,
                                  )
                                }
                                className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              >
                                <option value="">Select level</option>
                                {levelOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Intake
                              </span>
                              <select
                                value={applicationData.intake}
                                onChange={(event) =>
                                  updateApplicationData(
                                    "intake",
                                    event.target.value,
                                  )
                                }
                                className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              >
                                <option value="">Select intake</option>
                                {intakeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-2 md:col-span-2">
                              <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Preferred Program
                              </span>
                              <select
                                value={applicationData.preferredProgram}
                                onChange={(event) =>
                                  updateApplicationData(
                                    "preferredProgram",
                                    event.target.value,
                                  )
                                }
                                className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              >
                                <option value="">Select program</option>
                                {programOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>
                      )}

                      {applicationStep === 3 && (
                        <div>
                          <h3 className="font-heading text-3xl font-light text-foreground mb-5">
                            Statement and declaration
                          </h3>
                          <label className="space-y-2 block mb-4">
                            <span className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground">
                              Why do you want to join this program?
                            </span>
                            <textarea
                              value={applicationData.statement}
                              onChange={(event) =>
                                updateApplicationData(
                                  "statement",
                                  event.target.value,
                                )
                              }
                              rows={6}
                              className="w-full border border-border/60 rounded-[14px] px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent/45"
                              placeholder="Write at least 80 characters..."
                            />
                            <span className="font-body text-[11px] text-muted-foreground">
                              {applicationData.statement.length} / 80 minimum
                            </span>
                          </label>

                          <label className="inline-flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={applicationData.agreePolicy}
                              onChange={(event) =>
                                updateApplicationData(
                                  "agreePolicy",
                                  event.target.checked,
                                )
                              }
                              className="mt-1"
                            />
                            <span className="font-body text-sm text-muted-foreground leading-relaxed">
                              I confirm that the information provided is
                              accurate and I agree to the admissions policy and
                              verification procedures.
                            </span>
                          </label>
                        </div>
                      )}

                      {formError && (
                        <p className="mt-4 text-sm text-destructive font-body">
                          {formError}
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handlePreviousStep}
                          disabled={applicationStep === 1}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] border border-border/70 text-foreground font-body text-xs tracking-[0.14em] uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent/40 hover:text-accent transition-colors duration-300"
                        >
                          Back
                        </button>

                        {applicationStep < 3 ? (
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-accent text-accent-foreground font-body text-xs tracking-[0.14em] uppercase hover:bg-accent/90 transition-colors duration-300"
                          >
                            Continue <ArrowRight size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmitApplication}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-accent text-accent-foreground font-body text-xs tracking-[0.14em] uppercase hover:bg-accent/90 transition-colors duration-300"
                          >
                            Submit Application <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "Overview",
              "Requirements",
              "Important Dates",
              "Downloads",
              "Contacts",
              "Frequently Asked Questions",
            ].map((block) => (
              <article
                key={block}
                className="border border-border rounded-[20px] p-5 bg-background transition-all duration-400 hover:border-accent/40 hover:bg-accent/5"
              >
                <h2 className="font-heading text-2xl font-light text-foreground mb-2">
                  {block}
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  This section for {item.title.toLowerCase()} is ready for your
                  institutional content and can be connected to your CMS or API.
                </p>
              </article>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudyItemPage;
