
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconX } from "@/components/icons/AppIcons";
import { WORKSHOP_CERTIFICATE_PRICE_LABEL, CERTIFICATE_PRICE_LABEL } from "@/lib/certificatePrograms";

const ADS_IMAGE = `${process.env.PUBLIC_URL}/image/ads.png`;
const ADS_KEY = "lerbo-ads-dismissed";
const SHOW_DELAY_MS = 1200;

/**
 * Promotional popup — uses image/ads.png + certificate apply CTA.
 */
export default function Ads() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      location.pathname.startsWith("/apply-certificate")
      || location.pathname.startsWith("/login")
      || location.pathname.startsWith("/register")
      || location.pathname.startsWith("/admin")
      || location.pathname.startsWith("/student")
      || location.pathname.startsWith("/startup")
      || location.pathname.startsWith("/institution")
    ) {
      setVisible(false);
      return undefined;
    }

    try {
      if (sessionStorage.getItem(ADS_KEY)) return undefined;
    } catch {
      /* show anyway */
    }

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(ADS_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[3px] sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ads-title"
      data-testid="ads-popup"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="relative w-full max-w-[min(92vw,420px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl sm:max-w-[480px] md:max-w-[540px] lg:max-w-[600px]">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          data-testid="ads-close"
          className="absolute right-3 top-3 z-10 rounded-md bg-white/95 p-1.5 text-slate-500 shadow-sm transition-colors hover:text-slate-900 sm:right-4 sm:top-4 sm:p-2"
        >
          <IconX className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div
          className="flex justify-center border-b border-slate-200/60 px-5 py-5 sm:px-8 sm:py-7 md:py-8"
          style={{ backgroundColor: "#FFE001" }}
        >
          <img
            src={ADS_IMAGE}
            alt="Important announcement"
            className="h-20 w-auto max-w-[85%] object-contain sm:h-24 md:h-28 lg:h-32"
            data-testid="ads-banner-image"
          />
        </div>

        <div className="px-5 py-5 text-center sm:px-8 sm:py-7 md:px-10 md:py-8">
          <h2 id="ads-title" className="font-display text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl md:text-[1.75rem] lg:text-3xl">
            Get your best Lerbo Tech certificate
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base md:mt-4 md:text-lg">
            Cyber Security, Cloud & Full Stack — workshops and internship tracks for all departments.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Workshop</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-[#D92D20] sm:text-3xl">{WORKSHOP_CERTIFICATE_PRICE_LABEL}</p>
              <p className="mt-1 text-xs text-slate-600">Verified completion certificate</p>
            </div>
            <div className="rounded-lg border border-[#D92D20]/30 bg-[#D92D20]/5 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Internship & course</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-[#D92D20] sm:text-3xl">{CERTIFICATE_PRICE_LABEL}</p>
              <p className="mt-1 text-xs text-slate-600">Best full certificate program</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8">
            <Link to="/apply-certificate" onClick={dismiss} data-testid="ads-cta" className="w-full">
              <Button className="h-11 w-full bg-[#D92D20] text-sm font-bold text-white hover:bg-[#B91C1C] sm:h-12 sm:text-base md:h-14 md:text-lg">
                Apply now — from {WORKSHOP_CERTIFICATE_PRICE_LABEL}
              </Button>
            </Link>
            <p className="text-xs text-slate-500 sm:text-sm">
              Internship & course certificates at <strong className="text-slate-700">{CERTIFICATE_PRICE_LABEL}</strong>
            </p>
            <button
              type="button"
              onClick={dismiss}
              data-testid="ads-later"
              className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline sm:text-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
