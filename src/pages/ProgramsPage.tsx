import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Heart,
  ArrowRight,
  Clock,
  DollarSign,
  GraduationCap,
  Calendar,
  X,
  Award,
  Building,
  Globe,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

type Program = {
  id: number; programName: string; programCode: string; programType: string;
  awardQualification: string; programDescription: string; programObjectives: string;
  learningOutcomes: string; careerOpportunities: string; status: string;
  facultySchool: string; department: string; programCoordinator: string; campus: string;
  duration: number; durationUnit: string; numberOfYears: number; numberOfSemesters: number;
  semestersPerYear: number; totalCreditUnits: number; studyMode: string; academicCalendar: string;
  fees: string; admissionRequirements: string; curriculum: string; intakes: string;
  studyOptions: string; accreditation: string; documents: string;
  imageUrl: string; shortDescription: string; fullDescription: string;
  featured: boolean; displayOrder: number; categoryNames: string[];
};

type ProgramCategory = {
  id: number; name: string; description: string; displayOrder: number;
  programs: { id: number; programName: string; programCode: string; programType: string }[];
};

type Course = { code: string; name: string; credits: number; type: string; prerequisites: string };
type ElectiveGroup = { groupName: string; requiredCount: number; courses: Course[] };
type SemesterData = { semester: number; courses: Course[]; electiveGroups?: ElectiveGroup[] };
type RecessTerm = { name: string; courses: Course[]; electiveGroups?: ElectiveGroup[] };
type YearData = { year: number; semesters: SemesterData[]; recessTerms?: RecessTerm[] };

type FeeSemester = { tuition: number; registration: number; examination: number; functional: number; ict: number; library: number; medical: number; accommodation: number; other: number; total: number; name?: string; termType?: string };
type FeeYear = { year: number; semesters: FeeSemester[] };

type CurriculumData = {
  curriculum_name?: string; version?: string; academic_year?: string;
  total_credit_units?: number; years?: YearData[];
};

type FeeData = { currency?: string; year_fees?: FeeYear[] };

type AdmissionData = {
  min_qualification?: string; min_grade?: string; required_subjects?: string;
  min_points?: string; direct_entry?: string; diploma_entry?: string;
  mature_age_entry?: string; international?: string; other?: string;
};

type IntakeData = { name?: string; month?: string; academic_year?: string; app_open?: string; app_close?: string; admission_start?: string; max_students?: number; status?: string };
type AccreditationData = { status?: string; body?: string; number?: string; date?: string; expiry?: string; document_url?: string };
type DocumentData = { type?: string; name?: string; url?: string };

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

