import React from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import LegalContactBlock from "@/components/LegalContactBlock";

export default function Terms() {
  return (
    <PublicLayout>
      <section className="theme-section py-24">
        <div className="mx-auto max-w-3xl px-6 text-slate-600 dark:text-slate-400">
          <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white">Terms & Conditions</h1>
          <p className="mt-4 text-sm text-slate-500">Effective: 1 January 2025</p>
          <p className="mt-8">By accessing Lerbo Tech you agree to these Terms. Lerbo Tech is a talent marketplace connecting students, startups and institutions. We do not employ users.</p>
          <h3 className="mt-8 font-display text-xl font-bold text-slate-900 dark:text-white">User responsibility</h3>
          <p className="mt-2">Profile information must be accurate. Misrepresentation may result in suspension.</p>
          <h3 className="mt-8 font-display text-xl font-bold text-slate-900 dark:text-white">Subscriptions</h3>
          <p className="mt-2">Startup subscriptions are monthly, renewable, and cancellable anytime via the billing dashboard.</p>
          <h3 className="mt-8 font-display text-xl font-bold text-slate-900 dark:text-white">Disputes</h3>
          <p className="mt-2">Subject to the jurisdiction of courts in Bengaluru, Karnataka.</p>
          <LegalContactBlock />
        </div>
      </section>
    </PublicLayout>
  );
}
