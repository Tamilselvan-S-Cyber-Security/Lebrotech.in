/* eslint-disable react/no-unescaped-entities */
import React from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import LegalContactBlock from "@/components/LegalContactBlock";

export default function Privacy() {
  return (
    <PublicLayout>
      <section className="theme-section py-24">
        <div className="mx-auto max-w-3xl px-6 text-slate-600 dark:text-slate-400">
          <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="mt-4 text-sm text-slate-500">Effective: 1 January 2025</p>
          <p className="mt-8">Lerbo Tech ("we", "us") respects your privacy. This policy explains what we collect, why, and how we protect it. We follow India's Digital Personal Data Protection Act (DPDPA) 2023.</p>
          <h3 className="mt-8 font-display text-xl font-bold text-slate-900 dark:text-white">What we collect</h3>
          <p className="mt-2">Account data (email, name), profile data (skills, college, resume), and usage logs for product improvement.</p>
          <h3 className="mt-8 font-display text-xl font-bold text-slate-900 dark:text-white">How we use it</h3>
          <p className="mt-2">To match students with opportunities, to allow startups to evaluate candidates, and to provide institutions with placement analytics.</p>
          <h3 className="mt-8 font-display text-xl font-bold text-slate-900 dark:text-white">Your rights</h3>
          <p className="mt-2">You can view, edit, and delete your data anytime. Reach out to us via the contact form for any data-protection or privacy request.</p>
          <LegalContactBlock />
        </div>
      </section>
    </PublicLayout>
  );
}
