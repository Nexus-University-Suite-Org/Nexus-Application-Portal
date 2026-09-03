import { useEffect, useRef, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealOptions {
  /** Element(s) to animate — CSS selector within the container or direct ref */
  targets?: string;
  /** Animation origin: 'up' | 'left' | 'right' | 'scale' | 'fade' */
  from?: "up" | "left" | "right" | "scale" | "fade";
  /** Stagger delay between children (seconds) */
  stagger?: number;
  /** Duration in seconds */
  duration?: number;
  /** ScrollTrigger start position */
  start?: string;
  /** Extra delay in seconds */
  delay?: number;
  /** Whether to reverse on scroll back */
  reverse?: boolean;
}

const originMap = {
  up: { y: 60, opacity: 0 },
  left: { x: -60, opacity: 0 },
  right: { x: 60, opacity: 0 },
  scale: { scale: 0.88, opacity: 0 },
  fade: { opacity: 0 },
};

/**
 * Declarative scroll-reveal hook.
 * Returns a ref to attach to the container element.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
): RefObject<T> {
  const ref = useRef<T>(null);
  const {
    targets,
    from = "up",
    stagger = 0.1,
    duration = 0.9,
    start = "top 82%",
    delay = 0,
    reverse = true,
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const elements = targets
      ? ref.current.querySelectorAll(targets)
      : [ref.current];

    if (!elements.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        originMap[from],
        {
          ...Object.fromEntries(
            Object.keys(originMap[from]).map((key) => [
              key,
              key === "opacity" ? 1 : key === "scale" ? 1 : 0,
            ])
          ),
          duration,
          stagger,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start,
            toggleActions: reverse
              ? "play none none reverse"
              : "play none none none",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref as RefObject<T>;
}

/**
 * Adds magnetic spotlight tracking to interactive cards.
 * Attach to a container — all children matching `selector` get the effect.
 */
export function useSpotlightCards(
  containerRef: RefObject<HTMLElement | null>,
  selector = ".spotlight-card",
  deps: unknown[] = []
) {
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>(selector);
    if (!cards.length) return;

    const handlers: Array<() => void> = [];

    cards.forEach((card) => {
      const handleMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--spotlight-x", `${x}%`);
        card.style.setProperty("--spotlight-y", `${y}%`);
      };

      const handleLeave = () => {
        card.style.setProperty("--spotlight-x", "50%");
        card.style.setProperty("--spotlight-y", "50%");
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);

      handlers.push(() => {
        card.removeEventListener("mousemove", handleMove);
        card.removeEventListener("mouseleave", handleLeave);
      });
    });

    return () => handlers.forEach((cleanup) => cleanup());
  }, [containerRef.current, ...deps]);
}

/**
 * Animates number counters when scrolled into view.
 */
export function useCountUp(
  containerRef: RefObject<HTMLElement | null>,
  selector = ".count-up",
  deps: unknown[] = []
) {
  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;

    const ctx = gsap.context(() => {
      elements.forEach((el) => {
        const target = parseInt(el.dataset.target || "0", 10);
        const suffix = el.dataset.suffix || "";
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString() + suffix;
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef.current, ...deps]);
}

/**
 * Parallax scroll effect for background elements.
 */
export function useParallax(
  containerRef: RefObject<HTMLElement | null>,
  selector = ".parallax-el"
) {
  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;

    const ctx = gsap.context(() => {
      elements.forEach((el, i) => {
        const speed = parseFloat(el.dataset.speed || String(0.3 + i * 0.15));
        gsap.to(el, {
          y: () => -speed * 120,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("section") || containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);
}
