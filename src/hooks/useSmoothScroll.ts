import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;

// Access the active Lenis instance so navigation resets can drive Lenis'
// internal scroll position directly. Native window.scrollTo is ignored by
// Lenis and gets overridden on the next animation frame.
export const getLenis = () => lenisInstance;

const useSmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      allowNestedScroll: true,
    });

    lenisInstance = lenis;

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
};

export default useSmoothScroll;
