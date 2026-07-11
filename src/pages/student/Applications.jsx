/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STUDENT_NAV } from "@/lib/nav";
import api from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { v: "all", label: "All" },
  { v: "applied", label: "Applied" },
  { v: "shortlisted", label: "Shortlisted" },
  { v: "interview", label: "Interview" },
  { v: "offer", label: "Offers" },
  { v: "rejected", label: "Rejected" },
];

export default function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState("all");

  useEffect(() => { api.get("/applications/me").then(({ data }) => setApps(data)); }, []);

  const filtered = tab === "all" ? apps : apps.filter((a) => (tab === "shortlisted" ? ["shortlisted", "interview", "offer", "hired"].includes(a.status) : a.status === tab));

  return (
    <DashboardLayout nav={STUDENT_NAV} title="My Applications">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.v} value={t.v} data-testid={`app-tab-${t.v}`}>{t.label} {tab === t.v && `(${filtered.length})`}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab}>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Startup</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} data-testid={`application-row-${a.id}`} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <Link to={`/student/opportunities/${a.opportunity_id}`} className="font-semibold text-slate-900 hover:underline">{a.opportunity_title}</Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{a.startup_name}</td>
                    <td className="px-4 py-4 text-slate-500">{a.applied_at?.split("T")[0]}</td>
                    <td className="px-4 py-4"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">No applications in this stage.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
