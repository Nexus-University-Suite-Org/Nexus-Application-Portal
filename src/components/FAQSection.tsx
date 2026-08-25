import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const faqData = [
  {
    q: "What are the application deadlines?",
    a: "Undergraduate applications close on March 31, Postgraduate on April 30, Professional on May 15, and Exchange students on June 30. Early applications are encouraged.",
  },
  {
    q: "What is the minimum GPA requirement?",
    a: "We require a minimum 3.0 GPA for undergraduate programs. However, we also consider the strength of your application holistically.",
  },
  {
    q: "Do you accept international students?",
    a: "Yes! We welcome international students from all over the world. International applicants need to demonstrate English language proficiency through TOEFL or IELTS scores.",
  },
  {
    q: "Is financial aid available?",
    a: "Yes, we offer merit-based scholarships and need-based financial aid to qualified students. We also have partnerships with external organizations for additional funding.",
  },
  {
    q: "Can I change my major after admission?",
    a: "Yes, you can change your major during your first year without penalties. After that, changes are still possible but may require additional coursework.",
  },
  {
    q: "Does University Application Portal offer online learning options?",
    a: "Yes! We offer fully online degrees, hybrid programs, and certificates through our Learning Online platform. All programs maintain the same academic rigor as on-campus options.",
  },
];

const FAQSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
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

      // FAQ items animation
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
  }, []);

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
        {faqData.map((item, index) => {
          const isExpanded = expandedId === index;

          return (
            <div
              key={index}
              className="faq-item opacity-0 card-hover rounded-[20px] border border-border/50 bg-gradient-to-r from-secondary/10 to-background overflow-hidden transition-all duration-500"
            >
              <button
                onClick={() => toggleExpand(index)}
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
