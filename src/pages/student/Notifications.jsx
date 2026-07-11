/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { navForRole } from "@/lib/roles";
import api from "@/lib/api";
import { IconBell as Bell, IconCheckCheck as CheckCheck } from "@/components/icons/AppIcons";
import { Button } from "@/components/ui/button";

export default function StudentNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const nav = navForRole(user?.role);

  const load = () => api.get("/notifications").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  const markAll = async () => { await api.post("/notifications/read-all"); load(); };

  return (
    <DashboardLayout nav={nav} title="Notifications">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {user?.role === "startup"
            ? "Updates on applicants, internships, and billing."
            : user?.role === "institution"
              ? "Updates on students, referrals, and your campus dashboard."
              : "All updates from startups, applications and the platform."}
        </p>
        <Button variant="outline" onClick={markAll} data-testid="notif-mark-all"><CheckCheck className="mr-2 h-4 w-4" /> Mark all read</Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {items.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500"><Bell className="mx-auto mb-3 h-10 w-10 text-slate-700 dark:text-slate-300" />No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 p-4 ${n.is_read ? "" : "bg-rose-50/40"}`}>
                <div className={`mt-1 h-2 w-2 rounded-full ${n.is_read ? "bg-slate-300" : "bg-[#D92D20]"}`} />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  <div className="text-sm text-slate-600">{n.body}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{n.created_at?.split("T")[0]}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
