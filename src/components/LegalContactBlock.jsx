import React from "react";
import { Link } from "react-router-dom";
import { useBrand } from "@/lib/brand";

export default function LegalContactBlock() {
  const brand = useBrand();
  return (
    <div className="mt-12 rounded-none border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5" data-testid="legal-contact-block">
      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Questions about {brand.name}?</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Send us a message through our contact form and our team will get back to you.
      </p>
      <Link
        to="/contact"
        className="mt-4 inline-flex items-center text-sm font-semibold text-[#D92D20] hover:underline dark:text-[#F87171]"
      >
        Go to contact form →
      </Link>
    </div>
  );
}
