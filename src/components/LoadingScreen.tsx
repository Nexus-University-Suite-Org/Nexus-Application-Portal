import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SPLASH_KEY = "institute-splash-seen";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const brandBlockRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const mottoRef = useRef<HTMLParagraphElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoText, setLogoText] = useState("IU");
  const [portalName, setPortalName] = useState("Institute Uganda");
  const [motto, setMotto] = useState("Empowering Through Vocational Skills");
  const [statusText, setStatusText] = useState("Preparing Experience");

  useEffect(() => {
    fetch("/api/v1/content/site-settings")
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data.splash_logo_url) setLogoUrl(data.splash_logo_url);
        if (data.splash_logo_text) setLogoText(data.splash_logo_text);
        if (data.splash_name) setPortalName(data.splash_name);
        if (data.splash_motto) setMotto(data.splash_motto);
        if (data.splash_status_text) setStatusText(data.splash_status_text);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      const timeoutId = window.setTimeout(() => {
        onComplete();
      }, 550);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    const progressState = { value: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.set(containerRef.current, { opacity: 1 })
        .fromTo(
          haloRef.current,
          { scale: 0.75, opacity: 0 },
          { scale: 1, opacity: 0.35, duration: 1.1, ease: "power2.out" },
        )
        .fromTo(
          brandBlockRef.current,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          "-=0.8",
        )
        .fromTo(
          nameRef.current,
          { letterSpacing: "0.42em" },
          { letterSpacing: "0.26em", duration: 0.8, ease: "power2.out" },
          "<",
        )
        .fromTo(
          mottoRef.current,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.55",
        )
        .fromTo(
          progressBarRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.45, ease: "power2.inOut" },
          "-=0.2",
        )
        .to(
          progressState,
          {
            value: 100,
            duration: 1.45,
            ease: "power2.inOut",
            onUpdate: () => {
              if (progressTextRef.current) {
                progressTextRef.current.textContent = `${Math.round(progressState.value)}%`;
              }
            },
          },
          "<",
        )
        .to(statusRef.current, {
          opacity: 0.85,
          duration: 0.35,
          onStart: () => {
            if (statusRef.current) {
              statusRef.current.textContent = "Ready";
            }
          },
        })
        .to({}, { duration: 0.22 })
        .to(containerRef.current, {
          opacity: 0,
          duration: 0.7,
          ease: "power2.inOut",
          onComplete,
        });

      gsap.to(haloRef.current, {
        scale: 1.08,
        opacity: 0.42,
        duration: 1.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });

    return () => {
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[110] overflow-hidden bg-primary"
      role="status"
      aria-live="polite"
      aria-label="Loading institute homepage"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, hsl(var(--accent) / 0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, hsl(var(--primary-foreground) / 0.08) 0%, transparent 48%)",
        }}
      />

      <div
        ref={haloRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--accent) / 0.28) 0%, hsl(var(--accent) / 0.05) 45%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div
          ref={brandBlockRef}
          className="flex flex-col items-center opacity-0"
        >
          <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/30 text-xs font-body tracking-[0.22em] text-primary-foreground/75 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              logoText
            )}
          </span>

          <div
            ref={nameRef}
            className="font-heading text-3xl font-light uppercase text-primary-foreground md:text-5xl"
          >
            {portalName}
          </div>

          <p
            ref={mottoRef}
            className="mt-3 font-body text-[11px] uppercase tracking-[0.28em] text-primary-foreground/65 md:text-xs"
          >
            {motto}
          </p>

          <div className="mt-10 w-[230px] md:w-[280px]">
            <div className="h-px w-full overflow-hidden bg-primary-foreground/20">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-left bg-accent"
              />
            </div>
            <div className="mt-3 flex items-center justify-between font-body text-[10px] uppercase tracking-[0.22em] text-primary-foreground/70 md:text-[11px]">
              <p ref={statusRef}>{statusText}</p>
              <span ref={progressTextRef}>0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingWrapper = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    try {
      return window.sessionStorage.getItem(SPLASH_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const handleComplete = () => {
    try {
      window.sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      // Ignore storage errors and continue UX flow.
    }
    setLoading(false);
  };

  return (
    <>
      {loading && <LoadingScreen onComplete={handleComplete} />}
      <div
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        {children}
      </div>
    </>
  );
};

export default LoadingWrapper;
