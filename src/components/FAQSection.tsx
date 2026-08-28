import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type FaqDoc = {
  id: string;
  question?: string;
  answer?: string;
  category?: string;
};

const FAQSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data: faqDocs } = useContentCollection<FaqDoc>("faqs", []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current.querySelectorAll("*"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: titleRef.current,
              start: "top 85%",
            },
          },
        );
      }

      if (faqRef.current) {
        gsap.fromTo(
          faqRef.current.querySelectorAll(".faq-item"),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: faqRef.current,
              start: "top 85%",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [faqDocs]);

  return (
    <section
      ref={sectionRef}
      className="relative px-8 md:px-16 py-24 md:py-32 bg-gradient-to-b from-background via-secondary/5 to-background"
    >
      {/* Title */}
      <div ref={titleRef} className="max-w-3xl mx-auto mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <p className="font-body text-xs tracking-[0.25em] uppercase text-accent font-semibold">
            Common Questions
          </p>
        </div>
        <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1] mb-6">
          Frequently Asked Questions
        </h2>
        <p className="font-body text-lg text-muted-foreground leading-relaxed">
          Find answers to common questions about admissions, academics, and
          more.
        </p>
      </div>

      {/* FAQ Items */}
      <div ref={faqRef} className="max-w-3xl mx-auto space-y-4">
        {faqDocs.map((item, index) => {
          const isExpanded = expandedId === index;

          return (
            <div
              key={item.id}
              className="faq-item opacity-0 card-hover rounded-[20px] border border-border/50 bg-gradient-to-r from-secondary/10 to-background overflow-hidden transition-all duration-500"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-start justify-between p-6 md:p-8 hover:bg-secondary/5 transition-colors duration-300"
              >
                <h3 className="font-heading text-lg md:text-xl font-light text-foreground text-left leading-relaxed">
                  {item.question}
                </h3>
                <ChevronDown
                  size={24}
                  className={`icon-hover text-accent flex-shrink-0 ml-4 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-border/30">
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {faqDocs.length === 0 && (
          <p className="text-muted-foreground text-center py-12">
            No FAQs yet. Add them from the admin panel.
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="font-body text-muted-foreground mb-4">
          Need more help?{" "}
          <a
            href="/admissions/faq"
            className="text-accent font-semibold hover:text-accent/80 transition-colors"
          >
            View all FAQs
          </a>
        </p>
      </div>
    </section>
  );
};

export default FAQSection;
