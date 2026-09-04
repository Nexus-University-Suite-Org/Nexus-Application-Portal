import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Menu, X, Heart } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { useLocation, useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const defaultNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "News", href: "/news" },
  { label: "Programs", href: "/programs" },
  { label: "Running Admissions", href: "/admissions/lists" },
  { label: "Impact", href: "/impact" },
  { label: "Stories", href: "/stories" },
  { label: "Gallery", href: "/gallery" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
];

const defaultCtaButtons = [
  { label: "Apply Now", href: "/admissions/how-to-apply", style: "accent", visible: true },
  { label: "Donate", href: "/donate", style: "outline", visible: true },
];

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [portalName, setPortalName] = useState("University Application Portal");
  const [navItems, setNavItems] = useState(defaultNavItems);
  const [ctaButtons, setCtaButtons] = useState(defaultCtaButtons);

  const forceSolidNavbar = location.pathname.startsWith(
    "/admissions/application/start",
  );
  const solidNavbar = scrolled || mobileOpen || forceSolidNavbar;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 },
      );
    }
  }, []);

  useEffect(() => {
    fetch("/api/v1/content/site-settings")
      .then((res) => {
        console.log("[Navbar] site-settings response status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: Record<string, string>) => {
        console.log("[Navbar] site-settings raw data:", data);
        console.log("[Navbar] portal_name from API:", data.portal_name);
        if (data.portal_name) {
          console.log("[Navbar] setting portalName to:", data.portal_name);
          setPortalName(data.portal_name);
        } else {
          console.log("[Navbar] portal_name is empty/falsy, keeping default");
        }
        if (data.nav_links) {
          try {
            const parsed = JSON.parse(data.nav_links);
            const visible = parsed.filter((l: { visible?: boolean }) => l.visible !== false);
            if (visible.length > 0) setNavItems(visible);
          } catch {}
        }
        if (data.cta_buttons) {
          try {
            const parsed = JSON.parse(data.cta_buttons);
            const visible = parsed.filter((b: { visible?: boolean }) => b.visible !== false);
            if (visible.length > 0) setCtaButtons(visible);
          } catch {}
        }
      })
      .catch((err) => {
        console.error("[Navbar] failed to fetch site-settings:", err);
        // Use defaults if API is down
      });
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    navigate(href);
  };

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  const navbarEl = (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 opacity-0 ${
        solidNavbar
          ? "bg-background/95 backdrop-blur-md shadow-[0_1px_0_hsl(var(--border))]"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-8 md:px-16 py-5">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className={`font-heading text-xl md:text-2xl font-light tracking-[0.3em] uppercase transition-colors duration-700 ${
            solidNavbar ? "text-foreground" : "text-primary-foreground"
          }`}
        >
          {portalName}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className={`font-body text-xs tracking-[0.2em] uppercase transition-all duration-500 relative group ${
                solidNavbar
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              } ${isActive(item.href) ? "!text-accent" : ""}`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1 left-0 w-full h-px bg-accent transition-transform duration-500 origin-left ${
                  isActive(item.href)
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </button>
          ))}
          {/* CTA Buttons */}
          <div className="flex items-center gap-3 pl-4 border-l border-accent/20">
            <NotificationBell />
            {ctaButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => navigate(btn.href)}
                className={`px-5 py-2.5 font-body text-xs tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 hover:scale-105 ${
                  btn.style === "accent"
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : `bg-foreground/10 text-foreground hover:bg-foreground/20`
                }`}
              >
                {btn.label === "Donate" && <Heart size={12} className="fill-current mr-1 inline" />}
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden relative z-10 transition-colors duration-500 ${
            solidNavbar ? "text-foreground" : "text-primary-foreground"
          }`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );

  const mobileMenu = mobileOpen
    ? createPortal(
        <div
          className="fixed inset-0 md:hidden overflow-y-auto"
          style={{ zIndex: 9999, backgroundColor: "hsl(var(--background))" }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-5 right-8 text-foreground"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col items-center pt-24 pb-12 gap-6">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`font-heading text-2xl font-light tracking-[0.15em] uppercase transition-all duration-500 hover:text-accent ${
                  isActive(item.href) ? "text-accent" : "text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
            {ctaButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleNavClick(btn.href)}
                className={`px-8 py-4 font-body text-sm tracking-[0.2em] uppercase rounded-[20px] transition-all duration-500 mt-4 ${
                  btn.style === "accent"
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-accent/20 text-accent hover:bg-accent/30"
                }`}
              >
                {btn.label === "Donate" && <Heart size={16} className="fill-current mr-2 inline" />}
                {btn.label}
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {navbarEl}
      {mobileMenu}
    </>
  );
};

export default Navbar;
