import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, BookOpen, ArrowRight } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import {
  fetchRunningSchemes,
  type AdmissionScheme,
  parseFees,
  parsePreferredStartDates,
  formatMoney,
} from "@/lib/schemes";

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_LABELS: Record<string, string> = {
  BACHELOR: "Undergraduate",
  DIPLOMA: "Diploma",
  CERTIFICATE: "Certificate",
  MASTER: "Postgraduate",
  PHD: "Postgraduate",
};

const CATEGORY_ORDER = ["BACHELOR", "MASTER", "PHD", "DIPLOMA", "CERTIFICATE"];

const formatDate = (value: string | null) => {
  if (!value) return "TBA";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateWithTime = (value: string | null) => {
  if (!value) return "TBA";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} at ${time}`;
};

const countdownLabel = (daysLeft: number | null) => {
  if (daysLeft == null) return null;
  if (daysLeft > 300) return `${Math.round(daysLeft / 30)} MONTHS LEFT`;
  if (daysLeft >= 45) return `${Math.floor(daysLeft / 30)} MONTH LEFT`;
  if (daysLeft >= 2) return `${daysLeft} DAYS LEFT`;
  if (daysLeft === 1) return "A DAY LEFT";
  if (daysLeft === 0) return "CLOSING TODAY";
  return "CLOSED";
};

const AdmissionsListsPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const schemesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState<AdmissionScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchRunningSchemes();
        if (active) setSchemes(data);
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, AdmissionScheme[]> = {};
    for (const s of schemes) {
      const key = CATEGORY_LABELS[s.category] ?? (s.category || "Other");
      (groups[key] = groups[key] || []).push(s);
    }
    return groups;
  }, [schemes]);

  const headings = useMemo(() => {
    const unique: string[] = [];
    for (const g of Object.keys(grouped)) {
      if (!unique.includes(g)) unique.push(g);
    }
    return unique.sort((a, b) => {
      const ia = Object.keys(grouped).indexOf(a);
      const ib = Object.keys(grouped).indexOf(b);
      return ia - ib;
    });
  }, [grouped]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
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
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.1, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.8,
            ease: "power2.out",
            delay: 0.2,
          },
        );
      }
      if (schemesRef.current) {
        gsap.fromTo(
          schemesRef.current.querySelectorAll(".scheme-card"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: schemesRef.current, start: "top 85%" },
          },
        );
      }
    });
    return () => ctx.revert();
  }, [loading]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={aboutHero}
            alt="Running Admissions"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Running Admissions
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            Welcome to the Online Applications Portal
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            This portal is your one-stop platform for applying to programmes.
            Browse the open admission schemes below, complete and submit your
            application online, generate a payment reference (PRN) and pay your
            application fees, then track your application and admission status.
            Please make sure the details and documents you provide are accurate;
            falsified information may lead to automatic disqualification.
          </p>
        </div>
      </div>

      <div
        ref={schemesRef}
        className="px-8 md:px-16 py-24 bg-gradient-to-b from-secondary/20 to-background"
      >
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Open Schemes
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-6 leading-[1.1]">
            Running Admissions
          </h2>
        </div>

        {loading ? (
          <p className="font-body text-muted-foreground">Loading admissions schemes...</p>
        ) : error ? (
          <p className="font-body text-muted-foreground">{error}</p>
        ) : schemes.length === 0 ? (
          <div className="p-10 rounded-[24px] border border-border/50 bg-background text-center">
            <p className="font-body text-muted-foreground">
              No admission schemes are currently open for applications.
            </p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Please check back later, or browse our programmes for details.
            </p>
            <Button
              className="mt-6"
              onClick={() => navigate("/programs")}
            >
              Browse Programmes <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          headings.map((categoryGroup) => {
            const items = grouped[categoryGroup];
            return (
              <div key={categoryGroup} className="mb-16">
                <Badge className="mb-4 px-3 py-1 text-xs tracking-widest uppercase">
                  {categoryGroup.toUpperCase()} SCHEMES
                </Badge>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {items.map((scheme) => {
                    const fees = parseFees(scheme.applicationFees);
                    const countdown = countdownLabel(scheme.daysLeft);
                    return (
                      <div
                        key={scheme.id}
                        className="scheme-card opacity-0"
                      >
                        <div className="card-hover p-8 rounded-[24px] border border-border/50 bg-background hover:border-accent/40 transition-all duration-500">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-heading text-2xl font-light text-foreground">
                              {scheme.schemeName}
                            </h3>
                            {countdown && (
                              <span className="shrink-0 text-xs font-bold tracking-widest text-foreground/70 whitespace-nowrap">
                                A {countdown}
                              </span>
                            )}
                          </div>

                          <div className="mb-4 pb-4 border-b border-border/50">
                            <p className="font-body text-xs tracking-[0.2em] uppercase text-accent font-semibold mb-2">
                              Scheme: {scheme.schemeName.toUpperCase()}, Academic
                              Year: {scheme.academicYear || "—"}, Intake:{" "}
                              {scheme.intakeMonth || "—"}, Category:{" "}
                              {categoryGroup.toUpperCase()}
                            </p>
                            {scheme.description && (
                              <p className="font-body text-sm text-muted-foreground mb-1">
                                SCHEME DESCRIPTION: {scheme.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-body text-muted-foreground mb-5">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar size={15} className="text-accent" />
                              Runs from: {formatDate(scheme.appOpenDate)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={15} className="text-accent" />
                              To: {formatDateWithTime(scheme.appCloseDate)}
                            </span>
                              {scheme.capacity != null && (
                              <span className="inline-flex items-center gap-1.5">
                                <Users size={15} className="text-accent" />
                                Capacity: {scheme.capacity}
                              </span>
                            )}
                            {parsePreferredStartDates(scheme.preferredStartDate).length > 0 && (
                              <span className="inline-flex items-center gap-1.5 text-accent font-medium">
                                Start Dates: {parsePreferredStartDates(scheme.preferredStartDate).join(", ")}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                            <div className="p-4 rounded-[16px] bg-accent/5 border border-accent/20">
                              <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                                Ugandan
                              </p>
                              <p className="font-body text-foreground font-semibold">
                                {formatMoney(fees.ugandan)}
                              </p>
                            </div>
                            <div className="p-4 rounded-[16px] bg-accent/5 border border-accent/20">
                              <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                                East-African
                              </p>
                              <p className="font-body text-foreground font-semibold">
                                {formatMoney(fees.eastAfrican)}
                              </p>
                            </div>
                            <div className="p-4 rounded-[16px] bg-accent/5 border border-accent/20">
                              <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                                Non East-African
                              </p>
                              <p className="font-body text-foreground font-semibold">
                                {formatMoney(fees.nonEastAfrican)}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 rounded-[16px] bg-background border border-border/50 mb-5">
                            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                              Service Fee
                            </p>
                            <p className="font-body text-foreground font-semibold">
                              {formatMoney(scheme.serviceFee)}
                            </p>
                          </div>

                          <Button
                            className="w-full"
                            onClick={() =>
                              navigate(`/admissions/application/start`)
                            }
                          >
                            Apply Now <ArrowRight size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {!loading && !error && schemes.length === 0 && (
          <div className="mt-12 p-8 rounded-[24px] border border-accent/30 bg-accent/5">
            <p className="font-body text-sm text-foreground">
              <BookOpen className="inline-block mr-2" size={16} /> Not seeing the
              programme you want? Each programme may open for applications at
              different times. Browse all programmes for the full catalogue and
              check back for new schemes.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdmissionsListsPage;
