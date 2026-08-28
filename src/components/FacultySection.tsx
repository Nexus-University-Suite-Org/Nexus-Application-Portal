import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type FacultyDoc = {
  id: string;
  name?: string;
  title?: string;
  department?: string;
  bio?: string;
  specialization?: string;
};

const FacultySection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data: facultyDocs } = useContentCollection<FacultyDoc>("faculty", []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      if (cardsRef.current) {
        const items = cardsRef.current.querySelectorAll(".faculty-card");
        gsap.fromTo(
          items,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [facultyDocs]);

  return (
    <section
      ref={sectionRef}
      id="faculty"
      className="py-32 md:py-48 px-8 md:px-16"
    >
      <h2
        ref={headingRef}
        className="heading-section text-foreground mb-8 opacity-0"
      >
        Faculty
      </h2>
      <p className="body-text text-muted-foreground max-w-2xl mb-24 text-lg">
        Our faculty are not merely instructors—they are active scholars whose
        work reshapes their disciplines. Each brings decades of inquiry to the
        classroom.
      </p>

      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
      >
        {facultyDocs.map((member) => (
          <div
            key={member.id}
            className="faculty-card group opacity-0 relative overflow-hidden p-5 -m-5 border border-transparent hover:border-accent/30 hover:bg-accent/5 transition-all duration-500"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-accent origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            <div className="w-full aspect-[3/2] bg-secondary flex items-center justify-center mb-6 overflow-hidden transition-all duration-500 group-hover:bg-accent/10 group-hover:border group-hover:border-accent/30">
              <span className="font-heading text-6xl font-light text-muted-foreground/40 tracking-widest select-none transition-colors duration-500 group-hover:text-accent/50">
                {(member.name ?? "")
                  .split(" ")
                  .filter((w) => w.length > 1)
                  .map((w) => w[0])
                  .join("")}
              </span>
            </div>

            <h3 className="font-heading text-2xl font-light text-foreground mb-1 group-hover:text-accent transition-colors duration-400">
              {member.name}
            </h3>
            <p className="font-body text-xs tracking-[0.15em] uppercase text-accent mb-4 group-hover:tracking-[0.2em] transition-all duration-400">
              {member.title}
            </p>

            <div className="space-y-3">
              {member.specialization && (
                <div>
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    Research
                  </span>
                  <p className="font-body text-sm text-foreground mt-0.5 group-hover:text-accent/90 transition-colors duration-300">
                    {member.specialization}
                  </p>
                </div>
              )}
              {member.bio && (
                <div>
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    Credentials
                  </span>
                  <p className="font-body text-sm text-foreground mt-0.5 group-hover:text-foreground transition-colors duration-300">
                    {member.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {facultyDocs.length === 0 && (
          <p className="col-span-full text-muted-foreground text-center py-12">
            No faculty members yet. Add them from the admin panel.
          </p>
        )}
      </div>
    </section>
  );
};

export default FacultySection;
