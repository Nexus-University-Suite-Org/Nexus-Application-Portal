import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
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

const HowToApplyPage = () => {
  const { data: sections, isLoading } = useContentCollection<PageSection>("page_sections", []);

  const howToApplySections = sections.filter((s) => s.page_key === "how-to-apply");
  const fetchedSteps = howToApplySections
    .filter((s) => s.section_key?.startsWith("step"))
    .map((s, i) => ({ number: i + 1, title: s.title || "Step", desc: s.body || s.subtitle || "" }));
  const steps =
    fetchedSteps.length > 0 ? fetchedSteps : [
        { number: 1, title: "Research Programs", desc: "Browse available programs and find one that matches your goals." },
        { number: 2, title: "Check Requirements", desc: "Review admission requirements for your chosen program." },
        { number: 3, title: "Gather Documents", desc: "Prepare academic transcripts, identification, and references." },
        { number: 4, title: "Submit Application", desc: "Complete the online application form with all required details." },
        { number: 5, title: "Pay Application Fee", desc: "Submit the application fee through our secure payment system." },
        { number: 6, title: "Await Decision", desc: "Track your application status and wait for the admissions decision." },
      ];

  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

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
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0 0 0)",
            duration: 1.6,
            ease: "power3.inOut",
            delay: 0.4,
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Steps: animate only once the (async) step content has rendered, so the
  // .step-card elements exist as GSAP targets.
  useEffect(() => {
    if (isLoading || !stepsRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stepsRef.current!.querySelectorAll(".step-card"),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: stepsRef.current, start: "top 85%" },
        },
      );
    }, stepsRef);
    return () => ctx.revert();
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={aboutHero}
            alt="How to Apply"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Application Guide
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            How to Apply
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            A straightforward, step-by-step guide to your University Application Portal admission
            journey.
          </p>
        </div>
      </div>

      {/* Application Steps */}
      <div ref={stepsRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Process
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Six Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="font-body text-muted-foreground">Loading steps...</p>
            </div>
          ) : steps.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="font-body text-muted-foreground">No application steps available at this time.</p>
            </div>
          ) : (
            steps.map((step, index) => (
              <div key={step.number} className="step-card opacity-0">
                <div className="card-hover relative p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/20 to-background hover:border-accent/40 transition-all duration-500 h-full">
                  <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="font-heading text-3xl font-light text-accent/60">
                      {String(step.number).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative pt-8">
                    <h3 className="font-heading text-2xl font-light text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      {step.desc}
                    </p>

                    <div className="inline-flex items-center gap-2 text-accent font-body text-xs tracking-widest uppercase font-semibold">
                      {index < steps.length - 1 ? (
                        <>
                          Next Step
                          <ArrowRight size={16} className="icon-hover" />
                        </>
                      ) : (
                        <>✓ Complete</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Timeline visualization */}
        <div className="mt-16 p-8 rounded-[24px] border border-accent/30 bg-accent/5">
          <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold mb-6">
            Timeline
          </p>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="text-center">
              <p className="font-heading text-2xl font-light text-foreground">
                30 mins
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Register & Start
              </p>
            </div>
            <div className="hidden md:block text-accent">→</div>
            <div className="text-center">
              <p className="font-heading text-2xl font-light text-foreground">
                2 hours
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Complete Forms
              </p>
            </div>
            <div className="hidden md:block text-accent">→</div>
            <div className="text-center">
              <p className="font-heading text-2xl font-light text-foreground">
                30 days
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Processing
              </p>
            </div>
            <div className="hidden md:block text-accent">→</div>
            <div className="text-center">
              <p className="font-heading text-2xl font-light text-foreground">
                Instant
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Decision
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-accent/20 flex flex-wrap items-center gap-4">
            <Link
              to="/admissions/application/start"
              className="group inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-[14px] font-body text-xs tracking-[0.2em] uppercase"
            >
              Start Application
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </Link>
            <p className="font-body text-xs text-muted-foreground">
              This takes you to the application start page and follows all six
              steps above.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowToApplyPage;
