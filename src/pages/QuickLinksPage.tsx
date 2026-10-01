import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  HelpCircle,
  Library,
  Mail,
  Map,
  Monitor,
  Phone,
  Shield,
  Users,
} from "lucide-react";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

// Keyed by the lucide icon name that the API returns in `icon`.
const iconMap = {
  Monitor: Monitor,
  BookOpen: BookOpen,
  Library: Library,
  Calendar: Calendar,
  FileText: FileText,
  Phone: Phone,
  Map: Map,
  HelpCircle: HelpCircle,
  Mail: Mail,
  Users: Users,
  Shield: Shield,
  GraduationCap: GraduationCap,
} as const;

type QuickLinkDoc = {
  id: number;
  title: string;
  url: string;
  icon?: string;
  displayOrder?: number;
};

const QuickLinksPage = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { data: quickLinks, isLoading } = useContentCollection<QuickLinkDoc>(
    "quick_links",
    [],
  );

  // The API returns a flat list with no category, and the seed data currently
  // contains the same link three times, so de-duplicate by url and sort by
  // displayOrder before rendering.
  const sections = useMemo(() => {
    const seen = new Set<string>();
    const links = quickLinks
      .filter((link) => {
        const key = link.url || link.title;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((link) => {
        const iconKey = (link.icon || "") as keyof typeof iconMap;
        return {
          id: String(link.id),
          href: link.url || `/quick-links/${link.title.toLowerCase().replace(/\s+/g, "-")}`,
          label: link.title,
          desc: "Visit this resource",
          icon: iconMap[iconKey] ?? FileText,
        };
      });
    return links.length > 0 ? [{ title: "", links }] : [];
  }, [quickLinks]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".ql-hero > *",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.3,
        },
      );
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.querySelectorAll(".ql-group"),
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
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
      <div className="px-8 md:px-16 pt-40 pb-20 bg-primary">
        <div className="ql-hero max-w-3xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">
            Quick Links
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.9] mb-6 opacity-0">
            Find What You Need
          </h1>
          <p className="font-body text-lg text-primary-foreground/60 leading-relaxed opacity-0">
            Fast access to the most-used university resources, portals, and
            services.
          </p>
        </div>
      </div>

      {/* Links Grid */}
      <div ref={gridRef} className="px-8 md:px-16 py-32 space-y-24">
        {isLoading && sections.length === 0 && (
          <p className="font-body text-lg text-muted-foreground text-center">
            Loading quick links...
          </p>
        )}
        {!isLoading && sections.length === 0 && (
          <p className="font-body text-lg text-muted-foreground text-center">
            No quick links available yet.
          </p>
        )}
        {sections.map((group) => (
          <div key={group.title || "all"} className="ql-group opacity-0">
            {group.title && (
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-10">
                {group.title}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.id}
                    to={link.href}
                    className="group flex items-start gap-5 p-6 border border-border rounded-[20px] transition-all duration-500 hover:border-accent/40 hover:shadow-[0_15px_50px_-15px_hsl(var(--accent)/0.12)]"
                  >
                    <div className="w-12 h-12 rounded-[12px] bg-secondary flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors duration-500">
                      <Icon
                        size={20}
                        className="text-muted-foreground group-hover:text-accent transition-colors duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-xl font-light text-foreground group-hover:text-accent transition-colors duration-500">
                          {link.label}
                        </h3>
                        <ArrowUpRight
                          size={14}
                          className="text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-500"
                        />
                      </div>
                      <p className="font-body text-sm text-muted-foreground mt-1">
                        {link.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default QuickLinksPage;
