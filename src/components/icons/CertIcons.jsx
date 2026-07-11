import React from "react";

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconApplied({ className = "h-5 w-5", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
      <path d="m16 11 3 3-5 5h-3v-3l5-5Z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

export function IconVerified({ className = "h-5 w-5", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M12 2 4 5.5v6.3c0 3.9 3.4 7.5 8 9.2 4.6-1.7 8-5.3 8-9.2V5.5L12 2Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 2 4 5.5v6.3c0 3.9 3.4 7.5 8 9.2 4.6-1.7 8-5.3 8-9.2V5.5L12 2Z" />
      <path d="m9 12 2 2 4-4" strokeWidth={2} />
    </svg>
  );
}

export function IconInProgress({ className = "h-5 w-5", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="9" strokeDasharray="4 3" />
      <path d="M12 7v5l3 2" strokeWidth={2} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCertified({ className = "h-5 w-5", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <circle cx="12" cy="9" r="5" fill="currentColor" fillOpacity="0.15" />
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 14 7 21l5-2.5L17 21l-1.5-7" fill="currentColor" fillOpacity="0.12" />
      <path d="M8.5 14 7 21l5-2.5L17 21l-1.5-7" />
      <path d="M10 8.5 11.5 10 14 7.5" strokeWidth={2} />
    </svg>
  );
}

export function IconCertificate({ className = "h-5 w-5", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M8 8h8M8 12h8M8 16h5" />
      <circle cx="17" cy="17" r="4" fill="currentColor" fillOpacity="0.2" stroke="none" />
      <path d="m15.5 17 1 1 2.5-2.5" stroke="#fff" strokeWidth={1.75} />
    </svg>
  );
}

export function IconCompany({ className = "h-4 w-4", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <rect x="5" y="3" width="14" height="18" fill="currentColor" fillOpacity="0.1" />
      <rect x="5" y="3" width="14" height="18" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" strokeWidth={1.25} />
    </svg>
  );
}

export function IconLocation({ className = "h-4 w-4", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconRupee({ className = "h-4 w-4", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M6 4h12M6 8h9a3 3 0 0 1 0 6H6M6 14h10" strokeWidth={2} />
    </svg>
  );
}

export function IconDone({ className = "h-4 w-4", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" strokeWidth={2} />
    </svg>
  );
}

export function IconLive({ className = "h-3 w-3", ...props }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} {...props}>
      <circle cx="6" cy="6" r="6" fill="currentColor" fillOpacity="0.25" />
      <circle cx="6" cy="6" r="3" fill="currentColor" />
    </svg>
  );
}

/** Modern icon tile — square, themed background */
export function IconTile({ icon: Icon, tone = "brand", active = false, done = false, spin = false, size = "md" }) {
  const tones = {
    brand: {
      box: active ? "bg-[#FEE2E2] text-[#D92D20] ring-1 ring-[#D92D20]/20 dark:bg-[#D92D20]/20 dark:text-[#F87171] dark:ring-[#D92D20]/30" : done ? "bg-[#FEE2E2]/60 text-[#D92D20] dark:bg-[#D92D20]/10 dark:text-[#F87171]" : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500",
    },
    sky: {
      box: active ? "bg-sky-100 text-sky-600 ring-1 ring-sky-500/25 dark:bg-sky-500/20 dark:text-sky-400 dark:ring-sky-500/30" : done ? "bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400" : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500",
    },
    violet: {
      box: active ? "bg-violet-100 text-violet-600 ring-1 ring-violet-500/25 dark:bg-violet-500/20 dark:text-violet-400 dark:ring-violet-500/30" : done ? "bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400" : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500",
    },
    amber: {
      box: active ? "bg-amber-100 text-amber-600 ring-1 ring-amber-500/25 dark:bg-amber-500/20 dark:text-amber-400 dark:ring-amber-500/30" : done ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400" : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500",
    },
    emerald: {
      box: active ? "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-500/30" : done ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500",
    },
  };
  const sz = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-9 w-9";
  const iconSz = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div
      className={`cert-icon-tile flex shrink-0 items-center justify-center rounded-none transition-all duration-500 ${sz} ${tones[tone]?.box || tones.brand.box} ${active ? "cert-icon-active shadow-sm" : ""}`}
    >
      <Icon className={`${iconSz} ${spin && active ? "animate-spin" : ""}`} />
    </div>
  );
}

export const CERT_STAGE_ICONS = {
  Applied: IconApplied,
  Verified: IconVerified,
  "In progress": IconInProgress,
  Certified: IconCertified,
};

/* ---------- Institution feature icons ---------- */

export function IconDashboard({ className = "h-5 w-5", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <rect x="3" y="3" width="8" height="10" rx="1" fill="currentColor" fillOpacity="0.15" />
      <rect x="3" y="3" width="8" height="10" rx="1" />
      <rect x="13" y="3" width="8" height="6" rx="1" />
      <rect x="13" y="11" width="8" height="10" rx="1" fill="currentColor" fillOpacity="0.15" />
      <rect x="13" y="11" width="8" height="10" rx="1" />
      <rect x="3" y="15" width="8" height="6" rx="1" />
    </svg>
  );
}

export function IconFeed({ className = "h-5 w-5", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M4 5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M4 5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Z" />
      <path d="M8 9h6M8 12h8M8 15h5" />
      <circle cx="18" cy="6" r="3" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <circle cx="18" cy="6" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconReport({ className = "h-5 w-5", ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M6 3h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M6 3h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v4h4" />
      <path d="M8 17v-3M12 17v-5M16 17v-2" strokeWidth={2} />
    </svg>
  );
}

export const INSTITUTION_ICONS = {
  "Certificate dashboard": IconDashboard,
  "Verified internship feed": IconFeed,
  "NAAC-ready reports": IconReport,
};
