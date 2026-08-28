import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrendingUp, Users, BookOpen, Globe } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  body?: string;
};

const iconMap = [Users, BookOpen, Globe, TrendingUp];

const fallbackStats = [
  { label: "Students Enrolled", value: "12,400+", trend: "↑ 8% YoY" },
  { label: "Academic Programs", value: "143+", trend: "↑ New 12 programs" },
  { label: "Countries Represented", value: "74", trend: "Expanding globally" },
  { label: "Research Growth", value: "+34%", trend: "Year-over-year" },
];

const fallbackFacts = [
  { category: "Faculty", stat: "1,200+", desc: "Highly qualified faculty members with advanced degrees" },
  { category: "Libraries", stat: "2.5M+", desc: "Books, journals, and digital resources" },
  { category: "Labs", stat: "50+", desc: "State-of-the-art research and teaching labs" },
  { category: "Scholarships", stat: "$18M+", desc: "Annual financial aid distributed" },
  { category: "Graduation Rate", stat: "94%", desc: "Four-year completion rate" },
  { category: "Employment", stat: "92%", desc: "Graduate employment within 6 months" },
];

const parseJson = (body: string | undefined, fallback: unknown[]) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const FactsFiguresPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const factsRef = useRef<HTMLDivElement>(null);
  const { data: sections } = useContentCollection<PageSection>("page_sections", []);
  const ffSections = sections.filter((s) => s.page_key === "facts_figures");
  const statsSection = ffSections.find((s) => s.section_key === "stats");
  const factsSection = ffSections.find((s) => s.section_key === "facts");
  const stats = parseJson(statsSection?.body, fallbackStats);
  const facts = parseJson(factsSection?.body, fallbackFacts);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Hero text
      if (heroTextRef.current) {
        gsap.fromTo(
          heroTextRef.current.querySelectorAll("*"),
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.3,
          },
        );
      }

      // Hero image
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.1, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.8,
            ease: "power2.out",
            delay: 0.2,
          },
        );
      }

      // Stats cards
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll(".stat-card"),
          { y: 50, opacity: 0, rotateX: 15 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
          },
        );
      }

      // Facts grid
      if (factsRef.current) {
        gsap.fromTo(
          factsRef.current.querySelectorAll(".fact-card"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: factsRef.current, start: "top 85%" },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={aboutHero}
            alt="By the Numbers"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Key Metrics
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            Facts & Figures
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Discover the numbers that define our institution and its impact on
            students and society.
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div
        ref={statsRef}
        className="px-8 md:px-16 py-24 bg-gradient-to-b from-secondary/20 to-background"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((item, index) => {
            const Icon = iconMap[index % iconMap.length];
            return (
              <div key={item.label} className="stat-card opacity-0">
                <div className="card-hover h-full p-8 rounded-[24px] border border-border/40 bg-background hover:border-accent/40 transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <Icon size={32} className="icon-hover text-accent mb-6" />
                    <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground font-semibold mb-4">
                      {item.label}
                    </p>
                    <p className="font-heading text-4xl font-light text-foreground mb-3">
                      {item.value}
                    </p>
                    <p className="font-body text-sm text-accent">
                      {item.trend}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Facts Grid */}
      <div ref={factsRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            More Details
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            By the Numbers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facts.map((item) => (
            <div key={item.category} className="fact-card opacity-0">
              <div className="card-hover p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/30 to-background hover:border-accent/40 transition-all duration-500">
                <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-4">
                  {item.category}
                </p>
                <p className="font-heading text-4xl font-light text-foreground mb-4">
                  {item.stat}
                </p>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FactsFiguresPage;
