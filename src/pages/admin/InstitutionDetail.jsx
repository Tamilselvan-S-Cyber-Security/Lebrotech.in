/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { resolveAssetUrl } from "@/lib/assets";
import { IconArrowLeft as ArrowLeft, IconMapPin as MapPin, IconMail as Mail, IconPhone as Phone, IconGlobe as Globe, IconCalendar as Calendar, IconGraduationCap as GraduationCap, IconLink as LinkIcon, IconFileText as FileText } from "@/components/icons/AppIcons";

function fmt(iso) { return iso ? new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }) : "—"; }
function StatTile({ label, value }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="font-display text-2xl font-extrabold text-slate-900">{value ?? 0}</div><div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div></div>;
}

export default function AdminInstitutionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/institutions/${id}/detail`).then(({ data }) => setData(data)).catch(() => setData({ error: true }));
  }, [id]);

  if (!data) return <DashboardLayout nav={ADMIN_NAV} title="Loading">Loading...</DashboardLayout>;
  if (data.error) return <DashboardLayout nav={ADMIN_NAV} title="Not found">Institution not found.</DashboardLayout>;

  const { institution: i, user: u, students, stats } = data;
  const referralUrl = i.referral_slug ? `${window.location.origin}/register?institution=${i.referral_slug}` : "";

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Institution details">
      <Link to="/admin/users" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1" data-testid="institution-detail-card">
          <div className="flex items-start gap-4">
            {i.logo_url ? (
              <img src={i.logo_url} alt={i.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <GraduationCap className="h-8 w-8" />
              </div>
            )}
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">{i.name}</h1>
              <div className="text-sm text-slate-500">{i.city}, {i.state}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {i.is_verified ? <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge> : <Badge variant="outline">Pending verification</Badge>}
                {u?.is_active ? <Badge className="bg-emerald-100 text-emerald-700">Active</Badge> : <Badge className="bg-rose-100 text-rose-700">Disabled</Badge>}
                {i.selected_plan_id && i.selected_plan_id !== "free" ? (
                  <Badge variant="outline">Plan interest: {i.selected_plan_id.replace(/_/g, " ")}</Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            {i.email ? <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {i.email}</div> : null}
            {i.phone ? <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {i.phone}</div> : null}
            {i.website ? <a href={i.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-rose-700"><Globe className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {i.website}</a> : null}
            {i.address ? <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {i.address}</div> : null}
            <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> Joined {fmt(i.created_at)}</div>
          </div>

          {referralUrl ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><LinkIcon className="h-3 w-3" /> Referral link</div>
              <div className="mt-1 break-all font-mono text-[11px] text-slate-700">{referralUrl}</div>
            </div>
          ) : null}

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verification proof</div>
            {i.proof_url ? (
              <a
                href={resolveAssetUrl(i.proof_url)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#D92D20] hover:underline"
              >
                <FileText className="h-4 w-4" />
                {i.proof_filename || "Open proof document"}
              </a>
            ) : (
              <p className="mt-2 text-xs text-amber-700">No proof document on file</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Students" value={stats.total_students} />
            <StatTile label="Profile ≥80%" value={stats.complete_profiles} />
            <StatTile label="Applications" value={stats.applications} />
            <StatTile label="Hired" value={stats.hired} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-3 font-display text-lg font-bold text-slate-900">Mapped students ({students.length})</h3>
            {students.length === 0 ? <div className="text-sm text-slate-500">No students mapped yet.</div> : (
              <ul className="divide-y divide-slate-100" data-testid="institution-students-list">
                {students.slice(0, 100).map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <Link to={`/admin/students/${s.id}`} className="font-semibold text-slate-900 hover:text-rose-700">{s.full_name}</Link>
                      <div className="truncate text-xs text-slate-500">{s.email} · {s.department || "—"} · Year {s.year_of_study || "—"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{s.profile_completion || 0}%</Badge>
                      {s.onboarded_by === "institution" ? <Badge className="bg-amber-100 text-[10px] text-amber-700">Onboarded</Badge> : null}
                    </div>
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