const ProgramsPage = () => {
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement>(null);
  const [modalProgram, setModalProgram] = useState<Program | null>(null);
  const [modalTab, setModalTab] = useState<"overview" | "fees" | "curriculum" | "admission" | "intakes" | "accreditation" | "documents">("overview");

  const [heroTagline, setHeroTagline] = useState("What We Teach");
  const [heroHeading1, setHeroHeading1] = useState("Vocational Programs");
  const [heroHeading2, setHeroHeading2] = useState("That Build Real Futures");
  const [heroDescription, setHeroDescription] = useState("8 practical programs. Market-driven curricula. Every graduate leaves with skills to earn a living from day one.");
  const [sectionTagline, setSectionTagline] = useState("Our Programs");
  const [sectionHeading, setSectionHeading] = useState("Choose Your Path");
  const [sectionDescription, setSectionDescription] = useState("Click on any program to see skills, career outcomes, and how long it takes to complete.");

  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uncategorizedPrograms, setUncategorizedPrograms] = useState<Program[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch("http://localhost:8080/api/v1/content/site-settings")
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data.programs_hero_tagline) setHeroTagline(data.programs_hero_tagline);
        if (data.programs_hero_heading_1) setHeroHeading1(data.programs_hero_heading_1);
        if (data.programs_hero_heading_2) setHeroHeading2(data.programs_hero_heading_2);
        if (data.programs_hero_description) setHeroDescription(data.programs_hero_description);
        if (data.programs_section_tagline) setSectionTagline(data.programs_section_tagline);
        if (data.programs_section_heading) setSectionHeading(data.programs_section_heading);
        if (data.programs_section_description) setSectionDescription(data.programs_section_description);
      })
      .catch(() => {});

    Promise.all([
      fetch("http://localhost:8080/api/v1/programs").then(r => r.json()),
      fetch("http://localhost:8080/api/v1/programs/categories").then(r => r.json()),
    ])
      .then(([progs, cats]) => {
        const activeProgs = (progs as Program[]).filter(p => p.status === "Active");
        setPrograms(activeProgs);
        setCategories(cats as ProgramCategory[]);
        const categorizedIds = new Set((cats as ProgramCategory[]).flatMap(c => c.programs.map(p => p.id)));
        setUncategorizedPrograms(activeProgs.filter(p => !categorizedIds.has(p.id)));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    const ctx = gsap.context(() => {
      gsap.fromTo(".programs-hero-text > *", { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }, { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.18, ease: "power3.out", delay: 0.3 });
      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.querySelectorAll(".prog-card"), { y: 60, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.85, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: cardsRef.current, start: "top 82%", toggleActions: "play none none reverse" } });
      }
    });
    return () => ctx.revert();
  }, []);

  const openModal = (p: Program) => { setModalProgram(p); setModalTab("overview"); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setModalProgram(null); document.body.style.overflow = ""; };

  const getTotalFees = (p: Program): { total: number; currency: string } => {
    const fees = parseJson<FeeData>(p.fees, {});
    const total = (fees.year_fees || []).reduce((sum, yf) => sum + yf.semesters.reduce((s, sem) => s + (sem.total || 0), 0), 0);
    return { total, currency: fees.currency || "" };
  };

  const getCurriculumStats = (p: Program) => {
    const curr = parseJson<CurriculumData>(p.curriculum, {});
    const years = curr.years || [];
    let totalCourses = 0;
    let totalCredits = 0;
    let electiveGroupCount = 0;
    for (const y of years) {
      for (const sem of y.semesters) {
        totalCourses += sem.courses.length;
        totalCredits += sem.courses.reduce((s, c) => s + (c.credits || 0), 0);
        electiveGroupCount += (sem.electiveGroups || []).length;
      }
      for (const rt of (y.recessTerms || [])) {
        totalCourses += rt.courses.length;
        totalCredits += rt.courses.reduce((s, c) => s + (c.credits || 0), 0);
        electiveGroupCount += (rt.electiveGroups || []).length;
      }
    }
    return { years: years.length, totalCourses, totalCredits, electiveGroupCount };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[60vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img src={aboutHero} alt="Students learning vocational skills" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-primary/70 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 programs-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">{heroTagline}</p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-8 opacity-0">
            {heroHeading1}<br />{heroHeading2}
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">{heroDescription}</p>
        </div>
      </div>

      {/* Programs */}
      <div ref={cardsRef} className="px-8 md:px-16 py-24 md:py-32">
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{sectionTagline}</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">{sectionHeading}</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6 max-w-lg">{sectionDescription}</p>
        </div>

        {isLoading && <p className="font-body text-sm text-muted-foreground">Loading programs...</p>}
        {!isLoading && programs.length === 0 && <p className="font-body text-sm text-muted-foreground">No programs available yet.</p>}

        {uncategorizedPrograms.length > 0 && (
          <div className="mb-12">
            <h3 className="font-heading text-2xl font-light text-foreground mb-6">All Programs</h3>
            <div className="space-y-4">
              {uncategorizedPrograms.map(p => (
                <ProgramCard key={p.id} program={p} onClick={() => openModal(p)} feeInfo={getTotalFees(p)} stats={getCurriculumStats(p)} />
              ))}
            </div>
          </div>
        )}

        {categories.map(cat => {
          const catPrograms = cat.programs.map(cp => programs.find(p => p.id === cp.id)).filter(Boolean) as Program[];
          if (catPrograms.length === 0) return null;
          return (
            <div key={cat.id} className="mb-12">
              <h3 className="font-heading text-2xl font-light text-foreground mb-2">{cat.name}</h3>
              {cat.description && <p className="font-body text-sm text-muted-foreground mb-6">{cat.description}</p>}
              <div className="space-y-4">
                {catPrograms.map(p => (
                  <ProgramCard key={p.id} program={p} onClick={() => openModal(p)} feeInfo={getTotalFees(p)} stats={getCurriculumStats(p)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-8 md:px-16 py-24 bg-primary text-primary-foreground text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">Ready to Help?</p>
        <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-10 max-w-2xl mx-auto">Sponsor a Student's Journey</h2>
        <p className="font-body text-sm text-primary-foreground/60 max-w-lg mx-auto mb-10 leading-relaxed">For as little as $50 a month, you can sponsor a student through one of these life-changing programs.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate("/donate")} className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift">
            <Heart size={16} className="fill-current" /> Sponsor a Student
          </button>
          <button onClick={() => navigate("/contact")} className="group flex items-center gap-2 px-10 py-4 border border-primary-foreground/30 text-primary-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent btn-lift">
            Contact Us <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <Footer />

      {/* Detail Modal */}
      {modalProgram && <ProgramDetailModal program={modalProgram} tab={modalTab} onTabChange={setModalTab} onClose={closeModal} feeInfo={getTotalFees(modalProgram)} stats={getCurriculumStats(modalProgram)} />}
    </div>
  );
};

/* ──────────────────────────── Program Card ──────────────────────────── */

function ProgramCard({ program, onClick, feeInfo, stats }: { program: Program; onClick: () => void; feeInfo: { total: number; currency: string }; stats: { years: number; totalCourses: number; totalCredits: number; electiveGroupCount: number } }) {
  return (
    <button onClick={onClick} className="prog-card w-full text-left border border-border rounded-[20px] p-5 md:p-6 transition-all duration-500 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_hsl(var(--accent)/0.12)] cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading text-xl md:text-2xl font-light text-foreground group-hover:text-accent transition-colors duration-300 truncate">{program.programName}</h3>
            {program.programCode && <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded shrink-0">{program.programCode}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {program.programType && <span className="text-accent">{program.programType}</span>}
            {program.duration && <span className="flex items-center gap-1"><Clock size={12} /> {program.duration} {program.durationUnit || "years"}</span>}
            {stats.totalCredits > 0 && <span>{stats.totalCredits} credits</span>}
            {program.studyMode && <span>{program.studyMode}</span>}
            {feeInfo.total > 0 && <span className="flex items-center gap-1"><DollarSign size={12} /> {feeInfo.currency} {feeInfo.total.toLocaleString()}</span>}
          </div>
          {program.shortDescription && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{program.shortDescription}</p>}
        </div>
        <ChevronDown size={20} className="text-muted-foreground shrink-0 ml-4 group-hover:text-accent transition-colors" />
      </div>
    </button>
  );
}

/* ──────────────────────── Detail Modal ──────────────────────── */

function ProgramDetailModal({ program, tab, onTabChange, onClose, feeInfo, stats }: {
  program: Program; tab: string; onTabChange: (t: "overview" | "fees" | "curriculum" | "admission" | "intakes" | "accreditation" | "documents") => void;
  onClose: () => void; feeInfo: { total: number; currency: string }; stats: { years: number; totalCourses: number; totalCredits: number; electiveGroupCount: number };
}) {
  const tabs = ["overview", "fees", "curriculum", "admission", "intakes", "accreditation", "documents"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm rounded-t-3xl border-b border-border px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {program.programType && <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent border border-accent/30 px-3 py-1 rounded-full mb-3">{program.programType}</span>}
              <h2 className="font-heading text-3xl md:text-4xl font-light text-foreground leading-tight">{program.programName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                {program.programCode && <span className="font-mono bg-muted px-2 py-0.5 rounded">{program.programCode}</span>}
                {program.awardQualification && <span className="flex items-center gap-1"><Award size={12} /> {program.awardQualification}</span>}
                {program.facultySchool && <span className="flex items-center gap-1"><Building size={12} /> {program.facultySchool}</span>}
                {program.department && <span>{program.department}</span>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full border border-border hover:bg-muted transition-colors cursor-pointer shrink-0 ml-4"><X size={16} /></button>
          </div>

          {/* Quick facts bar */}
          <div className="flex flex-wrap gap-4 mt-5">
            {program.duration > 0 && <QuickFact icon={<Clock size={14} />} label={`${program.duration} ${program.durationUnit || "years"}`} />}
            {stats.totalCredits > 0 && <QuickFact icon={<Award size={14} />} label={`${stats.totalCredits} credits`} />}
            {stats.totalCourses > 0 && <QuickFact icon={<BookOpen size={14} />} label={`${stats.totalCourses} courses`} />}
            {program.studyMode && <QuickFact icon={<Building size={14} />} label={program.studyMode} />}
            {program.numberOfYears > 0 && <QuickFact icon={<Calendar size={14} />} label={`${program.numberOfYears} years, ${program.numberOfSemesters} semesters`} />}
            {feeInfo.total > 0 && <QuickFact icon={<DollarSign size={14} />} label={`${feeInfo.currency} ${feeInfo.total.toLocaleString()}`} />}
            {program.campus && <QuickFact icon={<Globe size={14} />} label={program.campus} />}
            {program.academicCalendar && <QuickFact icon={<Calendar size={14} />} label={program.academicCalendar} />}
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[180px] z-10 bg-card/95 backdrop-blur-sm border-b border-border px-8">
          <div className="flex gap-1 overflow-x-auto py-2 -mb-px">
            {tabs.map(t => (
              <button key={t} onClick={() => onTabChange(t as typeof tab)} className={`px-4 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8 md:p-10">

          {/* ─── Overview ─── */}
          {tab === "overview" && (
            <div className="space-y-8">
              {(program.fullDescription || program.programDescription) && (
                <Section title="About this Program">
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{program.fullDescription || program.programDescription}</div>
                </Section>
              )}
              {program.learningOutcomes && (
                <Section title="Learning Outcomes">
                  <div className="space-y-2">
                    {program.learningOutcomes.split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{line.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {program.programObjectives && (
                <Section title="Program Objectives">
                  <div className="space-y-2">
                    {program.programObjectives.split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{line.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {program.careerOpportunities && (
                <Section title="Career Opportunities">
                  <div className="space-y-2">
                    {program.careerOpportunities.split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ArrowRight size={14} className="text-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{line.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {program.programCoordinator && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <Users size={16} className="text-accent" />
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Program Coordinator</p>
                    <p className="text-sm font-medium">{program.programCoordinator}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Fees ─── */}
          {tab === "fees" && <FeesTab program={program} feeInfo={feeInfo} />}

          {/* ─── Curriculum ─── */}
          {tab === "curriculum" && <CurriculumTab program={program} />}

          {/* ─── Admission ─── */}
          {tab === "admission" && <AdmissionTab program={program} />}

          {/* ─── Intakes ─── */}
          {tab === "intakes" && <IntakesTab program={program} />}

          {/* ─── Accreditation ─── */}
          {tab === "accreditation" && <AccreditationTab program={program} />}

          {/* ─── Documents ─── */}
          {tab === "documents" && <DocumentsTab program={program} />}

          <div className="mt-8 pt-6 border-t border-border">
            <button onClick={onClose} className="font-body text-xs tracking-[0.15em] uppercase text-accent hover:text-foreground transition-colors cursor-pointer">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Reusable Components ──────────────────── */

function QuickFact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
      <span className="text-accent">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">{title}</h4>
      {children}
    </div>
  );
}

/* ──────────────────── Fees Tab ──────────────────── */

function FeesTab({ program, feeInfo }: { program: Program; feeInfo: { total: number; currency: string } }) {
  const fees = parseJson<FeeData>(program.fees, {});
  const yearFees = fees.year_fees || [];

  if (yearFees.length === 0 && feeInfo.total === 0) {
    return <p className="text-sm text-muted-foreground">No fee information available for this program.</p>;
  }

  return (
    <div className="space-y-6">
      <Section title="Fee Structure">
        <p className="text-sm text-muted-foreground mb-4">Fees are charged per semester. Contact the finance office for payment plans.</p>
      </Section>

      {yearFees.map((yf, yi) => (
        <div key={yi} className="border border-border rounded-2xl overflow-hidden">
          <div className="bg-muted/50 px-5 py-3 border-b border-border">
            <h4 className="text-sm font-semibold flex items-center gap-2"><Calendar size={14} className="text-accent" /> Year {yf.year}</h4>
          </div>
          <div className="divide-y divide-border">
            {yf.semesters.map((sem, si) => (
              <div key={si} className="px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">{sem.name || `Semester ${sem.semester || si + 1}`}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    ["Tuition", sem.tuition], ["Registration", sem.registration], ["Examination", sem.examination],
                    ["Functional", sem.functional], ["ICT / Technology", sem.ict], ["Library", sem.library],
                    ["Medical", sem.medical], ["Accommodation", sem.accommodation], ["Other", sem.other],
                  ].filter(([, v]) => v && v > 0).map(([label, amount]) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{feeInfo.currency} {(amount as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {sem.total > 0 && (
                  <div className="flex justify-between text-xs font-semibold mt-3 pt-2 border-t border-border/50">
                    <span>Semester Total</span>
                    <span className="text-accent">{feeInfo.currency} {sem.total.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {feeInfo.total > 0 && (
        <div className="flex justify-between items-center p-5 rounded-2xl bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">Total Program Fees</span>
          <span className="text-xl font-heading font-light text-primary">{feeInfo.currency} {feeInfo.total.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────── Curriculum Tab ──────────────────── */

function CurriculumTab({ program }: { program: Program }) {
  const curr = parseJson<CurriculumData>(program.curriculum, {});
  const years = curr.years || [];
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => new Set(years.length > 0 ? [years[0].year] : []));

  const toggleYear = (y: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(y)) next.delete(y); else next.add(y);
      return next;
    });
  };

  if (years.length === 0) {
    return <p className="text-sm text-muted-foreground">No curriculum information available.</p>;
  }

  const typeColor = (t: string) => {
    if (t === "Core") return "bg-accent/10 text-accent";
    if (t === "Elective") return "bg-violet-100 text-violet-700";
    if (t === "Audited") return "bg-amber-100 text-amber-700";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <Section title="Curriculum">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {curr.curriculum_name && <span className="bg-muted px-2 py-1 rounded">{curr.curriculum_name}</span>}
          {curr.version && <span className="bg-muted px-2 py-1 rounded">v{curr.version}</span>}
          {curr.academic_year && <span className="bg-muted px-2 py-1 rounded">{curr.academic_year}</span>}
        </div>
      </Section>

      {years.map(year => {
        const expanded = expandedYears.has(year.year);
        const yearCredits = year.semesters.reduce((s, sem) => s + sem.courses.reduce((s2, c) => s2 + (c.credits || 0), 0), 0)
          + (year.recessTerms || []).reduce((s, rt) => s + rt.courses.reduce((s2, c) => s2 + (c.credits || 0), 0), 0);
        const yearCourses = year.semesters.reduce((s, sem) => s + sem.courses.length, 0)
          + (year.recessTerms || []).reduce((s, rt) => s + rt.courses.length, 0);

        return (
          <div key={year.year} className="border border-border rounded-2xl overflow-hidden">
            <button onClick={() => toggleYear(year.year)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors cursor-pointer">
              <BookOpen size={16} className="text-accent shrink-0" />
              <span className="font-heading text-sm font-semibold flex-1">Year {year.year}</span>
              <span className="text-[10px] text-muted-foreground">{yearCourses} courses · {yearCredits} credits</span>
              {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            {expanded && (
              <div className="border-t border-border px-5 py-4 space-y-4">
                {year.semesters.map(sem => (
                  <div key={sem.semester}>
                    <p className="text-xs font-medium text-accent mb-2">Semester {sem.semester}</p>
                    <div className="space-y-1">
                      {sem.courses.map((cr, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm py-1.5">
                          <span className="font-mono text-xs text-accent w-24 shrink-0">{cr.code}</span>
                          <span className="flex-1 min-w-0 truncate">{cr.name}</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">{cr.credits} cr</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${typeColor(cr.type)}`}>{cr.type}</span>
                        </div>
                      ))}
                    </div>
                    {(sem.electiveGroups || []).map((group, gi) => (
                      <div key={gi} className="mt-3 border border-violet-200 bg-violet-50/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide">Elective Group</span>
                          {group.groupName && <span className="text-xs text-violet-700 font-medium">— {group.groupName}</span>}
                        </div>
                        <p className="text-[10px] text-violet-600 mb-2">Choose {group.requiredCount} from {group.courses.length} options</p>
                        <div className="space-y-1">
                          {group.courses.map((cr, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm py-1">
                              <span className="font-mono text-xs text-violet-500 w-24 shrink-0">{cr.code}</span>
                              <span className="flex-1 min-w-0 truncate text-violet-800">{cr.name}</span>
                              <span className="text-xs text-violet-500 w-12 text-right">{cr.credits} cr</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {(year.recessTerms || []).map((rt, ri) => (
                  <div key={`r${ri}`} className="border-t border-dashed border-border pt-3">
                    <p className="text-xs font-medium text-amber-600 mb-2">{rt.name || `Recess Term ${ri + 1}`}</p>
                    <div className="space-y-1">
                      {rt.courses.map((cr, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm py-1.5">
                          <span className="font-mono text-xs text-amber-500 w-24 shrink-0">{cr.code}</span>
                          <span className="flex-1 min-w-0 truncate">{cr.name}</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">{cr.credits} cr</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${typeColor(cr.type)}`}>{cr.type}</span>
                        </div>
                      ))}
                    </div>
                    {(rt.electiveGroups || []).map((group, gi) => (
                      <div key={gi} className="mt-3 border border-violet-200 bg-violet-50/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide">Elective Group</span>
                          {group.groupName && <span className="text-xs text-violet-700 font-medium">— {group.groupName}</span>}
                        </div>
                        <p className="text-[10px] text-violet-600 mb-2">Choose {group.requiredCount} from {group.courses.length} options</p>
                        <div className="space-y-1">
                          {group.courses.map((cr, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm py-1">
                              <span className="font-mono text-xs text-violet-500 w-24 shrink-0">{cr.code}</span>
                              <span className="flex-1 min-w-0 truncate text-violet-800">{cr.name}</span>
                              <span className="text-xs text-violet-500 w-12 text-right">{cr.credits} cr</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────── Admission Tab ──────────────────── */

function AdmissionTab({ program }: { program: Program }) {
  const adm = parseJson<AdmissionData>(program.admissionRequirements, {});
  const items = [
    ["Minimum Entry Qualification", adm.min_qualification], ["Minimum Grade", adm.min_grade],
    ["Required Subjects", adm.required_subjects], ["Minimum Points", adm.min_points],
    ["Direct Entry", adm.direct_entry], ["Diploma Entry", adm.diploma_entry],
    ["Mature Age Entry", adm.mature_age_entry], ["International Students", adm.international],
    ["Other Requirements", adm.other],
  ].filter(([, v]) => v && String(v).trim()) as [string, string][];

  if (items.length === 0) return <p className="text-sm text-muted-foreground">No admission requirements specified.</p>;

  return (
    <div className="space-y-4">
      <Section title="Admission Requirements">
        <div className="space-y-4">
          {items.map(([label, value]) => (
            <div key={label} className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-accent mb-1">{label}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ──────────────────── Intakes Tab ──────────────────── */

function IntakesTab({ program }: { program: Program }) {
  const intakes = parseJson<IntakeData[]>(program.intakes, []);

  if (intakes.length === 0) return <p className="text-sm text-muted-foreground">No intake information available.</p>;

  return (
    <div className="space-y-3">
      <Section title="Intake Periods">
        <div className="space-y-3">
          {intakes.map((ink, i) => (
            <div key={i} className="border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{ink.name || "Intake"}</h4>
                <span className={`text-[10px] px-3 py-1 rounded-full font-medium ${ink.status === "Open" ? "bg-emerald-100 text-emerald-700" : ink.status === "Upcoming" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{ink.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                {ink.month && <div className="flex items-center gap-1.5"><Calendar size={12} className="text-accent" /> {ink.month}</div>}
                {ink.academic_year && <div>{ink.academic_year}</div>}
                {ink.app_open && <div>Applications open: {ink.app_open}</div>}
                {ink.app_close && <div>Applications close: {ink.app_close}</div>}
                {ink.admission_start && <div>Admission starts: {ink.admission_start}</div>}
                {ink.max_students && <div className="flex items-center gap-1.5"><Users size={12} className="text-accent" /> Max {ink.max_students} students</div>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ──────────────────── Accreditation Tab ──────────────────── */

function AccreditationTab({ program }: { program: Program }) {
  const acc = parseJson<AccreditationData>(program.accreditation, {});

  if (!acc.status) return <p className="text-sm text-muted-foreground">No accreditation information available.</p>;

  return (
    <div className="space-y-4">
      <Section title="Accreditation">
        <div className="p-5 rounded-2xl bg-muted/50 border border-border space-y-3">
          {acc.status && (
            <div className="flex items-center gap-2 mb-2">
              {acc.status === "Accredited" ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-amber-500" />}
              <span className="text-sm font-semibold">{acc.status}</span>
            </div>
          )}
          {acc.body && <InfoRow label="Accreditation Body" value={acc.body} />}
          {acc.number && <InfoRow label="Accreditation Number" value={acc.number} />}
          {acc.date && <InfoRow label="Accreditation Date" value={acc.date} />}
          {acc.expiry && <InfoRow label="Expiry Date" value={acc.expiry} />}
        </div>
      </Section>
    </div>
  );
}

/* ──────────────────── Documents Tab ──────────────────── */

function DocumentsTab({ program }: { program: Program }) {
  const docs = parseJson<DocumentData[]>(program.documents, []);

  if (docs.length === 0) return <p className="text-sm text-muted-foreground">No documents available for this program.</p>;

  return (
    <div className="space-y-3">
      <Section title="Documents">
        <div className="space-y-2">
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
              <FileText size={16} className="text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-[10px] text-muted-foreground">{doc.type}</p>
              </div>
              {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline shrink-0">View</a>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ──────────────────── Info Row ──────────────────── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

export default ProgramsPage;
