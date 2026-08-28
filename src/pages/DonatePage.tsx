import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Users, Check, ChevronDown } from "lucide-react";
import heroCampus from "@/assets/hero-campus.jpg";
import { useSpotlightCards, useParallax } from "@/hooks/useScrollReveal";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

const fallbackDonationTiers = [
  { amount: "$10", usd: 10, label: "Learning Materials", description: "Provides one student with notebooks, pens, and essential reading materials for a month.", impact: "Learning materials for 1 student", color: "border-border hover:border-accent/40" },
  { amount: "$25", usd: 25, label: "Training Tools", description: "Covers specialized tools and supplies needed for hands-on vocational training — needles, thread, fittings, or electrical components.", impact: "Training tools for 1 student", color: "border-border hover:border-accent/40" },
  { amount: "$50", usd: 50, label: "Monthly Sponsorship", description: "Sponsors a student for a full month, covering training fees, materials, and basic support. The most popular giving level.", impact: "Full monthly support for 1 student", color: "border-accent bg-accent/5 shadow-[0_20px_60px_-20px_hsl(var(--accent)/0.25)]", featured: true },
  { amount: "$200", usd: 200, label: "Full Program Support", description: "Covers a significant portion of a student's full training program from start to finish — a transformative gift that changes a life completely.", impact: "Covers most of a full training program", color: "border-border hover:border-accent/40" },
];

const fallbackFaqs = [
  { q: "How is my donation used?", a: "100% of your donation goes directly to student training — covering fees, materials, tools, and basic support. We publish annual impact reports so you can see exactly how funds are used." },
  { q: "Can I sponsor a specific student?", a: "Yes! Through our Sponsor a Student program, we match you with a student in our program. You'll receive updates on their progress and a letter from them upon graduation." },
  { q: "Is my donation tax-deductible?", a: "We are a registered non-profit organization. Depending on your country, your donation may be tax-deductible. Contact us for official documentation." },
  { q: "Can organizations or companies donate?", a: "Absolutely. We welcome corporate partnerships, NGO funding, and institutional support. Please visit our Partners page or contact us directly to discuss collaboration." },
  { q: "What payment methods do you accept?", a: "We accept bank transfers, mobile money (MTN/Airtel), PayPal, and credit/debit cards. Contact us via WhatsApp or email to get payment details." },
];

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const DonatePage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTierUsd, setSelectedTierUsd] = useState<number>(50);
  const tiersRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const faqAnswerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  const { items: pageSections } = useContentCollection<PageSection>("page_sections");
  const tiersSections = pageSections.filter(s => s.page_key === "donate" && s.section_key === "donation_tiers");
  const donationTiers = tiersSections.length > 0
    ? parseJson(tiersSections[0].body, fallbackDonationTiers) as { amount: string; usd: number; label: string; description: string; impact: string; color: string; featured?: boolean }[]
    : fallbackDonationTiers;
  const faqsSections = pageSections.filter(s => s.page_key === "donate" && s.section_key === "faqs");
  const faqs = faqsSections.length > 0
    ? parseJson(faqsSections[0].body, fallbackFaqs) as { q: string; a: string }[]
    : fallbackFaqs;

  const selectedTier = donationTiers.find((tier) => tier.usd === selectedTierUsd) ?? donationTiers[0];

  useSpotlightCards(tiersRef, ".tier-card");
  useParallax(pageRef);

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
          <img src={heroCampus} alt="Students learning skills" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-primary/75 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 donate-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">Make A Difference</p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-8 opacity-0">
            Your Gift Builds<br /><em className="text-accent">A Better Tomorrow</em>
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            One donation. One student. One family lifted out of poverty. Your support is the bridge between vulnerability and self-sufficiency.
          </p>
        </div>
      </div>

      {/* Donation Tiers */}
      <div ref={tiersRef} className="px-8 md:px-16 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Choose Your Level</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">Every Amount Makes an Impact</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6">All donations go directly to student training, materials, and support. No overhead. Real impact.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {donationTiers.map(({ amount, usd, label, description, impact, featured }) => (
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
          ))}
        </div>

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
      </div>

      {/* Sponsor a Student Section */}
      <div id="sponsor" className="px-8 md:px-16 py-24 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">Personal Impact</p>
            <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-8">Sponsor a Student Directly</h2>
            <p className="font-body text-base text-primary-foreground/70 leading-relaxed mb-6">Through our Sponsor a Student program, you are matched with a specific student. You receive:</p>
            <ul className="space-y-4 mb-10">
              {["A profile and story of the student you're supporting", "Regular progress updates throughout their program", "A personal letter and certificate upon their graduation", "The knowledge that you directly changed a life"].map((item) => (
                <li key={item} className="flex items-start gap-3 font-body text-sm text-primary-foreground/80">
                  <Heart size={16} className="text-accent fill-accent shrink-0 mt-0.5" /><span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => { const msg = encodeURIComponent("Hello, I would like to sponsor a student. Please tell me more about the Sponsor a Student program."); window.open(`https://wa.me/256700000000?text=${msg}`, "_blank", "noopener,noreferrer"); }}
              className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
            >
              <Users size={16} />Start Sponsoring
            </button>
          </div>
          <div className="space-y-6">
            <div className="p-8 bg-primary-foreground/5 border border-primary-foreground/10 rounded-[20px] stat-glow">
              <p className="stat-value font-heading text-4xl font-light text-accent mb-2">$50<span className="text-xl text-primary-foreground/50">/month</span></p>
              <p className="font-body text-sm text-primary-foreground/60 mb-4">Sponsors one student for a month</p>
              <div className="w-full bg-primary-foreground/10 rounded-full h-1.5"><div className="bg-accent h-1.5 rounded-full w-[68%]" /></div>
              <p className="font-body text-xs text-primary-foreground/40 mt-2">68% of monthly spots filled</p>
            </div>
            <div className="p-8 bg-primary-foreground/5 border border-primary-foreground/10 rounded-[20px] stat-glow">
              <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-3">Current Need</p>
              <p className="font-heading text-2xl font-light text-primary-foreground mb-2">47 students awaiting sponsorship</p>
              <p className="font-body text-sm text-primary-foreground/60">These students are enrolled and ready to start but need a sponsor to begin their program.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div ref={faqRef} className="relative px-8 md:px-16 py-24 md:py-32 overflow-hidden">
        <div className="parallax-el pointer-events-none absolute -top-16 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" data-speed="0.3" />
        <div className="parallax-el pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" data-speed="0.5" />
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <p className="faq-anim font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">Questions</p>
            <h2 className="faq-anim font-heading text-4xl md:text-5xl font-light text-foreground leading-tight">Frequently Asked Questions</h2>
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

      <Footer />
    </div>
  );
};

export default DonatePage;
