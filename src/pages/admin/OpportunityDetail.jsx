/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { IconArrowLeft as ArrowLeft, IconStar as Star, IconMapPin as MapPin, IconCalendar as Calendar, IconBriefcase as Briefcase, IconEye as Eye } from "@/components/icons/AppIcons";
import { toast } from "sonner";

function fmt(iso) { return iso ? new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }) : "—"; }
function StatTile({ label, value }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="font-display text-2xl font-extrabold text-slate-900">{value ?? 0}</div><div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div></div>;
}

export default function AdminOpportunityDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const load = () => {
    api.get(`/admin/opportunities/${id}/detail`).then(({ data }) => setData(data)).catch(() => setData({ error: true }));
  };

  useEffect(() => { load(); }, [id]);

  if (!data) return <DashboardLayout nav={ADMIN_NAV} title="Loading">Loading...</DashboardLayout>;
  if (data.error) return <DashboardLayout nav={ADMIN_NAV} title="Not found">Internship not found.</DashboardLayout>;

  const { opportunity: o, applications, stats } = data;

  const toggleFeature = async () => {
    try {
      await api.patch(`/admin/opportunities/${o.id}/feature`, { is_featured: !o.is_featured });
      toast.success(o.is_featured ? "Removed from featured" : "Marked as featured");
      load();
    } catch (err) { toast.error(formatApiError(err)); }
  };
  const close = async () => {
    try {
      await api.patch(`/opportunities/${o.id}/status`, { status: "closed" });
      toast.success("Internship closed");
      load();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Internship details">
      <Link to="/admin/opportunities" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to internships
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:col-span-1 dark:border-white/10 dark:bg-slate-900" data-testid="opportunity-detail-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{o.domain}</span>
              <h1 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{o.title}</h1>
              {o.startup_id ? (
                <Link to={`/admin/startups/${o.startup_id}`} className="text-sm text-slate-500 hover:text-rose-700">{o.startup_name}</Link>
              ) : <div className="text-sm text-slate-500">{o.startup_name}</div>}
            </div>
            <StatusBadge status={o.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {o.is_featured ? <Badge className="bg-amber-100 text-amber-700"><Star className="mr-0.5 h-3 w-3" /> Featured</Badge> : null}
            <Badge variant="outline">{o.mode}</Badge>
            <Badge variant="outline">{o.duration}</Badge>
            <Badge variant="outline">{o.stipend_range}</Badge>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            {o.city ? <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {o.city}</div> : null}
            <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> Posted {fmt(o.created_at)}</div>
            {o.application_deadline ? <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> Deadline {fmt(o.application_deadline)}</div> : null}
            <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {o.openings || 1} opening{(o.openings || 1) > 1 ? "s" : ""}</div>
            <div className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" /> {o.view_count || 0} views</div>
          </div>

          {o.skills_required?.length ? (
            <div className="mt-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Required skills</div>
              <div className="flex flex-wrap gap-1">{o.skills_required.map((s) => <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs">{s}</span>)}</div>
            </div>
          ) : null}

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            <div className="font-semibold uppercase tracking-wider">Description</div>
            <p className="mt-1 whitespace-pre-wrap">{o.description}</p>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button variant="outline" className="w-full sm:w-auto" onClick={toggleFeature} data-testid="opp-detail-feature-btn"><Star className="mr-1 h-3 w-3" /> {o.is_featured ? "Unfeature" : "Feature"}</Button>
            {o.status === "active" ? <Button variant="outline" className="w-full sm:w-auto" onClick={close}>Close listing</Button> : null}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Applications" value={stats.total_applications} />
            <StatTile label="Shortlisted" value={stats.shortlisted} />
            <StatTile label="Interviews" value={stats.interviews} />
            <StatTile label="Hired" value={stats.hired} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-white/10 dark:bg-slate-900">
            <h3 className="mb-3 font-display text-lg font-bold text-slate-900 dark:text-white">Applications ({applications.length})</h3>
            {applications.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/20">No applications yet.</div> : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5" data-testid="opp-applications-list">
                {applications.map((a) => (
                  <li key={a.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link to={`/admin/students/${a.student_id}`} className="font-semibold text-slate-900 hover:text-rose-700 dark:text-white">{a.student_name}</Link>
                      <div className="break-all text-xs text-slate-500">{a.student_email} · Applied {fmt(a.applied_at)}</div>
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
