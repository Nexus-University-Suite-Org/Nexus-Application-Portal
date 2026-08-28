import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useContentCollection } from "@/hooks/useContentCollection";

type Article = {
  id: string;
  slug: string;
  title: string;
  date?: string;
  published_date?: string;
  category: string;
  excerpt: string;
  readTime?: string;
  body?: string[];
  content?: string;
  highlights?: string[];
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

const toParagraphs = (article: Article): string[] => {
  if (Array.isArray(article.body) && article.body.length > 0) {
    return article.body;
  }
  if (
    typeof article.content === "string" &&
    article.content.trim().length > 0
  ) {
    return article.content
      .split(/\n\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const NewsArticlePage = () => {
  const { slug } = useParams();
  const [portalName] = useState("University Application Portal");
  const { data: remoteArticles, isLoading } =
    useContentCollection<RemoteNewsArticle>("NewsArticles", [], {
      orderBy: { field: "createdAt", direction: "desc" },
    });

  const allArticles: Article[] =
    remoteArticles.length > 0
      ? remoteArticles
          .filter((item) => item.published !== false)
          .map((item) => {
            const title =
              typeof item.title === "string" && item.title.trim().length > 0
                ? item.title
                : "Untitled News";
            const generatedSlug = `${toSlug(title)}-${item.id.slice(0, 6)}`;
            return {
              id: item.id,
              slug:
                typeof item.slug === "string" && item.slug.trim().length > 0
                  ? item.slug
                  : generatedSlug,
              title: title.replace(/University Application Portal/g, portalName),
              date:
                (typeof item.createdAt === "string" && item.createdAt) ||
                (typeof item.published_date === "string" &&
                  item.published_date) ||
                "",
              published_date:
                (typeof item.published_date === "string" &&
                  item.published_date) ||
                (typeof item.createdAt === "string" && item.createdAt) ||
                "",
              category:
                typeof item.category === "string" &&
                item.category.trim().length > 0
                  ? item.category
                  : "News",
              excerpt:
                typeof item.excerpt === "string" &&
                item.excerpt.trim().length > 0
                  ? item.excerpt.replace(/University Application Portal/g, portalName)
                  : "Read the full story for details.",
              content:
                typeof item.content === "string" &&
                item.content.trim().length > 0
                  ? item.content.replace(/University Application Portal/g, portalName)
                  : undefined,
            };
          })
      : [];

  const article =
    slug ? allArticles.find((item) => item.slug === slug) : undefined;

  if (!article) {
    return <Navigate to="/not-found" replace />;
  }

  const normalizedArticle: Article = {
    id: (article as any).id || slug || "",
    slug: (article as any).slug || slug || "",
    ...(article as any),
  };

  const relatedArticles = allArticles
    .filter((item) => item.slug !== normalizedArticle.slug)
    .slice(0, 3);
  const paragraphs = toParagraphs(normalizedArticle).map((paragraph) =>
    paragraph.replace(/University Application Portal/g, portalName),
  );
  const highlights = Array.isArray(normalizedArticle.highlights)
    ? normalizedArticle.highlights.map((highlight) =>
        highlight.replace(/University Application Portal/g, portalName),
      )
    : [];
  const articleDate =
    normalizedArticle.published_date ?? normalizedArticle.date;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-8 md:px-16 pt-36 pb-24">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.18em] uppercase text-accent mb-8"
          >
            <ArrowLeft size={14} />
            Back to News
          </Link>

          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            {normalizedArticle.category}
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-[0.95] mb-6">
            {normalizedArticle.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 font-body text-sm text-muted-foreground mb-8">
            <span>{articleDate}</span>
            <span>{normalizedArticle.readTime ?? "5 min read"}</span>
          </div>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl">
            {normalizedArticle.excerpt}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10 items-start">
            <article className="space-y-6">
              {paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="font-body text-base text-foreground/90 leading-8"
                >
                  {paragraph}
                </p>
              ))}
            </article>

            <aside className="border border-border rounded-[24px] p-6 bg-secondary/20">
              <p className="font-body text-[11px] tracking-[0.22em] uppercase text-accent mb-4">
                Key Takeaways
              </p>
              <div className="space-y-4">
                {highlights.map((highlight) => (
                  <p
                    key={highlight}
                    className="font-body text-sm text-muted-foreground leading-relaxed"
                  >
                    {highlight}
                  </p>
                ))}
              </div>
            </aside>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-24">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">
                Related Reading
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-light text-foreground">
                More from {portalName}
              </h2>
            </div>
            <Link
              to="/news"
              className="font-body text-xs tracking-[0.18em] uppercase text-accent"
            >
              All News
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((item) => (
              <Link
                key={item.slug}
                to={`/news/${item.slug}`}
                className="group p-6 border border-border rounded-[20px] transition-all duration-500 hover:border-accent/40 hover:shadow-[0_18px_50px_-18px_hsl(var(--accent)/0.15)]"
              >
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-accent mb-3">
                  {item.category}
                </p>
                <h3 className="font-heading text-2xl font-light text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                  {item.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 font-body text-xs tracking-[0.16em] uppercase text-accent">
                  Read Article
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsArticlePage;
