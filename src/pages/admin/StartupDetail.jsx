/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import { resolveAssetUrl } from "@/lib/assets";
import {
  IconArrowLeft as ArrowLeft, IconMail as Mail, IconPhone as Phone, IconGlobe as Globe, IconBriefcase as Briefcase, IconMapPin as MapPin, IconCalendar as Calendar, IconLinkedin as Linkedin, IconStar as Star, IconBuilding as Building, IconFileText as FileText,
} from "@/components/icons/AppIcons";

function fmt(iso) { return iso ? new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }) : "—"; }
function StatTile({ label, value }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="font-display text-2xl font-extrabold text-slate-900">{value ?? 0}</div><div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div></div>;
}

export default function AdminStartupDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/startups/${id}/detail`).then(({ data }) => setData(data)).catch(() => setData({ error: true }));
  }, [id]);

  if (!data) return <DashboardLayout nav={ADMIN_NAV} title="Loading">Loading...</DashboardLayout>;
  if (data.error) return <DashboardLayout nav={ADMIN_NAV} title="Not found">Startup not found.</DashboardLayout>;

  const { startup: s, user: u, opportunities: opps, applications: apps, stats } = data;

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Startup details">
      <Link to="/admin/users" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1" data-testid="startup-detail-card">
          <div className="flex items-start gap-4">
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
                {s.name?.[0]?.toUpperCase() || "S"}
              </div>
            )}
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">{s.name}</h1>
              <div className="text-sm text-slate-500">{s.industry}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.is_verified ? <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge> : <Badge variant="outline">Pending verification</Badge>}
                {u?.is_active ? <Badge className="bg-emerald-100 text-emerald-700">Active</Badge> : <Badge className="bg-rose-100 text-rose-700">Disabled</Badge>}
                <Badge variant="outline" className="capitalize">{s.subscription_tier || "free"}</Badge>
                {s.selected_plan_id && s.selected_plan_id !== "free" ? (
                  <Badge variant="outline">Plan interest: {s.selected_plan_id.replace(/_/g, " ")}</Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {s.email}</div>
            {s.phone ? <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {s.phone}</div> : null}
            {s.website ? <a href={s.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-rose-700"><Globe className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {s.website}</a> : null}
            {s.linkedin_url ? <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-rose-700"><Linkedin className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> LinkedIn</a> : null}
            {s.city ? <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {s.city}</div> : null}
            <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> Joined {fmt(s.created_at)}</div>
            {s.team_size ? <div className="flex items-center gap-2"><Building className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> Team size: {s.team_size}</div> : null}
            {s.funding_stage ? <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> Stage: {s.funding_stage}</div> : null}
          </div>

          {s.description ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{s.description}</div>
          ) : null}

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verification proof</div>
            {s.proof_url ? (
              <a
                href={resolveAssetUrl(s.proof_url)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#D92D20] hover:underline"
              >
                <FileText className="h-4 w-4" />
                {s.proof_filename || "Open proof document"}
              </a>
            ) : (
              <p className="mt-2 text-xs text-amber-700">No proof document on file</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Total internships" value={stats.total_opportunities} />
            <StatTile label="Active" value={stats.active_opportunities} />
            <StatTile label="Applications" value={stats.total_applications} />
            <StatTile label="Hired" value={stats.hired} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-3 font-display text-lg font-bold text-slate-900">Internships posted ({opps.length})</h3>
            {opps.length === 0 ? <div className="text-sm text-slate-500">No postings yet.</div> : (
              <ul className="divide-y divide-slate-100" data-testid="startup-postings-list">
                {opps.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <Link to={`/admin/opportunities/${o.id}`} className="font-semibold text-slate-900 hover:text-rose-700">{o.title}</Link>
                      <div className="text-xs text-slate-500">{o.mode} · {o.duration} · {o.stipend_range}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {o.is_featured ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700"><Star className="h-3 w-3" /> Featured</span> : null}
                      <StatusBadge status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-3 font-display text-lg font-bold text-slate-900">Latest applications ({apps.length})</h3>
            {apps.length === 0 ? <div className="text-sm text-slate-500">No applications yet.</div> : (
              <ul className="divide-y divide-slate-100">
                {apps.slice(0, 20).map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <Link to={`/admin/students/${a.student_id}`} className="font-semibold text-slate-900 hover:text-rose-700">{a.student_name}</Link>
                      <div className="truncate text-xs text-slate-500">{a.opportunity_title} · Applied {fmt(a.applied_at)}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
