/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STUDENT_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconSearch as Search, IconArrowRight as ArrowRight, IconMapPin as MapPin, IconCalendar as Calendar } from "@/components/icons/AppIcons";
import OpportunityImage from "@/components/OpportunityImage";

export default function StudentOpportunities() {
  const [opps, setOpps] = useState([]);
  const [meta, setMeta] = useState(null);
  const [f, setF] = useState({ q: "", domain: "all", mode: "all", stipend_range: "all", duration: "all" });

  useEffect(() => { api.get("/meta/constants").then(({ data }) => setMeta(data)); }, []);
  useEffect(() => {
    const load = () => {
      const p = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v && v !== "all") p.set(k, v); });
      p.set("limit", "100");
      api.get(`/opportunities?${p.toString()}`)
        .then(({ data }) => setOpps(Array.isArray(data) ? data : []))
        .catch(() => setOpps([]));
    };
    load();
    window.addEventListener("lerbo-db-hydrated", load);
    return () => window.removeEventListener("lerbo-db-hydrated", load);
  }, [f]);

  return (
    <DashboardLayout nav={STUDENT_NAV} title="Browse Internships">
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 dark:text-slate-400" />
          <Input data-testid="student-opps-search" className="pl-9" placeholder="Search internship, startup, keyword..." value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        </div>
        <Select value={f.domain} onValueChange={(v) => setF({ ...f, domain: v })}>
          <SelectTrigger data-testid="student-opps-domain"><SelectValue placeholder="Domain" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All domains</SelectItem>{(meta?.domains || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={f.mode} onValueChange={(v) => setF({ ...f, mode: v })}>
          <SelectTrigger data-testid="student-opps-mode"><SelectValue placeholder="Mode" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Any mode</SelectItem>{["remote", "hybrid", "onsite"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={f.stipend_range} onValueChange={(v) => setF({ ...f, stipend_range: v })}>
          <SelectTrigger><SelectValue placeholder="Stipend" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Any stipend</SelectItem>{(meta?.stipend_buckets || []).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {opps.map((o) => (
          <Link to={`/student/opportunities/${o.id}`} key={o.id} data-testid={`student-opp-card-${o.id}`} className="opp-card block overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <OpportunityImage src={o.image_url} alt={o.title} className="h-36 w-full" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{o.domain}</span>
                {o.is_featured && <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Featured</span>}
              </div>
              <h3 className="opp-card-title mt-3 font-display text-base font-bold leading-tight text-slate-900 transition-colors">{o.title}</h3>
              <div className="text-xs text-slate-500">{o.startup_name}</div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.city || o.mode}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {o.duration}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-bold text-slate-900">{o.stipend_range}</span>
                <span className="opp-card-cta inline-flex items-center gap-1 font-semibold text-[#D92D20] transition-colors">View <ArrowRight className="h-3 w-3" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {opps.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="font-display text-xl font-bold text-slate-700">No internships match your filters</div>
          <Button className="mt-4" variant="outline" onClick={() => setF({ q: "", domain: "all", mode: "all", stipend_range: "all", duration: "all" })}>Reset filters</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
