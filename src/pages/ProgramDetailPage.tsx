import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen, ChevronDown, ChevronUp, ArrowLeft, ArrowRight,
  Clock, Banknote, Award, Calendar, Globe, Users, Building,
  CheckCircle2, AlertCircle, FileText,
} from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";

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

type Course = { code: string; name: string; credits: number; type: string; prerequisites: string };
type ElectiveGroup = { groupName: string; requiredCount: number; courses: Course[] };
type SemesterData = { semester: number; courses: Course[]; electiveGroups?: ElectiveGroup[] };
type RecessTerm = { name: string; courses: Course[]; electiveGroups?: ElectiveGroup[] };
type YearData = { year: number; semesters: SemesterData[]; recessTerms?: RecessTerm[] };
type FeeSemester = { tuition: number; registration: number; examination: number; functional: number; ict: number; library: number; medical: number; accommodation: number; other: number; total: number; name?: string; termType?: string };
type FeeYear = { year: number; semesters: FeeSemester[] };
type CurriculumData = { curriculum_name?: string; version?: string; academic_year?: string; total_credit_units?: number; years?: YearData[] };
type FeeData = { currency?: string; year_fees?: FeeYear[] };
type AdmissionData = { min_qualification?: string; min_grade?: string; required_subjects?: string; min_points?: string; direct_entry?: string; diploma_entry?: string; mature_age_entry?: string; international?: string; other?: string };
type IntakeData = { name?: string; month?: string; academic_year?: string; app_open?: string; app_close?: string; admission_start?: string; max_students?: number; status?: string };
type AccreditationData = { status?: string; body?: string; number?: string; date?: string; expiry?: string; document_url?: string };
type DocumentData = { type?: string; name?: string; url?: string };

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

type Tab = "overview" | "fees" | "curriculum" | "admission" | "intakes" | "accreditation" | "documents";

const ProgramDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) { setNotFound(true); setLoading(false); return; }

    fetch(`http://localhost:8080/api/v1/programs/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: Program) => { setProgram(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!program) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".detail-hero-content > *", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.15 });
      gsap.fromTo(".detail-tab-content", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.4 });
    });
    return () => ctx.revert();
  }, [program]);

  const getTotalFees = (p: Program): { total: number; currency: string } => {
    const fees = parseJson<FeeData>(p.fees, {});
    const total = (fees.year_fees || []).reduce((sum, yf) => sum + yf.semesters.reduce((s, sem) => s + (sem.total || 0), 0), 0);
    return { total, currency: fees.currency || "" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground">Loading program...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !program) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <p className="font-heading text-3xl font-light text-foreground">Program Not Found</p>
          <button onClick={() => navigate("/programs")} className="flex items-center gap-2 text-sm text-accent hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft size={16} /> Back to Programs
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const feeInfo = getTotalFees(program);
  const fees = parseJson<FeeData>(program.fees, {});
  const curr = parseJson<CurriculumData>(program.curriculum, {});
  const years = curr.years || [];
  const adm = parseJson<AdmissionData>(program.admissionRequirements, {});
  const intakes = parseJson<IntakeData[]>(program.intakes, []);
  const acc = parseJson<AccreditationData>(program.accreditation, {});
  const docs = parseJson<DocumentData[]>(program.documents, []);

  const quickFacts: { icon: React.ReactNode; label: string }[] = [];
  if (program.duration > 0) quickFacts.push({ icon: <Clock size={14} />, label: `${program.duration} ${program.durationUnit || "years"}` });
  if (program.numberOfYears > 0) quickFacts.push({ icon: <Calendar size={14} />, label: `${program.numberOfYears} years, ${program.numberOfSemesters} semesters` });
  if (program.studyMode) quickFacts.push({ icon: <Building size={14} />, label: program.studyMode });
  if (feeInfo.total > 0) quickFacts.push({ icon: <Banknote size={14} />, label: `${feeInfo.currency} ${feeInfo.total.toLocaleString()}` });
  if (program.campus) quickFacts.push({ icon: <Globe size={14} />, label: program.campus });
  if (program.academicCalendar) quickFacts.push({ icon: <Calendar size={14} />, label: program.academicCalendar });

  const typeColor = (t: string) => {
    if (t === "Core") return "bg-accent/10 text-accent";
    if (t === "Elective") return "bg-violet-100 text-violet-700";
    if (t === "Audited") return "bg-amber-100 text-amber-700";
    return "bg-muted text-muted-foreground";
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "fees", label: "Fees" },
    { key: "curriculum", label: "Curriculum" },
    { key: "admission", label: "Admission" },
    { key: "intakes", label: "Intakes" },
    { key: "accreditation", label: "Accreditation" },
    { key: "documents", label: "Documents" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[50vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden">
          <img src={aboutHero} alt={program.programName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/70" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-16 pt-32 detail-hero-content max-w-5xl w-full">
          <button onClick={() => navigate("/programs")} className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary-foreground/60 hover:text-primary-foreground transition-colors mb-8 cursor-pointer">
            <ArrowLeft size={14} /> All Programs
          </button>

          {program.programType && (
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-accent border border-accent/30 px-3 py-1 rounded-full mb-4">{program.programType}</span>
          )}

          <h1 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-4">{program.programName}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {program.programCode && <span className="font-mono text-xs bg-primary-foreground/10 text-primary-foreground/80 px-2.5 py-1 rounded">{program.programCode}</span>}
            {program.awardQualification && <span className="text-xs text-primary-foreground/70 flex items-center gap-1"><Award size={12} /> {program.awardQualification}</span>}
            {program.facultySchool && <span className="text-xs text-primary-foreground/70 flex items-center gap-1"><Building size={12} /> {program.facultySchool}</span>}
            {program.department && <span className="text-xs text-primary-foreground/70">{program.department}</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            {quickFacts.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs bg-primary-foreground/10 text-primary-foreground/80 px-3 py-1.5 rounded-full">
                <span className="text-accent">{f.icon}</span> {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="max-w-5xl mx-auto px-8 md:px-16 py-12">
        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto border-b border-border mb-10 pb-px">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors cursor-pointer ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{t.label}</button>
          ))}
        </div>

        <div className="detail-tab-content">

          {/* ─── Overview ─── */}
          {tab === "overview" && (
            <div className="space-y-10">
              {(program.fullDescription || program.programDescription) && (
                <Section title="About this Program">
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{program.fullDescription || program.programDescription}</div>
                </Section>
              )}
              {program.learningOutcomes && (
                <Section title="Learning Outcomes">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {program.learningOutcomes.split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                        <CheckCircle2 size={15} className="text-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{line.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {program.programObjectives && (
                <Section title="Program Objectives">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {program.programObjectives.split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                        <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{line.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {program.careerOpportunities && (
                <Section title="Career Opportunities">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {program.careerOpportunities.split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                        <ArrowRight size={15} className="text-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{line.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {program.programCoordinator && (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/50 border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users size={18} className="text-primary" /></div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Program Coordinator</p>
                    <p className="text-sm font-medium">{program.programCoordinator}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Fees ─── */}
          {tab === "fees" && (
            <div className="space-y-8">
              <Section title="Fee Structure">
                <p className="text-sm text-muted-foreground mb-2">Fees are charged per semester. Contact the finance office for payment plans.</p>
              </Section>

              {(fees.year_fees || []).map((yf, yi) => (
                <div key={yi} className="border border-border rounded-2xl overflow-hidden">
                  <div className="bg-muted/50 px-6 py-3.5 border-b border-border">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><Calendar size={15} className="text-accent" /> Year {yf.year}</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {yf.semesters.map((sem, si) => (
                      <div key={si} className="px-6 py-5">
                        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-3">{sem.name || `Semester ${si + 1}`}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                          {([ ["Tuition", sem.tuition], ["Registration", sem.registration], ["Examination", sem.examination], ["Functional", sem.functional], ["ICT / Technology", sem.ict], ["Library", sem.library], ["Medical", sem.medical], ["Accommodation", sem.accommodation], ["Other", sem.other] ] as const).filter(([, v]) => v && v > 0).map(([label, amount]) => (
                            <div key={label} className="flex justify-between text-xs py-1">
                              <span className="text-muted-foreground">{label}</span>
                              <span className="font-medium">{feeInfo.currency} {(amount as number).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        {sem.total > 0 && (
                          <div className="flex justify-between text-sm font-semibold mt-4 pt-3 border-t border-border/50">
                            <span>Semester {si + 1} Total</span>
                            <span className="text-accent">{feeInfo.currency} {sem.total.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {feeInfo.total > 0 && (
                <div className="flex justify-between items-center p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <span className="text-sm font-medium">Total Program Fees</span>
                  <span className="text-2xl font-heading font-light text-primary">{feeInfo.currency} {feeInfo.total.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* ─── Curriculum ─── */}
          {tab === "curriculum" && (
            <CurriculumSection years={years} curr={curr} />
          )}

          {/* ─── Admission ─── */}
          {tab === "admission" && (
            <div className="space-y-4">
              <Section title="Admission Requirements">
                {([ ["Minimum Entry Qualification", adm.min_qualification], ["Minimum Grade", adm.min_grade], ["Required Subjects", adm.required_subjects], ["Minimum Points", adm.min_points], ["Direct Entry", adm.direct_entry], ["Diploma Entry", adm.diploma_entry], ["Mature Age Entry", adm.mature_age_entry], ["International Students", adm.international], ["Other Requirements", adm.other] ] as const).filter(([, v]) => v && String(v).trim()).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No admission requirements specified.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {([ ["Minimum Entry Qualification", adm.min_qualification], ["Minimum Grade", adm.min_grade], ["Required Subjects", adm.required_subjects], ["Minimum Points", adm.min_points], ["Direct Entry", adm.direct_entry], ["Diploma Entry", adm.diploma_entry], ["Mature Age Entry", adm.mature_age_entry], ["International Students", adm.international], ["Other Requirements", adm.other] ] as const).filter(([, v]) => v && String(v).trim()).map(([label, value]) => (
                      <div key={label} className="p-5 rounded-2xl bg-muted/50 border border-border">
                        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-accent mb-1.5">{label}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* ─── Intakes ─── */}
          {tab === "intakes" && (
            <div className="space-y-4">
              <Section title="Intake Periods">
                {intakes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No intake information available.</p>
                ) : (
                  <div className="space-y-4">
                    {intakes.map((ink, i) => (
                      <div key={i} className="border border-border rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold">{ink.name || "Intake"}</h4>
                          <span className={`text-[10px] px-3 py-1 rounded-full font-medium ${ink.status === "Open" ? "bg-emerald-100 text-emerald-700" : ink.status === "Upcoming" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{ink.status}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
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
                )}
              </Section>
            </div>
          )}

          {/* ─── Accreditation ─── */}
          {tab === "accreditation" && (
            <div className="space-y-4">
              <Section title="Accreditation">
                {!acc.status ? (
                  <p className="text-sm text-muted-foreground">No accreditation information available.</p>
                ) : (
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border space-y-4 max-w-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {acc.status === "Accredited" ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-amber-500" />}
                      <span className="text-base font-semibold">{acc.status}</span>
                    </div>
                    {acc.body && <InfoRow label="Accreditation Body" value={acc.body} />}
                    {acc.number && <InfoRow label="Accreditation Number" value={acc.number} />}
                    {acc.date && <InfoRow label="Accreditation Date" value={acc.date} />}
                    {acc.expiry && <InfoRow label="Expiry Date" value={acc.expiry} />}
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* ─── Documents ─── */}
          {tab === "documents" && (
            <div className="space-y-4">
              <Section title="Documents">
                {docs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents available for this program.</p>
                ) : (
                  <div className="space-y-3">
                    {docs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-border hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText size={18} className="text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground">{doc.type}</p>
                        </div>
                        {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline shrink-0">View</a>}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>
      </div>

      {/* Back to Programs CTA */}
      <div className="px-8 md:px-16 py-16 bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-2">Ready to Apply?</p>
            <p className="text-sm text-muted-foreground">Start your journey today with {program.programName}.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate("/programs")} className="flex items-center gap-2 px-8 py-3 border border-border text-sm rounded-full hover:bg-muted transition-colors cursor-pointer">
              <ArrowLeft size={14} /> All Programs
            </button>
            <button onClick={() => navigate("/admissions/application/start")} className="group flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm rounded-full hover:bg-primary/90 transition-colors cursor-pointer">
              Apply Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

/* ─── Curriculum Section (shared logic) ─── */

function CurriculumSection({ years, curr }: { years: YearData[]; curr: CurriculumData }) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => new Set(years.length > 0 ? [years[0].year] : []));

  const toggleYear = (y: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(y)) next.delete(y); else next.add(y);
      return next;
    });
  };

  const typeColor = (t: string) => {
    if (t === "Core") return "bg-accent/10 text-accent";
    if (t === "Elective") return "bg-violet-100 text-violet-700";
    if (t === "Audited") return "bg-amber-100 text-amber-700";
    return "bg-muted text-muted-foreground";
  };

  if (years.length === 0) return <p className="text-sm text-muted-foreground">No curriculum information available.</p>;

  return (
    <div className="space-y-6">
      <Section title="Curriculum">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
          {curr.curriculum_name && <span className="bg-muted px-3 py-1 rounded-full">{curr.curriculum_name}</span>}
          {curr.version && <span className="bg-muted px-3 py-1 rounded-full">v{curr.version}</span>}
          {curr.academic_year && <span className="bg-muted px-3 py-1 rounded-full">{curr.academic_year}</span>}
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
            <button onClick={() => toggleYear(year.year)} className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-muted/50 transition-colors cursor-pointer">
              <BookOpen size={18} className="text-accent shrink-0" />
              <span className="font-heading text-base font-semibold flex-1">Year {year.year}</span>
              <span className="text-xs text-muted-foreground">{yearCourses} courses · {yearCredits} credits</span>
              {expanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
            </button>
            {expanded && (
              <div className="border-t border-border px-6 py-5 space-y-6">
                {year.semesters.map(sem => (
                  <div key={sem.semester}>
                    <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Semester {sem.semester}</p>
                    <div className="space-y-1">
                      {sem.courses.map((cr, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm py-2 px-3 rounded-lg hover:bg-muted/50">
                          <span className="font-mono text-xs text-accent w-28 shrink-0">{cr.code}</span>
                          <span className="flex-1 min-w-0 truncate">{cr.name}</span>
                          <span className="text-xs text-muted-foreground w-14 text-right">{cr.credits} credits</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full shrink-0 ${typeColor(cr.type)}`}>{cr.type}</span>
                        </div>
                      ))}
                    </div>
                    {(sem.electiveGroups || []).map((group, gi) => (
                      <div key={gi} className="mt-4 border border-violet-200 bg-violet-50/50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide">Elective Group</span>
                          {group.groupName && <span className="text-xs text-violet-700 font-medium">— {group.groupName}</span>}
                        </div>
                        <p className="text-[10px] text-violet-600 mb-3">Choose {group.requiredCount} from {group.courses.length} options</p>
                        <div className="space-y-1">
                          {group.courses.map((cr, i) => (
                            <div key={i} className="flex items-center gap-4 text-sm py-1.5 px-3 rounded-lg">
                              <span className="font-mono text-xs text-violet-500 w-28 shrink-0">{cr.code}</span>
                              <span className="flex-1 min-w-0 truncate text-violet-800">{cr.name}</span>
                              <span className="text-xs text-violet-500 w-14 text-right">{cr.credits} credits</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {(year.recessTerms || []).map((rt, ri) => (
                  <div key={`r${ri}`} className="border-t border-dashed border-border pt-5">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">{rt.name || `Recess Term ${ri + 1}`}</p>
                    <div className="space-y-1">
                      {rt.courses.map((cr, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm py-2 px-3 rounded-lg hover:bg-muted/50">
                          <span className="font-mono text-xs text-amber-500 w-28 shrink-0">{cr.code}</span>
                          <span className="flex-1 min-w-0 truncate">{cr.name}</span>
                          <span className="text-xs text-muted-foreground w-14 text-right">{cr.credits} credits</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full shrink-0 ${typeColor(cr.type)}`}>{cr.type}</span>
                        </div>
                      ))}
                    </div>
                    {(rt.electiveGroups || []).map((group, gi) => (
                      <div key={gi} className="mt-4 border border-violet-200 bg-violet-50/50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide">Elective Group</span>
                          {group.groupName && <span className="text-xs text-violet-700 font-medium">— {group.groupName}</span>}
                        </div>
                        <p className="text-[10px] text-violet-600 mb-3">Choose {group.requiredCount} from {group.courses.length} options</p>
                        <div className="space-y-1">
                          {group.courses.map((cr, i) => (
                            <div key={i} className="flex items-center gap-4 text-sm py-1.5 px-3 rounded-lg">
                              <span className="font-mono text-xs text-violet-500 w-28 shrink-0">{cr.code}</span>
                              <span className="flex-1 min-w-0 truncate text-violet-800">{cr.name}</span>
                              <span className="text-xs text-violet-500 w-14 text-right">{cr.credits} credits</span>
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

/* ─── Shared Components ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{title}</h4>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

export default ProgramDetailPage;
