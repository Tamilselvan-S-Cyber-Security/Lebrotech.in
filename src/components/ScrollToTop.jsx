import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToHash, scrollToTop } from "@/lib/navigation";

/** Reset scroll position on route changes; smooth-scroll to hash targets. */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => scrollToHash(hash, true), 0);
      return () => window.clearTimeout(timer);
    }
    scrollToTop(false);
  }, [pathname, search, hash]);

  return null;
}
