import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, Users, Briefcase } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type AlumniDoc = {
  id: string;
  name: string;
  occupation?: string;
  company?: string;
  graduation_year?: number;
  bio?: string;
  featured?: boolean;
};

const AlumniPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const spotlightsRef = useRef<HTMLDivElement>(null);
  const { data: alumniDocs, isLoading } = useContentCollection<AlumniDoc>("alumni", [], {
    orderBy: { field: "graduation_year", direction: "desc" },
  });

  const spotlightData =
    alumniDocs.length > 0
      ? alumniDocs
          .filter((item) => item.featured ?? true)
          .slice(0, 3)
          .map((item) => ({
            name: item.name,
            role: [item.occupation, item.company].filter(Boolean).join(", "),
            year: item.graduation_year ? String(item.graduation_year) : "-",
            bio:
              item.bio || "Alumni profile from the University Application Portal community network.",
          }))
      : [];

  const dynamicStats = [
    {
      icon: Users,
      label: "Alumni Records",
      value: `${alumniDocs.length}+`,
      desc: "In our directory",
    },
    {
      icon: Briefcase,
      label: "Featured Profiles",
      value: `${spotlightData.length}`,
      desc: "Spotlighted alumni",
    },
    {
      icon: Award,
      label: "Total Profiles",
      value: `${alumniDocs.length}`,
      desc: "In the community",
    },
  ];

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
          { scale: 1.15, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.8,
            ease: "power2.out",
            delay: 0.2,
          },
        );
      }

      // Stats
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll(".stat-item"),
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

      // Spotlights
      if (spotlightsRef.current) {
        gsap.fromTo(
          spotlightsRef.current.querySelectorAll(".spotlight-card"),
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: spotlightsRef.current, start: "top 85%" },
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
            alt="Our Alumni"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Our Community
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            University Application Portal Alumni
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            A global network of leaders, innovators, and changemakers
            transforming society.
          </p>
        </div>
      </div>

      {/* Alumni Stats */}
      <div
        ref={statsRef}
        className="px-8 md:px-16 py-24 bg-gradient-to-b from-secondary/20 to-background"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {dynamicStats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="stat-item opacity-0">
                <div className="card-hover p-8 rounded-[24px] border border-border/40 bg-background hover:border-accent/40 text-center transition-all duration-500">
                  <Icon
                    size={40}
                    className="icon-hover text-accent mx-auto mb-6"
                  />
                  <p className="font-heading text-3xl font-light text-foreground mb-3">
                    {item.value}
                  </p>
                  <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-3">
                    {item.label}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Alumni */}
      <div ref={spotlightsRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Spotlight
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Distinguished Alumni
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isLoading && spotlightData.length === 0 && (
            <p className="col-span-full text-center font-body text-muted-foreground py-12">
              Loading alumni...
            </p>
          )}
          {!isLoading && spotlightData.length === 0 && (
            <p className="col-span-full text-center font-body text-muted-foreground py-12">
              No alumni profiles available yet.
            </p>
          )}
          {spotlightData.map((alumni) => (
            <div key={alumni.name} className="spotlight-card opacity-0">
              <div className="card-hover p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/20 to-background hover:border-accent/40 transition-all duration-500">
                <div className="mb-6 pb-6 border-b border-border/50">
                  <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-2">
                    Class of {alumni.year}
                  </p>
                  <h3 className="font-heading text-2xl font-light text-foreground mb-2">
                    {alumni.name}
                  </h3>
                  <p className="font-body text-sm text-accent font-semibold">
                    {alumni.role}
                  </p>
                </div>
                <p className="font-body text-muted-foreground leading-relaxed mb-6">
                  {alumni.bio}
                </p>
                <button className="text-accent hover:text-accent/80 transition-colors font-body text-xs tracking-[0.15em] uppercase font-semibold">
                  Read Story →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AlumniPage;
