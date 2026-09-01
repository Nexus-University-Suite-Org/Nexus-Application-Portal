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
} from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

type Program = {
  id: number;
  programName: string;
  programCode: string;
  programType: string;
  awardQualification: string;
  programDescription: string;
  programObjectives: string;
  learningOutcomes: string;
  careerOpportunities: string;
  status: string;
  facultySchool: string;
  department: string;
  programCoordinator: string;
  campus: string;
  duration: number;
  durationUnit: string;
  numberOfYears: number;
  numberOfSemesters: number;
  semestersPerYear: number;
  totalCreditUnits: number;
  studyMode: string;
  academicCalendar: string;
  fees: string;
  admissionRequirements: string;
  curriculum: string;
  intakes: string;
  studyOptions: string;
  accreditation: string;
  documents: string;
  imageUrl: string;
  shortDescription: string;
  fullDescription: string;
  featured: boolean;
  displayOrder: number;
  categoryNames: string[];
};

type ProgramCategory = {
  id: number;
  name: string;
  description: string;
  displayOrder: number;
  programs: { id: number; programName: string; programCode: string; programType: string }[];
};

type FeeData = {
  tuition?: number; registration?: number; examination?: number;
  functional?: number; ict?: number; library?: number;
  medical?: number; accommodation?: number; other?: number;
  total?: number; currency?: string;
  fee_structure?: Record<string, Record<string, number>>;
};

type CurriculumData = {
  curriculum_name?: string; version?: string; academic_year?: string;
  total_credit_units?: number;
  years?: { year: number; semesters: { semester: number; courses: { code: string; name: string; credits: number; type: string; prerequisites: string }[] }[] }[];
};

type AdmissionData = {
  min_qualification?: string; min_grade?: string; required_subjects?: string;
  min_points?: string; direct_entry?: string; diploma_entry?: string;
  mature_age_entry?: string; international?: string; other?: string;
};

type IntakeData = {
  name?: string; month?: string; academic_year?: string;
  app_open?: string; app_close?: string; admission_start?: string;
  max_students?: number; status?: string;
};

type AccreditationData = {
  status?: string; body?: string; number?: string;
  date?: string; expiry?: string; document_url?: string;
};

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

