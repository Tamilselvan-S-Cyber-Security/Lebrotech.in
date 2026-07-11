import React from "react";

const LOGO_SRC = `${process.env.PUBLIC_URL}/logo/logo.png`;

export default function OaxisLogo({ className = "h-11 w-auto", mark = false }) {
  if (mark) {
    return <img src={LOGO_SRC} alt="Lerbo Tech" className={className} />;
  }
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src={LOGO_SRC} alt="" className="h-11 w-11 object-contain" aria-hidden />
      <span className="font-display text-[28px] font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">Lerbo&nbsp;Tech</span>
    </div>
  );
}
