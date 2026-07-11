/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  IconUserPlus as UserPlus, IconBriefcase as Briefcase, IconFileText as FileText, IconMessageSquare as MessageSquare, IconMail as Mail,
  IconSparkles as Sparkles, IconActivity as ActivityIcon, IconRefreshCw as RefreshCw,
} from "@/components/icons/AppIcons";
import api from "@/lib/api";

const KIND_META = {
  "user.created":        { icon: UserPlus,      color: "bg-rose-50 text-rose-700",       label: "Signup" },
  "opportunity.posted":  { icon: Briefcase,     color: "bg-amber-50 text-amber-700",     label: "Internship" },
  "application.created": { icon: FileText,      color: "bg-sky-50 text-sky-700",         label: "Application" },
  "application.status":  { icon: Sparkles,      color: "bg-violet-50 text-violet-700",   label: "Status change" },
  "message.sent":        { icon: MessageSquare, color: "bg-slate-100 text-slate-700",    label: "Message" },
  "enquiry.created":     { icon: Mail,          color: "bg-emerald-50 text-emerald-700", label: "Enquiry" },
};

function relTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function eventLink(e) {
  // Map back to admin detail routes when possible
  if (e.entity_role === "internship" && e.entity_id) return `/admin/opportunities/${e.entity_id}`;
  if (e.entity_role === "student" && e.entity_id) return `/admin/users`;
  if (e.entity_role === "enquiry") return `/admin/enquiries`;
  return null;
}

export default function ActivityFeed({ limit = 15, refreshIntervalMs = 15000, compact = false }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/activity?limit=${limit}`);
      setEvents(data.items || []);
    } catch { /* silent */ }
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    load();
    const iv = setInterval(load, refreshIntervalMs);
    return () => clearInterval(iv);
  }, [load, refreshIntervalMs]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a]" data-testid="admin-activity-feed">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-rose-700" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Platform activity</h3>
        </div>
        <button onClick={load} className="text-xs font-semibold text-slate-500 hover:text-white">
          <RefreshCw className="inline h-3 w-3" /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400">Loading...</div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400">No activity yet</div>
      ) : (
        <ul className={`${compact ? "" : "max-h-[640px]"} divide-y divide-white/10 overflow-y-auto`}>
          {events.map((e) => {
            const M = KIND_META[e.kind] || KIND_META["message.sent"];
            const Icon = M.icon;
            const url = eventLink(e);
            const Body = (
              <div className="flex items-start gap-3 px-5 py-3 hover:bg-white/5">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${M.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{e.title}</div>
                  <div className="line-clamp-1 text-xs text-slate-500">{e.subtitle}</div>
                </div>
                <span className="shrink-0 text-[10px] text-slate-600 dark:text-slate-400">{relTime(e.ts)}</span>
              </div>
            );
            return (
              <li key={`${e.kind}-${e.entity_id}-${e.ts}`} data-testid={`activity-${e.kind}`}>
                {url ? <Link to={url}>{Body}</Link> : Body}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
