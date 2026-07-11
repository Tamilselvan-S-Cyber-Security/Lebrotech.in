import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import RoleWelcomeBanner from "@/components/RoleWelcomeBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconCheckCircle, IconArrowRight } from "@/components/icons/AppIcons";
import { STARTUP_BENEFITS } from "@/lib/siteContent";
import { getRegisterLink } from "@/lib/plans";

export default function ForStartups() {
  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <Badge className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/5">For Startups</Badge>
            <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-6xl">Run internships that end with a verified certificate.</h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">Post certificate-eligible internships, verify and validate applicants, and confirm completion so every intern receives their official Lerbo Tech certificate — free for startups.</p>
            <div className="mt-8 flex gap-3">
              <Link to={getRegisterLink("startup")}><Button className="bg-[#D92D20] hover:bg-[#B91C1C]">Register free <IconArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/how-it-works"><Button variant="outline" className="border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">How it works</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="theme-section-alt py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {STARTUP_BENEFITS.map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 backdrop-blur-sm">
                <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="theme-section py-20" id="get-started">
        <div className="mx-auto max-w-7xl px-6">
          <RoleWelcomeBanner expectedRole="startup" />
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-8 md:p-10">
            <Badge className="rounded-none bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">Free forever</Badge>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 dark:text-white">No monthly pricing for startups</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Post unlimited internships, manage applicants, and issue verified certificates at no subscription cost. Create your account and get verified by our team.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                "Unlimited internship postings",
                "Applicant pipeline & messaging",
                "Verification badge after approval",
                "Issue internship certificates",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <IconCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <Link to={getRegisterLink("startup")} className="mt-8 inline-block">
              <Button className="bg-[#D92D20] hover:bg-[#B91C1C]">Create free startup account <IconArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
