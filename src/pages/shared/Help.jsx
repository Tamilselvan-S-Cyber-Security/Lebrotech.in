/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Link } from "react-router-dom";
import { IconMessageSquare, IconFileText, IconHelpCircle } from "@/components/icons/AppIcons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { navForRole } from "@/lib/roles";

const FAQS = [
  {
    q: "How do I get my internship certificate?",
    a: "Apply for a verified internship, pass verification and validation, complete your internship, and your Lerbo Tech certificate is issued automatically.",
  },
  {
    q: "How long does verification take?",
    a: "Student profiles are verified quickly after registration. Startups and institutions are verified within 24 hours by our team.",
  },
  {
    q: "What happens after I apply?",
    a: "Your application goes through verification and validation. Once selected and you complete the internship, your certificate is issued and available to download.",
  },
  {
    q: "Can institutions track certificates?",
    a: "Yes. The institution dashboard shows which students applied, were verified, completed internships, and received their Lerbo Tech certificate.",
  },
  {
    q: "How do I edit my profile?",
    a: "Use the Profile link in the sidebar of your dashboard. Changes save instantly.",
  },
  {
    q: "Is my data safe?",
    a: "All authentication runs securely and your documents are stored safely. We never share data with third parties.",
  },
];

export default function Help() {
  const { user } = useAuth();
  const nav = navForRole(user?.role);

  return (
    <DashboardLayout nav={nav} title="Help & Support">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact card */}
        <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 backdrop-blur-sm lg:col-span-1" data-testid="help-contact-card">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-none bg-[#D92D20]/20 text-[#D92D20] dark:text-[#F87171]">
            <IconHelpCircle className="h-5 w-5" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Need help?</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Send us a message and our team will get back to you.</p>

          <Link
            to="/contact"
            className="mt-5 inline-flex w-full items-center justify-center rounded-none bg-[#D92D20] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B91C1C]"
            data-testid="help-open-contact-form"
          >
            Open Contact Form
          </Link>
        </div>

        {/* FAQ */}
        <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 backdrop-blur-sm lg:col-span-2" data-testid="help-faqs">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-none bg-amber-500/10 text-amber-400">
              <IconMessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Frequently asked</h2>
              <p className="text-sm text-slate-500">Quick answers to the most common questions.</p>
            </div>
          </div>

          <div className="space-y-3">
            {FAQS.map((f, idx) => (
              <details key={f.q} className="group rounded-none border border-slate-200 dark:border-white/10 p-4 open:bg-white/5" data-testid={`faq-item-${idx}`}>
                <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white group-open:text-[#F87171]">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-none border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <IconFileText className="h-4 w-4 text-slate-500" />
              <span>Need to read our policies?</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Link to="/privacy" className="text-[#D92D20] dark:text-[#F87171] hover:underline">Privacy Policy</Link>
              <Link to="/terms" className="text-[#D92D20] dark:text-[#F87171] hover:underline">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
