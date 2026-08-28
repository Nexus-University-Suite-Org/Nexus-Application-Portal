import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useContentCollection } from "@/hooks/useContentCollection";

type QuickLinkDoc = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  link_url?: string;
};

const QuickLinkDetailPage = () => {
  const { slug } = useParams();
  const { data: quickLinks, isLoading } = useContentCollection<QuickLinkDoc>(
    "quick_links",
    [],
  );

  const remoteLink = slug
    ? quickLinks.find((item) => item.slug === slug)
    : undefined;

  const guide = remoteLink
    ? {
        slug: remoteLink.slug,
        title: remoteLink.title,
        category: remoteLink.category,
        excerpt:
          remoteLink.description ??
          "Resource detail and access information.",
        overview:
          remoteLink.description ??
          "This resource is maintained in the institute portal and can be accessed from the link below.",
        highlights: [
          "Sourced from the platform quick links collection.",
          "Use this as the fastest path to the intended service.",
          "Contact support if the destination is unavailable.",
        ],
        sections: [
          {
            title: "How to Use",
            body: "Open the primary action below to access the target resource. If you need additional support, use Contact Us from the quick links directory.",
          },
        ],
        primaryAction: remoteLink.link_url
          ? { label: "Open Resource", href: remoteLink.link_url }
          : undefined,
        secondaryAction: {
          label: "Back to Quick Links",
          href: "/quick-links",
        },
      }
    : undefined;

  if (!isLoading && !guide) {
    return <Navigate to="/not-found" replace />;
  }

  if (isLoading && !guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="px-8 md:px-16 pt-36 pb-24">
          <p className="font-body text-sm text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!guide) return null;

  const relatedGuides = quickLinks
    .filter((item) => item.slug !== guide.slug)
    .slice(0, 4);
  const isExternalUrl = (href: string) => /^https?:\/\//i.test(href);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-8 md:px-16 pt-36 pb-24">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/quick-links"
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.18em] uppercase text-accent mb-8"
          >
            <ArrowLeft size={14} />
            Back to Quick Links
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 items-start">
            <div>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
                {guide.category}
              </p>
              <h1 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-[0.95] mb-6">
                {guide.title}
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-10 max-w-3xl">
                {guide.overview}
              </p>

              <div className="space-y-8">
                {guide.sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="font-heading text-2xl font-light text-foreground mb-3">
                      {section.title}
                    </h2>
                    <p className="font-body text-base text-foreground/90 leading-8">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="border border-border rounded-[24px] p-6 bg-secondary/20">
                <p className="font-body text-[11px] tracking-[0.22em] uppercase text-accent mb-4">
                  Quick Overview
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                  {guide.excerpt}
                </p>
                <div className="space-y-3">
                  {guide.highlights.map((highlight) => (
                    <p
                      key={highlight}
                      className="font-body text-sm text-foreground/80 leading-relaxed"
                    >
                      {highlight}
                    </p>
                  ))}
                </div>
              </div>

              {(guide.primaryAction || guide.secondaryAction) && (
                <div className="border border-border rounded-[24px] p-6 bg-background">
                  <p className="font-body text-[11px] tracking-[0.22em] uppercase text-accent mb-4">
                    Next Steps
                  </p>
                  <div className="space-y-3">
                    {guide.primaryAction &&
                      (isExternalUrl(guide.primaryAction.href) ? (
                        <a
                          href={guide.primaryAction.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-[16px] border border-accent/35 px-4 py-3 font-body text-xs tracking-[0.16em] uppercase text-accent hover:bg-accent/10 transition-colors duration-300"
                        >
                          {guide.primaryAction.label}
                          <ArrowRight size={14} />
                        </a>
                      ) : (
                        <Link
                          to={guide.primaryAction.href}
                          className="flex items-center justify-between rounded-[16px] border border-accent/35 px-4 py-3 font-body text-xs tracking-[0.16em] uppercase text-accent hover:bg-accent/10 transition-colors duration-300"
                        >
                          {guide.primaryAction.label}
                          <ArrowRight size={14} />
                        </Link>
                      ))}
                    {guide.secondaryAction && (
                      <Link
                        to={guide.secondaryAction.href}
                        className="flex items-center justify-between rounded-[16px] border border-border px-4 py-3 font-body text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        {guide.secondaryAction.label}
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-24">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Related Links
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedGuides.map((item) => (
              <Link
                key={item.slug}
                to={`/quick-links/${item.slug}`}
                className="group p-5 border border-border rounded-[18px] transition-all duration-300 hover:border-accent/40 hover:bg-accent/5"
              >
                <h3 className="font-heading text-xl font-light text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {item.description || "Visit this resource"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuickLinkDetailPage;
