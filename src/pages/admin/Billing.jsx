/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  IconIndianRupee as IndianRupee, IconShieldCheck as ShieldCheck, IconClock as Clock, IconX as X, IconRefreshCw as RefreshCw, IconMail as Mail, IconExternalLink as ExternalLink, IconBuilding2 as Building2,
} from "@/components/icons/AppIcons";
import { toast } from "sonner";
import { ALL_PLANS } from "@/lib/plans";
import PlanDetailsDialog from "@/components/PlanDetailsDialog";

function fmt(iso) { if (!iso) return "—"; const d = new Date(iso); return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }

const STATUS_STYLES = {
  initiated: "bg-slate-100 text-slate-700",
  pending_verification: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function AdminBilling() {
  const [data, setData] = useState({ items: [], stats: { total: 0, initiated: 0, pending_verification: 0, approved: 0, rejected: 0, revenue_inr: 0 } });
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [planStats, setPlanStats] = useState([]);
  const [planDetails, setPlanDetails] = useState(null);

  const load = useCallback(async () => {
    const url = filterStatus ? `/admin/billing/attempts?status=${filterStatus}` : "/admin/billing/attempts";
    try {
      const { data: d } = await api.get(url);
      setData(d);
    } catch { /* silent */ }
  }, [filterStatus]);

  const loadEnq = useCallback(async () => {
    try {
      const { data: d } = await api.get("/admin/billing/enterprise-enquiries");
      setEnquiries(d);
    } catch { /* silent */ }
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const { data: d } = await api.get("/admin/billing/plans");
      setPlanStats(d);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); loadEnq(); loadPlans(); }, [load, loadEnq, loadPlans]);

  const open = (item) => { setSelected(item); setNote(""); };
  const close = () => { setSelected(null); setNote(""); };

  const verify = async (action) => {
    if (!selected) return;
    setBusy(true);
    try {
      await api.patch(`/admin/billing/attempts/${selected.id}/verify`, { action, note: note || undefined });
      toast.success(action === "approve" ? "Plan activated for user" : "Payment marked as rejected");
      close();
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const tiles = [
    { l: "Total attempts", v: data.stats.total, c: "bg-slate-100 text-slate-700", icon: IndianRupee },
    { l: "Pending verification", v: data.stats.pending_verification, c: "bg-amber-100 text-amber-700", icon: Clock },
    { l: "Active subscriptions", v: data.stats.approved, c: "bg-emerald-100 text-emerald-700", icon: ShieldCheck },
    { l: "Revenue (₹)", v: data.stats.revenue_inr?.toLocaleString("en-IN"), c: "bg-rose-100 text-rose-700", icon: IndianRupee },
  ];

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Billing & Subscriptions">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="billing-stats">
        {tiles.map((t) => (
          <div key={t.l} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${t.c}`}>
              <t.icon className="h-4 w-4" />
            </div>
            <div className="font-display text-3xl font-extrabold text-slate-900">{t.v ?? 0}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.l}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="attempts" className="mt-6">
        <TabsList>
          <TabsTrigger value="attempts" data-testid="tab-attempts">Payment attempts</TabsTrigger>
          <TabsTrigger value="plans" data-testid="tab-plans">Plan catalogue</TabsTrigger>
          <TabsTrigger value="enterprise" data-testid="tab-enterprise">Enterprise enquiries ({enquiries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="attempts" className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter</span>
            {["", "pending_verification", "approved", "rejected", "initiated"].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setFilterStatus(s)}
                data-testid={`filter-${s || "all"}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${filterStatus === s ? "border-rose-600 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {s ? s.replace("_", " ") : "All"}
              </button>
            ))}
            <button onClick={load} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"><RefreshCw className="h-3 w-3" /> Refresh</button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500" data-testid="attempts-empty">No payment attempts match this filter.</td></tr>
                ) : data.items.map((a) => (
                  <tr key={a.id} data-testid={`attempt-row-${a.id}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{a.user_email || "—"}<div className="text-xs font-normal capitalize text-slate-500">{a.user_role || "—"}</div></td>
                    <td className="px-4 py-3 text-slate-700">{a.plan_name}<div className="font-mono text-[10px] text-slate-400">{a.plan_id}</div></td>
                    <td className="px-4 py-3 font-mono text-sm">₹{(a.amount_inr ?? 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3"><Badge className={`${STATUS_STYLES[a.status] || "bg-slate-100 text-slate-700"} text-[10px]`}>{a.status.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmt(a.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {a.status === "pending_verification" ? (
                        <Button size="sm" onClick={() => open(a)} data-testid={`verify-attempt-${a.id}`} className="bg-[#D92D20] hover:bg-[#B91C1C]">Verify</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => open(a)}>View</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-600">All subscription plans, Razorpay links, and payment stats.</p>
            <button type="button" onClick={loadPlans} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Audience</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Attempts</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_PLANS.map((catalogue) => {
                  const p = planStats.find((row) => row.id === catalogue.id);
                  return (
                    <tr key={catalogue.id} data-testid={`plan-row-${catalogue.id}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{catalogue.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{catalogue.id}</div>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700">{catalogue.audience}</td>
                      <td className="px-4 py-3 font-mono">{catalogue.price}{catalogue.suffix || ""}</td>
                      <td className="px-4 py-3 text-slate-600">{catalogue.period || p?.period?.replace("_", " ") || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">{p?.attempts_total ?? 0}</span> total
                        {(p?.attempts_pending ?? 0) > 0 ? <span className="ml-2 text-amber-700">· {p.attempts_pending} pending</span> : null}
                        {(p?.attempts_approved ?? 0) > 0 ? <span className="ml-2 text-emerald-700">· {p.attempts_approved} approved</span> : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`view-plan-${catalogue.id}`}
                          onClick={() => setPlanDetails({
                            ...catalogue,
                            razorpayLink: catalogue.razorpayLink || p?.razorpay_link || null,
                            stats: {
                              attempts_total: p?.attempts_total ?? 0,
                              attempts_approved: p?.attempts_approved ?? 0,
                            },
                          })}
                        >
                          View details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="enterprise" className="mt-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {enquiries.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500" data-testid="enterprise-empty">No enterprise enquiries yet.</div>
            ) : (
              <ul className="divide-y divide-slate-100" data-testid="enterprise-list">
                {enquiries.map((e) => (
                  <li key={e.id} className="p-5 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          <span className="font-semibold text-slate-900">{e.institution_name}</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{e.contact_person} · {e.designation || "—"}</div>
                        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                          <span><Mail className="mr-1 inline h-3 w-3" /> {e.email}</span>
                          <span>📱 {e.mobile}</span>
                          {e.num_campuses ? <span>🏫 {e.num_campuses} campuses</span> : null}
                          {e.num_students ? <span>👥 {e.num_students} students</span> : null}
                          {e.current_erp ? <span>ERP: {e.current_erp}</span> : null}
                        </div>
                        {e.notes ? <div className="mt-2 line-clamp-2 text-sm text-slate-700">{e.notes}</div> : null}
                      </div>
                      <a href={`mailto:${e.email}`} className="btn-link border-slate-200 text-xs text-slate-700 hover:bg-slate-50">
                        Reply <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-400">{fmt(e.created_at)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && close()}>
        <DialogContent data-testid="attempt-detail-dialog">
          <DialogHeader><DialogTitle>{selected?.plan_name}</DialogTitle></DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs uppercase tracking-wider text-slate-500">User</div><div className="font-medium">{selected.user_email || "—"}</div></div>
                <div><div className="text-xs uppercase tracking-wider text-slate-500">Role</div><div className="capitalize">{selected.user_role || "—"}</div></div>
                <div><div className="text-xs uppercase tracking-wider text-slate-500">Plan ID</div><div className="font-mono text-xs">{selected.plan_id || "—"}</div></div>
                <div><div className="text-xs uppercase tracking-wider text-slate-500">Amount</div><div>₹{(selected.amount_inr ?? 0).toLocaleString("en-IN")}</div></div>
                <div><div className="text-xs uppercase tracking-wider text-slate-500">Status</div><Badge className={STATUS_STYLES[selected.status]}>{selected.status.replace(/_/g, " ")}</Badge></div>
                <div><div className="text-xs uppercase tracking-wider text-slate-500">Created</div><div>{fmt(selected.created_at)}</div></div>
                {selected.confirmed_at ? <div><div className="text-xs uppercase tracking-wider text-slate-500">Confirmed</div><div>{fmt(selected.confirmed_at)}</div></div> : null}
                {selected.verified_at ? <div><div className="text-xs uppercase tracking-wider text-slate-500">Verified</div><div>{fmt(selected.verified_at)}</div></div> : null}
                {selected.plan_period ? <div><div className="text-xs uppercase tracking-wider text-slate-500">Billing period</div><div>{selected.plan_period.replace("_", " ")}</div></div> : null}
                {selected.plan_tier ? <div><div className="text-xs uppercase tracking-wider text-slate-500">Tier</div><div>{selected.plan_tier}</div></div> : null}
                {selected.payment_reference ? (
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wider text-slate-500">Razorpay reference</div>
                    <span className="font-mono text-xs">{selected.payment_reference}</span>
                  </div>
                ) : null}
                {selected.admin_note ? (
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wider text-slate-500">Admin note</div>
                    {selected.admin_note}
                  </div>
                ) : null}
              </div>
              {selected.razorpay_link ? (
                <a href={selected.razorpay_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline">
                  Open Razorpay payment link <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
              {selected.status === "pending_verification" ? (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Note (optional)</div>
                  <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for rejection or verification reference..." data-testid="verify-note" />
                </div>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            {selected?.status === "pending_verification" ? (
              <>
                <Button variant="outline" onClick={() => verify("reject")} disabled={busy} data-testid="verify-reject"><X className="mr-1 h-4 w-4" /> Reject</Button>
                <Button onClick={() => verify("approve")} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700" data-testid="verify-approve"><ShieldCheck className="mr-1 h-4 w-4" /> Approve & Activate</Button>
              </>
            ) : (
              <Button variant="outline" onClick={close}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PlanDetailsDialog
        plan={planDetails}
        open={Boolean(planDetails)}
        onOpenChange={(open) => !open && setPlanDetails(null)}
        showAdminFields
      />
    </DashboardLayout>
  );
}
