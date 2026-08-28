import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Quote, ArrowRight, Heart, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import storiesHero from "@/assets/stories-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

interface Story {
  name: string;
  age: number;
  program: string;
  graduated: string;
  image: string;
  tag: string;
  quote: string;
  before: string;
  after: string;
  fullStory: string;
}

type StudentStoryDoc = {
  id: string;
  title: string;
  student_name: string;
  program?: string;
  graduation_year?: number;
  content?: string;
  image_url?: string;
};

const StudentStoriesPage = () => {
  const navigate = useNavigate();
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  const [portalName] = useState("University Application Portal");
  const storiesRef = useRef<HTMLDivElement>(null);
  const { data: storyDocs, isLoading } = useContentCollection<StudentStoryDoc>(
    "student_stories",
    [],
    { orderBy: { field: "published_date", direction: "desc" } },
  );

  const dynamicStories: Story[] =
    storyDocs.length > 0
      ? storyDocs.map((doc, index) => {
          const content = (
            doc.content || "Story details will be published soon."
          ).replace(/University Application Portal/g, portalName);
          return {
            name: doc.student_name,
            age: 0,
            program: doc.program || "Vocational Training",
            graduated: doc.graduation_year
              ? String(doc.graduation_year)
              : "Recent",
            image: doc.image_url || "",
            tag: "Featured Story",
            quote: doc.title,
            before: "Learner preparing for better livelihood opportunities.",
            after: "Graduate applying practical skills for income and impact.",
            fullStory: content,
          };
        })
      : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stories-hero-text > *",
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

      if (storiesRef.current) {
        gsap.fromTo(
          storiesRef.current.querySelectorAll(".story-card"),
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: storiesRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      gsap.utils.toArray<HTMLElement>(".section-heading").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  const toggleStory = (index: number) => {
    setExpandedStory(expandedStory === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[55vh] flex items-end overflow-hidden">
        <img
          src={storiesHero}
          alt="Graduate success"
          className="absolute inset-0 w-full h-full object-cover rounded-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20 rounded-none" />
        <div className="relative z-10 px-8 md:px-16 pb-20 pt-40 stories-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-5 opacity-0">
            Student Stories
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-6 opacity-0">
            Real People.
            <br />
            <em className="text-accent">Real Transformation.</em>
          </h1>
          <p className="font-body text-base text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            Behind every statistic is a person whose life was changed by
            practical skills and the belief that a better future is possible.
          </p>
        </div>
      </div>

      {/* Stories */}
      <section className="py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Their Journeys
          </p>
          <h2 className="section-heading font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
            From Hardship
            <br />
            To Hope
          </h2>
        </div>

        <div ref={storiesRef} className="space-y-8 max-w-5xl">
          {isLoading && dynamicStories.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">Loading student stories...</p>
          )}
          {!isLoading && dynamicStories.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">No student stories available yet.</p>
          )}
          {dynamicStories.map((story, i) => (
            <div
              key={story.name}
              className="story-card opacity-0 group border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-500"
            >
              <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr]">
                {/* Image */}
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 bg-accent/90 text-accent-foreground rounded-full backdrop-blur-sm">
                      {story.tag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex flex-col">
                  <div className="flex items-start gap-3 mb-4">
                    <div>
                      <h3 className="font-heading text-2xl md:text-3xl font-light text-foreground">
                        {story.name}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        {story.program} · Graduated {story.graduated} · Age{" "}
                        {story.age}
                      </p>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="relative mb-6">
                    <Quote size={16} className="text-accent/40 mb-2" />
                    <p className="font-heading text-lg md:text-xl font-light text-foreground/90 leading-relaxed italic">
                      {story.quote}
                    </p>
                  </div>

                  {/* Before / After */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-destructive/60 mb-2">
                        Before
                      </p>
                      <p className="font-body text-sm text-foreground/70 leading-relaxed">
                        {story.before}
                      </p>
                    </div>
                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-accent/80 mb-2">
                        After
                      </p>
                      <p className="font-body text-sm text-foreground/70 leading-relaxed">
                        {story.after}
                      </p>
                    </div>
                  </div>

                  {/* Expandable full story */}
                  <button
                    onClick={() => toggleStory(i)}
                    className="flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-accent hover:text-accent/80 transition-colors duration-300 mt-auto"
                  >
                    {expandedStory === i ? "Read Less" : "Read Full Story"}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${expandedStory === i ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expandedStory === i && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {story.fullStory}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-8 md:px-16 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Be Part of the Story
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-8">
            Help Write the Next
            <br />
            Success Story
          </h2>
          <p className="font-body text-sm text-primary-foreground/60 leading-relaxed mb-10 max-w-lg mx-auto">
            Every student who walks through our doors has the potential to
            transform their life and their community. Your support makes it
            possible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/donate")}
              className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
            >
              <Heart size={16} className="fill-current" />
              Sponsor a Student
            </button>
            <button
              onClick={() => navigate("/programs")}
              className="group flex items-center gap-2 px-10 py-4 border border-primary-foreground/40 text-primary-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:border-accent hover:text-accent btn-lift"
            >
              View Programs
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StudentStoriesPage;
