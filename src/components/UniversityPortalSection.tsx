import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Compass,
  GraduationCap,
  X,
  HandHeart,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type NewsDoc = {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
};

type EventDoc = {
  id: string;
  title?: string;
  description?: string;
  eventDate?: string;
};

const quickOptions = [
  "Prospective student: admissions and programs",
  "Current student: timetable and support",
  "Parent/guardian: tuition and campus life",
  "Research partner: labs and innovation",
  "Alumni: events and giving",
];

const audienceGuides: Record<
  string,
  { title: string; note: string; cta: string; href: string }
> = {
  "Prospective student: admissions and programs": {
    title: "Your next step starts here",
    note: "Compare programs, application timelines, and entry pathways with advisor-ready checklists.",
    cta: "Explore Admissions",
    href: "/admissions/how-to-apply",
  },
  "Current student: timetable and support": {
    title: "Everything for your semester",
    note: "Access timetables, learning support, and key student services in one guided track.",
    cta: "Open Student Hub",
    href: "/quick-links/student-portal",
  },
  "Parent/guardian: tuition and campus life": {
    title: "Support with confidence",
    note: "Find tuition guidance, accommodation insights, and safety resources for informed planning.",
    cta: "View Parent Resources",
    href: "/admissions/fees",
  },
  "Research partner: labs and innovation": {
    title: "Collaborate on impact",
    note: "Discover labs, grant-ready partnerships, and translational research opportunities.",
    cta: "See Research Partnerships",
    href: "/research/opportunities",
  },
  "Alumni: events and giving": {
    title: "Stay part of the story",
    note: "Reconnect through alumni events, mentorship programs, and strategic giving channels.",
    cta: "Open Alumni Network",
    href: "/about/alumni",
  },
};

