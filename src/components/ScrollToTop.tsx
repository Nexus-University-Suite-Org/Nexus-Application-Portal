import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getLenis } from "@/hooks/useSmoothScroll";

// Resets scroll to the top on every route change. Drives Lenis directly
// because Lenis ignores native window.scrollTo and restores its own offset
// on the next animation frame otherwise.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
