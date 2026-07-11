const HEADER_OFFSET = 72;

/** Scroll to page top (accounts for sticky header when using hash targets). */
export function scrollToTop(smooth = false) {
  window.scrollTo({ top: 0, left: 0, behavior: smooth ? "smooth" : "auto" });
}

/** Scroll to an in-page section by element id. */
export function scrollToHash(hash, smooth = true) {
  const id = String(hash || "").replace(/^#/, "");
  if (!id) {
    scrollToTop(smooth);
    return;
  }
  const el = document.getElementById(id);
  if (!el) {
    scrollToTop(smooth);
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
}

/** If already on the same route, scroll to top instead of no-op navigation. */
export function handleSameRouteClick(event, currentLocation, targetTo) {
  const [targetPathAndQuery, targetHash] = targetTo.split("#");
  if (targetHash) return false;

  const targetPathOnly = targetPathAndQuery.split("?")[0];
  const targetSearch = targetPathAndQuery.includes("?") ? `?${targetPathAndQuery.split("?")[1]}` : "";
  const samePath = currentLocation.pathname === targetPathOnly;
  const sameSearch = currentLocation.search === targetSearch;

  if (samePath && sameSearch) {
    event.preventDefault();
    scrollToTop(true);
    return true;
  }
  return false;
}
