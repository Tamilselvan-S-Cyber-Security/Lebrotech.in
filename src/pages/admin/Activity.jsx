/* eslint-disable react/no-unescaped-entities */
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import ActivityFeed from "@/components/ActivityFeed";

export default function AdminActivity() {
  return (
    <DashboardLayout nav={ADMIN_NAV} title="Platform activity">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm text-slate-500">A live feed of everything happening on Lerbo Tech — signups, internships, applications, status changes, messages, and support enquiries. Auto-refreshes every 15 seconds.</p>
        <ActivityFeed limit={100} refreshIntervalMs={15000} />
      </div>
    </DashboardLayout>
  );
}
