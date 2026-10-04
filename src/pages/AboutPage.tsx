import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import aboutHero from "@/assets/about-hero.jpg";
import studentsHero from "@/assets/students-hero.jpg";
import { Heart, ArrowRight } from "lucide-react";
import { useSpotlightCards, useParallax } from "@/hooks/useScrollReveal";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/** Every CMS key this page reads. Absence is reported in the debug overlay. */
const ABOUT_SETTING_KEYS = [
  "about_story_label",
  "about_story_heading_1",
  "about_story_heading_2",
  "about_story_paragraph",
  "about_founding_label",
  "about_founding_heading",
  "about_founding_story",
  "about_mission_label",
  "about_mission_text",
  "about_vision_label",
  "about_vision_text",
  "about_values_label",
  "about_values_heading",
  "about_programs_btn",
  "about_cta_label",
  "about_cta_heading",
  "about_cta_donate_btn",
  "about_cta_partner_btn",
  "about_values",
  "about_hero_image",
];

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const navigate = useNavigate();
  const imageRef = useRef<HTMLImageElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const founderRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [storyLabel, setStoryLabel] = useState("Our Story");
  const [headingLine1, setHeadingLine1] = useState("Built on Hope,");
  const [headingLine2, setHeadingLine2] = useState("Powered by Purpose");
  const [storyParagraph, setStoryParagraph] = useState(
    "We started with one belief: that every person  regardless of circumstance  deserves the chance to build a dignified life through skills and hard work."
  );
  const [foundingLabel, setFoundingLabel] = useState("Our Founding Story");
  const [foundingHeading, setFoundingHeading] = useState("Why We Started");
  const [foundingStory, setFoundingStory] = useState(
    "Our institute was founded after witnessing firsthand the cycle of poverty trapping single mothers and vulnerable youth in our community — not because of lack of ability, but lack of opportunity and skills.\n\nThe founder, a community leader and educator, believed that practical vocational training — not charity — was the most dignified path to self-sufficiency. A small rented space, three sewing machines, and twelve students became the beginning of something far greater.\n\nToday, hundreds of graduates are running their own businesses, supporting their families, and transforming their communities — one skill at a time."
  );
  const [missionLabel, setMissionLabel] = useState("Our Mission");
  const [missionText, setMissionText] = useState("\u201cTo equip vulnerable youth and single mothers with practical vocational skills that enable them to earn sustainable livelihoods.\u201d");
  const [visionLabel, setVisionLabel] = useState("Our Vision");
  const [visionText, setVisionText] = useState("\u201cA society where every young person has the skills to build a better future.\u201d");
  const [valuesLabel, setValuesLabel] = useState("What We Stand For");
  const [valuesHeading, setValuesHeading] = useState("Our Core Values");
  const [programsBtn, setProgramsBtn] = useState("See Our Programs");
  const [ctaLabel, setCtaLabel] = useState("Join Our Mission");
  const [ctaHeading, setCtaHeading] = useState("Be Part of the Change");
  const [ctaDonateBtn, setCtaDonateBtn] = useState("Donate Now");
  const [ctaPartnerBtn, setCtaPartnerBtn] = useState("Partner With Us");
  const [values, setValues] = useState<Array<{ title: string; desc: string }>>([
    { title: "Empowerment", desc: "We believe every person has the potential to transform their life through education and practical skills." },
    { title: "Dignity", desc: "We treat every student with respect and create an environment where they feel valued and supported." },
    { title: "Practical Education", desc: "Our programs are designed to give students immediately applicable skills for the real world." },
    { title: "Community Impact", desc: "When we invest in one person, we invest in their entire community. Our graduates create ripple effects of change." },
  ]);
  const [heroImage, setHeroImage] = useState<string>(aboutHero);

  const foundingParagraphs = foundingStory.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 0);

  useSpotlightCards(valuesRef);
  useParallax(pageRef);

  const { settings } = useSiteSettings({ keys: ABOUT_SETTING_KEYS, scope: "/about" });

  useEffect(() => {
    const data = settings;
    if (data.about_story_label) setStoryLabel(data.about_story_label);
    if (data.about_story_heading_1) setHeadingLine1(data.about_story_heading_1);
    if (data.about_story_heading_2) setHeadingLine2(data.about_story_heading_2);
    if (data.about_story_paragraph) setStoryParagraph(data.about_story_paragraph);
    if (data.about_founding_label) setFoundingLabel(data.about_founding_label);
    if (data.about_founding_heading) setFoundingHeading(data.about_founding_heading);
    if (data.about_founding_story) setFoundingStory(data.about_founding_story);
    if (data.about_mission_label) setMissionLabel(data.about_mission_label);
    if (data.about_mission_text) setMissionText(data.about_mission_text);
    if (data.about_vision_label) setVisionLabel(data.about_vision_label);
    if (data.about_vision_text) setVisionText(data.about_vision_text);
    if (data.about_values_label) setValuesLabel(data.about_values_label);
    if (data.about_values_heading) setValuesHeading(data.about_values_heading);
    if (data.about_programs_btn) setProgramsBtn(data.about_programs_btn);
    if (data.about_cta_label) setCtaLabel(data.about_cta_label);
    if (data.about_cta_heading) setCtaHeading(data.about_cta_heading);
    if (data.about_cta_donate_btn) setCtaDonateBtn(data.about_cta_donate_btn);
    if (data.about_cta_partner_btn) setCtaPartnerBtn(data.about_cta_partner_btn);
    if (data.about_values) {
      try {
        const parsed = JSON.parse(data.about_values);
        if (Array.isArray(parsed) && parsed.length > 0) setValues(parsed);
      } catch { /* keep fallback */ }
    }
    if (data.about_hero_image) {
      setHeroImage(data.about_hero_image);
      new Image().src = data.about_hero_image;
    }
  }, [settings]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Hero text — cascading reveal
      gsap.fromTo(".about-hero-text > *",
        { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.18, ease: "power3.out", delay: 0.3 }
      );

      // Hero image — cinematic zoom-in
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          { scale: 1.3, opacity: 0 },
          { scale: 1, opacity: 1, duration: 2.2, ease: "power2.out", delay: 0.1 }
        );
      }

      // Founder section — slide from left
      if (founderRef.current) {
        gsap.fromTo(founderRef.current.querySelectorAll(".founder-anim"),
          { x: -50, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 1, stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: founderRef.current, start: "top 80%", toggleActions: "play none none reverse" },
          }
        );

        // Mission/Vision cards — slide from right
        gsap.fromTo(founderRef.current.querySelectorAll(".mission-card"),
          { x: 60, opacity: 0, scale: 0.92 },
          {
            x: 0, opacity: 1, scale: 1,
            duration: 1, stagger: 0.15, delay: 0.2,
            ease: "power3.out",
            scrollTrigger: { trigger: founderRef.current, start: "top 80%", toggleActions: "play none none reverse" },
          }
        );
      }

      // CTA section
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.9, stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: ctaRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!valuesRef.current || values.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(valuesRef.current!.querySelectorAll(".value-card"),
        { y: 60, opacity: 0, scale: 0.9 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.9, stagger: 0.12,
          ease: "back.out(1.2)",
          scrollTrigger: { trigger: valuesRef.current, start: "top 82%", toggleActions: "play none none reverse" },
        }
      );
    }, valuesRef);
    return () => ctx.revert();
  }, [values]);

  return (
    <div ref={pageRef} className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-screen flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img ref={imageRef} src={heroImage} alt="Students at the institute" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-black/70 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 about-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">{storyLabel}</p>
          <h1 className="font-heading text-5xl md:text-8xl font-light text-primary-foreground leading-[0.9] mb-8 opacity-0">
            {headingLine1}<br />{headingLine2}
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            {storyParagraph}
          </p>
        </div>
      </div>

      {/* Founder Story */}
      <div ref={founderRef} className="px-8 md:px-16 py-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="founder-anim opacity-0 font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{foundingLabel}</p>
            <h2 className="founder-anim opacity-0 font-heading text-4xl md:text-6xl font-light text-foreground leading-tight mb-8">{foundingHeading}</h2>
            {foundingParagraphs.map((para, i) => (
              <p key={i} className={`founder-anim opacity-0 font-body text-base text-muted-foreground leading-relaxed ${i === foundingParagraphs.length - 1 ? 'mb-10' : 'mb-6'}`}>
                {para}
              </p>
            ))}
            <button
              onClick={() => navigate("/programs")}
              className="founder-anim opacity-0 group flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
            >
              {programsBtn}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
          <div className="space-y-6">
            <div className="mission-card opacity-0 p-10 bg-primary text-primary-foreground rounded-[20px] magnetic-card">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{missionLabel}</p>
              <p className="font-heading text-2xl md:text-3xl font-light text-primary-foreground leading-relaxed">
                {missionText}
              </p>
            </div>
            <div className="mission-card opacity-0 p-10 border border-border rounded-[20px] magnetic-card">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{visionLabel}</p>
              <p className="font-heading text-2xl md:text-3xl font-light text-foreground leading-relaxed">
                {visionText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div ref={valuesRef} className="px-8 md:px-16 py-32 bg-secondary/30">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{valuesLabel}</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">{valuesHeading}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground col-span-2">Content coming soon.</p>
          ) : (
            values.map((v) => (
              <div key={v.title} className="value-card spotlight-card opacity-0 group p-10 border border-border bg-background rounded-[20px]">
                <div className="relative z-10">
                  <h3 className="font-heading text-3xl font-light text-foreground mb-4 group-hover:text-accent transition-colors duration-500">{v.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div ref={ctaRef} className="px-0 md:px-0 py-28">
        <div className="relative mx-auto h-[440px] w-full max-w-[1800px] overflow-hidden border border-white/10 bg-black/90 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${studentsHero})`,
              filter: "brightness(0.7) contrast(1.08)",
              transform: "scale(1.08)",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,7,0.75)_0%,rgba(8,8,7,0.58)_35%,rgba(8,8,7,0.6)_100%)]" />
          <div className="relative z-10 flex h-full items-center justify-center px-6 md:px-12">
            <div className="mx-auto max-w-5xl text-center">
              <p className="font-body text-xs tracking-[0.4em] uppercase text-accent mb-6">{ctaLabel}</p>
              <h2 className="font-heading text-4xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-10 italic tracking-[-0.04em]">{ctaHeading}</h2>
              <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-4 md:gap-6">
                <button onClick={() => navigate("/donate")} className="group flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-7 py-4 text-sm font-medium tracking-[0.2em] text-accent-foreground uppercase shadow-[0_10px_30px_rgba(182,136,65,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(182,136,65,0.42)]">
                  <Heart size={16} className="fill-current" />{ctaDonateBtn}
                </button>
                <button onClick={() => navigate("/contact")} className="group flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-4 text-sm font-medium tracking-[0.2em] text-primary-foreground uppercase backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-accent hover:text-accent">
                  {ctaPartnerBtn}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
