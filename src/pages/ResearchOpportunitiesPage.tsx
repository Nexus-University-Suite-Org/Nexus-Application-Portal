import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { useContentCollection } from "@/hooks/useContentCollection";

const opportunityTracks = [
  {
    title: "Research Assistantships",
    description:
      "Embedded roles in faculty labs and field projects for students who want direct exposure to research workflows and publication culture.",
  },
  {
    title: "Industry Collaboration Projects",
    description:
      "Applied partnerships where academic teams work with companies, agencies, and civic institutions on defined implementation problems.",
  },
  {
    title: "Postgraduate Research Pathways",
    description:
      "Structured routes for master's and doctoral candidates seeking supervision, funding alignment, and interdisciplinary research communities.",
  },
];

type ResearchOpportunityDoc = {
  id: string;
  title: string;
  description?: string;
};

const ResearchOpportunitiesPage = () => {
  const { data: opportunities } =
    useContentCollection<ResearchOpportunityDoc>(
      "research_opportunities",
      opportunityTracks.map((track) => ({
        id: track.title,
        title: track.title,
        description: track.description,
      })),
      { orderBy: { field: "published_date", direction: "desc" }, limit: 6 },
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-8 md:px-16 pt-36 pb-24">
        <div className="max-w-5xl mx-auto">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Research Opportunities
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-[0.95] mb-6">
            Build with teams solving real problems.
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-3xl mb-12">
            University Application Portal research opportunities are designed for students, faculty,
            collaborators, and employers who want practical work with clear
            academic standards and measurable public value.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {opportunities.map((track) => (
              <div
                key={track.id}
                className="p-6 border border-border rounded-[24px] bg-secondary/20"
              >
                <h2 className="font-heading text-2xl font-light text-foreground mb-3">
                  {track.title}
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {track.description}
                </p>
              </div>
            ))}
          </div>

          <div className="border border-accent/30 rounded-[28px] p-8 md:p-10 bg-accent/5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-3">
                Best Next Steps
              </p>
              <h2 className="font-heading text-3xl font-light text-foreground mb-3">
                Start with a clear path.
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Applicants usually compare academic programs first, then review
                research areas, events, and partner-facing opportunities with a
                faculty or admissions conversation in mind.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/research"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-accent px-5 py-3 font-body text-xs tracking-[0.16em] uppercase text-accent hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
              >
                Explore Research
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/quick-links/jobs-careers"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-border px-5 py-3 font-body text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Careers Guidance
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResearchOpportunitiesPage;
