/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INSTITUTION_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { IconLink as LinkIcon, IconUserPlus as UserPlus, IconArrowRight as ArrowRight } from "@/components/icons/AppIcons";
import AccountVerificationBanner from "@/components/AccountVerificationBanner";
import { dashboardGreeting } from "@/lib/roles";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

export default function InstitutionDashboard() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [referral, setReferral] = useState(null);

  useEffect(() => {
    if (!profile?.id) return;
    api.get(`/institutions/${profile.id}/stats`).then(({ data }) => setStats(data)).catch(() => {});
    api.get("/institutions/me/referral").then(({ data }) => setReferral(data)).catch(() => {});
  }, [profile?.id]);

  if (!stats) return <DashboardLayout nav={INSTITUTION_NAV} title={dashboardGreeting(profile, user, "institution")}>Loading stats…</DashboardLayout>;

  const tiles = [
    { l: "Students enrolled", v: stats.total_students },
    { l: "Profile complete", v: stats.profile_complete },
    { l: "Internship applications", v: stats.total_applications },
    { l: "Interns placed", v: stats.hired },
  ];

  const referralUrl = referral ? `${window.location.origin}/register?institution=${referral.slug}` : "";

  return (
    <DashboardLayout nav={INSTITUTION_NAV} title={dashboardGreeting(profile, user, "institution")}>
      <AccountVerificationBanner profile={profile} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.l} data-testid={`inst-stat-${t.l.toLowerCase().replace(/\s/g, "-")}`} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-5">
            <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{t.v}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.l}</div>
          </div>
        ))}
      </div>

      {/* Quick onboarding CTA */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 lg:col-span-2" data-testid="inst-referral-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-rose-700 shadow-sm">
              <LinkIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-bold text-slate-900 dark:text-white">Your referral signup link</div>
              <div className="mt-1 truncate font-mono text-xs text-slate-600 dark:text-slate-400" data-testid="inst-referral-url">{referralUrl || "Generating…"}</div>
            </div>
            <Link to="/institution/onboard">
              <Button variant="outline" size="sm">Manage <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </div>
        </div>
        <Link to="/institution/onboard" className="card-lift rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-900 p-5 text-white">
          <UserPlus className="h-5 w-5 text-rose-300" />
          <div className="mt-2 font-display text-base font-bold">Onboard students</div>
          <div className="mt-1 text-xs text-slate-400">Add individually or upload an Excel.</div>
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
          <h3 className="font-display text-lg font-bold">Top departments by internship placements</h3>
          <div className="mt-4" style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={stats.departments.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="count" fill="#D92D20" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
          <h3 className="font-display text-lg font-bold">Internship application trend</h3>
          <div className="mt-4" style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={stats.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Line type="monotone" dataKey="applications" stroke="#D92D20" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
        <h3 className="font-display text-lg font-bold">Startup partners hiring your students as interns</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {stats.top_startups.length === 0 ? <span className="text-sm text-slate-500">No partner activity yet.</span> :
            stats.top_startups.map((s) => (
              <div key={s.name} className="rounded-xl border border-slate-200 dark:border-white/10 bg-[hsl(var(--background))] px-4 py-3">
                <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                <div className="text-xs text-slate-500">{s.count} internship applications</div>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link to="/institution/students" className="btn-link border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">View Student List →</Link>
        <Link to="/institution/opportunities" className="btn-link border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">Browse Internships →</Link>
        <Link to="/institution/analytics" className="btn-link border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">Full Analytics →</Link>
      </div>
    </DashboardLayout>
  );
}
