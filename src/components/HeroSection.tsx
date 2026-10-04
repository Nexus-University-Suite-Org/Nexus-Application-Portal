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
  const [heroCtaLearnMore, setHeroCtaLearnMore] = useState("Learn More");
  const [heroCtaLearnMoreVisible, setHeroCtaLearnMoreVisible] = useState(true);
  const [heroStats, setHeroStats] = useState(fallbackStats);
  const [heroImage, setHeroImage] = useState<string>(heroCampus);
  const { data: sections } = useContentCollection<PageSection>("page_sections", []);
  const homeSections = sections.filter((s) => s.page_key === "home");
  const statsSection = homeSections.find((s) => s.section_key === "impact-stats");
  const impactStats = statsSection?.body
    ? (() => { try { return JSON.parse(statsSection.body); } catch { return fallbackStats; } })()
    : fallbackStats;

  useEffect(() => {
    fetch("/api/v1/content/site-settings")
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
        if (data.hero_cta_learn_more) setHeroCtaLearnMore(data.hero_cta_learn_more);
        if (data.hero_cta_learn_more_visible !== undefined) setHeroCtaLearnMoreVisible(data.hero_cta_learn_more_visible !== 'false');
        if (data.hero_stats) {
          try {
            const parsed = JSON.parse(data.hero_stats);
            if (Array.isArray(parsed) && parsed.length > 0) setHeroStats(parsed);
          } catch {}
        }
        if (data.home_hero_image) {
          setHeroImage(data.home_hero_image);
          new Image().src = data.home_hero_image;
        }
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
        opacity: 0.35,
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
      className="relative min-h-screen overflow-hidden flex flex-col bg-[#090907]"
    >
      <div ref={imageRef} className="absolute inset-0 -top-10">
        <img
          src={heroImage}
          alt="Students learning practical vocational skills at the institute"
          className="w-full h-[130%] object-cover brightness-[0.62] contrast-[1.08]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,7,0.84)_0%,rgba(8,8,7,0.74)_32%,rgba(8,8,7,0.3)_68%,rgba(8,8,7,0.7)_100%)]" />
        <div ref={overlayRef} className="absolute inset-0 bg-black/45" />
      </div>
      <div
        ref={heroGlowRef}
        className="absolute left-1/2 top-1/2 z-[1] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.2)_0%,transparent_62%)] blur-3xl pointer-events-none"
      />
      <div className="hero-orb absolute top-24 right-[8%] z-[1] h-28 w-28 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
      <div className="hero-orb absolute bottom-28 left-[7%] z-[1] h-24 w-24 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div
        ref={heroContentRef}
        className="relative z-10 flex flex-1 items-center px-6 sm:px-8 md:px-16 pb-12 pt-28 md:pb-16"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-10">
          <div className="max-w-4xl mx-auto lg:mx-0 text-center lg:text-left">
            <p className="font-body text-[10px] sm:text-xs tracking-[0.28em] uppercase text-accent mb-6 flex items-center justify-center lg:justify-start gap-2">
              <Heart size={12} className="fill-accent" />
              {heroTagline}
            </p>

            <h1
              ref={titleRef}
              className="font-heading text-[3.5rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[8rem] leading-[0.86] tracking-[-0.04em] text-primary-foreground max-w-4xl opacity-0 mx-auto lg:mx-0"
            >
              {heroHeading1}
              <br />
              <em className="text-accent italic">{heroHeading2}</em>
              <br />
              {heroHeading3}
            </h1>

            <p
              ref={subtitleRef}
              className="font-body mt-8 max-w-xl text-base sm:text-lg text-primary-foreground/75 leading-relaxed opacity-0 mx-auto lg:mx-0"
            >
              {heroSubtitle}
            </p>

            <div ref={ctaRef} className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 opacity-0">
              {heroCtaDonateVisible && (
                <button
                  onClick={() => navigate("/donate")}
                  className="group flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-accent-foreground uppercase shadow-[0_10px_30px_hsl(var(--accent)/0.35)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_16px_36px_hsl(var(--accent)/0.42)]"
                >
                  <Heart size={16} className="fill-current" />
                  {heroCtaDonate}
                </button>
              )}

              {heroCtaSponsorVisible && (
                <button
                  onClick={() => navigate("/donate#sponsor")}
                  className="group flex items-center gap-2 rounded-full border border-primary-foreground/35 bg-white/5 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-primary-foreground uppercase backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                >
                  <Users size={16} />
                  {heroCtaSponsor}
                </button>
              )}

              {heroCtaLearnMoreVisible && (
                <button
                  onClick={() => navigate("/about")}
                  className="group flex items-center gap-2 px-2 py-3 text-sm tracking-[0.18em] text-primary-foreground/75 uppercase transition-all duration-500 hover:text-primary-foreground"
                >
                  {heroCtaLearnMore}
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              )}
            </div>
          </div>

          <div className="hidden xl:block w-[320px] pr-3">
            <div className="ml-auto rounded-[28px] border border-white/15 bg-black/20 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
                <span>Community</span>
                <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-accent">Live</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/20 bg-white/5 p-4">
                  <p className="text-3xl font-heading text-accent">1,200+</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary-foreground/60">students trained</p>
                </div>

                <div className="space-y-3 text-sm text-primary-foreground/75">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>Skills funded</span>
                    <span className="font-medium text-primary-foreground">8 programs</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>Graduates</span>
                    <span className="font-medium text-primary-foreground">300+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={statsRef}
        className="relative z-10 mx-auto mt-6 mb-12 w-full max-w-7xl px-6 sm:px-8 md:px-16 opacity-0"
      >
        <div className="grid grid-cols-2 gap-4 rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm md:grid-cols-4 md:p-6">
          {heroStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center md:text-left">
              <p className="font-heading text-3xl md:text-4xl font-light text-accent">
                {stat.value}
              </p>
              <p className="mt-2 font-body text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 opacity-60">
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground">
          Scroll
        </span>
        <div className="h-8 w-px bg-primary-foreground/60 animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;
