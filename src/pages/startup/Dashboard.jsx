/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STARTUP_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusBadge from "@/components/StatusBadge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { IconFilePlus as FilePlus, IconEye as Eye, IconSparkles as Sparkles } from "@/components/icons/AppIcons";
import AccountVerificationBanner from "@/components/AccountVerificationBanner";
import { dashboardGreeting } from "@/lib/roles";

function MatchBadge({ score }) {
  const color = score >= 75 ? "bg-emerald-100 text-emerald-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700";
  return (
    <span data-testid={`candidate-match-${score}`} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
      <Sparkles className="h-3 w-3" /> {score}%
    </span>
  );
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "S";
}

export default function StartupDashboard() {
  const { profile, user } = useAuth();
  const [postings, setPostings] = useState([]);
  const [apps, setApps] = useState([]);
  const [recommendedStudents, setRecommendedStudents] = useState([]);

  useEffect(() => {
    if (!profile?.id) return;
    api.get(`/opportunities?startup_id=${profile.id}&status=active&limit=50`).then(({ data }) => setPostings(data));
    api.get("/applications/me").then(({ data }) => setApps(data));
    api.get("/matching/startup-recommendations?limit=6")
      .then(({ data }) => setRecommendedStudents(data))
      .catch(() => setRecommendedStudents([]));
  }, [profile?.id]);

  const stats = useMemo(() => [
    { l: "Active Internships", v: postings.length },
    { l: "Total Applicants", v: apps.length },
    { l: "Shortlisted", v: apps.filter((a) => ["shortlisted", "interview", "offer", "hired"].includes(a.status)).length },
    { l: "Interns Hired", v: apps.filter((a) => a.status === "hired").length },
  ], [postings, apps]);

  const chartData = useMemo(() => {
    return postings.map((p) => ({
      name: p.title.length > 18 ? p.title.slice(0, 16) + "…" : p.title,
      Applications: apps.filter((a) => a.opportunity_id === p.id).length,
    }));
  }, [postings, apps]);

  const recent = apps.slice(0, 6);

  return (
    <DashboardLayout nav={STARTUP_NAV} title={dashboardGreeting(profile, user, "startup")}>
      <AccountVerificationBanner profile={profile} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} data-testid={`startup-stat-${s.l.toLowerCase().replace(/\s/g, "-")}`} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-5">
            <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{s.v}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold">Applicants per internship</h3>
            <Link to="/startup/post"><Button size="sm" className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="startup-quick-post"><FilePlus className="mr-2 h-4 w-4" /> Post internship</Button></Link>
          </div>
          <div className="mt-4" style={{ height: 256 }}>
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No internships posted yet — create one to see analytics.</div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Bar dataKey="Applications" fill="#D92D20" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
          <h3 className="font-display text-xl font-bold">Plan</h3>
          <div className="mt-4 rounded-xl bg-slate-900 p-5 text-white">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">Current plan</div>
            <div className="mt-1 font-display text-2xl font-extrabold">Free</div>
            <div className="mt-2 text-sm text-slate-300">No monthly fees — post internships and issue certificates free.</div>
            <Link to="/startup/post"><Button size="sm" className="mt-4 bg-white text-[#0a0f1a] hover:bg-slate-100">Post internship</Button></Link>
          </div>
        </div>
      </div>

      {/* Recommended candidates */}
      <div className="mt-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6" data-testid="startup-recommended-students">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Recommended candidates</h3>
            <p className="text-xs text-slate-500">AI-matched students for your most recent posting{recommendedStudents[0]?.for_opportunity_title ? `: ${recommendedStudents[0].for_opportunity_title}` : ""}.</p>
          </div>
          {recommendedStudents[0]?.for_opportunity_id ? (
            <Link to={`/startup/applicants/${recommendedStudents[0].for_opportunity_id}`} className="text-sm font-semibold text-[#D92D20] hover:underline">See applicants →</Link>
          ) : null}
        </div>
        {recommendedStudents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-sm text-slate-500">
            Post an active internship to get AI-matched candidate recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recommendedStudents.map((s) => (
              <Link
                key={s.id}
                to={`/startup/candidate/${s.id}`}
                data-testid={`rec-student-${s.id}`}
                className="card-lift block rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {s.photo_url ? <AvatarImage src={s.photo_url} alt={s.full_name} /> : null}
                    <AvatarFallback className="bg-slate-900 text-xs font-bold text-white">{initials(s.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-slate-900 dark:text-white">{s.full_name}</span>
                      <MatchBadge score={s.match_score} />
                    </div>
                    <div className="truncate text-xs text-slate-500">{s.degree} · {s.department}</div>
                    <div className="truncate text-[11px] text-slate-600 dark:text-slate-400">{s.college_name_raw} · {s.city}</div>
                  </div>
                </div>
                {s.match_reasons?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.match_reasons.slice(0, 3).map((r) => (
                      <span key={r} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">{r}</span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold">Recent applications</h3>
            <Link to="/startup/opportunities" className="text-sm font-semibold text-[#D92D20] hover:underline">Manage internships →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-sm text-slate-500">No applications yet.</div>
          ) : (
            <div className="mt-4 space-y-2">
              {recent.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 p-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white">{a.student_name}</div>
                    <div className="truncate text-xs text-slate-500">{a.opportunity_title}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={a.status} />
                    <Link to={`/startup/applicants/${a.opportunity_id}`} className="text-sm font-semibold text-[#D92D20]">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
          <h3 className="font-display text-xl font-bold">Active internships</h3>
          {postings.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-sm text-slate-500">No internships posted yet.</div>
          ) : (
            <div className="mt-4 space-y-2">
              {postings.slice(0, 6).map((p) => (
                <Link key={p.id} to={`/startup/applicants/${p.id}`} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 p-3 hover:bg-white/5">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.mode} · {p.duration} · {p.stipend_range}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Eye className="h-3 w-3" /> {p.view_count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
