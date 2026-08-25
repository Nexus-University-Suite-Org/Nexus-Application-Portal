import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Calendar, Clock, Users } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";

gsap.registerPlugin(ScrollTrigger);

const tours = [
  {
    name: "Campus Walking Tour",
    duration: "2 hours",
    group: "Up to 30 people",
    frequency: "Daily at 10 AM & 2 PM",
  },
  {
    name: "Academic Building Tour",
    duration: "1.5 hours",
    group: "Up to 25 people",
    frequency: "Mon-Fri 11 AM",
  },
  {
    name: "Residential Life Tour",
    duration: "1 hour",
    group: "Up to 20 people",
    frequency: "Daily 3 PM",
  },
  {
    name: "Lab & Innovation Hub",
    duration: "2.5 hours",
    group: "Up to 15 people",
    frequency: "Wed & Fri 9 AM",
  },
];

const highlights = [
  "Four botanical gardens spanning 45 acres",
  "State-of-the-art library with 2.5M+ volumes",
  "Olympic-standard sports complex",
  "Modern dining halls and residential complexes",
  "Innovation Hub and research centers",
  "Historic heritage buildings dating to 1922",
];

const VisitInstitutePage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const toursRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Hero text
      if (heroTextRef.current) {
        gsap.fromTo(
          heroTextRef.current.querySelectorAll("*"),
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
      }

      // Hero image
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.6,
            ease: "power3.inOut",
            delay: 0.4,
          },
        );
      }

      // Tours cards
      if (toursRef.current) {
        gsap.fromTo(
          toursRef.current.querySelectorAll(".tour-card"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: toursRef.current, start: "top 85%" },
          },
        );
      }

      // Highlights
      if (highlightsRef.current) {
        gsap.fromTo(
          highlightsRef.current.querySelectorAll(".highlight-item"),
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: highlightsRef.current, start: "top 85%" },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={aboutHero}
            alt="Campus Visit"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/55" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Campus Experience
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            Visit University Application Portal
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Experience our beautiful campus firsthand. Explore world-class
            facilities and meet our vibrant community.
          </p>
        </div>
      </div>

      {/* Campus Highlights */}
      <div ref={highlightsRef} className="px-8 md:px-16 py-24 bg-secondary/20">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Campus Features
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Explore Our Campus
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((item) => (
            <div
              key={item}
              className="highlight-item opacity-0 card-hover flex items-start gap-4 p-6 rounded-[20px] border border-border/40 hover:border-accent/40 bg-background transition-all duration-500"
            >
              <MapPin size={24} className="icon-hover text-accent flex-shrink-0 mt-1" />
              <p className="font-body text-muted-foreground leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tour Guide Section */}
      <div ref={toursRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Guided Tours
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Choose Your Tour
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tours.map((tour) => (
            <div key={tour.name} className="tour-card opacity-0">
              <div className="card-hover p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/20 to-background hover:border-accent/40 transition-all duration-500">
                <h3 className="font-heading text-2xl font-light text-foreground mb-8">
                  {tour.name}
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Clock size={20} className="icon-hover text-accent flex-shrink-0" />
                    <div>
                      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                        Duration
                      </p>
                      <p className="font-body text-foreground">
                        {tour.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Users size={20} className="icon-hover text-accent flex-shrink-0" />
                    <div>
                      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                        Group Size
                      </p>
                      <p className="font-body text-foreground">{tour.group}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Calendar size={20} className="icon-hover text-accent flex-shrink-0" />
                    <div>
                      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                        Schedule
                      </p>
                      <p className="font-body text-foreground">
                        {tour.frequency}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="mt-8 w-full py-3 rounded-[16px] border border-accent/50 bg-gradient-to-r hover:from-accent/15 hover:to-accent/5 transition-all duration-300">
                  <span className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold">
                    Reserve Tour
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VisitInstitutePage;
