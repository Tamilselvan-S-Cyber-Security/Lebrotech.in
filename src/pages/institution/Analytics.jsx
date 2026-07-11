/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INSTITUTION_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import { IconDownload as Download } from "@/components/icons/AppIcons";

const COLORS = ["#D92D20", "#1E293B", "#0EA5E9", "#F59E0B", "#10B981", "#8B5CF6"];

export default function InstitutionAnalytics() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!profile?.id) return;
    api.get(`/institutions/${profile.id}/stats`).then(({ data }) => setStats(data));
  }, [profile?.id]);

  if (!stats) return <DashboardLayout nav={INSTITUTION_NAV} title="Analytics">Loading…</DashboardLayout>;

  const funnel = [
    { stage: "Applications", value: stats.total_applications },
    { stage: "Shortlisted", value: stats.shortlisted },
    { stage: "Interns hired", value: stats.hired },
  ];

  return (
    <DashboardLayout nav={INSTITUTION_NAV} title="Internship Analytics">
      <div className="mb-6 flex justify-end">
        <Button data-testid="inst-export-button" variant="outline" onClick={() => toast.success("PDF export queued — production version generates NAAC-ready PDF.")}><Download className="mr-2 h-4 w-4" /> Export NAAC report</Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Department-wise internship placements</h3>
          <div className="mt-4" style={{ height: 288 }}>
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={stats.departments}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="count" fill="#1E293B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Conversion funnel</h3>
          <div className="mt-4" style={{ height: 288 }}>
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="stage" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="value" fill="#D92D20" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-bold">Top startup partners hiring interns</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div style={{ height: 288 }}>
            <ResponsiveContainer width="100%" height={288}>
              <PieChart>
                <Pie data={stats.top_startups} dataKey="count" nameKey="name" outerRadius={90}>
                  {stats.top_startups.map((s) => <Cell key={s.name} fill={COLORS[stats.top_startups.indexOf(s) % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {stats.top_startups.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="font-semibold text-slate-900">{s.name}</span>
                </div>
                <span className="text-sm font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