const UniversityPortalSection = () => {
  const [selectedAudience, setSelectedAudience] = useState(quickOptions[0]);
  const [email, setEmail] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const quickLinksRef = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const innovationRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: newsDocs } = useContentCollection<NewsDoc>("news", []);
  const { data: eventDocs } = useContentCollection<EventDoc>("events", []);
  const [modalEvent, setModalEvent] = useState<EventDoc | null>(null);
  const stories = newsDocs.slice(0, 3);
  const innovationArticles = newsDocs.slice(0, 6);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    toast({
      title: "Subscribed",
      description: `Campus updates will be sent to ${email.trim()}.`,
    });
    setEmail("");
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Quick Links Section
      if (quickLinksRef.current) {
        gsap.fromTo(
          quickLinksRef.current.querySelector(".panel-heading"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: quickLinksRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.fromTo(
          quickLinksRef.current.querySelector(".quick-panel"),
          { opacity: 0, x: -60 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: 0.12,
            scrollTrigger: {
              trigger: quickLinksRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.fromTo(
          quickLinksRef.current.querySelectorAll(".action-card"),
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.6)",
            delay: 0.24,
            scrollTrigger: {
              trigger: quickLinksRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Stories Section
      if (storiesRef.current) {
        gsap.fromTo(
          storiesRef.current.querySelector(".stories-heading"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: storiesRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.fromTo(
          storiesRef.current.querySelectorAll(".story-card"),
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: storiesRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Events Section
      if (eventsRef.current) {
        gsap.fromTo(
          eventsRef.current.querySelector(".events-heading"),
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: eventsRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.fromTo(
          eventsRef.current.querySelectorAll(".event-card"),
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.1,
            scrollTrigger: {
              trigger: eventsRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Innovation Section
      if (innovationRef.current) {
        gsap.fromTo(
          innovationRef.current.querySelector(".innovation-heading"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: innovationRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.fromTo(
          innovationRef.current.querySelectorAll(".article-card"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: innovationRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Newsletter Section
      if (newsletterRef.current) {
        gsap.fromTo(
          newsletterRef.current.querySelector(".newsletter-content"),
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: newsletterRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.fromTo(
          newsletterRef.current.querySelector(".newsletter-form"),
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.1,
            scrollTrigger: {
              trigger: newsletterRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!prefersReducedMotion) {
        gsap.to(".floating-orb-a", {
          x: -14,
          y: 22,
          duration: 6.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(".floating-orb-b", {
          x: 12,
          y: -16,
          duration: 5.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-48 px-8 md:px-16 bg-gradient-to-b from-background via-secondary/15 to-background overflow-hidden"
    >
      <div className="floating-orb-a absolute top-20 left-[-8rem] w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="floating-orb-b absolute bottom-24 right-[-9rem] w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground)/0.04)_1px,transparent_0)] bg-[length:26px_26px]" />

      {/* Quick Links Section */}
      <div
        ref={quickLinksRef}
        id="quick-links"
        className="relative mb-32 md:mb-40 max-w-7xl mx-auto"
      >
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Quick Links
        </p>
        <div className="panel-heading mb-10">
          <h2 className="font-heading text-5xl md:text-6xl font-light text-foreground leading-[0.95]">
            Access resources <br /> you need instantly.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="quick-panel lg:col-span-2 border border-border/70 rounded-[24px] p-6 md:p-10 bg-gradient-to-br from-background to-secondary/20 backdrop-blur-sm">
            <p className="font-heading text-2xl md:text-3xl font-light text-foreground leading-tight mb-6">
              Tell us who you are, and we'll show you what fits.
            </p>
            <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-3">
              I am a...
            </label>
            <div className="relative mb-6">
              <select
                value={selectedAudience}
                onChange={(event) => setSelectedAudience(event.target.value)}
                className="w-full bg-background border border-border/50 rounded-[16px] px-5 py-3.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent appearance-none cursor-pointer transition-all duration-300 hover:border-accent/30"
                aria-label="Select your user type"
              >
                {quickOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              This dynamic list highlights the most requested pathways. Can't
              find your way?{" "}
              <span className="text-accent font-medium">Contact our team</span>{" "}
              for personalized guidance.
            </p>

            <div className="mt-6 border border-border/50 rounded-[16px] p-4 bg-background/70 backdrop-blur-sm">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-accent mb-2">
                Personalized Path
              </p>
              <p className="font-heading text-xl font-light text-foreground leading-tight mb-2">
                {audienceGuides[selectedAudience].title}
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                {audienceGuides[selectedAudience].note}
              </p>
              <Link
                to={audienceGuides[selectedAudience].href}
                className="inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-accent border border-accent/35 px-4 py-2.5 rounded-[12px] hover:bg-accent/10 transition-all duration-300"
              >
                {audienceGuides[selectedAudience].cta}
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Join",
                text: "Begin your admission journey and discover scholarship routes.",
                icon: GraduationCap,
                href: "/admissions/how-to-apply",
              },
              {
                title: "Visit",
                text: "Book a campus tour, open lecture, or faculty meet-and-greet.",
                icon: Compass,
                href: "/about/visit",
              },
              {
                title: "Give",
                text: "Support student success, research, and community impact.",
                icon: HandHeart,
                href: "/about/alumni",
              },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(item.href)}
                className="action-card text-left border border-border/50 rounded-[20px] p-5 md:p-6 bg-background group relative overflow-hidden transition-all duration-500 hover:border-accent/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <div className="relative inline-flex w-10 h-10 rounded-[12px] border border-accent/25 bg-accent/10 items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors duration-300">
                  <item.icon size={16} className="text-accent" />
                </div>
                <div className="relative flex items-start justify-between mb-2">
                  <span className="font-heading text-3xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
                    {item.title}
                  </span>
                  <ArrowRight
                    size={20}
                    className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1.5 transition-all duration-300 shrink-0"
                  />
                </div>
                <p className="relative font-body text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {item.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <div
        ref={storiesRef}
        id="campus-updates"
        className="mb-32 md:mb-40 max-w-7xl mx-auto"
      >
        <div className="stories-heading mb-12">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
            <div>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
                Happening Around Campus
              </p>
              <h3 className="font-heading text-5xl md:text-6xl font-light text-foreground leading-[0.95]">
                Stories worth sharing
              </h3>
            </div>
            <Link
              to="/news"
              className="font-body text-xs tracking-[0.2em] uppercase text-accent border border-accent/40 px-6 py-3 rounded-[16px] hover:bg-accent/8 transition-all duration-300"
            >
              View All Stories
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {stories.map((story) => (
            <article
              key={story.id}
              className="story-card group relative border border-border/50 rounded-[20px] p-6 md:p-7 bg-background overflow-hidden transition-all duration-500 hover:border-accent/50 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]"
            >
              <div className="absolute top-0 left-0 w-1 h-0 bg-accent group-hover:h-full transition-all duration-500" />
              <p className="font-body text-xs tracking-[0.15em] uppercase text-accent mb-4 font-medium">
                {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
              </p>
              <h4 className="font-heading text-2xl font-light text-foreground mb-3 leading-tight group-hover:text-accent transition-colors duration-300">
                {story.title}
              </h4>
              <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
                {story.excerpt}
              </p>
              <Link
                to={`/news/${story.slug}`}
                className="inline-flex items-center gap-2.5 font-body text-xs tracking-[0.16em] uppercase text-foreground group-hover:text-accent transition-all duration-300"
              >
                Read More
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
            </article>
          ))}
        </div>
      </div>

      {/* Events Section */}
      <div
        ref={eventsRef}
        id="events"
        className="mb-32 md:mb-40 max-w-7xl mx-auto"
      >
        <div className="events-heading flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
              Upcoming Activities
            </p>
            <h3 className="font-heading text-5xl md:text-6xl font-light text-foreground leading-[0.95]">
              Events & activities
            </h3>
          </div>
          <Link
            to="/quick-links/upcoming-events"
            className="font-body text-xs tracking-[0.2em] uppercase text-accent border border-accent/40 px-6 py-3 rounded-[16px] hover:bg-accent/8 transition-all duration-300"
          >
            Full Calendar
          </Link>
        </div>

        <div className="space-y-4 md:space-y-5">
          {eventDocs.map((event) => {
            const eventDate = event.eventDate ? new Date(event.eventDate) : null;
            const day = eventDate ? eventDate.getDate() : "";
            const month = eventDate ? eventDate.toLocaleDateString("en-US", { month: "short" }) : "";
            return (
              <article
                key={event.id}
                className="event-card group relative border border-border/50 rounded-[20px] p-5 md:p-6 bg-background overflow-hidden transition-all duration-500 hover:border-accent/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
                  <div className="md:col-span-2 flex md:flex-col items-center md:items-start gap-3">
                    <div className="w-16 h-16 md:w-14 md:h-14 rounded-[14px] border border-accent/30 flex flex-col items-center justify-center bg-accent/8 group-hover:bg-accent/15 transition-colors duration-300 shrink-0">
                      <span className="font-heading text-2xl md:text-xl leading-none text-foreground font-light">
                        {day}
                      </span>
                      <span className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
                        {month}
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-7">
                    <h4 className="font-heading text-xl md:text-2xl font-light text-foreground mb-1.5 group-hover:text-accent transition-colors duration-300">
                      {event.title}
                    </h4>
                    <p className="font-body text-xs md:text-sm text-muted-foreground inline-flex items-center gap-2">
                      {event.description}
                    </p>
                  </div>
                  <div className="md:col-span-3 md:text-right">
                    <button
                      onClick={() => setModalEvent(event)}
                      className="w-full md:w-auto inline-flex items-center justify-center md:justify-end gap-2 font-body text-xs tracking-[0.15em] uppercase text-accent border border-accent/30 px-4 py-2.5 rounded-[12px] group-hover:bg-accent/10 transition-all duration-300 cursor-pointer"
                    >
                      View Details
                      <ArrowRight
                        size={13}
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Innovation Section */}
      <div
        ref={innovationRef}
        id="innovation"
        className="mb-32 md:mb-40 max-w-7xl mx-auto"
      >
        <div className="innovation-heading mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={22} className="text-accent" />
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-medium">
              Recent Research
            </p>
          </div>
          <h3 className="font-heading text-5xl md:text-6xl font-light text-foreground leading-[0.95] mb-4">
            Innovation in action
          </h3>
          <p className="font-body text-muted-foreground max-w-2xl">
            Breakthrough discoveries from our labs, field projects, and
            collaborations shaping industries and solving global challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {innovationArticles.map((article) => (
            <Link
              key={article.id}
              to="/research/opportunities"
              className="article-card group relative border border-border/50 rounded-[20px] p-6 bg-background overflow-hidden transition-all duration-500 hover:border-accent/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent -translate-x-1/2 -translate-y-1/2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                    <Newspaper
                      size={14}
                      className="text-accent group-hover:text-foreground transition-colors duration-300"
                    />
                  </div>
                  <span className="font-body text-[10px] tracking-[0.16em] uppercase text-accent font-medium">
                    Research
                  </span>
                </div>
                <p className="font-body text-sm leading-relaxed text-foreground group-hover:text-accent transition-colors duration-300">
                  {article.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div
        ref={newsletterRef}
        id="newsletter"
        className="max-w-7xl mx-auto border border-border/70 rounded-[28px] p-8 md:p-12 bg-gradient-to-br from-background via-secondary/30 to-background backdrop-blur-sm overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="newsletter-content">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-5 font-medium">
              Stay Connected
            </p>
            <h3 className="font-heading text-4xl md:text-5xl font-light text-foreground leading-tight mb-4">
              Never miss a moment
            </h3>
            <p className="font-body text-muted-foreground leading-relaxed">
              Subscribe for the latest campus stories, research breakthroughs,
              event updates, and institutional news delivered to your inbox.
            </p>
          </div>
          <form
            onSubmit={handleNewsletterSubmit}
            className="newsletter-form space-y-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              aria-label="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-border/50 rounded-[16px] px-5 py-3.5 bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-300"
            />
            <button
              type="submit"
              className="w-full px-6 py-3.5 bg-accent text-accent-foreground font-body text-xs tracking-[0.16em] uppercase rounded-[16px] font-medium hover:bg-accent/90 transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              Subscribe <CalendarDays size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Event Detail Modal */}
      {modalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalEvent(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10">
              <div className="flex items-center justify-between mb-6">
                {modalEvent.eventDate && (
                  <div className="w-16 h-16 rounded-[14px] border border-accent/30 flex flex-col items-center justify-center bg-accent/8 shrink-0">
                    <span className="font-heading text-2xl leading-none text-foreground font-light">
                      {new Date(modalEvent.eventDate).getDate()}
                    </span>
                    <span className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
                      {new Date(modalEvent.eventDate).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setModalEvent(null)}
                  className="p-2 rounded-full border border-border hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-light text-foreground leading-tight mb-3">
                {modalEvent.title}
              </h2>
              {modalEvent.eventDate && (
                <p className="font-body text-sm text-accent mb-6">
                  {new Date(modalEvent.eventDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
              <p className="font-body text-base text-muted-foreground leading-relaxed">
                {modalEvent.description || "Details coming soon."}
              </p>
              <div className="mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setModalEvent(null)}
                  className="font-body text-xs tracking-[0.15em] uppercase text-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UniversityPortalSection;
