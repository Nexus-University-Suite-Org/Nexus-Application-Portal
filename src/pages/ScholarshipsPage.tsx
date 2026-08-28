import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, TrendingUp, Users } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type ScholarshipDoc = {
  id: string;
  name: string;
  amount?: number;
  currency?: string;
  eligibility_criteria?: string;
  level?: string;
};

const ScholarshipsPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const typesRef = useRef<HTMLDivElement>(null);
  const { data: scholarshipDocs, isLoading } = useContentCollection<ScholarshipDoc>(
    "scholarships",
    [],
    { orderBy: { field: "amount", direction: "desc" } },
  );

  const scholarshipData =
    scholarshipDocs.length > 0
      ? scholarshipDocs.map((item) => ({
          name: item.name,
          amount:
            typeof item.amount === "number"
              ? `${item.currency || "$"}${item.amount.toLocaleString()}`
              : "Varies",
          criteria:
            item.eligibility_criteria ||
            "See scholarship details for eligibility and requirements.",
          count: item.level ? `${item.level} level` : "Open category",
        }))
      : [];

  const totalAmount = scholarshipDocs.reduce(
    (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
    0,
  );
  const dynamicStats = [
    {
      label: "Total Scholarships",
      value:
        totalAmount > 0
          ? `$${Math.round(totalAmount).toLocaleString()}`
          : "—",
      desc: "Recorded in database",
    },
    {
      label: "Coverage",
      value: scholarshipDocs.length > 0 ? `${scholarshipDocs.length}` : "—",
      desc: "Available scholarship records",
    },
    {
      label: "Award Options",
      value: scholarshipDocs.length > 0 ? `${scholarshipDocs.length}` : "—",
      desc: "Different scholarship types",
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

      // Types
      if (typesRef.current) {
        gsap.fromTo(
          typesRef.current.querySelectorAll(".scholarship-card"),
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: typesRef.current, start: "top 85%" },
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
            alt="Scholarships"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Financial Support
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            Scholarships
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Make your education affordable with our comprehensive scholarship
            programs and financial aid options.
          </p>
        </div>
      </div>

      {/* Impact Stats */}
      <div
        ref={statsRef}
        className="px-8 md:px-16 py-24 bg-gradient-to-b from-secondary/20 to-background"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {dynamicStats.map((item) => (
            <div key={item.label} className="stat-card opacity-0">
              <div className="card-hover p-8 rounded-[24px] border border-border/40 bg-background hover:border-accent/40 text-center transition-all duration-500">
                <p className="font-heading text-4xl font-light text-accent mb-3">
                  {item.value}
                </p>
                <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-2">
                  {item.label}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scholarship Types */}
      <div ref={typesRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Categories
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Scholarship Types
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {isLoading && scholarshipData.length === 0 ? (
            <p className="col-span-full text-center py-12 font-body text-muted-foreground">
              Loading scholarships...
            </p>
          ) : !isLoading && scholarshipData.length === 0 ? (
            <p className="col-span-full text-center py-12 font-body text-muted-foreground">
              No scholarships available yet.
            </p>
          ) : (
            scholarshipData.map((scholarship) => (
            <div key={scholarship.name} className="scholarship-card opacity-0">
              <div className="group card-hover h-full p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/20 to-background hover:border-accent/40 transition-all duration-500">
                <Award
                  size={32}
                  className="icon-hover text-accent mb-6 group-hover:scale-110 transition-transform"
                />
                <h3 className="font-heading text-2xl font-light text-foreground mb-4">
                  {scholarship.name}
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="pb-4 border-b border-border/50">
                    <p className="font-body text-xs text-accent font-semibold tracking-widest uppercase mb-1">
                      Award Amount
                    </p>
                    <p className="font-heading text-xl font-light text-foreground">
                      {scholarship.amount}
                    </p>
                  </div>

                  <div className="pb-4 border-b border-border/50">
                    <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">
                      Selection Criteria
                    </p>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {scholarship.criteria}
                    </p>
                  </div>

                  <div>
                    <p className="font-body text-xs text-accent font-semibold tracking-widest uppercase mb-1">
                      Annual Awards
                    </p>
                    <p className="font-body text-sm text-foreground">
                      {scholarship.count}
                    </p>
                  </div>
                </div>

                <Link
                  to="/study/scholarships"
                  className="flex w-full items-center justify-center py-2 px-4 rounded-[12px] border border-accent/50 hover:bg-accent/10 transition-all duration-300"
                >
                  <span className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold">
                    Learn More
                  </span>
                </Link>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Application Timeline */}
        <div className="mt-16 p-8 rounded-[24px] border border-accent/30 bg-accent/5">
          <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-6">
            Important Dates
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="font-heading text-lg font-light text-foreground mb-2">
                March 1, 2025
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Application Opens
              </p>
            </div>
            <div>
              <p className="font-heading text-lg font-light text-foreground mb-2">
                May 31, 2025
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Application Deadline
              </p>
            </div>
            <div>
              <p className="font-heading text-lg font-light text-foreground mb-2">
                July 15, 2025
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Awards Announced
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ScholarshipsPage;
