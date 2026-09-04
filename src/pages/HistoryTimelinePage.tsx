import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const fallbackTimeline = [
  { year: "1922", title: "Foundation Era", desc: "Established as the East African Institute of Higher Learning with 47 students and 6 faculty members." },
  { year: "1948", title: "University Charter", desc: "Became a fully chartered university, expanding to include schools of law, medicine, and engineering." },
  { year: "1965", title: "Independent Growth", desc: "Post-independence expansion with scholarships for students across Africa." },
  { year: "1971", title: "Research Pioneer", desc: "Established the first research center in sub-Saharan Africa dedicated to tropical medicine." },
  { year: "1995", title: "Global Partnerships", desc: "Launched international partnerships with universities across Europe, Asia, and North America." },
  { year: "2010", title: "Innovation Hub", desc: "Opened the Innovation Hub, a 50,000 sq ft facility bridging academia and industry." },
  { year: "2020", title: "Digital Transformation", desc: "Rapid transition to digital learning and research platforms during global challenges." },
  { year: "2024", title: "World Recognition", desc: "Ranked among the top 200 universities globally, with research output growing 34% year-over-year." },
];

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const HistoryTimelinePage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { data: pageSections } = useContentCollection<PageSection>("page_sections", []);
  const timelineSections = pageSections.filter(s => s.page_key === "history_timeline" && s.section_key === "timeline");
  const timeline = timelineSections.length > 0
    ? parseJson(timelineSections[0].body, fallbackTimeline) as { year: string; title: string; desc: string }[]
    : fallbackTimeline;

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

      // Timeline items
      if (timelineRef.current) {
        gsap.fromTo(
          timelineRef.current.querySelectorAll(".timeline-item"),
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: { trigger: timelineRef.current, start: "top 80%" },
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
            alt="Our History"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Journey Through Time
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            History Timeline
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Over 100 years of transformative moments that shaped University Application Portal
            Institute into a global leader in education and research.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Our Heritage
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Milestones & Achievements
          </h2>
        </div>

        <div className="relative">
          {/* Center line */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={item.year} className="timeline-item opacity-0">
                <div
                  className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}
                >
                  {/* Content */}
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="card-hover p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/20 to-background hover:border-accent/40 transition-all duration-500">
                      <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-3">
                        {item.year}
                      </p>
                      <h3 className="font-heading text-2xl font-light text-foreground mb-4">
                        {item.title}
                      </h3>
                      <p className="font-body text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden lg:flex items-center justify-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-2 rounded-full bg-accent/20 border border-accent/40" />
                      <div className="relative w-4 h-4 rounded-full bg-accent" />
                    </div>
                  </div>

                  {/* Spacer for alternate layout */}
                  <div className="hidden lg:block flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HistoryTimelinePage;
