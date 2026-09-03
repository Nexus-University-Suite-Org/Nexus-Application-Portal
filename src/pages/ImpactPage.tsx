import { useEffect, useRef, useState } from "react"; // refresh
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, ArrowRight, Quote } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { useSpotlightCards, useCountUp } from "@/hooks/useScrollReveal";
import { useContentCollection } from "@/hooks/useContentCollection";

type StudentStory = Record<string, unknown> & {
  id: string;
  student_name?: string;
  program?: string;
  title?: string;
  content?: string;
};

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

gsap.registerPlugin(ScrollTrigger);

const fallbackStats = [
  { value: 1200, suffix: "+", label: "Total Graduates" },
  { value: 300, suffix: "+", label: "Businesses Started" },
  { value: 70, suffix: "%", label: "Women & Single Mothers" },
  { value: 12, suffix: "+", label: "Communities Reached" },
  { value: 85, suffix: "%", label: "Employment Rate" },
  { value: 8, suffix: "", label: "Vocational Programs" },
];

const ImpactPage = () => {
  const navigate = useNavigate();
  const statsRef = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const [heroTagline, setHeroTagline] = useState("Real Transformation");
  const [heroHeading1, setHeroHeading1] = useState("Lives Changed.");
  const [heroHeading2, setHeroHeading2] = useState("Communities Transformed.");
  const [heroDescription, setHeroDescription] = useState("Our graduates are proof that practical skills — combined with determination — can break the cycle of poverty in a single generation.");
  const [statsTagline, setStatsTagline] = useState("By The Numbers");
  const [statsHeading, setStatsHeading] = useState("Our Impact In Numbers");
  const [storiesTagline, setStoriesTagline] = useState("Graduate Stories");
  const [storiesHeading, setStoriesHeading] = useState("Meet Our Graduates");
  const [storiesDescription, setStoriesDescription] = useState("Behind every statistic is a real person with a real story. These are just a few of the lives transformed by our programs.");
  const [ctaHeading, setCtaHeading] = useState("Help Write the Next Success Story");
  const [ctaDescription, setCtaDescription] = useState("Your donation directly funds a student's journey from vulnerability to self-sufficiency.");
  const [ctaBtn1Text, setCtaBtn1Text] = useState("Donate Now");
  const [ctaBtn1Visible, setCtaBtn1Visible] = useState(true);
  const [ctaBtn2Text, setCtaBtn2Text] = useState("Sponsor a Student");
  const [ctaBtn2Visible, setCtaBtn2Visible] = useState(true);
  const { data: remoteStories, isLoading } = useContentCollection<StudentStory>("student_stories", []);
  const { data: sections } = useContentCollection<PageSection>("page_sections", []);
  const impactSections = sections.filter((s) => s.page_key === "impact");
  const statsSection = impactSections.find((s) => s.section_key === "stats");
  const impactStats = statsSection?.body
    ? (() => { try { return JSON.parse(statsSection.body); } catch { return fallbackStats; } })()
    : fallbackStats;

  useCountUp(statsRef);
  useSpotlightCards(storiesRef, ".story-card");

  const successStories = remoteStories.length > 0
    ? remoteStories.slice(0, 6).map((s) => ({
        name: s.student_name || "Graduate",
        program: s.program || "Vocational Training",
        duration: "",
        story: (typeof s.content === "string" && s.content.slice(0, 200)) || "A story of transformation through education.",
        outcome: "Now earning a stable income",
        tag: "Graduate",
      }))
    : [
        { name: "Mary Nakato", program: "Tailoring", duration: "", story: "Single mother who learned tailoring and now runs her own shop.", outcome: "Runs a tailoring business", tag: "Entrepreneur" },
        { name: "Samuel Opio", program: "Electrical", duration: "", story: "School dropout who became a certified electrician.", outcome: "Lead electrician", tag: "Youth" },
        { name: "Grace Achieng", program: "Welding", duration: "", story: "Orphaned woman who proved women can do technical work.", outcome: "Certified welder", tag: "Breaking Barriers" },
      ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("http://localhost:8080/api/v1/content/site-settings")
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data.impact_hero_tagline) setHeroTagline(data.impact_hero_tagline);
        if (data.impact_hero_heading_1) setHeroHeading1(data.impact_hero_heading_1);
        if (data.impact_hero_heading_2) setHeroHeading2(data.impact_hero_heading_2);
        if (data.impact_hero_description) setHeroDescription(data.impact_hero_description);
        if (data.impact_stats_tagline) setStatsTagline(data.impact_stats_tagline);
        if (data.impact_stats_heading) setStatsHeading(data.impact_stats_heading);
        if (data.impact_stories_tagline) setStoriesTagline(data.impact_stories_tagline);
        if (data.impact_stories_heading) setStoriesHeading(data.impact_stories_heading);
        if (data.impact_stories_description) setStoriesDescription(data.impact_stories_description);
        if (data.impact_cta_heading) setCtaHeading(data.impact_cta_heading);
        if (data.impact_cta_description) setCtaDescription(data.impact_cta_description);
        if (data.impact_cta_btn1_text) setCtaBtn1Text(data.impact_cta_btn1_text);
        if (data.impact_cta_btn1_visible) setCtaBtn1Visible(data.impact_cta_btn1_visible !== "false");
        if (data.impact_cta_btn2_text) setCtaBtn2Text(data.impact_cta_btn2_text);
        if (data.impact_cta_btn2_visible) setCtaBtn2Visible(data.impact_cta_btn2_visible !== "false");
      })
      .catch(() => {});
    const ctx = gsap.context(() => {
      // Hero
      gsap.fromTo(".impact-hero-text > *",
        { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.18, ease: "power3.out", delay: 0.3 }
      );

      // Stats — scale bounce
      if (statsRef.current) {
        gsap.fromTo(statsRef.current.querySelectorAll(".stat-card"),
          { y: 50, opacity: 0, scale: 0.85 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.8, stagger: 0.08,
            ease: "back.out(1.6)",
            scrollTrigger: { trigger: statsRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          }
        );
      }

      // Stories — staggered with rotation
      if (storiesRef.current) {
        gsap.fromTo(storiesRef.current.querySelectorAll(".story-card"),
          { y: 60, opacity: 0, rotateY: 6 },
          {
            y: 0, opacity: 1, rotateY: 0,
            duration: 0.9, stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: storiesRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[60vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img src={aboutHero} alt="Graduate success stories" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-primary/70 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 impact-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">{heroTagline}</p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-8 opacity-0">
            {heroHeading1}<br /><em className="text-accent">{heroHeading2}</em>
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            {heroDescription}
          </p>
        </div>
      </div>

      {/* Impact Stats */}
      <div ref={statsRef} className="px-8 md:px-16 py-24 md:py-32 bg-secondary/20">
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{statsTagline}</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">{statsHeading}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {impactStats.map(({ value, suffix, label }) => (
            <div key={label} className="stat-card opacity-0 p-8 bg-background border border-border rounded-[20px] text-center stat-glow">
              <p className="stat-value font-heading text-4xl font-light text-accent mb-2">
                <span className="count-up" data-target={value} data-suffix={suffix}>0{suffix}</span>
              </p>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div ref={storiesRef} className="px-8 md:px-16 py-24 md:py-32">
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{storiesTagline}</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">{storiesHeading}</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6 max-w-lg">
            {storiesDescription}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <p className="font-body text-muted-foreground text-center col-span-full py-12">Loading impact stories...</p>
          ) : successStories.length === 0 ? (
            <p className="font-body text-muted-foreground text-center col-span-full py-12">Impact stories coming soon.</p>
          ) : (
            successStories.map(({ name, program, duration, story, outcome, tag }) => (
              <div key={name} className="story-card spotlight-card opacity-0 group flex flex-col p-8 border border-border rounded-[20px]">
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center icon-bounce">
                      <Quote size={18} className="text-accent" />
                    </div>
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-accent border border-accent/30 px-3 py-1 rounded-full">{tag}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 mb-6 italic">"{story}"</p>
                  <div className="border-t border-border pt-6">
                    <p className="font-heading text-xl font-light text-foreground mb-1">{name}</p>
                    <p className="font-body text-xs tracking-[0.15em] uppercase text-accent mb-1">{program}</p>
                    <p className="font-body text-xs text-muted-foreground mb-3">{duration}</p>
                    <p className="font-body text-xs text-foreground/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />{outcome}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-8 md:px-16 py-24 bg-accent text-accent-foreground text-center">
        <h2 className="font-heading text-4xl md:text-6xl font-light leading-tight mb-6 max-w-2xl mx-auto">{ctaHeading}</h2>
        <p className="font-body text-sm text-accent-foreground/80 max-w-lg mx-auto mb-10 leading-relaxed">
          {ctaDescription}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {ctaBtn1Visible && (
            <button onClick={() => navigate("/donate")} className="group flex items-center gap-2 px-10 py-4 bg-accent-foreground text-accent font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent-foreground/90 btn-lift">
              <Heart size={16} className="fill-current" />{ctaBtn1Text}
            </button>
          )}
          {ctaBtn2Visible && (
            <button onClick={() => navigate("/donate#sponsor")} className="group flex items-center gap-2 px-10 py-4 border border-accent-foreground/40 text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent-foreground btn-lift">
              {ctaBtn2Text}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ImpactPage;
