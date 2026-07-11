import { useEffect, useState } from "react";
import api from "@/lib/api";

/** Fallback brand info matching backend DEFAULT_BRAND — used while the
 * /api/brand response is in-flight so Footer / Contact don't flash empty. */
const FALLBACK_BRAND = {
  id: "default",
  name: "Lerbo Tech",
  tagline: "Get Your Internship Certificate",
  description:
    "Lerbo Tech helps you apply for verified internships, pass verification and validation, and receive your official completion certificate.",
  phone: "+91 95856 41186",
  email: "connect@lerbotech.in",
  address_lines: [
    "3/153, N. Valasai",
    "Seikalathur",
    "Manamadurai",
    "Sivagangai",
    "Tamil Nadu",
    "India – 630 606",
  ],
  linkedin_url: "https://www.linkedin.com/company/lerbo-tech",
  instagram_url: "https://www.instagram.com/lerbotech/",
  business_hours: "Mon – Sat · 10:00 AM to 7:00 PM IST",
  support_response_sla: "We typically respond within 24 hours.",
  copyright: "© 2025 Lerbo Tech. Made in India for India's startup ecosystem.",
};

let _cache = null;
let _inflight = null;

export function fetchBrand(force = false) {
  if (_cache && !force) return Promise.resolve(_cache);
  if (_inflight) return _inflight;
  _inflight = api
    .get("/brand")
    .then(({ data }) => {
      _cache = data;
      _inflight = null;
      return data;
    })
    .catch(() => {
      _inflight = null;
      return FALLBACK_BRAND;
    });
  return _inflight;
}

export function invalidateBrandCache() {
  _cache = null;
}

export function useBrand() {
  const [brand, setBrand] = useState(_cache || FALLBACK_BRAND);
  useEffect(() => {
    let mounted = true;
    fetchBrand().then((data) => {
      if (mounted) setBrand(data);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return brand;
}
