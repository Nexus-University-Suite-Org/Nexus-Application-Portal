import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Monitor, Users, Clock, Award } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  subtitle?: string;
  body?: string;
};

gsap.registerPlugin(ScrollTrigger);

const LearningOnlinePage = () => {
  const { data: sections, isLoading } = useContentCollection<PageSection>("page_sections", []);

  const onlineSections = sections.filter((s) => s.page_key === "learning-online");
  const features = onlineSections.length > 0
    ? onlineSections.filter((s) => s.section_key?.startsWith("feature")).map((s) => ({ icon: Monitor, title: s.title || "Feature", desc: s.body || s.subtitle || "" }))
    : [
        { icon: Monitor, title: "Flexible Schedule", desc: "Access courses anytime, anywhere at your own pace" },
        { icon: Users, title: "Interactive Community", desc: "Connect with peers and instructors globally" },
        { icon: Clock, title: "Self-Paced Learning", desc: "Progress at your own speed with no fixed deadlines" },
        { icon: Award, title: "Recognized Credentials", desc: "Earn certificates and degrees with full recognition" },
      ];
  const programs = onlineSections.length > 0
    ? onlineSections.filter((s) => s.section_key?.startsWith("program")).map((s) => ({ name: s.title || "Program", duration: "", students: "", desc: s.body || s.subtitle || "" }))
    : [];
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const programsRef = useRef<HTMLDivElement>(null);

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

      // Features
      if (featuresRef.current) {
        gsap.fromTo(
          featuresRef.current.querySelectorAll(".feature-card"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: featuresRef.current, start: "top 85%" },
          },
        );
      }

      // Programs
      if (programsRef.current) {
        gsap.fromTo(
          programsRef.current.querySelectorAll(".program-card"),
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: { trigger: programsRef.current, start: "top 85%" },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4" />
          <p className="font-body text-sm text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={aboutHero}
            alt="Learning Online"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Digital Education
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            Learning Online
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Access world-class education from anywhere in the world with our
            comprehensive online programs.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div
        ref={featuresRef}
        className="px-8 md:px-16 py-24 bg-gradient-to-b from-secondary/20 to-background"
      >
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Advantages
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Why Choose Online Learning
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.length > 0 ? (
            features.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="feature-card opacity-0">
                  <div className="card-hover h-full p-8 rounded-[24px] border border-border/50 bg-background hover:border-accent/40 transition-all duration-500">
                    <Icon size={32} className="icon-hover text-accent mb-6" />
                    <h3 className="font-heading text-xl font-light text-foreground mb-3">
                      {item.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="font-body text-sm text-muted-foreground">No features available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Online Programs */}
      <div ref={programsRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Offerings
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Online Program Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {programs.length > 0 ? (
            programs.map((program) => (
              <div key={program.name} className="program-card opacity-0">
                <div className="card-hover h-full p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/20 to-background hover:border-accent/40 transition-all duration-500">
                  <h3 className="font-heading text-2xl font-light text-foreground mb-6">
                    {program.name}
                  </h3>

                  <div className="space-y-5 mb-8">
                    <div className="pb-5 border-b border-border/50">
                      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-2">
                        Duration
                      </p>
                      <p className="font-body text-sm text-foreground font-semibold">
                        {program.duration}
                      </p>
                    </div>

                    <div className="pb-5 border-b border-border/50">
                      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-2">
                        Active Students
                      </p>
                      <p className="font-body text-sm text-foreground font-semibold">
                        {program.students}
                      </p>
                    </div>

                    <div>
                      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-2">
                        Description
                      </p>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {program.desc}
                      </p>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-[16px] border border-accent/50 hover:bg-accent/10 transition-all duration-300">
                    <span className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold">
                      Explore Programs
                    </span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="font-body text-sm text-muted-foreground">No programs available at the moment.</p>
            </div>
          )}
        </div>

        {/* Technology Platform */}
        <div className="mt-16 p-8 rounded-[24px] border border-accent/30 bg-accent/5">
          <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-6">
            Learning Platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-heading text-xl font-light text-foreground mb-4">
                Cutting-Edge Technology
              </h4>
              <ul className="space-y-3">
                {[
                  "Interactive video lectures",
                  "Live tutoring sessions",
                  "AI-powered learning insights",
                  "Mobile app access",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 font-body text-sm text-muted-foreground"
                  >
                    <span className="text-accent">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-xl font-light text-foreground mb-4">
                Support & Community
              </h4>
              <ul className="space-y-3">
                {[
                  "24/7 technical support",
                  "Discussion forums",
                  "Peer study groups",
                  "Career services",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 font-body text-sm text-muted-foreground"
                  >
                    <span className="text-accent">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LearningOnlinePage;