const ProgramsPage = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [modalProgram, setModalProgram] = useState<Program | null>(null);
  const [modalTab, setModalTab] = useState<"overview" | "fees" | "curriculum" | "admission" | "intakes" | "accreditation">("overview");

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
      .then((r) => r.json())
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
      gsap.fromTo(
        ".programs-hero-text > *",
        { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.18, ease: "power3.out", delay: 0.3 },
      );
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.querySelectorAll(".prog-card"),
          { y: 60, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.85, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: cardsRef.current, start: "top 82%", toggleActions: "play none none reverse" } },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const openModal = (p: Program) => { setModalProgram(p); setModalTab("overview"); };
  const closeModal = () => setModalProgram(null);

  const getFeeTotal = (p: Program) => {
    const fees = parseJson<FeeData>(p.fees, {});
    return fees.total ? `${fees.currency || ""} ${fees.total.toLocaleString()}` : null;
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

        {/* Uncategorized programs */}
        {uncategorizedPrograms.length > 0 && (
          <div className="mb-12">
            <h3 className="font-heading text-2xl font-light text-foreground mb-6">All Programs</h3>
            <div className="space-y-4">
              {uncategorizedPrograms.map(p => (
                <ProgramCard key={p.id} program={p} onClick={() => openModal(p)} feeTotal={getFeeTotal(p)} />
              ))}
            </div>
          </div>
        )}

        {/* Category sections */}
        {categories.map(cat => {
          const catPrograms = cat.programs
            .map(cp => programs.find(p => p.id === cp.id))
            .filter(Boolean) as Program[];
          if (catPrograms.length === 0) return null;
          return (
            <div key={cat.id} className="mb-12">
              <h3 className="font-heading text-2xl font-light text-foreground mb-2">{cat.name}</h3>
              {cat.description && <p className="font-body text-sm text-muted-foreground mb-6">{cat.description}</p>}
              <div className="space-y-4">
                {catPrograms.map(p => (
                  <ProgramCard key={p.id} program={p} onClick={() => openModal(p)} feeTotal={getFeeTotal(p)} />
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
      {modalProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-8 md:p-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  {modalProgram.programType && <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent border border-accent/30 px-3 py-1 rounded-full mb-3">{modalProgram.programType}</span>}
                  <h2 className="font-heading text-3xl md:text-4xl font-light text-foreground leading-tight">{modalProgram.programName}</h2>
                  {modalProgram.programCode && <p className="font-body text-xs text-muted-foreground mt-2">Code: {modalProgram.programCode}</p>}
                </div>
                <button onClick={closeModal} className="p-2 rounded-full border border-border hover:bg-muted transition-colors cursor-pointer shrink-0"><X size={16} /></button>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {modalProgram.duration && <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-accent" /><span>{modalProgram.duration} {modalProgram.durationUnit || "years"}</span></div>}
                {modalProgram.totalCreditUnits && <div className="flex items-center gap-2 text-sm"><Award size={14} className="text-accent" /><span>{modalProgram.totalCreditUnits} credits</span></div>}
                {modalProgram.studyMode && <div className="flex items-center gap-2 text-sm"><Building size={14} className="text-accent" /><span>{modalProgram.studyMode}</span></div>}
                {getFeeTotal(modalProgram) && <div className="flex items-center gap-2 text-sm"><DollarSign size={14} className="text-accent" /><span>{getFeeTotal(modalProgram)}</span></div>}
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 border-b border-border pb-2 mb-6">
                {(["overview", "fees", "curriculum", "admission", "intakes", "accreditation"] as const).map(tab => (
                  <button key={tab} onClick={() => setModalTab(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${modalTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{tab}</button>
                ))}
              </div>

              {/* Tab content */}
              {modalTab === "overview" && (
                <div className="space-y-6">
                  {modalProgram.shortDescription && <p className="text-sm text-muted-foreground leading-relaxed">{modalProgram.shortDescription}</p>}
                  {modalProgram.fullDescription && <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{modalProgram.fullDescription}</div>}
                  {modalProgram.programDescription && !modalProgram.fullDescription && <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{modalProgram.programDescription}</div>}
                  {modalProgram.learningOutcomes && (
                    <div><h4 className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">Learning Outcomes</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{modalProgram.learningOutcomes}</p></div>
                  )}
                  {modalProgram.careerOpportunities && (
                    <div><h4 className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">Career Opportunities</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{modalProgram.careerOpportunities}</p></div>
                  )}
                  {modalProgram.awardQualification && <p className="text-sm"><span className="text-muted-foreground">Award:</span> <span className="font-medium">{modalProgram.awardQualification}</span></p>}
                  {modalProgram.facultySchool && <p className="text-sm"><span className="text-muted-foreground">Faculty:</span> <span className="font-medium">{modalProgram.facultySchool}</span></p>}
                  {modalProgram.department && <p className="text-sm"><span className="text-muted-foreground">Department:</span> <span className="font-medium">{modalProgram.department}</span></p>}
                </div>
              )}

              {modalTab === "fees" && (() => {
                const fees = parseJson<FeeData>(modalProgram.fees, {});
                const feeItems = [
                  ["Tuition", fees.tuition], ["Registration", fees.registration], ["Examination", fees.examination],
                  ["Functional", fees.functional], ["ICT / Technology", fees.ict], ["Library", fees.library],
                  ["Medical", fees.medical], ["Accommodation", fees.accommodation], ["Other", fees.other],
                ].filter(([, v]) => v && v > 0) as [string, number][];
                return (
                  <div className="space-y-4">
                    {feeItems.map(([label, amount]) => (
                      <div key={label} className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-medium">{fees.currency || ""} {amount.toLocaleString()}</span></div>
                    ))}
                    {fees.total && <div className="flex justify-between text-sm font-semibold border-t border-border pt-3"><span>Total</span><span>{fees.currency || ""} {fees.total.toLocaleString()}</span></div>}
                    {feeItems.length === 0 && <p className="text-sm text-muted-foreground">No fee information available.</p>}
                  </div>
                );
              })()}

              {modalTab === "curriculum" && (() => {
                const curr = parseJson<CurriculumData>(modalProgram.curriculum, {});
                return (
                  <div className="space-y-4">
                    {curr.curriculum_name && <p className="text-sm font-medium">{curr.curriculum_name} {curr.version && `(v${curr.version})`}</p>}
                    {curr.years?.map(year => (
                      <div key={year.year} className="border border-border rounded-xl p-4 space-y-3">
                        <h4 className="text-sm font-semibold">Year {year.year}</h4>
                        {year.semesters.map(sem => (
                          <div key={sem.semester} className="ml-4 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Semester {sem.semester}</p>
                            {sem.courses.map((cr, i) => (
                              <div key={i} className="flex items-center gap-3 ml-4 text-sm">
                                <span className="font-mono text-xs text-accent w-20">{cr.code}</span>
                                <span className="flex-1">{cr.name}</span>
                                <span className="text-xs text-muted-foreground">{cr.credits} cr</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${cr.type === "Core" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{cr.type}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                    {(!curr.years || curr.years.length === 0) && <p className="text-sm text-muted-foreground">No curriculum information available.</p>}
                  </div>
                );
              })()}

              {modalTab === "admission" && (() => {
                const adm = parseJson<AdmissionData>(modalProgram.admissionRequirements, {});
                const items = [
                  ["Minimum Entry Qualification", adm.min_qualification], ["Minimum Grade", adm.min_grade],
                  ["Required Subjects", adm.required_subjects], ["Minimum Points", adm.min_points],
                  ["Direct Entry", adm.direct_entry], ["Diploma Entry", adm.diploma_entry],
                  ["Mature Age Entry", adm.mature_age_entry], ["International Students", adm.international],
                  ["Other Requirements", adm.other],
                ].filter(([, v]) => v && String(v).trim()) as [string, string][];
                return (
                  <div className="space-y-3">
                    {items.map(([label, value]) => (
                      <div key={label}><p className="text-xs font-medium text-accent mb-1">{label}</p><p className="text-sm text-muted-foreground">{value}</p></div>
                    ))}
                    {items.length === 0 && <p className="text-sm text-muted-foreground">No admission requirements specified.</p>}
                  </div>
                );
              })()}

              {modalTab === "intakes" && (() => {
                const intakes = parseJson<IntakeData[]>(modalProgram.intakes, []);
                return (
                  <div className="space-y-3">
                    {intakes.map((ink, i) => (
                      <div key={i} className="border border-border rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{ink.name || "Intake"}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${ink.status === "Open" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{ink.status}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {ink.month && <span className="flex items-center gap-1"><Calendar size={12} /> {ink.month}</span>}
                          {ink.academic_year && <span>{ink.academic_year}</span>}
                          {ink.max_students && <span>Max {ink.max_students} students</span>}
                        </div>
                      </div>
                    ))}
                    {intakes.length === 0 && <p className="text-sm text-muted-foreground">No intake information available.</p>}
                  </div>
                );
              })()}

              {modalTab === "accreditation" && (() => {
                const acc = parseJson<AccreditationData>(modalProgram.accreditation, {});
                return (
                  <div className="space-y-3">
                    {acc.status && <p className="text-sm"><span className="text-muted-foreground">Status:</span> <span className="font-medium">{acc.status}</span></p>}
                    {acc.body && <p className="text-sm"><span className="text-muted-foreground">Body:</span> <span className="font-medium">{acc.body}</span></p>}
                    {acc.number && <p className="text-sm"><span className="text-muted-foreground">Number:</span> <span className="font-medium">{acc.number}</span></p>}
                    {acc.date && <p className="text-sm"><span className="text-muted-foreground">Date:</span> <span className="font-medium">{acc.date}</span></p>}
                    {acc.expiry && <p className="text-sm"><span className="text-muted-foreground">Expiry:</span> <span className="font-medium">{acc.expiry}</span></p>}
                    {!acc.status && <p className="text-sm text-muted-foreground">No accreditation information available.</p>}
                  </div>
                );
              })()}

              <div className="mt-8 pt-6 border-t border-border">
                <button onClick={closeModal} className="font-body text-xs tracking-[0.15em] uppercase text-accent hover:text-foreground transition-colors cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ProgramCard({ program, onClick, feeTotal }: { program: Program; onClick: () => void; feeTotal: string | null }) {
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
            {program.totalCreditUnits && <span>{program.totalCreditUnits} credits</span>}
            {program.studyMode && <span>{program.studyMode}</span>}
            {feeTotal && <span className="flex items-center gap-1"><DollarSign size={12} /> {feeTotal}</span>}
          </div>
          {program.shortDescription && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{program.shortDescription}</p>}
        </div>
        <ChevronDown size={20} className="text-muted-foreground shrink-0 ml-4 group-hover:text-accent transition-colors" />
      </div>
    </button>
  );
}

export default ProgramsPage;
