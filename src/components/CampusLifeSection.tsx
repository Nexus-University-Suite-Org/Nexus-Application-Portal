import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Home, Users, BookOpen, Dumbbell, Leaf, Music } from "lucide-react";
import campusLifeImg from "@/assets/campus-life.jpg";

gsap.registerPlugin(ScrollTrigger);

const highlights = [
  {
    icon: Home,
    title: "Residential Halls",
    stat: "12",
    description:
      "Heritage residences with private courtyards, libraries, and faculty-in-residence programs.",
  },
  {
    icon: Users,
    title: "Student Organizations",
    stat: "85+",
    description:
      "From the Dialectic Society to the Experimental Theatre Collective—every passion finds its people.",
  },
  {
    icon: BookOpen,
    title: "Libraries & Archives",
    stat: "4",
    description:
      "Including the rare manuscripts vault housing over 12,000 pre-modern texts.",
  },
  {
    icon: Dumbbell,
    title: "Athletic Facilities",
    stat: "6",
    description:
      "Olympic-grade aquatic center, fencing salle, and 200-acre cross-country trails.",
  },
  {
    icon: Leaf,
    title: "Botanical Gardens",
    stat: "30 acres",
    description:
      "A living laboratory and contemplative retreat at the heart of campus.",
  },
  {
    icon: Music,
    title: "Performance Venues",
    stat: "3",
    description:
      "Concert hall, black-box theatre, and open-air amphitheatre for 1,200.",
  },
];

const CampusLifeSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading slides in from left
      gsap.fromTo(
        headingRef.current,
        { x: -120, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Image parallax reveal with clip-path
      gsap.fromTo(
        imageRef.current,
        { clipPath: "inset(0 0 100% 0)", scale: 1.1 },
        {
          clipPath: "inset(0 0 0% 0)",
          scale: 1,
          duration: 1.6,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Parallax on the image while scrolling
      if (imageRef.current) {
        gsap.to(imageRef.current?.querySelector("img"), {
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

      // Stats bar counter-style entrance
      if (statsBarRef.current) {
        const items = statsBarRef.current.querySelectorAll(".stat-pill");
        gsap.fromTo(
          items,
          { y: 30, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: statsBarRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Cards stagger from bottom
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".campus-card");
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
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
  }, []);

  return (
    <section
      ref={sectionRef}
      id="campus-life"
      className="py-32 md:py-48 px-8 md:px-16"
    >
      <h2
        ref={headingRef}
        className="heading-section text-foreground mb-8 opacity-0"
      >
        Campus Life
      </h2>
      <p className="body-text text-muted-foreground max-w-2xl mb-16 text-lg">
        Life at University Application Portal extends far beyond the lecture hall. Our campus is
        designed to cultivate the whole person—intellectually, physically, and
        socially.
      </p>

      {/* Hero Image */}
      <div
        ref={imageRef}
        className="w-full overflow-hidden rounded-[20px] mb-24"
      >
        <img
          src={campusLifeImg}
          alt="University Application Portal campus quad at golden hour with students and autumn foliage"
          className="w-full aspect-[21/9] object-cover"
        />
      </div>

      {/* Key Stats Bar */}
      <div
        ref={statsBarRef}
        className="flex flex-wrap justify-center gap-4 md:gap-6 mb-24"
      >
        {[
          { value: "3,200", label: "Students" },
          { value: "96%", label: "Residential" },
          { value: "22:1", label: "Student-Faculty" },
          { value: "52", label: "Countries" },
        ].map((s) => (
          <div
            key={s.label}
            className="stat-pill group flex items-baseline gap-2 px-6 py-3 border border-border rounded-[20px] opacity-0 transition-all duration-400 hover:border-accent/40 hover:bg-accent/5 hover:-translate-y-1 cursor-pointer"
          >
            <span className="font-heading text-2xl md:text-3xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
              {s.value}
            </span>
            <span className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Facility Cards */}
      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
      >
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="campus-card group opacity-0 relative overflow-hidden p-4 -m-4 border border-transparent hover:border-accent/30 hover:bg-accent/5 transition-all duration-500"
            >
              <div className="absolute left-0 top-0 h-full w-[3px] bg-accent origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center border border-border group-hover:border-accent group-hover:bg-accent/10 transition-all duration-500 group-hover:rotate-3">
                  <Icon
                    size={18}
                    className="text-muted-foreground group-hover:text-accent transition-colors duration-500"
                  />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-heading text-xl font-light text-foreground group-hover:text-accent transition-colors duration-400">
                      {item.title}
                    </h3>
                    <span className="font-heading text-2xl font-light text-accent transition-transform duration-500 group-hover:translate-x-1">
                      {item.stat}
                    </span>
                  </div>
                </div>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed pl-14 group-hover:text-foreground transition-colors duration-400">
                {item.description}
              </p>
              <div className="flex items-center justify-between pl-14 mt-6">
                <div className="w-0 h-px bg-accent group-hover:w-full transition-all duration-700" />
                <span className="text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ml-4 leading-none">
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CampusLifeSection;
