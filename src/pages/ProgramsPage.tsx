import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Scissors,
  Zap,
  Wrench,
  Sparkles,
  Users,
  BookOpen,
  Car,
  Flame,
  ChevronDown,
  ChevronUp,
  Heart,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type ProgramCard = {
  id: string;
  title: string;
  duration?: string;
  description?: string;
  skills?: string[];
  careers?: string[];
  level?: string;
  icon: LucideIcon;
};

type RemoteProgram = Record<string, unknown> & {
  id: string;
  programName?: string;
  programCode?: string;
  department?: string;
  description?: string;
  duration?: number | string;
  totalCredits?: number;
  status?: string;
  createdAt?: string;
};

const iconByKeyword: Array<{
  keyword: string;
  icon: LucideIcon;
}> = [
  { keyword: "tailor", icon: Scissors },
  { keyword: "plumb", icon: Wrench },
  { keyword: "electric", icon: Zap },
  { keyword: "weld", icon: Flame },
  { keyword: "hair", icon: Users },
  { keyword: "beauty", icon: Sparkles },
  { keyword: "auto", icon: Car },
  { keyword: "soap", icon: BookOpen },
];

const resolveProgramVisuals = (title: string) => {
  const lower = title.toLowerCase();
  const matched = iconByKeyword.find((item) => lower.includes(item.keyword));
  return {
    icon: matched?.icon ?? BookOpen,
  };
};

const ProgramsPage = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [heroTagline, setHeroTagline] = useState("What We Teach");
  const [heroHeading1, setHeroHeading1] = useState("Vocational Programs");
  const [heroHeading2, setHeroHeading2] = useState("That Build Real Futures");
  const [heroDescription, setHeroDescription] = useState("8 practical programs. Market-driven curricula. Every graduate leaves with skills to earn a living from day one.");
  const [sectionTagline, setSectionTagline] = useState("Our Programs");
  const [sectionHeading, setSectionHeading] = useState("Choose Your Path");
  const [sectionDescription, setSectionDescription] = useState("Click on any program to see skills, career outcomes, and how long it takes to complete.");
  const {
    data: remotePrograms,
    isLoading,
  } = useContentCollection<RemoteProgram>("AcademicPrograms", []);

  const programs: ProgramCard[] =
    remotePrograms.length > 0
      ? remotePrograms
          .filter(
            (program) =>
              !program.status ||
              String(program.status).trim().toLowerCase() === "active",
          )
          .sort((a, b) =>
            String(a.programName ?? "").localeCompare(
              String(b.programName ?? ""),
            ),
          )
          .map((program) => {
            const programName =
              typeof program.programName === "string" &&
              program.programName.trim().length > 0
                ? program.programName
                : "Unnamed Program";

            const visuals = resolveProgramVisuals(programName);
            const fallbackSkills = program.department
              ? [`Department: ${program.department}`]
              : ["Practical hands-on training", "Career-oriented curriculum"];

            const durationText =
              typeof program.duration === "number"
                ? `${program.duration} years`
                : typeof program.duration === "string" &&
                    program.duration.trim().length > 0
                  ? program.duration
                  : "Flexible";

            const careers = [
              `${programName} technician`,
              "Self-employment pathway",
              "Industry apprenticeship",
            ];

            if (program.programCode) {
              careers.unshift(`Program code: ${program.programCode}`);
            }

            if (typeof program.totalCredits === "number") {
              careers.push(`Total credits: ${program.totalCredits}`);
            }

            return {
              id: program.id,
              title: programName,
              duration: durationText,
              description:
                program.description ??
                "A practical, market-focused program designed to build job-ready skills.",
              skills: fallbackSkills,
              careers,
              level: program.department,
              icon: visuals.icon,
            };
          })
      : [];

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
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".programs-hero-text > *",
        { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.3,
          stagger: 0.18,
          ease: "power3.out",
          delay: 0.3,
        },
      );

      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.querySelectorAll(".prog-card"),
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // Animate expanded content
  useEffect(() => {
    if (!expandedId) return;
    const el = document.getElementById(`prog-detail-${expandedId}`);
    if (!el) return;
    gsap.fromTo(
      el,
      { height: 0, opacity: 0 },
      { height: "auto", opacity: 1, duration: 0.5, ease: "power2.out" },
    );
  }, [expandedId]);

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[60vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img
            src={aboutHero}
            alt="Students learning vocational skills"
            className="w-full h-full object-cover rounded-none"
          />
          <div className="absolute inset-0 bg-primary/70 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 programs-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">
            {heroTagline}
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-8 opacity-0">
            {heroHeading1}
            <br />
            {heroHeading2}
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            {heroDescription}
          </p>
        </div>
      </div>

      {/* Programs Grid */}
      <div ref={cardsRef} className="px-8 md:px-16 py-24 md:py-32">
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            {sectionTagline}
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
            {sectionHeading}
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6 max-w-lg">
            {sectionDescription}
          </p>
        </div>

        {isLoading && programs.length === 0 && (
          <p className="font-body text-sm text-muted-foreground">Loading programs...</p>
        )}

        {!isLoading && programs.length === 0 && (
          <p className="font-body text-sm text-muted-foreground">No programs available yet.</p>
        )}

        <div className="space-y-4">
          {programs.map(
            ({
              id,
              icon: Icon,
              title,
              duration,
              skills,
              careers,
              description,
            }) => {
              const isOpen = expandedId === id;
              return (
                <div
                  key={id}
                  className="prog-card opacity-0 border border-border rounded-[20px] overflow-hidden magnetic-card"
                >
                  <button
                    onClick={() => toggle(id)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                  >
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center shrink-0 icon-bounce">
                        <Icon size={20} className="text-accent" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading text-xl md:text-2xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
                          {title}
                        </h3>
                        <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">
                          Duration: {duration}
                        </p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp
                        size={20}
                        className="text-accent shrink-0 transition-transform duration-300"
                      />
                    ) : (
                      <ChevronDown
                        size={20}
                        className="text-muted-foreground shrink-0 transition-transform duration-300 group-hover:translate-y-0.5"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div
                      id={`prog-detail-${id}`}
                      className="px-8 pb-8 border-t border-border/50 overflow-hidden"
                    >
                      <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6 mb-8 max-w-2xl">
                        {description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
                            Department
                          </p>
                          <ul className="space-y-2">
                            {skills.map((s) => (
                              <li
                                key={s}
                                className="flex items-center gap-3 font-body text-sm text-foreground"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
                            More Information about the Program
                          </p>
                          <ul className="space-y-2">
                            {careers.map((c) => (
                              <li
                                key={c}
                                className="flex items-center gap-3 font-body text-sm text-foreground"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-8 md:px-16 py-24 bg-primary text-primary-foreground text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
          Ready to Help?
        </p>
        <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-10 max-w-2xl mx-auto">
          Sponsor a Student's Journey
        </h2>
        <p className="font-body text-sm text-primary-foreground/60 max-w-lg mx-auto mb-10 leading-relaxed">
          For as little as $50 a month, you can sponsor a student through one of
          these life-changing programs.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate("/donate")}
            className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
          >
            <Heart size={16} className="fill-current" />
            Sponsor a Student
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="group flex items-center gap-2 px-10 py-4 border border-primary-foreground/30 text-primary-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent btn-lift"
          >
            Contact Us
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProgramsPage;
