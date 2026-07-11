/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import {
  IconArrowLeft as ArrowLeft, IconMail as Mail, IconPhone as Phone, IconMapPin as MapPin, IconLinkedin as Linkedin, IconExternalLink as ExternalLink,
  IconBriefcase as Briefcase, IconFileText as FileText, IconBookmark as Bookmark, IconBuilding as Building, IconGraduationCap as GraduationCap, IconCalendar as Calendar,
} from "@/components/icons/AppIcons";

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="font-display text-2xl font-extrabold text-slate-900">{value ?? 0}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400" /> : null}
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-32">{label}</div>
      <div className="flex-1 text-sm text-slate-900">{value || <span className="text-slate-600 dark:text-slate-400">—</span>}</div>
    </div>
  );
}

export default function AdminStudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/students/${id}/detail`).then(({ data }) => setData(data)).catch(() => setData({ error: true }));
  }, [id]);

  if (!data) return <DashboardLayout nav={ADMIN_NAV} title="Loading">Loading...</DashboardLayout>;
  if (data.error) return <DashboardLayout nav={ADMIN_NAV} title="Not found">Student not found.</DashboardLayout>;

  const { student: s, user: u, applications, saved, institution } = data;

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Student details">
      <Link to="/admin/users" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1" data-testid="student-detail-card">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {s.photo_url ? <AvatarImage src={s.photo_url} alt={s.full_name} /> : null}
              <AvatarFallback className="bg-slate-900 text-white">
                {s.full_name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">{s.full_name}</h1>
              <div className="text-sm text-slate-500">{s.email}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {u?.is_active ? <Badge className="bg-emerald-100 text-emerald-700">Active</Badge> : <Badge className="bg-rose-100 text-rose-700">Inactive</Badge>}
                {s.is_approved ? <Badge variant="outline">Approved</Badge> : <Badge variant="outline">Pending</Badge>}
                <Badge variant="outline" className="text-[10px]">{s.profile_completion || 0}% profile</Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            <InfoRow icon={Phone} label="Phone" value={s.phone} />
            <InfoRow icon={GraduationCap} label="Degree" value={s.degree} />
            <InfoRow icon={Building} label="College" value={s.college_name_raw} />
            <InfoRow icon={MapPin} label="City" value={s.city} />
            <InfoRow label="Department" value={s.department} />
            <InfoRow label="Year" value={s.year_of_study} />
            <InfoRow label="Reg. No." value={s.register_number} />
            <InfoRow label="CGPA" value={s.cgpa} />
            <InfoRow icon={Calendar} label="Joined" value={fmt(s.created_at)} />
          </div>

          {(s.linkedin_url || s.portfolio_url || s.resume_url) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {s.linkedin_url ? <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-link border-slate-200 text-xs text-slate-700 hover:bg-slate-50"><Linkedin className="h-3 w-3" /> LinkedIn</a> : null}
              {s.portfolio_url ? <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" className="btn-link border-slate-200 text-xs text-slate-700 hover:bg-slate-50"><ExternalLink className="h-3 w-3" /> Portfolio</a> : null}
              {s.resume_url ? <a href={s.resume_url} target="_blank" rel="noopener noreferrer" className="btn-link border-slate-200 text-xs text-slate-700 hover:bg-slate-50"><FileText className="h-3 w-3" /> Resume</a> : null}
            </div>
          )}

          {s.skills?.length ? (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Skills</div>
              <div className="flex flex-wrap gap-1">{s.skills.map((sk) => <span key={sk} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{sk}</span>)}</div>
            </div>
          ) : null}

          {institution ? (
            <Link to={`/admin/institutions/${institution.id}`} className="mt-4 block rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Institution</div>
              <div className="font-semibold text-slate-900">{institution.name}</div>
              <div className="text-xs text-slate-500">{institution.city}</div>
            </Link>
          ) : null}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Applications" value={applications.length} />
            <StatTile label="Shortlisted" value={applications.filter((a) => ["shortlisted", "interview", "offer", "hired"].includes(a.status)).length} />
            <StatTile label="Interviews" value={applications.filter((a) => ["interview", "offer", "hired"].includes(a.status)).length} />
            <StatTile label="Hired" value={applications.filter((a) => a.status === "hired").length} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-rose-700" />
              <h3 className="font-display text-lg font-bold text-slate-900">Applications ({applications.length})</h3>
            </div>
            {applications.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No applications yet.</div> : (
              <ul className="divide-y divide-slate-100" data-testid="student-applications-list">
                {applications.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <Link to={`/admin/opportunities/${a.opportunity_id}`} className="font-semibold text-slate-900 hover:text-rose-700">{a.opportunity_title}</Link>
                      <div className="text-xs text-slate-500">{a.startup_name} · Applied {fmt(a.applied_at)}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-3 flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-700" />
              <h3 className="font-display text-lg font-bold text-slate-900">Saved opportunities ({saved.length})</h3>
            </div>
            {saved.length === 0 ? <div className="text-sm text-slate-500">Nothing saved.</div> : (
              <ul className="divide-y divide-slate-100">
                {saved.map((sv) => (
                  <li key={sv.id} className="py-2 text-sm">
                    <Link to={`/admin/opportunities/${sv.opportunity_id}`} className="text-slate-700 hover:text-rose-700">{sv.opportunity_title}</Link>
                    <span className="ml-2 text-xs text-slate-600 dark:text-slate-400">{fmt(sv.saved_at)}</span>
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
