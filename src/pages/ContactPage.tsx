import { useEffect, useRef, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Heart,
  ArrowRight,
  Send,
  Users,
  Building,
  Globe,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import heroCampus from "@/assets/hero-campus.jpg";
import { useSpotlightCards } from "@/hooks/useScrollReveal";
import { useContentCollection } from "@/hooks/useContentCollection";
import { submitContactSubmission } from "@/lib/submissions";

gsap.registerPlugin(ScrollTrigger);

type PageSection = Record<string, unknown> & {
  id: string;
  page_key?: string;
  section_key?: string;
  title?: string;
  body?: string;
};

const fallbackPartnerTypes = [
  { title: "Corporate Sponsors", description: "Partner your brand with a life-changing cause. Corporate sponsorships fund training programs and provide visibility within our growing community network." },
  { title: "NGOs & Donors", description: "We welcome partnerships with like-minded organizations working on poverty alleviation, women's empowerment, and youth development." },
  { title: "Volunteers", description: "Share your skills with our students and staff. From workshop facilitation to mentorship and business coaching — your time makes a difference." },
  { title: "Individual Donors", description: "Become a regular supporter or make a one-time contribution. Every shilling goes directly toward training vulnerable youth and single mothers." },
];

const iconMap: Record<string, typeof Building> = {
  "Corporate Sponsors": Building,
  "NGOs & Donors": Globe,
  "Volunteers": Users,
  "Individual Donors": Heart,
};

const parseJson = (body: string | undefined, fallback: unknown) => {
  if (!body) return fallback;
  try { return JSON.parse(body); } catch { return fallback; }
};

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [organizationPhone, setOrganizationPhone] = useState("+256 700 000 000");
  const [organizationWhatsappCta, setOrganizationWhatsappCta] = useState("WhatsApp Us");
  const [organizationAddress, setOrganizationAddress] = useState(
    "Plot 7, Nakawa Road, Kampala, Uganda",
  );
  const [heroImage, setHeroImage] = useState<string>(heroCampus);
  const [contactHeroTagline, setContactHeroTagline] = useState("Get In Touch");
  const [contactHeroHeading, setContactHeroHeading] = useState("Contact & Partnerships");
  const [contactHeroDescription, setContactHeroDescription] = useState(
    "Whether you want to donate, partner, volunteer, or just learn more — we'd love to hear from you.",
  );
  const partnersRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useSpotlightCards(partnersRef, ".partner-card");

  const { data: pageSections } = useContentCollection<PageSection>("page_sections", []);
  const partnerTypesSections = pageSections.filter(s => s.page_key === "contact" && s.section_key === "partner_types");
  const partnerTypes = partnerTypesSections.length > 0
    ? parseJson(partnerTypesSections[0].body, fallbackPartnerTypes) as { title: string; description: string }[]
    : fallbackPartnerTypes;

  const phoneDigits = organizationPhone.replace(/\D/g, "");

  useEffect(() => {
    fetch("/api/v1/content/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, string> | null) => {
        if (data?.contact_hero_image) {
          setHeroImage(data.contact_hero_image);
          new Image().src = data.contact_hero_image;
        }
        if (data?.footer_email) setOrganizationEmail(data.footer_email);
        if (data?.footer_phone) setOrganizationPhone(data.footer_phone);
        if (data?.footer_whatsapp_cta) setOrganizationWhatsappCta(data.footer_whatsapp_cta);
        if (data?.footer_address) setOrganizationAddress(data.footer_address);
        if (data?.contact_hero_tagline) setContactHeroTagline(data.contact_hero_tagline);
        if (data?.contact_hero_heading) setContactHeroHeading(data.contact_hero_heading);
        if (data?.contact_hero_description) setContactHeroDescription(data.contact_hero_description);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Hero text — cinematic clip reveal
      gsap.fromTo(
        ".contact-hero-text > *",
        { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.3,
          stagger: 0.18,
          ease: "power3.out",
          delay: 0.3,
        },
      );

      if (partnersRef.current) {
        gsap.fromTo(
          partnersRef.current.querySelectorAll(".partner-card"),
          { y: 60, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: "back.out(1.3)",
            scrollTrigger: {
              trigger: partnersRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Contact section — staggered slides
      if (contactRef.current) {
        gsap.fromTo(
          contactRef.current.querySelectorAll(".contact-anim"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contactRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // Form field focus animations
  useEffect(() => {
    const inputs = document.querySelectorAll<HTMLElement>(".form-field");
    const handlers: Array<() => void> = [];

    inputs.forEach((input) => {
      const focusIn = () => {
        input.style.borderColor = "hsl(var(--accent))";
        gsap.to(input, {
          scale: 1.01,
          duration: 0.3,
          ease: "power2.out",
        });
      };
      const focusOut = () => {
        input.style.borderColor = "hsl(var(--border))";
        gsap.to(input, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      };
      input.addEventListener("focusin", focusIn);
      input.addEventListener("focusout", focusOut);
      handlers.push(() => {
        input.removeEventListener("focusin", focusIn);
        input.removeEventListener("focusout", focusOut);
      });
    });

    return () => handlers.forEach((fn) => fn());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    )
      return;
    setSending(true);

    try {
      const result = (await submitContactSubmission({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      })) as { queued?: boolean };

      setSending(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast({
        title: result?.queued ? "Message Saved" : "Message Sent",
        description: result?.queued
          ? "Your message was saved successfully and will be delivered when the API is back online."
          : "Thank you! We'll get back to you within 24 hours.",
        className:
          "data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full",
      });
    } catch (error) {
      setSending(false);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "We could not submit your message right now.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative min-h-[50vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden rounded-none">
          <img
            src={heroImage}
            alt="Contact us"
            className="w-full h-full object-cover rounded-none"
          />
          <div className="absolute inset-0 bg-primary/70 rounded-none" />
        </div>
        <div className="relative z-10 px-8 md:px-16 pb-24 pt-40 contact-hero-text max-w-4xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-6 opacity-0">
            {contactHeroTagline}
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[0.92] mb-8 opacity-0">
            {contactHeroHeading}
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-xl leading-relaxed opacity-0">
            {contactHeroDescription}
          </p>
        </div>
      </div>

      {/* Contact Info + Form */}
      <div ref={contactRef} className="px-8 md:px-16 py-24 md:py-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Details */}
          <div>
            <p className="contact-anim opacity-0 font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
              Find Us
            </p>
            <h2 className="contact-anim opacity-0 font-heading text-4xl md:text-5xl font-light text-foreground leading-tight mb-10">
              We're Here to Help
            </h2>
            <div className="space-y-8">
              {[
                {
                  href: `mailto:${organizationEmail}`,
                  icon: Mail,
                  label: "Email",
                  value: organizationEmail,
                },
                {
                  href: `tel:${organizationPhone.replace(/\s+/g, "")}`,
                  icon: Phone,
                  label: "Phone",
                  value: organizationPhone,
                },
                {
                  href: phoneDigits
                    ? `https://wa.me/${phoneDigits}`
                    : "https://wa.me/256700000000",
                  icon: MessageCircle,
                  label: "WhatsApp",
                  value: organizationWhatsappCta,
                  external: true,
                },
              ].map(({ href, icon: Icon, label, value, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="contact-anim opacity-0 group flex items-center gap-5 transition-colors duration-300 hover:text-accent"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className="font-body text-sm text-foreground group-hover:text-accent transition-colors duration-300 underline-grow">
                      {value}
                    </p>
                  </div>
                </a>
              ))}
              <div className="contact-anim opacity-0 flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-accent" />
                </div>
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">
                    Location
                  </p>
                  <p className="font-body text-sm text-foreground leading-relaxed">
                    {organizationAddress}
                  </p>
                  <a
                    href="https://maps.google.com/?q=Nakawa+Kampala+Uganda"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs text-accent mt-2 inline-flex items-center gap-1 hover:underline"
                  >
                    View on Google Maps
                    <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="contact-anim opacity-0 font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
              Send a Message
            </p>
            {[
              {
                type: "text",
                placeholder: "Your Name",
                key: "name",
                required: true,
              },
              {
                type: "email",
                placeholder: "Email Address",
                key: "email",
                required: true,
              },
              {
                type: "text",
                placeholder: "Subject (e.g. Partnership, Donation, Volunteer)",
                key: "subject",
                required: false,
              },
            ].map(({ type, placeholder, key, required }) => (
              <div key={key} className="contact-anim opacity-0">
                <input
                  type={type}
                  placeholder={placeholder}
                  value={formData[key as keyof typeof formData]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  required={required}
                  className="form-field w-full px-5 py-4 bg-transparent border border-border rounded-[16px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300"
                />
              </div>
            ))}
            <div className="contact-anim opacity-0">
              <textarea
                placeholder="Your message..."
                rows={6}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                className="form-field w-full px-5 py-4 bg-transparent border border-border rounded-[16px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300 resize-none"
              />
            </div>
            <div className="contact-anim opacity-0">
              <button
                type="submit"
                disabled={sending}
                className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed btn-lift"
              >
                {sending ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send
                      size={16}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Partner With Us */}
      <div
        ref={partnersRef}
        className="px-8 md:px-16 py-24 md:py-32 bg-secondary/20"
      >
        <div className="max-w-2xl mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-4">
            Collaborate
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-foreground leading-tight">
            Partner With Us
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6 max-w-lg">
            We welcome all forms of partnership and collaboration. Whether
            you're a company, NGO, or individual — there's a way for you to be
            part of this mission.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partnerTypes.map(({ title, description }) => {
            const Icon = iconMap[title] || Building;
            return (
            <div
              key={title}
              className="partner-card spotlight-card opacity-0 group p-8 bg-background border border-border rounded-[20px]"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6 icon-bounce">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="font-heading text-2xl font-light text-foreground mb-3 group-hover:text-accent transition-colors duration-500">
                  {title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          );
          })}
        </div>
        <div className="mt-12">
          <button
            onClick={() => navigate("/partnership-discussion")}
            className="group flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:bg-accent/90 btn-lift"
          >
            Discuss a Partnership
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
