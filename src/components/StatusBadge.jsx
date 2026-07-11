import React from "react";

const STATUS_STYLES = {
  applied: "bg-slate-100 text-slate-700 border-slate-200",
  reviewed: "bg-sky-50 text-sky-700 border-sky-200",
  shortlisted: "bg-amber-50 text-amber-800 border-amber-200",
  interview: "bg-violet-50 text-violet-700 border-violet-200",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  hired: "bg-emerald-100 text-emerald-800 border-emerald-300",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  withdrawn: "bg-slate-100 text-slate-500 border-slate-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  paused: "bg-amber-50 text-amber-800 border-amber-200",
  closed: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function StatusBadge({ status, className = "", ...rest }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.applied;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${cls} ${className}`}
      {...rest}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cls.split(" ")[1].replace("text-", "bg-")}`} />
      {status}
    </span>
  );
}
