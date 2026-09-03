import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Users, Check, ChevronDown } from "lucide-react";
import heroCampus from "@/assets/hero-campus.jpg";
import { useSpotlightCards, useParallax } from "@/hooks/useScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const DonatePage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTierUsd, setSelectedTierUsd] = useState<number>(50);
  const [donateContent, setDonateContent] = useState({
    heroTagline: "Make A Difference",
    heroHeading1: "Your Gift Builds",
    heroHeading2: "A Better Tomorrow",
    heroDescription: "One donation. One student. One family lifted out of poverty. Your support is the bridge between vulnerability and self-sufficiency.",
    tiersTagline: "Choose Your Level",
    tiersHeading: "Every Amount Makes an Impact",
    tiersDescription: "All donations go directly to student training, materials, and support. No overhead. Real impact.",
    sponsorTagline: "Personal Impact",
    sponsorHeading: "Sponsor a Student Directly",
    sponsorDescription: "Through our Sponsor a Student program, you are matched with a specific student. You receive:",
    sponsorBenefits: ["A profile and story of the student you're supporting", "Regular progress updates throughout their program", "A personal letter and certificate upon their graduation", "The knowledge that you directly changed a life"],
    sponsorBtnText: "Start Sponsoring",
    sponsorBtnVisible: true,
    faqTagline: "Questions",
    faqHeading: "Frequently Asked Questions",
    faqs: [] as { q: string; a: string }[],
    tiers: [] as { amount: string; usd: number; label: string; description: string; impact: string; color?: string; featured?: boolean }[],
    statAmount: "$50",
    statPeriod: "/month",
    statText: "Sponsors one student for a month",
    statProgress: "68",
    statProgressText: "68% of monthly spots filled",
    statVisible: true,
    needLabel: "Current Need",
    needHeading: "47 students awaiting sponsorship",
    needText: "These students are enrolled and ready to start but need a sponsor to begin their program.",
    needVisible: true,
  });
  const [heroImage, setHeroImage] = useState<string>(heroCampus);
  const tiersRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const faqAnswerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/v1/content/site-settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setDonateContent((prev) => {
          const next = {
            ...prev,
            heroTagline: data.donate_hero_tagline || prev.heroTagline,
            heroHeading1: data.donate_hero_heading_1 || prev.heroHeading1,
            heroHeading2: data.donate_hero_heading_2 || prev.heroHeading2,
            heroDescription: data.donate_hero_description || prev.heroDescription,
            tiersTagline: data.donate_tiers_tagline || prev.tiersTagline,
            tiersHeading: data.donate_tiers_heading || prev.tiersHeading,
            tiersDescription: data.donate_tiers_description || prev.tiersDescription,
            sponsorTagline: data.donate_sponsor_tagline || prev.sponsorTagline,
            sponsorHeading: data.donate_sponsor_heading || prev.sponsorHeading,
            sponsorDescription: data.donate_sponsor_description || prev.sponsorDescription,
            sponsorBtnText: data.donate_sponsor_btn_text || prev.sponsorBtnText,
            sponsorBtnVisible: data.donate_sponsor_btn_visible === undefined ? prev.sponsorBtnVisible : data.donate_sponsor_btn_visible !== "false",
            faqTagline: data.donate_faq_tagline || prev.faqTagline,
            faqHeading: data.donate_faq_heading || prev.faqHeading,
            statAmount: data.donate_stat_amount || prev.statAmount,
            statPeriod: data.donate_stat_period || prev.statPeriod,
            statText: data.donate_stat_text || prev.statText,
            statProgress: data.donate_stat_progress || prev.statProgress,
            statProgressText: data.donate_stat_progress_text || prev.statProgressText,
            statVisible: data.donate_stat_visible === undefined ? prev.statVisible : data.donate_stat_visible !== "false",
            needLabel: data.donate_need_label || prev.needLabel,
            needHeading: data.donate_need_heading || prev.needHeading,
            needText: data.donate_need_text || prev.needText,
            needVisible: data.donate_need_visible === undefined ? prev.needVisible : data.donate_need_visible !== "false",
          };
          if (data.donate_sponsor_benefits) {
            try {
              const parsed = JSON.parse(data.donate_sponsor_benefits);
              if (Array.isArray(parsed) && parsed.length > 0) next.sponsorBenefits = parsed;
            } catch (e) { console.error("[DonatePage] failed to parse donate_sponsor_benefits:", e); }
          }
          if (data.donate_faqs) {
            try {
              const parsed = JSON.parse(data.donate_faqs);
              if (Array.isArray(parsed) && parsed.length > 0) next.faqs = parsed;
            } catch (e) { console.error("[DonatePage] failed to parse donate_faqs:", e); }
          }
          if (data.donate_page_tiers) {
            try {
              const parsed = JSON.parse(data.donate_page_tiers);
              if (Array.isArray(parsed) && parsed.length > 0) next.tiers = parsed;
            } catch (e) { console.error("[DonatePage] failed to parse donate_page_tiers:", e); }
          }
          return next;
        });
        if (data.donate_hero_image) {
          setHeroImage(data.donate_hero_image);
          new Image().src = data.donate_hero_image;
        }
      })
      .catch((err) => console.error("[DonatePage] site-settings fetch failed:", err));
  }, []);

  const donationTiers = donateContent.tiers;
  const faqs = donateContent.faqs;

  const selectedTier = donationTiers.find((tier) => tier.usd === selectedTierUsd) ?? donationTiers[0];

  useSpotlightCards(tiersRef, ".tier-card");
  useParallax(pageRef);

  useEffect(() => {
    if (!tiersRef.current) return;
    const cards = tiersRef.current.querySelectorAll(".tier-card");
    if (cards.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(cards, { y: 60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.85, stagger: 0.1, ease: "back.out(1.3)" });
    });
    return () => ctx.revert();
  }, [donationTiers.map((t) => t.amount).join(",")]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(".donate-hero-text > *",
        { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.18, ease: "power3.out", delay: 0.3 }
      );

      if (tiersRef.current) {
        gsap.fromTo(tiersRef.current.querySelectorAll(".tier-card"),
          { y: 60, opacity: 0, scale: 0.9 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.85, stagger: 0.1,
            ease: "back.out(1.3)",
            scrollTrigger: { trigger: tiersRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          }
        );
      }

      if (faqRef.current) {
        gsap.fromTo(faqRef.current.querySelectorAll(".faq-anim"),
          { y: 28, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.8, stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: faqRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (openFaq === null) return;
    const answerEl = faqAnswerRefs.current[openFaq];
    if (!answerEl) return;
    gsap.fromTo(answerEl,
      { height: 0, autoAlpha: 0, y: -8 },
      { height: "auto", autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out" }
    );
  }, [openFaq]);

  const handleDonate = (amount: number, label?: string) => {
    const message = encodeURIComponent(`Hello, I would like to donate $${amount}${label ? ` for ${label}` : ""} to support a student. Please send me the payment details.`);
    window.open(`https://wa.me/256700000000?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[60vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img src={heroImage} alt="Students learning skills" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-primary/75 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 donate-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">{donateContent.heroTagline}</p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-8 opacity-0">
            {donateContent.heroHeading1}<br /><em className="text-accent">{donateContent.heroHeading2}</em>
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            {donateContent.heroDescription}
          </p>
        </div>
      </div>

      {/* Donation Tiers */}
      <div ref={tiersRef} className="px-8 md:px-16 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{donateContent.tiersTagline}</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">{donateContent.tiersHeading}</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6">{donateContent.tiersDescription}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {donationTiers.length === 0 ? (
            <p className="col-span-full text-center font-body text-sm text-muted-foreground py-12">
              Donation tiers coming soon.
            </p>
          ) : (
          donationTiers.map(({ amount, usd, label, description, impact, featured }) => (
            <div
              key={amount}
              role="button"
              tabIndex={0}
              aria-pressed={selectedTierUsd === usd}
              onClick={() => setSelectedTierUsd(usd)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedTierUsd(usd); } }}
              className={`tier-card spotlight-card opacity-0 flex flex-col p-8 border rounded-[20px] transition-all duration-500 cursor-pointer ${featured ? "relative" : ""} ${selectedTierUsd === usd ? "border-accent bg-accent/10 shadow-[0_24px_60px_-26px_hsl(var(--accent)/0.42)]" : "border-border"}`}
            >
              {featured && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 font-body text-xs tracking-[0.2em] uppercase px-4 py-1 rounded-full transition-colors duration-300 ${selectedTierUsd === usd ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground border border-border"}`}>
                  Most Popular
                </div>
              )}
              <div className="relative z-10">
                <p className="font-heading text-5xl font-light text-accent mb-2">{amount}</p>
                <p className="font-body text-sm font-medium text-foreground mb-3 uppercase tracking-wide">{label}</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{description}</p>
                <div className="flex items-center gap-2 mb-6 font-body text-xs text-foreground/70">
                  <Check size={14} className="text-accent shrink-0" /><span>{impact}</span>
                </div>
                <button
                  onClick={(event) => { event.stopPropagation(); setSelectedTierUsd(usd); handleDonate(usd, label); }}
                  className={`w-full py-3 font-body text-sm tracking-[0.2em] uppercase rounded-[16px] transition-all duration-300 btn-lift ${selectedTierUsd === usd ? "bg-accent text-accent-foreground hover:bg-accent/90" : "border border-foreground/20 text-foreground hover:border-accent hover:text-accent"}`}
                >
                  Donate {amount}
                </button>
              </div>
            </div>
          ))
          )}
        </div>

        {selectedTier && (
        <div className="mt-10 max-w-3xl mx-auto p-6 md:p-8 border border-accent/30 bg-accent/5 rounded-[20px]">
          <p className="font-body text-xs tracking-[0.24em] uppercase text-accent mb-3">Selected Donation</p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="font-heading text-4xl font-light text-foreground mb-1">${selectedTier.usd}</p>
              <p className="font-body text-sm font-medium text-foreground mb-1">{selectedTier.label}</p>
              <p className="font-body text-sm text-muted-foreground">{selectedTier.impact}</p>
            </div>
            <button
              onClick={() => handleDonate(selectedTier.usd, selectedTier.label)}
              className="shrink-0 px-8 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[18px] transition-all duration-300 hover:bg-accent/90 btn-lift"
            >
              Pay ${selectedTier.usd}
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Sponsor a Student Section */}
      <div id="sponsor" className="px-8 md:px-16 py-24 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">{donateContent.sponsorTagline}</p>
            <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-8">{donateContent.sponsorHeading}</h2>
            <p className="font-body text-base text-primary-foreground/70 leading-relaxed mb-6">{donateContent.sponsorDescription}</p>
            <ul className="space-y-4 mb-10">
              {donateContent.sponsorBenefits.map((item) => (
                <li key={item} className="flex items-start gap-3 font-body text-sm text-primary-foreground/80">
                  <Heart size={16} className="text-accent fill-accent shrink-0 mt-0.5" /><span>{item}</span>
                </li>
              ))}
            </ul>
            {donateContent.sponsorBtnVisible && (
            <button
              onClick={() => { const msg = encodeURIComponent("Hello, I would like to sponsor a student. Please tell me more about the Sponsor a Student program."); window.open(`https://wa.me/256700000000?text=${msg}`, "_blank", "noopener,noreferrer"); }}
              className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
            >
              <Users size={16} />{donateContent.sponsorBtnText}
            </button>
            )}
          </div>
          <div className="space-y-6">
            {donateContent.statVisible && (
            <div className="p-8 bg-primary-foreground/5 border border-primary-foreground/10 rounded-[20px] stat-glow">
              <p className="stat-value font-heading text-4xl font-light text-accent mb-2">{donateContent.statAmount}<span className="text-xl text-primary-foreground/50">{donateContent.statPeriod}</span></p>
              <p className="font-body text-sm text-primary-foreground/60 mb-4">{donateContent.statText}</p>
              <div className="w-full bg-primary-foreground/10 rounded-full h-1.5"><div className="bg-accent h-1.5 rounded-full" style={{ width: `${donateContent.statProgress}%` }} /></div>
              <p className="font-body text-xs text-primary-foreground/40 mt-2">{donateContent.statProgressText}</p>
            </div>
            )}
            {donateContent.needVisible && (
            <div className="p-8 bg-primary-foreground/5 border border-primary-foreground/10 rounded-[20px] stat-glow">
              <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-3">{donateContent.needLabel}</p>
              <p className="font-heading text-2xl font-light text-primary-foreground mb-2">{donateContent.needHeading}</p>
              <p className="font-body text-sm text-primary-foreground/60">{donateContent.needText}</p>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      {faqs.length > 0 && (
      <div ref={faqRef} className="relative px-8 md:px-16 py-24 md:py-32 overflow-hidden">
        <div className="parallax-el pointer-events-none absolute -top-16 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" data-speed="0.3" />
        <div className="parallax-el pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" data-speed="0.5" />
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <p className="faq-anim font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">{donateContent.faqTagline}</p>
            <h2 className="faq-anim font-heading text-4xl md:text-5xl font-light text-foreground leading-tight">{donateContent.faqHeading}</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className={`faq-anim border rounded-[16px] overflow-hidden transition-all duration-400 ${openFaq === i ? "border-accent/40 bg-accent/5 shadow-[0_18px_40px_-24px_hsl(var(--accent)/0.4)]" : "border-border hover:border-accent/25"}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/30 transition-colors duration-300">
                  <span className="font-body text-sm font-medium text-foreground pr-8">{q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-all duration-400 ${openFaq === i ? "text-accent rotate-180" : "text-muted-foreground"}`} />
                </button>
                {openFaq === i && (
                  <div ref={(el) => { faqAnswerRefs.current[i] = el; }} className="px-6 pb-6 border-t border-border/50">
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mt-4">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      <Footer />
    </div>
  );
};

export default DonatePage;
