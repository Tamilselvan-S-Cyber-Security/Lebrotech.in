
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconX } from "@/components/icons/AppIcons";

const COOKIE_KEY = "lerbo-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (choice) => {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ choice, at: new Date().toISOString() }));
    } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6" data-testid="cookie-consent">
      <div className="relative mx-auto flex max-w-4xl flex-col gap-4 rounded-none border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#0b1120] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍪</span>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">We use cookies</h3>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            We use cookies to improve your experience, analyze traffic, and personalize content. Read our{" "}
            <Link to="/privacy" className="font-semibold text-[#D92D20] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            onClick={() => decide("declined")}
            data-testid="cookie-decline"
            className="border-slate-300 dark:border-white/20"
          >
            Decline
          </Button>
          <Button
            onClick={() => decide("accepted")}
            data-testid="cookie-accept"
            className="bg-[#D92D20] text-white hover:bg-[#B91C1C]"
          >
            Accept all
          </Button>
        </div>
        <button
          type="button"
          onClick={() => decide("dismissed")}
          aria-label="Close"
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white sm:hidden"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
