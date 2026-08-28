import { useEffect, useRef } from "react";
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
  subtitle?: string;
  body?: string;
};

const AdmissionsListsPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const typesRef = useRef<HTMLDivElement>(null);
  const requirementsRef = useRef<HTMLDivElement>(null);

  const { data: sections, isLoading } = useContentCollection<PageSection>("page_sections", []);

  const admissionsSections = sections.filter((s) => s.page_key === "admissions-lists");
  const admissionTypes = admissionsSections.length > 0
    ? admissionsSections.filter((s) => s.section_key?.startsWith("type")).map((s) => ({ type: s.title || "Admission", intake: "", deadline: "", desc: s.body || s.subtitle || "" }))
    : [
        { type: "Undergraduate", intake: "500 students", deadline: "March 31", desc: "Bachelor's degree programs across all colleges." },
        { type: "Postgraduate", intake: "200 students", deadline: "April 30", desc: "Master's and doctoral programs." },
        { type: "Professional", intake: "150 students", deadline: "May 15", desc: "Professional certification programs." },
        { type: "International", intake: "100 students", deadline: "June 30", desc: "Programs for international students." },
      ];

  const requirements = admissionsSections.filter((s) => s.section_key?.startsWith("req")).map((s) => s.body || s.subtitle || s.title || "").filter(Boolean);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
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

      if (typesRef.current) {
        gsap.fromTo(
          typesRef.current.querySelectorAll(".admission-card"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: typesRef.current, start: "top 85%" },
          },
        );
      }

      if (requirementsRef.current) {
        gsap.fromTo(
          requirementsRef.current.querySelectorAll(".requirement-item"),
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: requirementsRef.current,
              start: "top 85%",
            },
          },
        );
      }
    });

    return () => ctx.revert();
  }, [sections]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={aboutHero}
            alt="Admissions"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Getting Started
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            Admissions Lists
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Explore our diverse admission pathways and find the program that
            fits your aspirations.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="px-8 md:px-16 py-24 flex items-center justify-center">
          <p className="font-body text-muted-foreground">Loading admissions data...</p>
        </div>
      ) : (
        <>
          <div
            ref={typesRef}
            className="px-8 md:px-16 py-24 bg-gradient-to-b from-secondary/20 to-background"
          >
            <div className="mb-16">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
                Pathways
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
                Admission Categories
              </h2>
            </div>

            {admissionTypes.length === 0 ? (
              <p className="font-body text-muted-foreground">No admission types available at this time.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {admissionTypes.map((item) => (
                  <div key={item.type} className="admission-card opacity-0">
                    <div className="card-hover p-8 rounded-[24px] border border-border/50 bg-background hover:border-accent/40 transition-all duration-500">
                      <div className="mb-6 pb-6 border-b border-border/50">
                        <h3 className="font-heading text-2xl font-light text-foreground mb-2">
                          {item.type}
                        </h3>
                        <p className="font-body text-sm text-accent font-semibold">
                          {item.intake}
                        </p>
                      </div>
                      <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="p-4 rounded-[16px] bg-accent/5 border border-accent/20">
                        <p className="font-body text-xs text-accent font-semibold tracking-widest uppercase mb-1">
                          Application Deadline
                        </p>
                        <p className="font-body text-foreground font-semibold">
                          {item.deadline}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div ref={requirementsRef} className="px-8 md:px-16 py-24 bg-background">
            <div className="mb-16">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
                Prerequisites
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
                General Requirements
              </h2>
            </div>

            {requirements.length === 0 ? (
              <p className="font-body text-muted-foreground">No requirements listed at this time.</p>
            ) : (
              <div className="max-w-3xl">
                <div className="space-y-4">
                  {requirements.map((req) => (
                    <div
                      key={req}
                      className="requirement-item opacity-0 card-hover flex items-start gap-4 p-6 rounded-[20px] border border-border/40 hover:border-accent/40 bg-gradient-to-r from-secondary/10 to-background transition-all duration-500"
                    >
                      <CheckCircle2
                        size={24}
                        className="icon-hover text-accent flex-shrink-0 mt-0.5"
                      />
                      <p className="font-body text-muted-foreground leading-relaxed pt-1">
                        {req}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 p-8 rounded-[24px] border border-accent/30 bg-accent/5">
              <p className="font-body text-sm text-foreground mb-4">
                📝 <span className="font-semibold">Note:</span> Each program may
                have additional specific requirements. Check the program details for
                full information.
              </p>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default AdmissionsListsPage;
