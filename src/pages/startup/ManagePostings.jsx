/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect, react-hooks/purity */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STARTUP_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { IconEye as Eye, IconUsers as Users, IconFilePlus as FilePlus } from "@/components/icons/AppIcons";

export default function StartupManagePostings() {
  const { profile } = useAuth();
  const [postings, setPostings] = useState([]);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    if (!profile?.id) return;
    api.get(`/opportunities?startup_id=${profile.id}&status=&limit=200`).then(({ data }) => setPostings(data));
    api.get("/applications/me").then(({ data }) => setApps(data));
  }, [profile?.id]);

  const countFor = (oppId) => apps.filter((a) => a.opportunity_id === oppId).length;

  const toggle = async (oppId, current) => {
    const ns = current === "active" ? "paused" : "active";
    await api.patch(`/opportunities/${oppId}/status`, { status: ns });
    setPostings((p) => p.map((x) => (x.id === oppId ? { ...x, status: ns } : x)));
  };

  return (
    <DashboardLayout nav={STARTUP_NAV} title="Manage Internships">
      <div className="mb-6 flex justify-end">
        <Link to="/startup/post"><Button className="bg-[#D92D20] hover:bg-[#B91C1C]"><FilePlus className="mr-2 h-4 w-4" /> Post new internship</Button></Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Internship</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Applicants</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {postings.map((p) => (
              <tr key={p.id} data-testid={`posting-row-${p.id}`}>
                <td className="px-4 py-3 font-semibold text-slate-900">{p.title}</td>
                <td className="px-4 py-3 text-slate-600">{p.domain}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-slate-700"><Users className="mr-1 inline h-3 w-3" /> {countFor(p.id)}</td>
                <td className="px-4 py-3 text-slate-500"><Eye className="mr-1 inline h-3 w-3" /> {p.view_count}</td>
                <td className="px-4 py-3 text-slate-500">{p.deadline?.split("T")[0]}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/startup/applicants/${p.id}`} data-testid={`posting-view-${p.id}`} className="mr-3 text-sm font-semibold text-[#D92D20] hover:underline">View applicants</Link>
                  <button onClick={() => toggle(p.id, p.status)} className="text-xs font-semibold text-slate-600 hover:underline">{p.status === "active" ? "Pause" : "Activate"}</button>
                </td>
              </tr>
            ))}
            {postings.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center text-sm text-slate-500">No internships posted yet. Click "Post new internship" to publish your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
