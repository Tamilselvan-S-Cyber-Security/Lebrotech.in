/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INSTITUTION_NAV } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { IconCheckCircle as CheckCircle2, IconArrowRight as ArrowRight } from "@/components/icons/AppIcons";

export default function InstitutionBilling() {
  return (
    <DashboardLayout nav={INSTITUTION_NAV} title="Plan">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8" data-testid="billing-status-card">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Current plan</div>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-900">Free Partner</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Institutions use Lerbo Tech free — no monthly or yearly campus subscription. Onboard students and track certificates from your dashboard.
        </p>
        <ul className="mt-6 space-y-2">
          {[
            "Unlimited students",
            "Bulk student upload",
            "Certificate & placement analytics",
            "No subscription fees",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
            </li>
          ))}
        </ul>
        <Link to="/institution/onboard" className="mt-8 inline-block">
          <Button className="bg-[#D92D20] hover:bg-[#B91C1C]">Onboard students <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
