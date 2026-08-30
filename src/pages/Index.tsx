import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Heart,
  ArrowRight,
  Scissors,
  Zap,
  Wrench,
  Sparkles,
  Users,
  BookOpen,
  Car,
  Flame,
} from "lucide-react";
import { useContentCollection } from "@/hooks/useContentCollection";
import LoadingWrapper from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { useSpotlightCards, useParallax } from "@/hooks/useScrollReveal";

gsap.registerPlugin(ScrollTrigger);

type RemoteProgram = Record<string, unknown> & {
  id: string;
  programName?: string;
  department?: string;
  description?: string;
};

type RemoteStory = Record<string, unknown> & {
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

const fallbackDonationTiers = [
  { amount: "$10", impact: "Provides learning materials for one student" },
  { amount: "$25", impact: "Covers essential training tools" },
  { amount: "$50", impact: "Sponsors a student for one month" },
  { amount: "$200", impact: "Covers full training support" },
];

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const Index = () => {
  const navigate = useNavigate();
  const programsRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const donateRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [whatWeTeachTagline, setWhatWeTeachTagline] = useState("What We Teach");
  const [whatWeTeachHeading1, setWhatWeTeachHeading1] = useState("Practical Skills That");
  const [whatWeTeachHeading2, setWhatWeTeachHeading2] = useState("Create Real Livelihoods");
  const [whatWeTeachSubtitle, setWhatWeTeachSubtitle] = useState("Our vocational programs are designed for immediate employment and entrepreneurship. Each graduate leaves with the skills to earn income from day one.");

  const { data: remotePrograms } = useContentCollection<RemoteProgram>("courses", []);
  const { data: remoteStories } = useContentCollection<RemoteStory>("student_stories", []);
  const { data: pageSections } = useContentCollection<PageSection>("page_sections", []);

  const donationTiersSections = pageSections.filter(s => s.page_key === "home" && s.section_key === "donation_tiers");
  const donationTiers = donationTiersSections.length > 0
    ? parseJson(donationTiersSections[0].body, fallbackDonationTiers) as { amount: string; impact: string }[]
    : fallbackDonationTiers;

  const iconMap: Record<string, typeof Scissors> = {
    tailor: Scissors, plumb: Wrench, electric: Zap, weld: Flame, hair: Users, beauty: Sparkles, auto: Car, soap: BookOpen,
  };

  const programPreviews = remotePrograms.length > 0
    ? remotePrograms.slice(0, 6).map((p) => {
        const name = (typeof p.programName === "string" && p.programName.trim()) || "Program";
        const lower = name.toLowerCase();
        const icon = Object.entries(iconMap).find(([k]) => lower.includes(k))?.[1] || BookOpen;
        return { icon, title: name, duration: "", outcome: (typeof p.description === "string" && p.description.slice(0, 100)) || "Practical skills for real careers" };
      })
    : [
        { icon: Scissors, title: "Tailoring & Design", duration: "6 months", outcome: "Run your own shop" },
        { icon: Zap, title: "Electrical Installation", duration: "8 months", outcome: "Certified electrician" },
        { icon: Wrench, title: "Plumbing", duration: "8 months", outcome: "Start a plumbing business" },
        { icon: Flame, title: "Welding & Fabrication", duration: "6 months", outcome: "Fabrication workshop owner" },
        { icon: Users, title: "Hairdressing", duration: "4 months", outcome: "Open your own salon" },
        { icon: Sparkles, title: "Beauty Therapy", duration: "4 months", outcome: "Freelance beauty therapist" },
      ];

  const storyFeature = remoteStories.length > 0
    ? { name: remoteStories[0].student_name || "Graduate", program: remoteStories[0].program || "Vocational Training", quote: remoteStories[0].title || "This program changed my life.", outcome: "Now earning a stable income" }
    : { name: "Mary Nakato", program: "Tailoring & Design", quote: "I went from nothing to owning my own business.", outcome: "Now runs a successful tailoring shop" };

  useSpotlightCards(programsRef);
  useSpotlightCards(donateRef);
  useParallax(pageRef);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/content/site-settings")
      .then((res) => { if (!res.ok) throw new Error(""); return res.json(); })
      .then((data: Record<string, string>) => {
        if (data.what_we_teach_tagline) setWhatWeTeachTagline(data.what_we_teach_tagline);
        if (data.what_we_teach_heading_1) setWhatWeTeachHeading1(data.what_we_teach_heading_1);
        if (data.what_we_teach_heading_2) setWhatWeTeachHeading2(data.what_we_teach_heading_2);
        if (data.what_we_teach_subtitle) setWhatWeTeachSubtitle(data.what_we_teach_subtitle);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // Programs section — staggered cards with scale
      if (programsRef.current) {
        gsap.fromTo(
          programsRef.current.querySelectorAll(".program-card"),
          { y: 70, opacity: 0, scale: 0.92 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.9, stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: programsRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          }
        );
      }

      // Story section — cinematic left-slide reveals
      if (storyRef.current) {
        gsap.fromTo(
          storyRef.current.querySelectorAll(".story-anim"),
          { x: -70, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 1.1, stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: storyRef.current, start: "top 78%", toggleActions: "play none none reverse" },
          }
        );

        // Stats counter on the right
        gsap.fromTo(
          storyRef.current.querySelectorAll(".stat-block"),
          { x: 60, opacity: 0, scale: 0.9 },
          {
            x: 0, opacity: 1, scale: 1,
            duration: 0.9, stagger: 0.15, delay: 0.3,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: storyRef.current, start: "top 78%", toggleActions: "play none none reverse" },
          }
        );
      }

      // Donate section — cards with rotation
      if (donateRef.current) {
        gsap.fromTo(
          donateRef.current.querySelectorAll(".donate-card"),
          { y: 50, opacity: 0, rotateX: 8 },
          {
            y: 0, opacity: 1, rotateX: 0,
            duration: 0.8, stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: donateRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          }
        );
      }

      // Section headings — elegant clip reveal
      gsap.utils.toArray<HTMLElement>(".section-heading").forEach((heading) => {
        gsap.fromTo(heading,
          { y: 50, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
          {
            y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2, ease: "power3.out",
            scrollTrigger: { trigger: heading, start: "top 85%", toggleActions: "play none none reverse" },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <LoadingWrapper>
      <div ref={pageRef} className="relative min-h-screen bg-background" id="home">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-[20px] font-body text-sm">
          Skip to main content
        </a>
        <Navbar />
        <div id="main-content">
          <HeroSection />

          {/* Programs Preview Section */}
          <section className="relative py-24 md:py-32 px-8 md:px-16 bg-background overflow-hidden">
            <div className="parallax-el pointer-events-none absolute -top-24 -left-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl" data-speed="0.3" />
            <div className="parallax-el pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" data-speed="0.5" />
            <div className="max-w-2xl mb-16">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{whatWeTeachTagline}</p>
              <h2 className="section-heading font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
                {whatWeTeachHeading1}<br />{whatWeTeachHeading2}
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6 max-w-lg">
                {whatWeTeachSubtitle}
              </p>
            </div>
            <div ref={programsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {programPreviews.map(({ icon: Icon, title, duration, outcome }) => (
                <div
                  key={title}
                  className="program-card spotlight-card opacity-0 group p-8 border border-border rounded-[20px] cursor-pointer"
                  onClick={() => navigate("/programs")}
                >
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-5 icon-bounce">
                      <Icon size={22} className="text-accent" />
                    </div>
                    <h3 className="font-heading text-2xl font-light text-foreground mb-2 group-hover:text-accent transition-colors duration-500">
                      {title}
                    </h3>
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">{duration}</p>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{outcome}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/programs")}
              className="group flex items-center gap-2 font-body text-sm tracking-[0.2em] uppercase text-accent transition-all duration-300 hover:gap-4 btn-lift"
            >
              View All Programs
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </section>

          {/* Featured Success Story */}
          <section ref={storyRef} className="relative py-24 md:py-32 px-8 md:px-16 bg-primary text-primary-foreground overflow-hidden">
            <div className="parallax-el pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-accent/15 blur-3xl" data-speed="0.4" />
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="story-anim opacity-0 font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">Student Success Story</p>
                <blockquote className="story-anim opacity-0 font-heading text-3xl md:text-5xl font-light text-primary-foreground leading-tight mb-8">
                  "{storyFeature.quote}"
                </blockquote>
                <p className="story-anim opacity-0 font-body text-sm text-primary-foreground/60 mb-2">— {storyFeature.name}, {storyFeature.program}</p>
                <p className="story-anim opacity-0 font-body text-sm text-accent mb-10">{storyFeature.outcome}</p>
                <button
                  onClick={() => navigate("/impact")}
                  className="story-anim opacity-0 group flex items-center gap-2 px-8 py-4 border border-primary-foreground/40 text-primary-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent btn-lift"
                >
                  Read More Stories
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
              <div className="hidden lg:flex flex-col gap-6">
                {[
                  { val: "1,200+", label: "Lives Changed" },
                  { val: "300+", label: "Businesses Started" },
                  { val: "12+", label: "Communities Reached" },
                ].map(({ val, label }) => (
                  <div key={label} className="stat-block opacity-0 p-8 bg-primary-foreground/5 border border-primary-foreground/15 rounded-[20px] stat-glow">
                    <p className="stat-value font-heading text-5xl font-light text-accent mb-2">{val}</p>
                    <p className="font-body text-sm text-primary-foreground/60 uppercase tracking-[0.2em]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Donate / Support Section */}
          <section className="relative py-24 md:py-32 px-8 md:px-16 bg-background overflow-hidden">
            <div className="parallax-el pointer-events-none absolute top-10 right-[-6rem] h-80 w-80 rounded-full bg-accent/12 blur-3xl" data-speed="0.35" />
            <div className="max-w-2xl mx-auto text-center mb-16">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Make A Difference</p>
              <h2 className="section-heading font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
                Your Support Changes<br />A Life
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6">
                Every contribution — large or small — directly funds training, materials, and opportunity for those who need it most.
              </p>
            </div>
            <div ref={donateRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
              {donationTiers.map(({ amount, impact }) => (
                <div
                  key={amount}
                  className="donate-card spotlight-card opacity-0 group p-8 border border-border rounded-[20px] text-center cursor-pointer"
                  onClick={() => navigate("/donate")}
                >
                  <div className="relative z-10">
                    <p className="font-heading text-4xl font-light text-accent mb-4 group-hover:scale-110 transition-transform duration-400">{amount}</p>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{impact}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/donate")}
                className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
              >
                <Heart size={16} className="fill-current" />
                Donate Now
              </button>
              <button
                onClick={() => navigate("/donate#sponsor")}
                className="group flex items-center gap-2 px-10 py-4 border border-foreground/30 text-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent btn-lift"
              >
                <Users size={16} />
                Sponsor a Student
              </button>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </LoadingWrapper>
  );
};

export default Index;
