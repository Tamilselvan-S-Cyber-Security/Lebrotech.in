/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS = {
  applied: "bg-slate-100 text-slate-700",
  reviewed: "bg-sky-100 text-sky-800",
  shortlisted: "bg-violet-100 text-violet-800",
  interview: "bg-amber-100 text-amber-800",
  offer: "bg-emerald-100 text-emerald-800",
  hired: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminApplications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    api.get("/admin/applications?limit=200").then(({ data }) => setApps(data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Internship applications">
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        All student internship applications across the platform. Students receive email confirmation when they apply.
      </p>

      {apps.length === 0 ? (
        <div className="rounded-none border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/20">
          No applications yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-none border border-slate-200 dark:border-white/10">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Internship</th>
                <th className="px-4 py-3">Startup</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {apps.map((app) => (
                <tr key={app.id} className="bg-white dark:bg-transparent" data-testid={`admin-app-${app.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{app.student_name}</div>
                    <div className="text-xs text-slate-500">{app.student_email}</div>
                    <div className="text-xs text-slate-400">{app.student_college || "—"} · {app.student_phone || "—"}</div>
                    {app.student_id ? (
                      <Link to={`/admin/students/${app.student_id}`} className="text-xs text-[#D92D20] hover:underline">View profile</Link>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{app.opportunity_title}</div>
                    {app.cover_note ? <div className="mt-1 line-clamp-2 text-xs text-slate-500">"{app.cover_note}"</div> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{app.startup_name}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[app.status] || STATUS_COLORS.applied}>{app.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {app.applied_at ? new Date(app.applied_at).toLocaleString("en-IN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
