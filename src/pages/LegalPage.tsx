import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { getLegalPageBySlug } from "@/lib/legalContent";
import { useContentCollection } from "@/hooks/useContentCollection";

type LegalPageDoc = {
  id: string;
  slug: string;
  title: string;
  content: string;
};

const LegalPage = () => {
  const { slug } = useParams();
  const { data: legalDocs } = useContentCollection<LegalPageDoc>(
    "legal_pages",
    [],
    {
      where: { field: "slug", operator: "==", value: slug ?? "" },
      limit: 1,
    },
  );

  const remotePage = legalDocs[0]
    ? {
        slug: legalDocs[0].slug,
        title: legalDocs[0].title,
        intro:
          "Official legal page content from the University Application Portal content library.",
        sections: legalDocs[0].content
          .split(/\n\n+/)
          .filter(Boolean)
          .map((paragraph, index) => ({
            title: `Section ${index + 1}`,
            body: paragraph,
          })),
      }
    : undefined;

  const page = remotePage ?? (slug ? getLegalPageBySlug(slug) : undefined);

  if (!page) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-8 md:px-16 pt-36 pb-24">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.18em] uppercase text-accent mb-8"
          >
            <ArrowLeft size={14} />
            Back to Site
          </Link>

          <h1 className="font-heading text-4xl md:text-6xl font-light text-foreground mb-6">
            {page.title}
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-12">
            {page.intro}
          </p>

          <div className="space-y-10">
            {page.sections.map((section) => (
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
      </main>

      <Footer />
    </div>
  );
};

export default LegalPage;
