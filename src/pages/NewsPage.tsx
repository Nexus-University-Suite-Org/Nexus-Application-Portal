import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Calendar, X } from "lucide-react";
import newsHero from "@/assets/news-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";


gsap.registerPlugin(ScrollTrigger);

const currentYear = new Date().getFullYear();

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  date: string;
  featured?: boolean;
};

type RemoteNewsArticle = Record<string, unknown> & {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  createdAt?: string;
  published_date?: string;
  featured?: boolean;
  published?: boolean;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  type: string;
};

const formatDate = (value: string | undefined, fallback = "TBA") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const NewsPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const [portalName] = useState("University Application Portal");
  const [heroTagline, setHeroTagline] = useState("News & Events");
  const [heroHeading1, setHeroHeading1] = useState("Stories That");
  const [heroHeading2, setHeroHeading2] = useState("Inspire");
  const [eventsTagline, setEventsTagline] = useState("Upcoming Events");
  const [eventsHeading, setEventsHeading] = useState("Mark Your Calendar");
  const [readMoreText, setReadMoreText] = useState("Read Full Story");
  const [readMoreVisible, setReadMoreVisible] = useState(true);
  const [featuredCategoryOverride, setFeaturedCategoryOverride] = useState("");
  const [featuredTitleOverride, setFeaturedTitleOverride] = useState("");
  const [featuredExcerptOverride, setFeaturedExcerptOverride] = useState("");
  const [settingNewsArticles, setSettingNewsArticles] = useState<Array<{ category: string; title: string; excerpt: string }>>([]);
  const [settingEvents, setSettingEvents] = useState<Array<{ title: string; date: string; type: string }>>([]);
  const [modalItem, setModalItem] = useState<{ kind: "news" | "event"; title: string; subtitle?: string; body?: string; category?: string; date?: string } | null>(null);
  const [heroImage, setHeroImage] = useState<string>(newsHero);

  const { data: rawNewsData, isLoading: newsLoading } = useContentCollection<RemoteNewsArticle>(
    "NewsArticles",
    [],
    {
      orderBy: { field: "createdAt", direction: "desc" },
    },
  );
  const { data: eventsData, isLoading: eventsLoading } = useContentCollection<EventItem>(
    "events",
    [],
    { orderBy: { field: "date", direction: "asc" } },
  );

  useEffect(() => {
    fetch("/api/v1/content/site-settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data.news_hero_tagline) setHeroTagline(data.news_hero_tagline);
        if (data.news_hero_heading_1) setHeroHeading1(data.news_hero_heading_1);
        if (data.news_hero_heading_2) setHeroHeading2(data.news_hero_heading_2);
        if (data.news_events_tagline) setEventsTagline(data.news_events_tagline);
        if (data.news_events_heading) setEventsHeading(data.news_events_heading);
        if (data.news_read_more) setReadMoreText(data.news_read_more);
        if (data.news_read_more_visible !== undefined) setReadMoreVisible(data.news_read_more_visible !== 'false');
        if (data.news_featured_category) setFeaturedCategoryOverride(data.news_featured_category);
        if (data.news_featured_title) setFeaturedTitleOverride(data.news_featured_title);
        if (data.news_featured_excerpt) setFeaturedExcerptOverride(data.news_featured_excerpt);
        try { if (data.news_articles) setSettingNewsArticles(JSON.parse(data.news_articles)); } catch {}
        try { if (data.news_events) setSettingEvents(JSON.parse(data.news_events)); } catch {}
        if (data.news_hero_image) {
          setHeroImage(data.news_hero_image);
          new Image().src = data.news_hero_image;
        }
      })
      .catch(() => {});
  }, []);

  const newsData: NewsItem[] =
    rawNewsData.length > 0
      ? rawNewsData
          .filter((item) => item.published !== false)
          .map((item) => {
            const title =
              typeof item.title === "string" && item.title.trim().length > 0
                ? item.title.replace(/University Application Portal/g, portalName)
                : "Untitled News";
            const generatedSlug = `${toSlug(title)}-${String(item.id).slice(0, 6)}`;
            return {
              id: item.id,
              title,
              slug:
                typeof item.slug === "string" && item.slug.trim().length > 0
                  ? item.slug
                  : generatedSlug,
              excerpt:
                typeof item.excerpt === "string" &&
                item.excerpt.trim().length > 0
                  ? item.excerpt.replace(/University Application Portal/g, portalName)
                  : "Read the full story for details.",
              category:
                typeof item.category === "string" &&
                item.category.trim().length > 0
                  ? item.category
                  : "News",
              date:
                (typeof item.createdAt === "string" && item.createdAt) ||
                (typeof item.published_date === "string" &&
                  item.published_date) ||
                "",
              featured: Boolean(item.featured),
            };
          })
      : [];

  const featuredNews =
    newsData.find((article) => article.featured) ?? newsData[0] ?? null;
  const dbNewsItems = newsData.filter(
    (article) => article.id !== featuredNews?.id,
  );
  const newsItems = settingNewsArticles.length > 0
    ? settingNewsArticles.map((a, i) => ({
        id: `setting-${i}`,
        title: a.title || 'Untitled',
        slug: toSlug(a.title || `article-${i}`),
        excerpt: a.excerpt || '',
        category: a.category || 'News',
        date: '',
        featured: false,
      }))
    : dbNewsItems;
  const dbEvents = eventsData.map((item) => ({
    ...item,
    date: formatDate(item.date, item.date),
  }));
  const events = settingEvents.length > 0
    ? settingEvents.map((e, i) => ({
        id: `setting-event-${i}`,
        title: e.title || 'Untitled Event',
        date: e.date || 'TBA',
        type: e.type || 'Event',
      }))
    : dbEvents;

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".news-hero-text > *",
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
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 1.6,
            ease: "power3.inOut",
            delay: 0.4,
          },
        );
      }
      if (newsRef.current) {
        gsap.fromTo(
          newsRef.current.querySelectorAll(".news-card"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: newsRef.current, start: "top 80%" },
          },
        );
      }
      if (eventsRef.current) {
        gsap.fromTo(
          eventsRef.current.querySelectorAll(".event-item"),
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: eventsRef.current, start: "top 80%" },
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
      <div className="relative min-h-[80vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img
            ref={imageRef}
            src={heroImage}
            alt="University news"
            className="w-full h-full object-cover rounded-none"
          />
          <div className="absolute inset-0 bg-primary/65 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 news-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">
            {heroTagline}
          </p>
          <h1 className="font-heading text-5xl md:text-8xl font-light text-primary-foreground leading-[0.9] mb-8 opacity-0">
            {heroHeading1}
            <br />
            {heroHeading2}
          </h1>
        </div>
      </div>

      {/* Featured */}
      {featuredNews && (
      <div className="px-8 md:px-16 py-24 border-b border-border">
        <div className="max-w-4xl">
          <span className="inline-block font-body text-[10px] tracking-[0.3em] uppercase text-accent border border-accent/30 px-3 py-1 rounded-full mb-6">
            {featuredCategoryOverride || featuredNews.category}
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-light text-foreground leading-tight mb-6">
            {featuredTitleOverride || featuredNews.title}
          </h2>
          <p className="font-body text-base text-muted-foreground leading-relaxed mb-6 max-w-2xl">
            {featuredExcerptOverride || featuredNews.excerpt}
          </p>
          <div className="flex items-center gap-6">
            <span className="font-body text-xs text-muted-foreground">
              {formatDate(featuredNews.date, featuredNews.date)}
            </span>
            {readMoreVisible && (
            <button
              onClick={() => setModalItem({ kind: "news", title: featuredTitleOverride || featuredNews.title, subtitle: featuredCategoryOverride || featuredNews.category, body: featuredExcerptOverride || featuredNews.excerpt, category: featuredCategoryOverride || featuredNews.category, date: featuredNews.date })}
              className="group inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-accent cursor-pointer"
            >
              {readMoreText}{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* News Grid */}
      <div ref={newsRef} className="px-8 md:px-16 py-32">
        {newsLoading && newsItems.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">Loading news...</p>
        ) : newsItems.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">No news articles yet.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((n) => (
            <button
              key={n.id}
              onClick={() => setModalItem({ kind: "news", title: n.title, subtitle: n.category, body: n.excerpt, category: n.category, date: n.date })}
              className="news-card group p-8 border border-border rounded-[20px] transition-all duration-500 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_hsl(var(--accent)/0.12)] text-left cursor-pointer"
            >
              <span className="inline-block font-body text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                {n.category}
              </span>
              <h3 className="font-heading text-xl font-light text-foreground mb-3 group-hover:text-accent transition-colors duration-500">
                {n.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                {n.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-muted-foreground/60">
                  {formatDate(n.date, n.date)}
                </span>
                <ArrowRight
                  size={16}
                  className="text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all duration-500"
                />
              </div>
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Events */}
      <div ref={eventsRef} className="px-8 md:px-16 py-32 bg-primary">
        <div className="max-w-2xl mb-20">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            {eventsTagline}
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight">
            {eventsHeading}
          </h2>
        </div>
        <div className="space-y-0">
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => setModalItem({ kind: "event", title: e.title, subtitle: e.type, body: `Date: ${e.date}`, category: e.type, date: e.date })}
              className="event-item group flex items-center justify-between py-8 border-t border-primary-foreground/10 last:border-b w-full text-left cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <Calendar size={18} className="text-accent shrink-0" />
                <div>
                  <h3 className="font-heading text-2xl font-light text-primary-foreground group-hover:text-accent transition-colors duration-500">
                    {e.title}
                  </h3>
                  <p className="font-body text-xs text-primary-foreground/50">
                    {e.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 border border-primary-foreground/15 px-3 py-1 rounded-full">
                  {e.type}
                </span>
                <ArrowRight
                  size={16}
                  className="text-primary-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all duration-500"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalItem(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10">
              <div className="flex items-center justify-between mb-6">
                <span className="inline-block font-body text-[10px] tracking-[0.3em] uppercase text-accent border border-accent/30 px-3 py-1 rounded-full">
                  {modalItem.kind === "news" ? modalItem.category : modalItem.category}
                </span>
                <button
                  onClick={() => setModalItem(null)}
                  className="p-2 rounded-full border border-border hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-light text-foreground leading-tight mb-4">
                {modalItem.title}
              </h2>
              {modalItem.subtitle && modalItem.kind === "event" && (
                <div className="flex items-center gap-3 mb-6">
                  <Calendar size={16} className="text-accent" />
                  <span className="font-body text-sm text-muted-foreground">{modalItem.date}</span>
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-accent border border-accent/30 px-3 py-1 rounded-full">
                    {modalItem.subtitle}
                  </span>
                </div>
              )}
              <p className="font-body text-base text-muted-foreground leading-relaxed">
                {modalItem.body || "Details coming soon."}
              </p>
              <div className="mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setModalItem(null)}
                  className="font-body text-xs tracking-[0.15em] uppercase text-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default NewsPage;
