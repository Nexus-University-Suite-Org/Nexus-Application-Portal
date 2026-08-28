import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  HeartHandshake,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { submitPartnershipSubmission } from "@/lib/submissions";
import { useContentCollection } from "@/hooks/useContentCollection";

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

const fallbackTracks = [
  { title: "Corporate Partnerships", description: "Co-design scholarship, training, and internship pathways that move learners into dignified work." },
  { title: "NGO and Foundation Programs", description: "Build joint initiatives focused on youth employability, women empowerment, and local enterprise growth." },
  { title: "Volunteer and Mentorship", description: "Support learners with practical sessions, guest lectures, and project-based mentorship." },
  { title: "Community Sponsorship", description: "Fund priority needs including student kits, trainer support, and startup seed opportunities." },
];

const iconMap: Record<string, typeof Building2> = {
  "Corporate Partnerships": Building2,
  "NGO and Foundation Programs": Globe,
  "Volunteer and Mentorship": Users,
  "Community Sponsorship": HeartHandshake,
};

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const PartnershipDiscussionPage = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    partnershipGoal: "",
    message: "",
  });

  const { items: pageSections } = useContentCollection<PageSection>("page_sections");
  const tracksSections = pageSections.filter(s => s.page_key === "partnership_discussion" && s.section_key === "tracks");
  const tracks = tracksSections.length > 0
    ? parseJson(tracksSections[0].body, fallbackTracks) as { title: string; description: string }[]
    : fallbackTracks;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.partnershipGoal.trim() ||
      !formData.message.trim()
    ) {
      toast({
        title: "Missing Details",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      await submitPartnershipSubmission({
        name: formData.name.trim(),
        email: formData.email.trim(),
        organization: formData.organization.trim(),
        partnershipGoal: formData.partnershipGoal.trim(),
        message: formData.message.trim(),
      });

      setFormData({
        name: "",
        email: "",
        organization: "",
        partnershipGoal: "",
        message: "",
      });

      toast({
        title: "Request Sent",
        description:
          "Thanks for reaching out. Our partnerships team will contact you shortly.",
        className:
          "data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "We could not send your request right now.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="px-8 md:px-16 pt-36 pb-20 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate("/contact")}
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors duration-300"
          >
            <ArrowLeft size={14} />
            Back to Contact
          </button>

          <p className="mt-8 font-body text-xs tracking-[0.3em] uppercase text-accent">
            Partnerships
          </p>
          <h1 className="mt-4 font-heading text-5xl md:text-7xl font-light text-foreground leading-[0.95]">
            Discuss a
            <br />
            Partnership
          </h1>
          <p className="mt-6 max-w-2xl font-body text-base text-muted-foreground leading-relaxed">
            Let us know your organization goals and we will shape a partnership
            model that creates measurable impact for learners and communities.
          </p>
        </div>
      </section>

      <section className="px-8 md:px-16 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {tracks.map(({ title, description }) => {
              const Icon = iconMap[title] || Building2;
              return (
              <article
                key={title}
                className="p-7 rounded-2xl border border-border bg-card"
              >
                <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-accent" />
                </div>
                <h2 className="font-heading text-3xl font-light text-foreground mb-2">
                  {title}
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </article>
            );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-7 md:p-10 rounded-2xl border border-border bg-background"
          >
            <h2 className="font-heading text-4xl font-light text-foreground mb-2">
              Start the Conversation
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-8">
              Share a few details and our team will follow up with next steps.
            </p>

            <div className="space-y-5">
              <input
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Your full name *"
                className="w-full px-5 py-3 rounded-xl border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />

              <input
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="Email address *"
                className="w-full px-5 py-3 rounded-xl border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />

              <input
                type="text"
                value={formData.organization}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    organization: event.target.value,
                  }))
                }
                placeholder="Organization (optional)"
                className="w-full px-5 py-3 rounded-xl border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />

              <input
                type="text"
                value={formData.partnershipGoal}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    partnershipGoal: event.target.value,
                  }))
                }
                placeholder="Partnership goal *"
                className="w-full px-5 py-3 rounded-xl border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />

              <textarea
                value={formData.message}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    message: event.target.value,
                  }))
                }
                placeholder="Tell us what you want to achieve together *"
                rows={6}
                className="w-full px-5 py-3 rounded-xl border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                required
              />

              <button
                type="submit"
                disabled={sending}
                className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-accent-foreground font-body text-xs tracking-[0.2em] uppercase hover:bg-accent/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send Request"}
                {!sending && (
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnershipDiscussionPage;
