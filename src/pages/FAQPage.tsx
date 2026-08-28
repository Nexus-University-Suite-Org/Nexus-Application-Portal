import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, HelpCircle } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type RemoteFaq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  order?: number;
};

const FAQPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: faqs, isLoading } = useContentCollection<RemoteFaq>(
    "faqs",
    [],
    {
      orderBy: { field: "order", direction: "asc" },
    },
  );

  const groupedFaqs = faqs.reduce<Record<string, RemoteFaq[]>>(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {},
  );

  const dynamicFaqCategories = Object.entries(groupedFaqs).map(
    ([category, questions]) => ({
      category,
      icon: HelpCircle,
      questions: questions
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => ({ q: item.question, a: item.answer })),
    }),
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Hero text
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

      // Hero image
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

      // FAQ items
      if (faqRef.current) {
        gsap.fromTo(
          faqRef.current.querySelectorAll(".faq-item"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: faqRef.current, start: "top 85%" },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={aboutHero}
            alt="Frequently Asked Questions"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Common Questions
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            Frequently Asked Questions
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Find answers to common questions about admissions, academics, campus
            life, fees, and more.
          </p>
        </div>
      </div>

      {/* FAQ Sections */}
      <div ref={faqRef} className="px-8 md:px-16 py-24 bg-background">
        {isLoading && dynamicFaqCategories.length === 0 ? (
          <div className="text-center">
            <p className="font-body text-lg text-muted-foreground">
              Loading frequently asked questions...
            </p>
          </div>
        ) : dynamicFaqCategories.length === 0 ? (
          <div className="text-center">
            <p className="font-body text-lg text-muted-foreground">
              No FAQs available yet.
            </p>
          </div>
        ) : (
        <div className="space-y-20">
          {dynamicFaqCategories.map((category) => (
            <div key={category.category} className="max-w-4xl mx-auto">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-12">
                <category.icon
                  size={32}
                  className="icon-hover text-accent flex-shrink-0"
                />
                <h2 className="font-heading text-3xl md:text-4xl font-light text-foreground">
                  {category.category}
                </h2>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {category.questions.map((item, index) => {
                  const itemId = `${category.category}-${index}`;
                  const isExpanded = expandedId === itemId;

                  return (
                    <div
                      key={itemId}
                      className="faq-item opacity-0 card-hover rounded-[20px] border border-border/50 bg-gradient-to-r from-secondary/10 to-background overflow-hidden transition-all duration-500"
                    >
                      <button
                        onClick={() => toggleExpand(itemId)}
                        className="w-full flex items-start justify-between p-6 md:p-8 hover:bg-secondary/5 transition-colors duration-300"
                      >
                        <h3 className="font-heading text-lg md:text-xl font-light text-foreground text-left leading-relaxed">
                          {item.q}
                        </h3>
                        <ChevronDown
                          size={24}
                          className={`icon-hover text-accent flex-shrink-0 ml-4 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Expanded Answer */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isExpanded ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-border/30">
                          <p className="font-body text-muted-foreground leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Additional Help Section */}
        <div className="mt-24 max-w-4xl mx-auto p-8 rounded-[24px] border border-accent/30 bg-accent/5">
          <div className="text-center">
            <p className="font-body text-foreground mb-4">
              Didn't find the answer you're looking for?
            </p>
            <p className="font-body text-muted-foreground mb-6 leading-relaxed">
              Contact our admissions team at{" "}
              <a
                href="mailto:admissions@universityapplicationportal.edu"
                className="text-accent font-semibold hover:text-accent/80 transition-colors"
              >
                admissions@universityapplicationportal.edu
              </a>{" "}
              or call{" "}
              <a
                href="tel:+1-555-PORTAL"
                className="text-accent font-semibold hover:text-accent/80 transition-colors"
              >
                +1-555-PORTAL
              </a>
            </p>
            <button className="px-8 py-3 rounded-[16px] border border-accent/50 bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 transition-all duration-300">
              <span className="font-body text-sm tracking-[0.15em] uppercase text-accent font-semibold">
                Schedule a Call
              </span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
