/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconSearch, IconArrowRight, IconMapPin, IconCalendar } from "@/components/icons/AppIcons";
import OpportunityImage from "@/components/OpportunityImage";

const DEFAULT_FILTERS = { q: "", domain: "all", mode: "all", stipend_range: "all", duration: "all" };

export default function OpportunitiesPublic() {
  const [searchParams] = useSearchParams();
  const [opps, setOpps] = useState([]);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    api.get("/meta/constants").then(({ data }) => setMeta(data));
  }, []);

  useEffect(() => {
    setFilters({
      q: searchParams.get("q") || "",
      domain: searchParams.get("domain") || "all",
      mode: searchParams.get("mode") || "all",
      stipend_range: searchParams.get("stipend_range") || "all",
      duration: searchParams.get("duration") || "all",
    });
  }, [searchParams]);

  useEffect(() => {
    const loadOpps = () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== "all") params.set(k, v);
      });
      api.get(`/opportunities?${params.toString()}`)
        .then(({ data }) => setOpps(Array.isArray(data) ? data : []))
        .catch(() => setOpps([]));
    };
    loadOpps();
    // Re-fetch after Firestore/local merge so listings appear after hydrate.
    window.addEventListener("lerbo-db-hydrated", loadOpps);
    return () => window.removeEventListener("lerbo-db-hydrated", loadOpps);
  }, [filters]);

  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <Badge className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/5">Certificate-eligible internships</Badge>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-6xl">Apply for internships that lead to a certificate.</h1>

          {/* Filters */}
          <div className="mt-10 grid grid-cols-1 gap-3 rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 backdrop-blur-sm md:grid-cols-5">
            <div className="relative md:col-span-2">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                data-testid="opp-search-input"
                placeholder="Search internship, startup, keyword..."
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-9 text-slate-900 dark:text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={filters.domain} onValueChange={(v) => setFilters((f) => ({ ...f, domain: v }))}>
              <SelectTrigger data-testid="opp-filter-domain" className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All domains</SelectItem>
                {(meta?.domains || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.mode} onValueChange={(v) => setFilters((f) => ({ ...f, mode: v }))}>
              <SelectTrigger data-testid="opp-filter-mode" className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"><SelectValue placeholder="Work mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any mode</SelectItem>
                {["remote", "hybrid", "onsite"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.stipend_range} onValueChange={(v) => setFilters((f) => ({ ...f, stipend_range: v }))}>
              <SelectTrigger data-testid="opp-filter-stipend" className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"><SelectValue placeholder="Stipend" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any stipend</SelectItem>
                {(meta?.stipend_buckets || []).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {opps.map((o) => (
              <Link key={o.id} to={`/opportunities/${o.id}`} data-testid={`opp-card-${o.id}`} className="opp-card block overflow-hidden rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 backdrop-blur-sm">
                <OpportunityImage src={o.image_url} alt={o.title} className="h-40 w-full" />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="rounded-none bg-[#D92D20]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D92D20] dark:text-[#F87171]">{o.domain}</span>
                    {o.is_featured && <span className="rounded-none bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">Featured</span>}
                  </div>
                  <h3 className="opp-card-title mt-4 font-display text-lg font-bold leading-tight text-slate-900 transition-colors dark:text-white">{o.title}</h3>
                  <div className="text-sm text-slate-500">{o.startup_name}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1"><IconMapPin className="h-3 w-3" /> {o.city || o.mode}</span>
                    <span className="inline-flex items-center gap-1"><IconCalendar className="h-3 w-3" /> {o.duration}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{o.stipend_range}</span>
                    <span className="opp-card-cta inline-flex items-center gap-1 text-xs font-semibold text-[#D92D20] transition-colors dark:text-[#F87171]">View <IconArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {opps.length === 0 && (
            <div className="mt-12 rounded-none border border-dashed border-slate-300 dark:border-white/20 p-12 text-center">
              <div className="font-display text-xl font-bold text-slate-900 dark:text-white">No matching internships</div>
              <div className="mt-1 text-sm text-slate-500">Try clearing filters or check back tomorrow.</div>
              <Button className="mt-4 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10" variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</Button>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
