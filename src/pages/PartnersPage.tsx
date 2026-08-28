import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Handshake,
  Building2,
  Users,
  Heart,
  Globe,
  ArrowRight,
  Mail,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import partnersHero from "@/assets/partners-hero.jpg";
import communityOutreach from "@/assets/gallery/community-outreach.jpg";
import graduatesGroup from "@/assets/gallery/graduates-group.jpg";
import { useSpotlightCards } from "@/hooks/useScrollReveal";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

const fallbackPartnerTypes = [
  { title: "Corporate Sponsors", description: "Fund training programs, supply equipment, or create internship pipelines for graduates. Your CSR investment directly translates to measurable community impact.", benefits: ["Tax-deductible contributions", "Brand visibility at events", "Impact reports & tracking", "Employee volunteer days"] },
  { title: "NGOs & Foundations", description: "Collaborate on joint programs, share expertise, or channel funding through our proven training model to reach vulnerable communities.", benefits: ["Co-branded programs", "Shared impact metrics", "Community access", "Grant collaboration"] },
  { title: "Volunteer Instructors", description: "Share your skills as a guest instructor, mentor graduates, or help with curriculum development. Your expertise creates ripple effects across generations.", benefits: ["Flexible commitment", "Teaching resources provided", "Community connection", "Certificate of service"] },
  { title: "Individual Donors", description: "Sponsor a student's full training, cover material costs, or contribute monthly to sustain ongoing operations. Every contribution changes a life.", benefits: ["Student progress updates", "Direct communication", "Annual impact letter", "Tax receipts"] },
];

const iconMap: Record<string, typeof Building2> = {
  "Corporate Sponsors": Building2,
  "NGOs & Foundations": Globe,
  "Volunteer Instructors": Users,
  "Individual Donors": Heart,
};

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

type PartnerDoc = {
  id: string;
  name: string;
  category?: string;
};

const PartnersPage = () => {
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement>(null);
  const partnersGridRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const { data: partnerDocs, isLoading } =
    useContentCollection<PartnerDoc>("partners", [], {
      orderBy: { field: "name", direction: "asc" },
    });

  const partnersList = partnerDocs.map((partner) => ({
    name: partner.name,
    type: partner.category || "Partner",
    since: "Now",
  }));

  const dynamicImpactNumbers = [
    { value: `${partnersList.length}`, label: "Active Partners" },
    { value: "$240K", label: "Funds Mobilised" },
    { value: "1,200+", label: "Students Supported" },
    { value: "6", label: "Countries Represented" },
  ];

  useSpotlightCards(cardsRef);

  const { items: pageSections } = useContentCollection<PageSection>("page_sections");
  const partnerTypesSections = pageSections.filter(s => s.page_key === "partners" && s.section_key === "partner_types");
  const partnerTypes = partnerTypesSections.length > 0
    ? parseJson(partnerTypesSections[0].body, fallbackPartnerTypes) as { title: string; description: string; benefits: string[] }[]
    : fallbackPartnerTypes;

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Hero text
      gsap.fromTo(
        ".partners-hero-text > *",
        { y: 60, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        },
      );

      // Partner type cards
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.querySelectorAll(".partner-card"),
          { y: 60, opacity: 0, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Stats
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll(".stat-item"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Current partners grid
      if (partnersGridRef.current) {
        gsap.fromTo(
          partnersGridRef.current.querySelectorAll(".current-partner"),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: partnersGridRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Section headings
      gsap.utils.toArray<HTMLElement>(".section-heading").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[55vh] flex items-end overflow-hidden">
        <img
          src={partnersHero}
          alt="Partnership meeting"
          className="absolute inset-0 w-full h-full object-cover rounded-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20 rounded-none" />
        <div className="relative z-10 px-8 md:px-16 pb-20 pt-40 partners-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-5 opacity-0">
            Partnerships
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-6 opacity-0">
            Together We Build
            <br />
            <em className="text-accent">Stronger Futures</em>
          </h1>
          <p className="font-body text-base text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            Our partners make transformation possible — from corporate sponsors
            to individual volunteers, every collaboration amplifies our impact.
          </p>
        </div>
      </div>

      {/* Partnership Stats */}
      <div ref={statsRef} className="px-8 md:px-16 py-16 bg-secondary/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {dynamicImpactNumbers.map(({ value, label }) => (
            <div
              key={label}
              className="stat-item opacity-0 text-center p-6 bg-background border border-border rounded-2xl stat-glow"
            >
              <p className="stat-value font-heading text-4xl md:text-5xl font-light text-accent mb-2">
                {value}
              </p>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Partner */}
      <section className="py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Ways to Partner
          </p>
          <h2 className="section-heading font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
            Find Your Way
            <br />
            To Make an Impact
          </h2>
        </div>
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partnerTypes.map(({ title, description, benefits }) => {
            const Icon = iconMap[title] || Building2;
            return (
            <div
              key={title}
              className="partner-card spotlight-card opacity-0 group p-8 md:p-10 border border-border rounded-2xl"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6 icon-bounce">
                  <Icon size={22} className="text-accent" />
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-light text-foreground mb-3 group-hover:text-accent transition-colors duration-500">
                  {title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                  {description}
                </p>
                <ul className="space-y-2">
                  {benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 font-body text-xs text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
          })}
        </div>
      </section>

      {/* Photo break */}
      <div className="relative h-[40vh] overflow-hidden">
        <img
          src={communityOutreach}
          alt="Community outreach"
          className="w-full h-full object-cover rounded-none"
        />
        <div className="absolute inset-0 bg-primary/40 rounded-none" />
      </div>

      {/* Current Partners */}
      <section className="py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Our Network
          </p>
          <h2 className="section-heading font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
            Current Partners
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6 max-w-lg">
            We are grateful to work with organisations and individuals who share
            our vision of empowerment through practical education.
          </p>
        </div>
        <div
          ref={partnersGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {isLoading ? (
            <p className="col-span-full text-center font-body text-sm text-muted-foreground py-12">
              Loading partners...
            </p>
          ) : partnersList.length === 0 ? (
            <p className="col-span-full text-center font-body text-sm text-muted-foreground py-12">
              No partners added yet.
            </p>
          ) : (
            partnersList.map(({ name, type, since }) => (
              <div
                key={name}
                className="current-partner opacity-0 group p-6 border border-border rounded-2xl hover:border-accent/40 transition-all duration-500 magnetic-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <Handshake
                    size={20}
                    className="text-accent/60 group-hover:text-accent transition-colors duration-500"
                  />
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                    Since {since}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-light text-foreground mb-1">
                  {name}
                </h3>
                <p className="font-body text-xs text-muted-foreground">
                  {type}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-8 md:px-16 bg-primary text-primary-foreground relative overflow-hidden">
        <img
          src={graduatesGroup}
          alt="Graduates"
          className="absolute inset-0 w-full h-full object-cover opacity-15 rounded-none"
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Become a Partner
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-8">
            Ready to Change Lives
            <br />
            Together?
          </h2>
          <p className="font-body text-sm text-primary-foreground/60 leading-relaxed mb-10 max-w-lg mx-auto">
            Whether you represent a corporation, an NGO, or you're an individual
            with skills to share — we'd love to explore how we can work
            together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/contact")}
              className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
            >
              <Mail size={16} />
              Get in Touch
            </button>
            <button
              onClick={() => navigate("/donate")}
              className="group flex items-center gap-2 px-10 py-4 border border-primary-foreground/40 text-primary-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent btn-lift"
            >
              <Heart size={16} />
              Donate Instead
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnersPage;
