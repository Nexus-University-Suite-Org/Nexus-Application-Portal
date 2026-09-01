import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import aboutHero from "@/assets/about-hero.jpg";
import { Heart, ArrowRight } from "lucide-react";
import { useSpotlightCards, useParallax } from "@/hooks/useScrollReveal";
import { useContentCollection } from "@/hooks/useContentCollection";

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  subtitle?: string;
  body?: string;
};

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
    "We started with one belief: that every person — regardless of circumstance — deserves the chance to build a dignified life through skills and hard work."
  );
  const [foundingLabel, setFoundingLabel] = useState("Our Founding Story");
  const [foundingHeading, setFoundingHeading] = useState("Why We Started");

  useSpotlightCards(valuesRef);
  useParallax(pageRef);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/content/site-settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: Record<string, string>) => {
        if (data.about_story_label) setStoryLabel(data.about_story_label);
        if (data.about_story_heading_1) setHeadingLine1(data.about_story_heading_1);
        if (data.about_story_heading_2) setHeadingLine2(data.about_story_heading_2);
        if (data.about_story_paragraph) setStoryParagraph(data.about_story_paragraph);
        if (data.about_founding_label) setFoundingLabel(data.about_founding_label);
        if (data.about_founding_heading) setFoundingHeading(data.about_founding_heading);
      })
      .catch(() => {});
  }, []);

  const { data: sections, isLoading } = useContentCollection<PageSection>("page_sections", []);

  const aboutSections = sections.filter((s) => s.page_key === "about");
  const values = aboutSections.length > 0
    ? aboutSections.filter((s) => s.section_key?.startsWith("value")).map((s) => ({ title: s.title || "Value", desc: s.body || s.subtitle || "" }))
    : [
        { title: "Empowerment", desc: "We believe every person has the potential to transform their life through education and practical skills." },
        { title: "Dignity", desc: "We treat every student with respect and create an environment where they feel valued and supported." },
        { title: "Practical Education", desc: "Our programs are designed to give students immediately applicable skills for the real world." },
        { title: "Community Impact", desc: "When we invest in one person, we invest in their entire community. Our graduates create ripple effects of change." },
      ];

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

      // Values — staggered with scale bounce
      if (valuesRef.current) {
        gsap.fromTo(valuesRef.current.querySelectorAll(".value-card"),
          { y: 60, opacity: 0, scale: 0.9 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.9, stagger: 0.12,
            ease: "back.out(1.2)",
            scrollTrigger: { trigger: valuesRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          }
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

  return (
    <div ref={pageRef} className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-screen flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img ref={imageRef} src={aboutHero} alt="Students at the institute" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-primary/70 rounded-none" />
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
            <p className="founder-anim opacity-0 font-body text-base text-muted-foreground leading-relaxed mb-6">
              Our institute was founded after witnessing firsthand the cycle of poverty trapping single mothers and vulnerable youth in our community — not because of lack of ability, but lack of opportunity and skills.
            </p>
            <p className="founder-anim opacity-0 font-body text-base text-muted-foreground leading-relaxed mb-6">
              The founder, a community leader and educator, believed that practical vocational training — not charity — was the most dignified path to self-sufficiency. A small rented space, three sewing machines, and twelve students became the beginning of something far greater.
            </p>
            <p className="founder-anim opacity-0 font-body text-base text-muted-foreground leading-relaxed mb-10">
              Today, hundreds of graduates are running their own businesses, supporting their families, and transforming their communities — one skill at a time.
            </p>
            <button
              onClick={() => navigate("/programs")}
              className="founder-anim opacity-0 group flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
            >
              See Our Programs
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
          <div className="space-y-6">
            <div className="mission-card opacity-0 p-10 bg-primary text-primary-foreground rounded-[20px] magnetic-card">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Our Mission</p>
              <p className="font-heading text-2xl md:text-3xl font-light text-primary-foreground leading-relaxed">
                "To equip vulnerable youth and single mothers with practical vocational skills that enable them to earn sustainable livelihoods."
              </p>
            </div>
            <div className="mission-card opacity-0 p-10 border border-border rounded-[20px] magnetic-card">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Our Vision</p>
              <p className="font-heading text-2xl md:text-3xl font-light text-foreground leading-relaxed">
                "A society where every young person has the skills to build a better future."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div ref={valuesRef} className="px-8 md:px-16 py-32 bg-secondary/30">
        <div className="max-w-2xl mb-20">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">What We Stand For</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading ? (
            <p className="font-body text-sm text-muted-foreground col-span-2">Loading...</p>
          ) : values.length === 0 ? (
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
      <div ref={ctaRef} className="px-8 md:px-16 py-32 text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">Join Our Mission</p>
        <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight mb-10 max-w-2xl mx-auto">Be Part of the Change</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate("/donate")} className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift">
            <Heart size={16} className="fill-current" />Donate Now
          </button>
          <button onClick={() => navigate("/contact")} className="group flex items-center gap-2 px-10 py-4 border border-foreground/30 text-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent btn-lift">
            Partner With Us
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
