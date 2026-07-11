/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CERTIFICATE_INTRO } from "@/lib/siteContent";

export default function About() {
  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-4xl px-6 py-24">
          <Badge className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/5">About Lerbo Tech</Badge>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-6xl">The platform for getting your internship certificate.</h1>
          <p className="mt-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Every year, millions of Indian students need real internship experience — and a certificate to prove it. Startups need verified interns. Colleges need to track who completed what. Existing platforms weren't built for this simple outcome.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {CERTIFICATE_INTRO} We connect students, startups, and institutions around one clear flow: apply for internship → verification & validation → getting certificate.
          </p>
        </div>
      </section>

      <section className="theme-section-alt py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { v: "3", t: "Steps", d: "Apply, verify, and get your internship certificate." },
              { v: "100%", t: "Verified", d: "Every certificate is backed by profile verification and completion confirmation." },
              { v: "₹0", t: "For students", d: "Students never pay to apply, verify, or receive their certificate." },
            ].map((b) => (
              <div key={b.t} className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-8 backdrop-blur-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-[#D92D20] dark:text-[#F87171]">{b.t}</div>
                <div className="mt-2 font-display text-3xl font-extrabold text-slate-900 dark:text-white">{b.v}</div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="theme-section py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-12 backdrop-blur-sm">
            <h3 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Our values</h3>
            <ul className="mt-6 space-y-4 text-base text-slate-600 dark:text-slate-400">
              <li><strong className="text-slate-900 dark:text-white">Certificate-first.</strong> Every feature exists to help students apply, get verified, and receive their internship certificate.</li>
              <li><strong className="text-slate-900 dark:text-white">Verified outcomes.</strong> Profiles are verified, applications are validated, and certificates are issued only after completion.</li>
              <li><strong className="text-slate-900 dark:text-white">Made in India.</strong> Tier-1 to Tier-3, every campus deserves a clear path to a certified internship.</li>
            </ul>
            <div className="mt-8">
              <Link to="/register"><Button className="bg-[#D92D20] text-white hover:bg-[#B91C1C]">Get your certificate</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
