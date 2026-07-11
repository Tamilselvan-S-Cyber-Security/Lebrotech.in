
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IconBell as Bell, IconActivity as ActivityIcon, IconShieldAlert as ShieldAlert } from "@/components/icons/AppIcons";
import api from "@/lib/api";

const LAST_SEEN_KEY = "oaxis_admin_activity_last_seen";

export default function AdminHeaderBells() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [newActivityCount, setNewActivityCount] = useState(0);

  const loadPending = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setPendingCount((data.pending_students || 0) + (data.pending_startups || 0));
    } catch { /* silent */ }
  }, []);

  const loadActivityCount = useCallback(async () => {
    try {
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      const { data } = await api.get(`/admin/activity?limit=100${lastSeen ? `&since=${encodeURIComponent(lastSeen)}` : ""}`);
      setNewActivityCount(data.count || 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadPending();
    loadActivityCount();
    const iv = setInterval(() => {
      loadPending();
      loadActivityCount();
    }, 20000);
    return () => clearInterval(iv);
  }, [loadPending, loadActivityCount]);

  const openActivity = () => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setNewActivityCount(0);
    navigate("/admin/activity");
  };

  return (
    <>
      {/* Approvals bell */}
      <button
        onClick={() => navigate("/admin/verifications")}
        data-testid="admin-bell-approvals"
        className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
        title="Pending approvals"
      >
        <ShieldAlert className="h-4 w-4" />
        {pendingCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white" data-testid="admin-bell-approvals-count">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        ) : null}
      </button>

      {/* Activity bell */}
      <button
        onClick={openActivity}
        data-testid="admin-bell-activity"
        className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
        title="Activity feed"
      >
        <ActivityIcon className="h-4 w-4" />
        {newActivityCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white" data-testid="admin-bell-activity-count">
            {newActivityCount > 99 ? "99+" : newActivityCount}
          </span>
        ) : null}
      </button>
    </>
  );
}
