import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import RoleWelcomeBanner from "@/components/RoleWelcomeBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INSTITUTION_BENEFITS } from "@/lib/siteContent";
import { INSTITUTION_ICONS, IconDashboard, IconTile } from "@/components/icons/CertIcons";
import { getRegisterLink } from "@/lib/plans";
import { IconCheckCircle, IconArrowRight } from "@/components/icons/AppIcons";

const BENEFIT_TONES = ["sky", "violet", "emerald"];
const CARD_ACCENTS = [
  "from-sky-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-emerald-500 to-teal-400",
];

export default function ForInstitutions() {
  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <Badge className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/5">For Institutions</Badge>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-6xl">Track internship certificates across your campus.</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">See which students applied, passed verification, completed internships, and received their Lerbo Tech certificate — free for institutions, with no subscription fees.</p>
          <div className="mt-8">
            <Link to={getRegisterLink("institution")}>
              <Button className="bg-[#D92D20] hover:bg-[#B91C1C]">Register free <IconArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="theme-section-alt py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {INSTITUTION_BENEFITS.map((c, i) => {
              const Icon = INSTITUTION_ICONS[c.t] || IconDashboard;
              return (
                <div key={c.t} className="group card-lift relative overflow-hidden rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-slate-300 dark:hover:border-white/20">
                  <span className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${CARD_ACCENTS[i]} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <IconTile icon={Icon} tone={BENEFIT_TONES[i] || "sky"} active size="lg" />
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{c.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="theme-section py-20" id="get-started">
        <div className="mx-auto max-w-7xl px-6">
          <RoleWelcomeBanner expectedRole="institution" />
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-8 md:p-10">
            <Badge className="rounded-none bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">Free forever</Badge>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 dark:text-white">No paid plans for institutions</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Onboard students, share internships, and track certificates from one campus dashboard — at no monthly or yearly fee.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                "Unlimited students",
                "Bulk student upload",
                "Certificate & placement analytics",
                "Institution referral link",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <IconCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <Link to={getRegisterLink("institution")} className="mt-8 inline-block">
              <Button className="bg-[#D92D20] hover:bg-[#B91C1C]">Create free institution account <IconArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
