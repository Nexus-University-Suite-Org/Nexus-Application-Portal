import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CreditCard, DollarSign } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { getFeeAssignments, type FeeAssignment } from "@/lib/fees";
import { useContentCollection } from "@/hooks/useContentCollection";

gsap.registerPlugin(ScrollTrigger);

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

const fallbackPaymentPlans = [
  { name: "Full Payment", desc: "Pay entire semester upfront", discount: "5% discount" },
  { name: "Installment Plan", desc: "4 equal monthly payments", interest: "No interest" },
  { name: "Employer Sponsorship", desc: "Payment through employer", flexible: "Flexible terms" },
];

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const FeesPaymentPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const [feeAssignments, setFeeAssignments] = useState<FeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: pageSections } = useContentCollection<PageSection>("page_sections", []);
  const plansSections = pageSections.filter(s => s.page_key === "fees_payment" && s.section_key === "payment_plans");
  const paymentPlans = plansSections.length > 0
    ? parseJson(plansSections[0].body, fallbackPaymentPlans) as { name: string; desc: string; discount?: string; interest?: string; flexible?: string }[]
    : fallbackPaymentPlans;

  useEffect(() => {
    getFeeAssignments()
      .then(setFeeAssignments)
      .catch(() => setFeeAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  const feeBreakdown =
    feeAssignments.length > 0
      ? feeAssignments.map((fa) => ({
          category: fa.description || fa.program || "Fee",
          amount: `$${fa.amount.toLocaleString()}`,
          note: `${fa.college} - ${fa.academicYear}`,
        }))
      : [];

  const totalAmount =
    feeAssignments.length > 0
      ? feeAssignments.reduce((sum, fa) => sum + fa.amount, 0)
      : 0;

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

      // Breakdown
      if (breakdownRef.current) {
        gsap.fromTo(
          breakdownRef.current.querySelectorAll(".fee-item"),
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: breakdownRef.current, start: "top 85%" },
          },
        );
      }

      // Plans
      if (plansRef.current) {
        gsap.fromTo(
          plansRef.current.querySelectorAll(".plan-card"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: plansRef.current, start: "top 85%" },
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
            alt="Fees & Payment"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 px-8 md:px-16 pb-20 pt-40 max-w-4xl"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6">
            Investment in Education
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.95] mb-8">
            Fees & Payment
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Transparent pricing and flexible payment options to make education
            accessible.
          </p>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div
        ref={breakdownRef}
        className="px-8 md:px-16 py-24 bg-gradient-to-b from-secondary/20 to-background"
      >
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Costs
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Annual Fee Breakdown
          </h2>
        </div>

        <div className="max-w-3xl space-y-4 mb-12">
          {loading && feeBreakdown.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">Loading fee information...</p>
          )}

          {!loading && feeBreakdown.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">No fee information available yet.</p>
          )}

          {feeBreakdown.map((item) => (
            <div key={item.category} className="fee-item opacity-0">
              <div className="card-hover flex items-center justify-between p-6 rounded-[20px] border border-border/40 hover:border-accent/40 bg-background transition-all duration-500">
                <div className="flex items-center gap-4 flex-1">
                  <DollarSign size={24} className="icon-hover text-accent flex-shrink-0" />
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground mb-1">
                      {item.category}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {item.note}
                    </p>
                  </div>
                </div>
                <p className="font-heading text-2xl font-light text-accent">
                  {item.amount}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="p-8 rounded-[24px] border-2 border-accent/40 bg-accent/5">
          <div className="flex items-center justify-between">
            <p className="font-heading text-2xl font-light text-foreground">
              Estimated Annual Total
            </p>
            <p className="font-heading text-4xl font-light text-accent">
              ${totalAmount.toLocaleString()}
            </p>
          </div>
          <p className="font-body text-sm text-muted-foreground mt-3">
            *Actual costs may vary by program and residency status.
            International students may have different rates.
          </p>
        </div>
      </div>

      {/* Payment Plans */}
      <div ref={plansRef} className="px-8 md:px-16 py-24 bg-background">
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent font-semibold mb-6">
            Flexibility
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-12 leading-[1.1]">
            Payment Plans
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {paymentPlans.map((plan) => (
            <div key={plan.name} className="plan-card opacity-0">
              <div className="card-hover h-full p-8 rounded-[24px] border border-border/50 bg-gradient-to-br from-secondary/20 to-background hover:border-accent/40 transition-all duration-500">
                <CreditCard size={32} className="icon-hover text-accent mb-6" />
                <h3 className="font-heading text-2xl font-light text-foreground mb-3">
                  {plan.name}
                </h3>
                <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                  {plan.desc}
                </p>
                <div className="pt-6 border-t border-border/50">
                  <p className="font-body text-xs tracking-[0.15em] uppercase text-accent font-semibold">
                    {(plan as any).discount ||
                      (plan as any).interest ||
                      (plan as any).flexible}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FeesPaymentPage;
