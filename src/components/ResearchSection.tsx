import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import researchImg from "@/assets/research.jpg";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { number: "147", label: "Research Labs" },
  { number: "2,300+", label: "Published Papers (2025)" },
  { number: "89%", label: "Faculty with Active Grants" },
  { number: "34", label: "Countries Represented" },
];

const ResearchSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading from right
      gsap.fromTo(
        headingRef.current,
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Image reveal: scale down + fade in with clip-path from bottom
      gsap.fromTo(
        imageRef.current,
        { clipPath: "inset(100% 0 0 0)", scale: 1.1 },
        {
          clipPath: "inset(0% 0 0 0)",
          scale: 1,
          duration: 1.6,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Parallax on inner image
      if (imageRef.current) {
        gsap.to(imageRef.current.querySelector("img"), {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Stats stagger
      if (statsRef.current) {
        const items = statsRef.current.querySelectorAll(".stat-item");
        gsap.fromTo(
          items,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="research"
      className="py-32 md:py-48 px-8 md:px-16"
    >
      <h2
        ref={headingRef}
        className="heading-section text-foreground mb-24 text-right opacity-0"
      >
        Research
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <p className="body-text text-foreground max-w-2xl text-lg mb-16">
            At University Application Portal, research is not a department—it is the institution's
            lifeblood. From quantum computing to ancient languages, our faculty
            and students push the boundaries of human understanding with a
            fearlessness matched only by their methodological rigor.
          </p>

          <div
            ref={statsRef}
            className="grid grid-cols-2 gap-x-8 md:gap-x-16 gap-y-8 md:gap-y-12"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="stat-item group opacity-0 p-4 md:p-5 border border-transparent hover:border-accent/30 hover:bg-accent/5 transition-all duration-500 cursor-pointer"
              >
                <div className="font-heading text-4xl md:text-5xl font-light text-foreground group-hover:text-accent transition-colors duration-400">
                  {stat.number}
                </div>
                <div className="font-body text-sm text-muted-foreground mt-2 tracking-wider uppercase group-hover:text-foreground transition-colors duration-300">
                  {stat.label}
                </div>
                <div className="w-0 h-px bg-accent mt-3 group-hover:w-12 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
          <div ref={imageRef} className="overflow-hidden rounded-[20px]">
            <img
              src={researchImg}
              alt="Scientific laboratory glassware with light refracting through beakers"
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchSection;
