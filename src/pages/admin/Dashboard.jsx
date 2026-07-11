/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import ActivityFeed from "@/components/ActivityFeed";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { IconUsers as Users, IconBriefcase as Briefcase, IconGraduationCap as GraduationCap, IconAlertCircle as AlertCircle } from "@/components/icons/AppIcons";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get("/admin/stats").then(({ data }) => setStats(data)); }, []);

  if (!stats) return <DashboardLayout nav={ADMIN_NAV} title="Admin">Loading…</DashboardLayout>;

  const tiles = [
    { l: "Students", v: stats.students, icon: Users, c: "bg-rose-100 text-rose-700" },
    { l: "Startups", v: stats.startups, icon: Briefcase, c: "bg-amber-100 text-amber-700" },
    { l: "Institutions", v: stats.institutions, icon: GraduationCap, c: "bg-sky-100 text-sky-700" },
    { l: "Active internships", v: stats.opportunities, icon: AlertCircle, c: "bg-emerald-100 text-emerald-700" },
  ];

  const chartData = [
    { name: "Students", value: stats.students },
    { name: "Startups", value: stats.startups },
    { name: "Institutions", value: stats.institutions },
    { name: "Internships", value: stats.opportunities },
    { name: "Applications", value: stats.applications },
  ];

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Admin overview">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.l} data-testid={`admin-stat-${t.l.toLowerCase().replace(/\s/g, "-")}`} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-5">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${t.c}`}><t.icon className="h-4 w-4" /></div>
            <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{t.v}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-bold">Platform usage</h3>
          <div className="mt-4" style={{ height: 288 }}>
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="value" fill="#D92D20" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
          <h3 className="font-display text-lg font-bold">Pending approvals</h3>
          <div className="mt-4 space-y-3">
            <Link to="/admin/verifications" className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:bg-white/5" data-testid="admin-pending-students">
              <span className="font-semibold text-slate-900 dark:text-white">Students awaiting approval</span>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-700">{stats.pending_students}</span>
            </Link>
            <Link to="/admin/verifications" className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:bg-white/5" data-testid="admin-pending-startups">
              <span className="font-semibold text-slate-900 dark:text-white">Startups awaiting verification</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">{stats.pending_startups}</span>
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-[hsl(var(--background))] p-3"><div className="text-xs text-slate-500">DAU (est.)</div><div className="font-display text-xl font-extrabold">{stats.dau}</div></div>
            <div className="rounded-xl bg-[hsl(var(--background))] p-3"><div className="text-xs text-slate-500">WAU (est.)</div><div className="font-display text-xl font-extrabold">{stats.wau}</div></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ActivityFeed limit={15} refreshIntervalMs={15000} />
        <div className="mt-3 text-right">
          <Link to="/admin/activity" className="text-sm font-semibold text-[#D92D20] hover:underline">See full activity feed →</Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
