import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Globe, Users, Heart, Plane } from "lucide-react";
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

const InternationalStudentsPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  const { data: sections, isLoading } = useContentCollection<PageSection>("page_sections", []);

  const intlSections = sections.filter((s) => s.page_key === "international");
  const services = intlSections.length > 0
    ? intlSections.filter((s) => s.section_key?.startsWith("service")).map((s) => ({ icon: Globe, title: s.title || "Service", desc: s.body || s.subtitle || "" }))
    : [
        { icon: Globe, title: "Visa Assistance", desc: "Help with student visa applications and renewals." },
        { icon: Globe, title: "Airport Pickup", desc: "Complimentary airport transfer on arrival." },
        { icon: Globe, title: "Housing Support", desc: "Assistance finding on or off-campus accommodation." },
        { icon: Globe, title: "Cultural Integration", desc: "Orientation programs and cultural exchange events." },
      ];

  const stats = intlSections.length > 0
    ? intlSections.filter((s) => s.section_key?.startsWith("stat")).map((s) => ({ label: s.title || "", value: s.body || s.subtitle || "" }))
    : [];

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
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.6,
            ease: "power3.inOut",
            delay: 0.4,
          },
        );
      }

      // Stats
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll(".stat-card"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
          },
        );
      }

      // Services
      if (servicesRef.current) {
        gsap.fromTo(
          servicesRef.current.querySelectorAll(".service-card"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: servicesRef.current, start: "top 85%" },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Loading...</p>
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
            alt="International Students"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Global Community
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            International Students
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Join our vibrant global community and access world-class education
            with comprehensive support.
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div
          ref={statsRef}
          className="px-8 md:px-16 py-24 bg-gradient-to-b from-secondary/20 to-background"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((item) => (
              <div key={item.label} className="stat-card opacity-0">
                <div className="card-hover p-8 rounded-[24px] border border-border/40 bg-background hover:border-accent/40 text-center transition-all duration-500">
                  <p className="font-heading text-4xl font-light text-accent mb-3">
                    {item.value}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      <div ref={servicesRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Support System
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Comprehensive Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.length === 0 ? (
            <p className="font-body text-muted-foreground col-span-full">
              No services available at this time.
            </p>
          ) : (
            services.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="service-card opacity-0">
                  <div className="card-hover h-full p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/20 to-background hover:border-accent/40 transition-all duration-500">
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
          )}
        </div>

        {/* Key Benefits */}
        <div className="mt-16 p-8 rounded-[24px] border border-accent/30 bg-accent/5">
          <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-6">
            Why Choose University Application Portal
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Welcoming multicultural campus environment",
              "Competitive tuition with scholarship opportunities",
              "Strong international alumni network",
              "Career services tailored for global graduates",
              "Flexible housing and accommodation options",
              "English-taught programs",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <span className="text-accent mt-1">✓</span>
                <p className="font-body text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InternationalStudentsPage;
