import React from "react";
import { Link } from "react-router-dom";
import { IconLifeBuoy, IconLinkedin, IconInstagram } from "@/components/icons/AppIcons";
import { useBrand } from "@/lib/brand";

export default function HelpCard({ helpPath }) {
  const brand = useBrand();
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-rose-50 to-purple-50 p-3 dark:border-white/10 dark:from-[#D92D20]/10 dark:to-purple-900/20" data-testid="sidebar-help-card">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#D92D20] dark:text-[#F87171]">
        <IconLifeBuoy className="h-3.5 w-3.5" /> Need Help?
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {brand.support_response_sla || "We typically respond within 24 hours."}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <a
          href={brand.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Lerbo Tech on LinkedIn"
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <IconLinkedin className="h-3.5 w-3.5" />
        </a>
        <a
          href={brand.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Lerbo Tech on Instagram"
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <IconInstagram className="h-3.5 w-3.5" />
        </a>
        {helpPath ? (
          <Link to={helpPath} className="ml-auto text-[11px] font-semibold text-[#D92D20] hover:underline dark:text-[#F87171]" data-testid="help-card-link">
            Visit Help Center →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
