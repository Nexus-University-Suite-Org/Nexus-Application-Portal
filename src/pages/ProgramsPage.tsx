import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, ChevronDown, Heart, ArrowRight, Clock, Banknote } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { nadApiUrl } from "@/lib/apiUrl";

gsap.registerPlugin(ScrollTrigger);

type Program = {
  id: number; programName: string; programCode: string; programType: string;
  awardQualification: string; programDescription: string; shortDescription: string;
  fullDescription: string; status: string; facultySchool: string; department: string;
  durationUnit: string; numberOfYears: number; semestersPerYear: number;
  studyMode: string; academicCalendar: string; campus: string;
  fees: string; curriculum: string; cutoffScore?: number;
};

type Course = { code: string; name: string; credits: number; type: string };
type ElectiveGroup = { groupName: string; requiredCount: number; courses: Course[] };
type SemesterData = { semester: number; courses: Course[]; electiveGroups?: ElectiveGroup[] };
type RecessTerm = { name: string; courses: Course[] };
type YearData = { year: number; semesters: SemesterData[]; recessTerms?: RecessTerm[] };
type FeeSemester = { tuition: number; registration: number; examination: number; functional: number; ict: number; library: number; medical: number; accommodation: number; other: number; total: number };
type FeeYear = { year: number; semesters: FeeSemester[] };
type CurriculumData = { years?: YearData[] };
type FeeData = { currency?: string; year_fees?: FeeYear[] };

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

const AWARD_ORDER = ["BACHELOR", "DIPLOMA", "CERTIFICATE", "MASTER", "PHD", "OTHER"];
const AWARD_LABELS: Record<string, string> = {
  BACHELOR: "Bachelor's Programmes",
  DIPLOMA: "Diploma Programmes",
  CERTIFICATE: "Certificate Programmes",
  MASTER: "Master's Programmes",
  PHD: "Doctoral (PhD) Programmes",
  OTHER: "Other Programmes",
};

const PROGRAM_TYPE_ALIASES: Record<string, string> = {
  UNDERGRADUATE: "BACHELOR",
  "BACHELOR'S": "BACHELOR",
  POSTGRADUATE: "MASTER",
  "MASTER'S": "MASTER",
  DOCTORAL: "PHD",
  DOCTORATE: "PHD",
};

function awardBucket(program: Program): string {
  const raw = (program.programType || "").trim().toUpperCase();
  if (raw in AWARD_LABELS) return raw;
  if (PROGRAM_TYPE_ALIASES[raw]) return PROGRAM_TYPE_ALIASES[raw];
  const award = (program.awardQualification || "").toLowerCase();
  if (award.startsWith("bachelor")) return "BACHELOR";
  if (award.startsWith("master")) return "MASTER";
  if (award.startsWith("doctor")) return "PHD";
  if (award.includes("diploma")) return "DIPLOMA";
  if (award.includes("certificate")) return "CERTIFICATE";
  return "OTHER";
}

const ProgramsPage = () => {
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement>(null);

  const [heroTagline, setHeroTagline] = useState("What We Teach");
  const [heroHeading1, setHeroHeading1] = useState("Vocational Programs");
  const [heroHeading2, setHeroHeading2] = useState("That Build Real Futures");
  const [heroDescription, setHeroDescription] = useState("8 practical programs. Market-driven curricula. Every graduate leaves with skills to earn a living from day one.");
  const [sectionTagline, setSectionTagline] = useState("Our Programs");
  const [sectionHeading, setSectionHeading] = useState("Choose Your Path");
  const [sectionDescription, setSectionDescription] = useState("Click on any program to see skills, career outcomes, and how long it takes to complete.");

  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string>(aboutHero);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch("/api/v1/content/site-settings")
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data.programs_hero_tagline) setHeroTagline(data.programs_hero_tagline);
        if (data.programs_hero_heading_1) setHeroHeading1(data.programs_hero_heading_1);
        if (data.programs_hero_heading_2) setHeroHeading2(data.programs_hero_heading_2);
        if (data.programs_hero_description) setHeroDescription(data.programs_hero_description);
        if (data.programs_section_tagline) setSectionTagline(data.programs_section_tagline);
        if (data.programs_section_heading) setSectionHeading(data.programs_section_heading);
        if (data.programs_section_description) setSectionDescription(data.programs_section_description);
        if (data.programs_hero_image) {
          setHeroImage(data.programs_hero_image);
          new Image().src = data.programs_hero_image;
        }
      })
      .catch(() => {});

    fetch(nadApiUrl("public/programs"))
      .then(r => r.json())
      .then((progs: Program[]) => {
        setPrograms(progs.filter(p => p.status === "Active"));
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
    for (const y of years) {
      for (const sem of y.semesters) {
        totalCourses += sem.courses.length;
        totalCredits += sem.courses.reduce((s, c) => s + (c.credits || 0), 0);
      }
      for (const rt of (y.recessTerms || [])) {
        totalCourses += rt.courses.length;
        totalCredits += rt.courses.reduce((s, c) => s + (c.credits || 0), 0);
      }
    }
    return { years: years.length, totalCourses, totalCredits };
  };

  const groupedByType = useMemo(() => {
    const groups: Record<string, Program[]> = {};
    for (const p of programs) {
      (groups[awardBucket(p)] = groups[awardBucket(p)] || []).push(p);
    }
    return groups;
  }, [programs]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[60vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img src={heroImage} alt="Students learning vocational skills" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-black/70 rounded-none" />
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

        {AWARD_ORDER.map(type => {
          const list = groupedByType[type];
          if (!list || list.length === 0) return null;
          return (
            <div key={type} className="mb-12">
              <h3 className="font-heading text-2xl font-light text-foreground mb-6">
                {AWARD_LABELS[type] ?? type}
              </h3>
              <div className="space-y-4">
                {list.map(p => (
                  <ProgramCard key={p.id} program={p} onClick={() => navigate(`/programs/${p.id}`)} feeInfo={getTotalFees(p)} stats={getCurriculumStats(p)} />
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
        <p className="font-body text-sm text-primary-foreground/60 max-w-lg mx-auto mb-10 leading-relaxed">For as little as 50 a month, you can sponsor a student through one of these life-changing programs.</p>
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
    </div>
  );
};

function ProgramCard({ program, onClick, feeInfo, stats }: { program: Program; onClick: () => void; feeInfo: { total: number; currency: string }; stats: { years: number; totalCourses: number; totalCredits: number } }) {
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
            {program.numberOfYears > 0 && <span className="flex items-center gap-1"><Clock size={12} /> {program.numberOfYears} {program.durationUnit || "years"}</span>}
            {stats.totalCredits > 0 && <span>{stats.totalCredits} credits</span>}
            {program.studyMode && <span>{program.studyMode}</span>}
            {typeof program.cutoffScore === 'number' && <span className="flex items-center gap-1 font-semibold text-foreground">Cutoff: {program.cutoffScore}</span>}
            {feeInfo.total > 0 && <span className="flex items-center gap-1"><Banknote size={12} /> {feeInfo.currency} {feeInfo.total.toLocaleString()}</span>}
          </div>
          {program.shortDescription && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{program.shortDescription}</p>}
        </div>
        <ArrowRight size={18} className="text-muted-foreground shrink-0 ml-4 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </button>
  );
}

export default ProgramsPage;
