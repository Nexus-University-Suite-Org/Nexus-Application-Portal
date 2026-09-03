import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Microscope,
  Cpu,
  Leaf,
  Brain,
  Atom,
  Globe,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useContentCollection } from "@/hooks/useContentCollection";
import researchHero from "@/assets/research-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  subtitle?: string;
  body?: string;
};

const ResearchPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const areasRef = useRef<HTMLDivElement>(null);
  const [heroImage, setHeroImage] = useState<string>(researchHero);
  const { data: sections, isLoading } = useContentCollection<PageSection>("page_sections", []);

  useEffect(() => {
    fetch("/api/v1/content/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, string> | null) => {
        if (!data?.research_hero_image) return;
        setHeroImage(data.research_hero_image);
        new Image().src = data.research_hero_image;
      })
      .catch(() => {});
  }, []);

  const researchSections = sections.filter((s) => s.page_key === "research");
  const areas = researchSections.length > 0
    ? researchSections.filter((s) => s.section_key?.startsWith("area")).map((s) => ({ icon: BookOpen, title: s.title || "Research Area", desc: s.body || s.subtitle || "", papers: 0 }))
    : [
        { icon: BookOpen, title: "Agriculture & Food Security", desc: "Sustainable farming, crop science, and food security solutions.", papers: 45 },
        { icon: BookOpen, title: "Public Health", desc: "Community health, disease prevention, and healthcare delivery.", papers: 38 },
        { icon: BookOpen, title: "Renewable Energy", desc: "Solar, wind, and biomass energy solutions for communities.", papers: 29 },
        { icon: BookOpen, title: "Education Technology", desc: "Digital learning tools and educational access.", papers: 33 },
        { icon: BookOpen, title: "Water & Sanitation", desc: "Clean water access and sanitation infrastructure.", papers: 27 },
        { icon: BookOpen, title: "Small Business Development", desc: "Microfinance, entrepreneurship, and market access.", papers: 41 },
      ];

  const stats = [
    { value: "$47M", label: "Annual Research Funding" },
    { value: "1,400+", label: "Published Papers (2024)" },
    { value: "32", label: "Research Centers" },
    { value: "96", label: "Industry Partners" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".res-hero-text > *",
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
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.6,
            ease: "power3.inOut",
            delay: 0.4,
          },
        );
      }
      gsap.fromTo(
        ".res-stat",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".res-stats", start: "top 80%" },
        },
      );
      if (areasRef.current) {
        gsap.fromTo(
          areasRef.current.querySelectorAll(".area-card"),
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: areasRef.current, start: "top 80%" },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-screen flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img
            ref={imageRef}
            src={heroImage}
            alt="Research laboratory"
            className="w-full h-full object-cover rounded-none"
          />
          <div className="absolute inset-0 bg-primary/70 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 res-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">
            Research & Innovation
          </p>
          <h1 className="font-heading text-5xl md:text-8xl font-light text-primary-foreground leading-[0.9] mb-8 opacity-0">
            Advancing
            <br />
            Knowledge
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            Tackling humanity's greatest challenges through interdisciplinary
            research, global collaboration, and bold inquiry.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="res-stats px-8 md:px-16 py-24 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((s) => (
            <div key={s.label} className="res-stat text-center opacity-0">
              <p className="font-heading text-5xl md:text-6xl font-light text-foreground mb-2">
                {s.value}
              </p>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Research Areas */}
      <div ref={areasRef} className="px-8 md:px-16 py-32">
        <div className="max-w-2xl mb-20">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Focus Areas
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
            Research That Shapes the Future
          </h2>
        </div>
        <div className="space-y-4">
          {isLoading && areas.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">Loading research areas...</p>
          )}
          {!isLoading && areas.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">Research areas coming soon.</p>
          )}
          {areas.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.title}
                to="/research/opportunities"
                className="area-card group opacity-0 flex items-start gap-8 p-8 border border-border rounded-[20px] transition-all duration-500 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_hsl(var(--accent)/0.12)]"
              >
                <div className="w-14 h-14 rounded-[14px] bg-secondary flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors duration-500">
                  <Icon
                    size={22}
                    className="text-muted-foreground group-hover:text-accent transition-colors duration-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading text-2xl font-light text-foreground group-hover:text-accent transition-colors duration-500">
                      {a.title}
                    </h3>
                    <span className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                      {a.papers}
                    </span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {a.desc}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all duration-500 mt-2 shrink-0"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-8 md:px-16 py-32 bg-primary text-center">
        <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground mb-6">
          Join Our Research Community
        </h2>
        <p className="font-body text-lg text-primary-foreground/60 max-w-xl mx-auto mb-10">
          Explore funded opportunities, postdoctoral positions, and
          collaborative projects.
        </p>
        <Link
          to="/research/opportunities"
          className="inline-flex px-10 py-4 border border-accent text-accent font-body text-xs tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent hover:text-primary-foreground"
        >
          Explore Opportunities
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default ResearchPage;
