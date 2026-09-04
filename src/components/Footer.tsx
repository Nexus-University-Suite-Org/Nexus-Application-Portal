import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

gsap.registerPlugin(ScrollTrigger);

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Running Admissions", href: "/admissions/lists" },
  { label: "Impact & Stories", href: "/impact" },
  { label: "Student Stories", href: "/stories" },
  { label: "Gallery", href: "/gallery" },
  { label: "Partners", href: "/partners" },
  { label: "Donate", href: "/donate" },
  { label: "Contact", href: "/contact" },
];

type ProgramDoc = {
  id: number;
  programName: string;
  status?: string;
};

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [portalName, setPortalName] = useState("University Application Portal");
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [organizationMission, setOrganizationMission] = useState(
    "Empowering single mothers and vulnerable youth through practical vocational skills — building dignified livelihoods one graduate at a time.",
  );
  const [organizationWhatsappCta, setOrganizationWhatsappCta] = useState("WhatsApp Us");
  const [organizationPhone, setOrganizationPhone] = useState("+256 700 000 000");
  const [organizationAddress, setOrganizationAddress] = useState(
    "Plot 7, Nakawa Road, Kampala, Uganda",
  );
  const [programLinks, setProgramLinks] = useState<{ label: string; href: string }[]>([]);

  useEffect(() => {
    fetch("/api/v1/programs")
      .then((res) => (res.ok ? res.json() : null))
      .then((progs: ProgramDoc[] | null) => {
        if (!progs || !Array.isArray(progs)) return;
        const active = progs.filter((p) => p.status === "Active");
        const names = [...new Set(
          (active.length ? active : progs)
            .map((p) => p.programName?.trim())
            .filter((n): n is string => Boolean(n)),
        )];
        if (names.length) {
          setProgramLinks(names.map((label) => ({ label, href: "/programs" })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    console.log("[Footer] fetching site-settings from", "/api/v1/content/site-settings");
    fetch("/api/v1/content/site-settings")
      .then((res) => {
        console.log("[Footer] site-settings response status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: Record<string, string>) => {
        console.log("[Footer] site-settings raw data:", data);
        console.log("[Footer] portal_name from API:", data.portal_name);
        if (data.portal_name) {
          console.log("[Footer] setting portalName to:", data.portal_name);
          setPortalName(data.portal_name);
        } else {
          console.log("[Footer] portal_name is empty/falsy, keeping default");
        }
        if (data.footer_mission) setOrganizationMission(data.footer_mission);
        if (data.footer_email) setOrganizationEmail(data.footer_email);
        if (data.footer_phone) setOrganizationPhone(data.footer_phone);
        if (data.footer_whatsapp_cta) setOrganizationWhatsappCta(data.footer_whatsapp_cta);
        if (data.footer_address) setOrganizationAddress(data.footer_address);
      })
      .catch((err) => {
        console.error("[Footer] failed to fetch site-settings:", err);
      });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const cols = contentRef.current.querySelectorAll(".footer-col");
        gsap.fromTo(
          cols,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 95%",
              toggleActions: "play none none none",
            },
          },
        );
      }
      gsap.fromTo(
        bottomRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          delay: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!value || subscribing) return;
    setSubscribing(true);
    fetch("/api/v1/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("subscribe failed");
        setEmail("");
        toast({
          title: "Subscribed",
          description: `Updates will be sent to ${value}.`,
        });
      })
      .catch(() => {
        toast({
          title: "Subscription Failed",
          description: "Please enter a valid email address and try again.",
          variant: "destructive",
        });
      })
      .finally(() => setSubscribing(false));
  };

  const whatsappDigits = organizationPhone.replace(/\D/g, "");

  return (
    <footer ref={footerRef} className="bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div ref={contentRef} className="px-8 md:px-16 pt-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
          {/* Brand & Contact */}
          <div className="footer-col lg:col-span-1">
            <h3 className="font-heading text-2xl font-light tracking-[0.2em] uppercase mb-4">
              {portalName}
            </h3>
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed mb-8">
              {organizationMission}
            </p>
            <div className="space-y-4">
              <a
                href={`mailto:${organizationEmail}`}
                className="group flex items-center gap-3 font-body text-sm text-primary-foreground/70 transition-colors duration-500 hover:text-primary-foreground"
              >
                <Mail
                  size={16}
                  className="text-primary-foreground/40 group-hover:text-accent transition-colors duration-500"
                />
                <span className="relative">
                  {organizationEmail}
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </span>
              </a>
              <a
                href={`tel:${organizationPhone.replace(/\s+/g, "")}`}
                className="group flex items-center gap-3 font-body text-sm text-primary-foreground/70 transition-colors duration-500 hover:text-primary-foreground"
              >
                <Phone
                  size={16}
                  className="text-primary-foreground/40 group-hover:text-accent transition-colors duration-500"
                />
                <span className="relative">
                  {organizationPhone}
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </span>
              </a>
              <a
                href={
                  whatsappDigits
                    ? `https://wa.me/${whatsappDigits}`
                    : "https://wa.me/256700000000"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 font-body text-sm text-primary-foreground/70 transition-colors duration-500 hover:text-primary-foreground"
              >
                <MessageCircle
                  size={16}
                  className="text-primary-foreground/40 group-hover:text-accent transition-colors duration-500"
                />
                <span className="relative">
                  {organizationWhatsappCta}
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="text-primary-foreground/40 mt-0.5 shrink-0"
                />
                <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
                  {organizationAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary-foreground/40 mb-8">
              Quick Links
            </p>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-2 font-body text-sm text-primary-foreground/70 transition-all duration-500 hover:text-primary-foreground hover:translate-x-1"
                  >
                    <span className="w-0 h-px bg-accent group-hover:w-4 transition-all duration-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          {programLinks.length > 0 && (
            <div className="footer-col">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary-foreground/40 mb-8">
                Our Programs
              </p>
              <ul className="space-y-4">
                {programLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="group flex items-center gap-2 font-body text-sm text-primary-foreground/70 transition-all duration-500 hover:text-primary-foreground hover:translate-x-1"
                    >
                      <span className="w-0 h-px bg-accent group-hover:w-4 transition-all duration-500" />
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-60 transition-opacity duration-500 -ml-1"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Donate & Newsletter */}
          <div className="footer-col">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary-foreground/40 mb-8">
              Support Our Mission
            </p>
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed mb-6">
              {organizationMission}
            </p>
            <Link
              to="/donate"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-body text-xs tracking-[0.2em] uppercase rounded-[16px] transition-all duration-500 hover:bg-accent/90 mb-10"
            >
              <Heart size={14} className="fill-current" />
              Donate Now
            </Link>

            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary-foreground/40 mb-4">
              Get Updates
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex border-b border-primary-foreground/20 group focus-within:border-accent transition-colors duration-500"
            >
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="flex-1 bg-transparent font-body text-sm text-primary-foreground py-3 placeholder:text-primary-foreground/30 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 text-primary-foreground/40 hover:text-accent transition-colors duration-500"
              >
                <ArrowUpRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        ref={bottomRef}
        className="border-t border-primary-foreground/10 px-8 md:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <p className="font-body text-xs text-primary-foreground/30 tracking-wider">
          © {new Date().getFullYear()} {portalName}. All rights reserved.
        </p>
        <div className="flex items-center gap-8">
          {[
            { label: "Privacy Policy", href: "/legal/privacy-policy" },
            { label: "Terms of Use", href: "/legal/terms-of-use" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="group font-body text-xs text-primary-foreground/30 tracking-wider transition-colors duration-500 hover:text-primary-foreground/70 relative"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-full h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
          ))}
          <Link
            to="/admin/login"
            className="group font-body text-xs text-primary-foreground/30 tracking-wider transition-colors duration-500 hover:text-primary-foreground/70 relative"
          >
            Admin
            <span className="absolute -bottom-0.5 left-0 w-full h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
