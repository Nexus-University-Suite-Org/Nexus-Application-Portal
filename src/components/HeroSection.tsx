import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, Users, ArrowRight } from "lucide-react";
import heroCampus from "@/assets/hero-campus.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

const fallbackStats = [
  { value: "1,200+", label: "Students Trained" },
  { value: "70%", label: "Women & Single Mothers" },
  { value: "300+", label: "Graduates Running Businesses" },
  { value: "8", label: "Vocational Programs" },
];

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroGlowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [heroTagline, setHeroTagline] = useState("Empowering Communities Since 2010");
  const [heroHeading1, setHeroHeading1] = useState("Empowering Single Mothers");
  const [heroHeading2, setHeroHeading2] = useState("& Vulnerable Youth");
  const [heroHeading3, setHeroHeading3] = useState("Through Practical Skills");
  const [heroSubtitle, setHeroSubtitle] = useState("We equip vulnerable youth and single mothers with vocational skills that enable them to earn sustainable livelihoods and build better futures.");
  const [heroCtaDonate, setHeroCtaDonate] = useState("Donate Now");
  const [heroCtaSponsor, setHeroCtaSponsor] = useState("Sponsor a Student");
  const [heroCtaDonateVisible, setHeroCtaDonateVisible] = useState(true);
  const [heroCtaSponsorVisible, setHeroCtaSponsorVisible] = useState(true);
  const { data: sections } = useContentCollection<PageSection>("page_sections", []);
  const homeSections = sections.filter((s) => s.page_key === "home");
  const statsSection = homeSections.find((s) => s.section_key === "impact-stats");
  const impactStats = statsSection?.body
    ? (() => { try { return JSON.parse(statsSection.body); } catch { return fallbackStats; } })()
    : fallbackStats;

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/content/site-settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: Record<string, string>) => {
        if (data.hero_tagline) setHeroTagline(data.hero_tagline);
        if (data.hero_heading_1) setHeroHeading1(data.hero_heading_1);
        if (data.hero_heading_2) setHeroHeading2(data.hero_heading_2);
        if (data.hero_heading_3) setHeroHeading3(data.hero_heading_3);
        if (data.hero_subtitle) setHeroSubtitle(data.hero_subtitle);
        if (data.hero_cta_donate) setHeroCtaDonate(data.hero_cta_donate);
        if (data.hero_cta_sponsor) setHeroCtaSponsor(data.hero_cta_sponsor);
        if (data.hero_cta_donate_visible !== undefined) setHeroCtaDonateVisible(data.hero_cta_donate_visible !== 'false');
        if (data.hero_cta_sponsor_visible !== undefined) setHeroCtaSponsorVisible(data.hero_cta_sponsor_visible !== 'false');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let handleMouseMove: ((event: MouseEvent) => void) | null = null;
    let handleMouseLeave: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.4, ease: "power3.out", delay: 0.3 },
      );
      gsap.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.7 },
      );
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 1 },
      );
      gsap.fromTo(
        statsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 1.3 },
      );

      gsap.to(imageRef.current, {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(overlayRef.current, {
        opacity: 0.75,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-orb", {
        y: -24,
        x: 16,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.45,
      });

      const contentX = gsap.quickTo(heroContentRef.current, "x", {
        duration: 0.9,
        ease: "power3.out",
      });
      const contentY = gsap.quickTo(heroContentRef.current, "y", {
        duration: 0.9,
        ease: "power3.out",
      });
      const glowX = gsap.quickTo(heroGlowRef.current, "x", {
        duration: 0.7,
        ease: "power2.out",
      });
      const glowY = gsap.quickTo(heroGlowRef.current, "y", {
        duration: 0.7,
        ease: "power2.out",
      });

      handleMouseMove = (event: MouseEvent) => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

        contentX(offsetX * 16);
        contentY(offsetY * 10);
        glowX(offsetX * 180);
        glowY(offsetY * 130);
      };

      handleMouseLeave = () => {
        contentX(0);
        contentY(0);
        glowX(0);
        glowY(0);
      };

      if (sectionRef.current && handleMouseMove && handleMouseLeave) {
        sectionRef.current.addEventListener("mousemove", handleMouseMove);
        sectionRef.current.addEventListener("mouseleave", handleMouseLeave);
      }
    }, sectionRef);

    return () => {
      if (sectionRef.current && handleMouseMove && handleMouseLeave) {
        sectionRef.current.removeEventListener("mousemove", handleMouseMove);
        sectionRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden flex flex-col"
    >
      {/* Hero Image */}
      <div ref={imageRef} className="absolute inset-0 -top-10">
        <img
          src={heroCampus}
          alt="Students learning practical vocational skills at the institute"
          className="w-full h-[130%] object-cover"
        />
        <div ref={overlayRef} className="absolute inset-0 bg-foreground/55" />
      </div>
      <div
        ref={heroGlowRef}
        className="absolute left-1/2 top-1/2 z-[1] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.25)_0%,transparent_68%)] blur-3xl pointer-events-none"
      />
      <div className="hero-orb absolute top-24 right-[8%] z-[1] h-28 w-28 rounded-full bg-accent/20 blur-2xl pointer-events-none" />
      <div className="hero-orb absolute bottom-28 left-[7%] z-[1] h-24 w-24 rounded-full bg-primary-foreground/25 blur-2xl pointer-events-none" />

      {/* Hero Content */}
      <div
        ref={heroContentRef}
        className="relative z-10 flex flex-col justify-end flex-1 px-8 md:px-16 pt-40 pb-16 md:pb-24"
      >
        <div className="max-w-5xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-2">
            <Heart size={12} className="fill-accent" />
            {heroTagline}
          </p>
          <h1
            ref={titleRef}
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-primary-foreground leading-[0.92] max-w-4xl opacity-0"
          >
            {heroHeading1}
            <br />
            <em className="text-accent">{heroHeading2}</em>
            <br />
            {heroHeading3}
          </h1>
          <p
            ref={subtitleRef}
            className="font-body mt-8 text-primary-foreground/75 max-w-xl text-lg leading-relaxed opacity-0"
          >
            {heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4 mt-10 opacity-0">
            {heroCtaDonateVisible && (
              <button
                onClick={() => navigate("/donate")}
                className="group flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 hover:scale-105"
              >
                <Heart size={16} className="fill-current" />
                {heroCtaDonate}
              </button>
            )}
            {heroCtaSponsorVisible && (
              <button
                onClick={() => navigate("/donate#sponsor")}
                className="group flex items-center gap-2 px-8 py-4 border border-primary-foreground/50 text-primary-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent"
              >
                <Users size={16} />
                {heroCtaSponsor}
              </button>
            )}
            <button
              onClick={() => navigate("/about")}
              className="group flex items-center gap-2 px-8 py-4 text-primary-foreground/70 font-body text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:text-primary-foreground"
            >
              Learn More
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        {/* Impact Stats Bar */}
        <div
          ref={statsRef}
          className="mt-16 pt-8 border-t border-primary-foreground/20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-0"
        >
          {impactStats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="font-heading text-3xl md:text-4xl font-light text-accent">
                {stat.value}
              </p>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-primary-foreground/60 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-10">
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground">
          Scroll
        </span>
        <div className="w-px h-8 bg-primary-foreground/50 animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;
