/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INSTITUTION_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { IconSearch as Search, IconShare2 as Share2 } from "@/components/icons/AppIcons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import OpportunityImage from "@/components/OpportunityImage";

export default function InstitutionOpportunities() {
  const [opps, setOpps] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => { api.get("/opportunities?limit=100").then(({ data }) => setOpps(data)); }, []);

  const filtered = q ? opps.filter((o) => `${o.title} ${o.startup_name} ${o.domain}`.toLowerCase().includes(q.toLowerCase())) : opps;

  return (
    <DashboardLayout nav={INSTITUTION_NAV} title="Internship Feed">
      <p className="text-sm text-slate-600">Curated startup internships you can share with your students.</p>
      <div className="my-4 max-w-md">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 dark:text-slate-400" /><Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search internship, domain, startup" /></div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((o) => (
          <div key={o.id} className="opp-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <OpportunityImage src={o.image_url} alt={o.title} className="h-36 w-full" />
            <div className="p-5">
              <div className="inline-block rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{o.domain}</div>
              <h3 className="opp-card-title mt-3 font-display text-base font-bold text-slate-900 transition-colors">{o.title}</h3>
              <div className="text-xs text-slate-500">{o.startup_name}</div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span>{o.duration} · {o.mode}</span>
                <span className="font-bold text-slate-900">{o.stipend_range}</span>
              </div>
              <Button data-testid={`inst-share-${o.id}`} className="mt-3 w-full bg-slate-900 hover:bg-slate-800" size="sm" onClick={() => toast.success(`Shared "${o.title}" with your students (mocked)`)}>
                <Share2 className="mr-2 h-3 w-3" /> Share with students
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
