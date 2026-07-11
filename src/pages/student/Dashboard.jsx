/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STUDENT_NAV } from "@/lib/nav";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { dashboardGreeting } from "@/lib/roles";
import { IconArrowRight as ArrowRight, IconSparkles as Sparkles } from "@/components/icons/AppIcons";
import OpportunityImage from "@/components/OpportunityImage";

function CompletionRing({ value = 0 }) {
  const r = 36, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative inline-flex h-24 w-24 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
        <circle cx="50" cy="50" r="36" stroke="#ffffff1a" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r="36" stroke="#D92D20" strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <span className="absolute font-display text-xl font-extrabold text-slate-900 dark:text-white">{value}%</span>
    </div>
  );
}

function MatchBadge({ score }) {
  const color = score >= 75 ? "bg-emerald-100 text-emerald-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700";
  return (
    <span data-testid={`match-score-${score}`} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
      <Sparkles className="h-3 w-3" /> {score}% match
    </span>
  );
}

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const [apps, setApps] = useState([]);
  const [matched, setMatched] = useState([]);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    api.get("/applications/me").then(({ data }) => setApps(data));
    api.get("/notifications").then(({ data }) => setNotifs(data));
    api.get("/matching/student-recommendations?limit=6")
      .then(({ data }) => setMatched(data))
      .catch(() => setMatched([]));
  }, []);

  const stats = [
    { l: "Applications", v: apps.length },
    { l: "Shortlisted", v: apps.filter((a) => ["shortlisted", "interview", "offer", "hired"].includes(a.status)).length },
    { l: "Interviews", v: apps.filter((a) => ["interview", "offer", "hired"].includes(a.status)).length },
    { l: "Offers", v: apps.filter((a) => ["offer", "hired"].includes(a.status)).length },
  ];

  return (
    <DashboardLayout nav={STUDENT_NAV} title={dashboardGreeting(profile, user, "student")}>
      {/* Top: completion + stats */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6 lg:col-span-1">
          <div className="flex items-center gap-5">
            <CompletionRing value={profile?.profile_completion || 0} />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile completion</div>
              <div className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">Stand out to startups</div>
              <Link to="/student/profile" data-testid="dashboard-complete-profile" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#D92D20] hover:underline">Complete Profile <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} data-testid={`student-stat-${s.l.toLowerCase()}`} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-5">
              <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{s.v}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Matched */}
      <div className="mt-10" data-testid="student-recommendations-section">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Recommended for you</h2>
            <p className="text-sm text-slate-500">Ranked by skills, domain, work-mode and location fit.</p>
          </div>
          <Link to="/student/opportunities" className="text-sm font-semibold text-[#D92D20] hover:underline">Browse all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matched.map((o) => (
            <Link to={`/student/opportunities/${o.id}`} key={o.id} data-testid={`rec-opp-${o.id}`} className="opp-card block overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a]">
              <OpportunityImage src={o.image_url} alt={o.title} className="h-32 w-full" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{o.domain}</span>
                  <MatchBadge score={o.match_score} />
                </div>
                <h3 className="opp-card-title mt-3 font-display text-base font-bold leading-tight text-slate-900 transition-colors dark:text-white">{o.title}</h3>
                <div className="text-xs text-slate-500">{o.startup_name}</div>
                {o.match_reasons?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.match_reasons.slice(0, 3).map((r) => (
                      <span key={r} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">{r}</span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-3 text-xs">
                  <span>{o.duration} · {o.mode}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{o.stipend_range}</span>
                </div>
              </div>
            </Link>
          ))}
          {matched.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-sm text-slate-500" data-testid="rec-empty">
              Update your skills & domains in <Link to="/student/profile" className="font-semibold text-rose-700 hover:underline">your profile</Link> to start matching with internships.
            </div>
          )}
        </div>
      </div>

      {/* Applications & certification */}
      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Recent applications</h3>
            <Link to="/student/applications" className="text-sm font-semibold text-[#D92D20] hover:underline">See all</Link>
          </div>
          {apps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-sm text-slate-500">No applications yet. Browse internships to apply.</div>
          ) : (
            <div className="space-y-2">
              {apps.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 p-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900 dark:text-white">{a.opportunity_title}</div>
                    <div className="text-xs text-slate-500">{a.startup_name}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
            <h3 className="mb-2 font-display text-xl font-bold text-slate-900 dark:text-white">Certification</h3>
            <p className="text-sm text-slate-500">Workshop, course & internship certificates — track applications and status.</p>
            <Link to="/student/certification" data-testid="dashboard-certification-link" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#D92D20] hover:underline">
              My certification <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-6">
            <h3 className="mb-4 font-display text-xl font-bold text-slate-900 dark:text-white">Recent notifications</h3>
          {notifs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-sm text-slate-500">All caught up!</div>
          ) : (
            <ul className="space-y-3">
              {notifs.slice(0, 5).map((n) => (
                <li key={n.id} className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</div>
                  <div className="text-xs text-slate-500">{n.body}</div>
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
