/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STARTUP_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IconArrowLeft as ArrowLeft, IconGripVertical as GripVertical, IconUsers as Users } from "@/components/icons/AppIcons";
import { toast } from "sonner";

const STAGES = [
  { key: "applied", label: "Applied" },
  { key: "reviewed", label: "Reviewed" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

const STAGE_COLORS = {
  applied: "bg-slate-400",
  reviewed: "bg-sky-500",
  shortlisted: "bg-amber-500",
  interview: "bg-violet-500",
  offer: "bg-emerald-500",
  hired: "bg-emerald-600",
  rejected: "bg-rose-500",
};

export default function StartupApplicants() {
  const { oppId } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [apps, setApps] = useState([]);
  const [dragging, setDragging] = useState(null);

  const load = () => {
    api.get(`/opportunities/${oppId}`).then(({ data }) => setOpp(data));
    api.get(`/opportunities/${oppId}/applicants`).then(({ data }) => setApps(data));
  };
  useEffect(() => { load(); }, [oppId]);

  const move = async (appId, newStatus) => {
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      toast.success("Pipeline updated");
    } catch (e) {
      toast.error(formatApiError(e));
      load();
    }
  };

  return (
    <DashboardLayout nav={STARTUP_NAV} title={opp ? `Applicants — ${opp.title}` : "Applicants"}>
      <Link to="/startup/opportunities" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to internships</Link>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600 inline-flex items-center gap-2"><Users className="h-4 w-4" /> {apps.length} applicants · drag cards across stages</div>
      </div>

      <div className="mt-6 -mx-2 flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const items = apps.filter((a) => a.status === stage.key);
          return (
            <div
              key={stage.key}
              data-testid={`kanban-column-${stage.key}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragging) { move(dragging, stage.key); setDragging(null); } }}
              className="w-72 shrink-0 rounded-2xl bg-slate-50/70 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className={`inline-block h-2 w-2 rounded-full ${STAGE_COLORS[stage.key]}`} />
                  {stage.label}
                </div>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((a) => (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={() => setDragging(a.id)}
                    data-testid={`applicant-card-${a.id}`}
                    className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-slate-900 text-xs text-white">{a.student_name?.[0]}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-900">{a.student_name}</div>
                        <div className="truncate text-xs text-slate-500">{a.applied_at?.split("T")[0]}</div>
                      </div>
                      <GripVertical className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </div>
                    {a.cover_note && <div className="mt-2 line-clamp-2 text-xs text-slate-600">"{a.cover_note}"</div>}
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => navigate(`/startup/candidate/${a.student_id}`)} className="text-xs font-semibold text-[#D92D20] hover:underline">View profile</button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-600 dark:text-slate-400">Drop here</div>}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
