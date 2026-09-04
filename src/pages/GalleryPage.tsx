import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContentCollection } from "@/hooks/useContentCollection";
import { useSiteSettings } from "@/hooks/useSiteSettings";

gsap.registerPlugin(ScrollTrigger);

type Category = string;

interface GalleryItem extends Record<string, unknown> {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: string;
  span?: "tall" | "wide" | "normal";
}

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroTagline, setHeroTagline] = useState("Photo Gallery");
  const [heroHeading1, setHeroHeading1] = useState("See the Impact");
  const [heroHeading2, setHeroHeading2] = useState("In Action");
  const [heroDescription, setHeroDescription] = useState("Photos from our training sessions, graduation ceremonies, student projects, and community activities.");
  const { data: galleryItems, isLoading } = useContentCollection<GalleryItem>(
    "gallery",
    [],
    { orderBy: { field: "created_at", direction: "desc" } },
  );

  const categories = [
    "All",
    ...Array.from(
      new Set(galleryItems.map((item) => item.category).filter(Boolean)),
    ),
  ];

  const filtered =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);
  const lightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, goNext, goPrev]);

  // Hero entrance
  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/v1/content/site-settings")
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data.gallery_hero_tagline) setHeroTagline(data.gallery_hero_tagline);
        if (data.gallery_hero_heading_1) setHeroHeading1(data.gallery_hero_heading_1);
        if (data.gallery_hero_heading_2) setHeroHeading2(data.gallery_hero_heading_2);
        if (data.gallery_hero_description) setHeroDescription(data.gallery_hero_description);
      })
      .catch(() => {});
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-hero-text > *",
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
    });
    return () => ctx.revert();
  }, []);

  // Animate grid items on filter change / when items first render
  useEffect(() => {
    if (!gridRef.current || filtered.length === 0) return;
    const items = gridRef.current.querySelectorAll(".gallery-item");
    if (items.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { scale: 0.92, opacity: 0, y: 40, filter: "blur(4px)" },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
        },
      );
    });
    return () => ctx.revert();
  }, [activeCategory, filtered.length]);

  // Lightbox animation
  useEffect(() => {
    if (lightboxItem && lightboxRef.current) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      );
      gsap.fromTo(
        lightboxRef.current.querySelector(".lightbox-content"),
        { scale: 0.92, y: 20, filter: "blur(6px)" },
        {
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power3.out",
          delay: 0.1,
        },
      );
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxItem]);

  // Scroll-triggered parallax on hero
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".gallery-hero-img", {
        y: 80,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  const getSpanClass = (span?: string) => {
    switch (span) {
      case "tall":
        return "row-span-2";
      case "wide":
        return "col-span-1 sm:col-span-2";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div
        ref={heroRef}
        className="relative min-h-[55vh] flex items-end overflow-hidden"
      >
        <div className="gallery-hero-img absolute inset-0 w-full h-full bg-primary rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20 rounded-none" />
        <div className="relative z-10 px-8 md:px-16 pb-20 pt-40 gallery-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-5 opacity-0">
            {heroTagline}
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-6 opacity-0">
            {heroHeading1}
            <br />
            <em className="text-accent">{heroHeading2}</em>
          </h1>
          <p className="font-body text-base text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            {heroDescription}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-8 md:px-16 py-5">
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-body text-xs tracking-[0.18em] uppercase px-5 py-2 rounded-full border transition-all duration-300 active:scale-95 ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/20"
                    : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground hover:shadow-sm"
                }`}
              >
                {cat}
                {cat !== "All" && (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    ({galleryItems.filter((g) => g.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid — masonry-inspired */}
      <div ref={gridRef} className="px-6 md:px-12 lg:px-16 py-12 md:py-20">
        {isLoading ? (
          <p className="text-center text-muted-foreground font-body text-sm">
            Loading gallery...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground font-body text-sm">
            No gallery items yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[280px] gap-3">
            {filtered.map(({ src, alt, caption, span }, i) => (
            <button
              key={src || `${activeCategory}-${i}`}
              className={`gallery-item opacity-0 group relative overflow-hidden rounded-2xl cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${getSpanClass(span)}`}
              onClick={() => openLightbox(i)}
              aria-label={`View: ${caption}`}
            >
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <p className="font-body text-sm text-primary-foreground/90 leading-snug">
                    {caption}
                  </p>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-accent/20 backdrop-blur-sm flex items-center justify-center scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-400 delay-100">
                  <ZoomIn className="w-4 h-4 text-accent-foreground" />
                </div>
              </div>
              {/* Subtle inner shadow for depth */}
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_-60px_60px_-40px_hsl(var(--primary)/0.3)] pointer-events-none" />
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[200] bg-primary/95 backdrop-blur-md flex items-center justify-center opacity-0"
          onClick={closeLightbox}
        >
          <div
            className="lightbox-content relative max-w-5xl w-full mx-4 md:mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 md:top-4 md:-right-14 w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-300 active:scale-95"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5 text-primary-foreground" />
            </button>

            {/* Navigation arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-2 md:-left-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-300 active:scale-95 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 md:-right-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-300 active:scale-95 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-primary-foreground" />
            </button>

            {/* Image */}
            <img
              src={lightboxItem.src}
              alt={lightboxItem.alt}
              className="w-full max-h-[78vh] object-contain rounded-2xl"
            />

            {/* Caption bar */}
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="font-body text-sm text-primary-foreground/70">
                {lightboxItem.caption}
              </p>
              <p className="font-body text-xs text-primary-foreground/40 tabular-nums">
                {lightboxIndex !== null ? lightboxIndex + 1 : 0} /{" "}
                {filtered.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GalleryPage;
