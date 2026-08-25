import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users,
  Home,
  BookOpen,
  Globe,
  Award,
  Heart,
  ArrowRight,
} from "lucide-react";
import studentsHero from "@/assets/students-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

const currentYear = new Date().getFullYear();

const stats = [
  { value: "12,400+", label: "Students Enrolled" },
  { value: "92%", label: "Graduate Employment" },
  { value: "74", label: "Countries Represented" },
  { value: "200+", label: "Student Organizations" },
];

const services = [
  {
    icon: Home,
    title: "Housing & Residence",
    desc: "Modern halls with single and shared rooms, dining facilities, and 24/7 security across 8 residential complexes.",
    href: "/about/visit",
  },
  {
    icon: BookOpen,
    title: "Academic Support",
    desc: "Tutoring centers, writing labs, and peer mentoring programs to help every student thrive academically.",
    href: "/admissions/faq",
  },
  {
    icon: Globe,
    title: "International Office",
    desc: "Visa support, cultural integration programs, and a dedicated team for our global student community.",
    href: "/admissions/international",
  },
  {
    icon: Award,
    title: "Scholarships & Aid",
    desc: "Over $18M in annual scholarships covering merit-based, need-based, and specialized program awards.",
    href: "/admissions/scholarships",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    desc: "On-campus clinic, counseling services, fitness center, and wellness workshops for holistic well-being.",
    href: "/quick-links/health-safety",
  },
  {
    icon: Users,
    title: "Career Services",
    desc: "Resume workshops, internship placements, employer networking events, and alumni mentorship programs.",
    href: "/quick-links/jobs-careers",
  },
];

const testimonials = [
  {
    name: "Amara Osei",
    program: "MSc Computer Science, 2025",
    quote:
      "University Application Portal gave me the tools, the mentors, and the confidence to build technology that matters.",
  },
  {
    name: "James Kariuki",
    program: "BA Economics, 2024",
    quote:
      "The diversity of thought here is extraordinary. Every conversation pushes you to think bigger.",
  },
  {
    name: "Sofia Nakamura",
    program: `PhD Biomedical Engineering, ${currentYear}`,
    quote:
      "The research facilities are world-class. I've published three papers in my first two years.",
  },
];

const StudentsPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Hero text
      gsap.fromTo(
        ".stu-hero-text > *",
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        },
      );

      // Hero image clip-path
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.6,
            ease: "power3.inOut",
            delay: 0.5,
          },
        );
      }

      // Stats counter
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll(".stat-item"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
          },
        );
      }

      // Services cards
      if (servicesRef.current) {
        gsap.fromTo(
          servicesRef.current.querySelectorAll(".service-card"),
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: servicesRef.current, start: "top 80%" },
          },
        );
      }

      // Testimonials
      if (testimonialsRef.current) {
        gsap.fromTo(
          testimonialsRef.current.querySelectorAll(".testimonial-card"),
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: testimonialsRef.current,
              start: "top 80%",
            },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div ref={heroRef} className="relative min-h-screen flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img
            ref={imageRef}
            src={studentsHero}
            alt="Students on campus"
            className="w-full h-full object-cover rounded-none"
          />
          <div className="absolute inset-0 bg-primary/60 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 stu-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">
            Student Life at University Application Portal
          </p>
          <h1 className="font-heading text-5xl md:text-8xl font-light text-primary-foreground leading-[0.9] mb-8 opacity-0">
            Where Every
            <br />
            Student Belongs
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            A vibrant community of scholars, creators, and changemakers from 74
            countries, united by curiosity and purpose.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        ref={statsRef}
        className="px-8 md:px-16 py-24 border-b border-border"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((s) => (
            <div key={s.label} className="stat-item text-center opacity-0">
              <p className="font-heading text-5xl md:text-6xl font-light text-foreground mb-2">
                {s.value}
              </p>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div ref={servicesRef} className="px-8 md:px-16 py-32">
        <div className="max-w-2xl mb-20">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Student Services
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
            Everything You Need to Thrive
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="service-card group opacity-0 p-8 border border-border rounded-[20px] transition-all duration-500 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_hsl(var(--accent)/0.15)]"
              >
                <div className="w-12 h-12 rounded-[12px] bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors duration-500">
                  <Icon
                    size={20}
                    className="text-muted-foreground group-hover:text-accent transition-colors duration-500"
                  />
                </div>
                <h3 className="font-heading text-2xl font-light text-foreground mb-3">
                  {s.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                  {s.desc}
                </p>
                <Link
                  to={s.href}
                  className="group/link inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-accent"
                >
                  Learn More
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover/link:translate-x-1"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div ref={testimonialsRef} className="px-8 md:px-16 py-32 bg-primary">
        <div className="max-w-2xl mb-20">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Student Voices
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight">
            Hear From Our Community
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="testimonial-card opacity-0 p-8 border border-primary-foreground/10 rounded-[20px] hover:border-accent/30 transition-all duration-500"
            >
              <p className="font-heading text-xl font-light text-primary-foreground leading-relaxed mb-8 italic">
                "{t.quote}"
              </p>
              <p className="font-body text-sm text-primary-foreground font-medium">
                {t.name}
              </p>
              <p className="font-body text-xs text-primary-foreground/50">
                {t.program}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentsPage;
