/* eslint-disable react/no-unescaped-entities */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { downloadEnquiriesCsv } from "@/lib/downloads";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IconDownload as Download, IconRefreshCw as RefreshCw, IconMail as Mail, IconPhone as Phone, IconMessageSquare as MessageSquare, IconInbox as Inbox } from "@/components/icons/AppIcons";
import { toast } from "sonner";

const USER_TYPES = ["all", "student", "startup", "institution", "other"];
const STATUSES = ["all", "new", "in_progress", "resolved"];

const STATUS_STYLES = {
  new: "bg-rose-100 text-rose-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
};
const STATUS_LABELS = { new: "New", in_progress: "In Progress", resolved: "Resolved" };

function fmt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }) + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminEnquiries() {
  const [data, setData] = useState({ items: [], stats: { total: 0, new: 0, in_progress: 0, resolved: 0 } });
  const [loading, setLoading] = useState(true);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [responseDraft, setResponseDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("new");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (userTypeFilter !== "all") params.user_type = userTypeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      const { data: resp } = await api.get("/admin/enquiries", { params });
      setData(resp);
    } catch {
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, [userTypeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openItem = (item) => {
    setSelected(item);
    setResponseDraft(item.admin_response || "");
    setStatusDraft(item.status || "new");
  };

  const closeItem = () => {
    setSelected(null);
    setResponseDraft("");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.patch(`/admin/enquiries/${selected.id}`, {
        status: statusDraft,
        admin_response: responseDraft,
      });
      toast.success("Enquiry updated");
      await load();
      closeItem();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const downloadCsv = () => {
    downloadEnquiriesCsv(data.items);
  };

  const tiles = useMemo(() => [
    { l: "Total", v: data.stats.total, c: "bg-slate-100 text-slate-700", icon: Inbox },
    { l: "New", v: data.stats.new, c: "bg-rose-100 text-rose-700", icon: Mail },
    { l: "In Progress", v: data.stats.in_progress, c: "bg-amber-100 text-amber-700", icon: MessageSquare },
    { l: "Resolved", v: data.stats.resolved, c: "bg-emerald-100 text-emerald-700", icon: RefreshCw },
  ], [data.stats]);

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Support & Enquiries">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.l} data-testid={`enquiries-stat-${t.l.toLowerCase().replace(/\s/g, "-")}`} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${t.c}`}>
              <t.icon className="h-4 w-4" />
            </div>
            <div className="font-display text-3xl font-extrabold text-slate-900">{t.v}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.l}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">User Type</span>
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className="h-9 w-[160px]" data-testid="filter-user-type"><SelectValue /></SelectTrigger>
            <SelectContent>{USER_TYPES.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
          <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[160px]" data-testid="filter-status"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All" : STATUS_LABELS[s] || s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} data-testid="refresh-enquiries"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          <Button onClick={downloadCsv} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="export-enquiries-csv"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading enquiries…</div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500" data-testid="enquiries-empty">No enquiries match these filters.</div>
        ) : (
          <ul className="divide-y divide-slate-200" data-testid="enquiries-list">
            {data.items.map((it) => (
              <li key={it.id} className="flex flex-col gap-3 p-5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{it.full_name}</span>
                    <Badge className={STATUS_STYLES[it.status] || "bg-slate-100 text-slate-700"}>{STATUS_LABELS[it.status] || it.status}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{it.user_type}</Badge>
                  </div>
                  <div className="mt-1 truncate text-sm font-medium text-slate-700">{it.subject}</div>
                  <div className="mt-1 line-clamp-1 text-xs text-slate-500">{it.message}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {it.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {it.mobile}</span>
                    <span>· {fmt(it.created_at)}</span>
                  </div>
                </div>
                <Button onClick={() => openItem(it)} variant="outline" data-testid={`view-enquiry-${it.id}`}>View / Respond</Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && closeItem()}>
        <DialogContent className="max-w-2xl" data-testid="enquiry-detail-dialog">
          <DialogHeader>
            <DialogTitle>Enquiry from {selected?.full_name}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</div>{selected.email}</div>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mobile</div>{selected.mobile}</div>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-slate-500">User Type</div>{selected.user_type}</div>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted</div>{fmt(selected.created_at)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</div>
                <div className="text-sm font-semibold text-slate-900">{selected.subject}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Message</div>
                <div className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{selected.message}</div>
              </div>

              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Internal status</div>
                <Select value={statusDraft} onValueChange={setStatusDraft}>
                  <SelectTrigger className="w-full" data-testid="enquiry-status-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Admin response (internal record)</div>
                <Textarea
                  rows={4}
                  placeholder="Notes / what we replied via email..."
                  value={responseDraft}
                  onChange={(e) => setResponseDraft(e.target.value)}
                  data-testid="enquiry-response-input"
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={closeItem}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="enquiry-save-btn">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
