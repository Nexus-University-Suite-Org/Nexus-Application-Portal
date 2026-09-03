import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

const fallbackHighlights = [
  { title: "Founded 1922", desc: "Over a century of academic excellence" },
  { title: "143+ Programs", desc: "Across 10 colleges and schools" },
  { title: "12,400+ Students", desc: "From 74 countries worldwide" },
  { title: "Top 200 Global", desc: "Ranked among world's leading universities" },
];

const fallbackMission = "University Application Portal is dedicated to fostering intellectual inquiry, advancing knowledge through research, and developing leaders who contribute meaningfully to society.";

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const AboutInstitutePage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const [portalName] = useState("University Application Portal");

  const { data: pageSections } = useContentCollection<PageSection>("page_sections", []);
  const highlightsSections = pageSections.filter(s => s.page_key === "about_institute" && s.section_key === "highlights");
  const highlights = highlightsSections.length > 0
    ? parseJson(highlightsSections[0].body, fallbackHighlights) as { title: string; desc: string }[]
    : fallbackHighlights;
  const missionSections = pageSections.filter(s => s.page_key === "about_institute" && s.section_key === "mission");
  const missionDesc = missionSections.length > 0 && missionSections[0].body
    ? missionSections[0].body
    : fallbackMission;

  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // Hero text animation
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

      // Hero image scale
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

      // Highlights cards
      if (highlightsRef.current) {
        gsap.fromTo(
          highlightsRef.current.querySelectorAll(".highlight-card"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: highlightsRef.current, start: "top 85%" },
          },
        );
      }

      // Mission section
      if (missionRef.current) {
        gsap.fromTo(
          missionRef.current.querySelectorAll("*"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: { trigger: missionRef.current, start: "top 80%" },
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
      <div className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={aboutHero}
            alt={portalName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            About the Institute
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            {portalName}
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            A beacon of academic excellence, producing leaders who transform
            communities across Africa and the world since 1922.
          </p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div ref={highlightsRef} className="px-8 md:px-16 py-20 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item) => (
            <div key={item.title} className="highlight-card opacity-0">
              <div className="card-hover p-6 rounded-[24px] border border-border/60 hover:border-accent/40 bg-gradient-to-br from-secondary/20 to-background transition-all duration-500">
                <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-3">
                  {item.title}
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div ref={missionRef} className="px-8 md:px-16 py-20 bg-secondary/30">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-accent rounded-full" />
            <p className="font-body text-xs tracking-[0.25em] uppercase text-accent font-semibold">
              Foundation
            </p>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-8 leading-[1.1]">
            Our Mission
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
            {missionDesc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Academic Leadership",
              "Global Impact",
              "Student-Centric",
              "Research Innovation",
            ].map((term) => (
              <div key={term} className="flex items-start gap-4">
                <CheckCircle2
                  size={24}
                  className="icon-hover text-accent flex-shrink-0 mt-1"
                />
                <p className="font-body text-muted-foreground">{term}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutInstitutePage;
