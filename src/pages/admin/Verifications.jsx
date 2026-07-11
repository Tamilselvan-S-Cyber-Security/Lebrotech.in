/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resolveAssetUrl } from "@/lib/assets";
import { IconCheck as Check, IconX as X, IconMail, IconPhone, IconMapPin, IconFileText } from "@/components/icons/AppIcons";

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <span><span className="font-medium text-slate-700 dark:text-slate-300">{label}:</span> {value}</span>
    </div>
  );
}

function ProofLink({ item }) {
  const url = resolveAssetUrl(item.proof_url);
  if (!url) {
    return <p className="text-xs font-medium text-amber-700">No proof document uploaded</p>;
  }
  const isImage = String(item.proof_content_type || "").startsWith("image/");
  return (
    <div className="mt-2 space-y-2 rounded-none border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#D92D20] hover:underline"
        data-testid="pending-proof-link"
      >
        <IconFileText className="h-4 w-4" />
        {item.proof_filename || "View proof document"}
      </a>
      {isImage ? (
        <img src={url} alt="Verification proof" className="max-h-40 rounded border border-slate-200 object-contain" />
      ) : null}
    </div>
  );
}

function PendingCard({ item, kind, onAct, detailLink }) {
  const [busy, setBusy] = useState(false);
  const act = async (approve) => {
    setBusy(true);
    try {
      await onAct(kind, item.id, approve);
      toast.success(`${kind} ${approve ? "verified — confirmation email sent" : "rejected — notification email sent"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-none border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5" data-testid={`pending-${kind}-${item.id}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {item.full_name || item.name || "Unnamed"}
            </h4>
            <span className="rounded-none bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">Pending</span>
          </div>
          <DetailRow icon={IconMail} label="Email" value={item.email} />
          <DetailRow icon={IconPhone} label="Phone" value={item.phone || item.founder_phone || item.placement_phone} />
          <DetailRow icon={IconMapPin} label="City" value={item.city} />
          {kind === "student" && (
            <>
              <DetailRow icon={IconMapPin} label="College" value={item.college_name_raw} />
              <p className="text-sm text-slate-500">{item.degree || "Degree not set"} · {item.department || "Dept not set"}</p>
            </>
          )}
          {kind === "startup" && (
            <>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Startup: {item.name || "—"}</p>
              <p className="text-sm text-slate-500">Founder: {item.founder_name || "—"}</p>
              <p className="text-sm text-slate-500">{item.industry || "Industry not set"} · {item.stage || "Stage not set"} · Website: {item.website || "—"}</p>
              {item.selected_plan_name ? (
                <p className="text-sm text-slate-500">Selected plan: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.selected_plan_name}</span></p>
              ) : null}
              <ProofLink item={item} />
            </>
          )}
          {kind === "institution" && (
            <>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Institution: {item.name || "—"}</p>
              <p className="text-sm text-slate-500">Placement officer: {item.placement_officer || "—"}</p>
              <p className="text-sm text-slate-500">{item.type || "Type not set"} · {item.state || item.city || ""}</p>
              {item.selected_plan_name ? (
                <p className="text-sm text-slate-500">Selected plan: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.selected_plan_name}</span></p>
              ) : null}
              <ProofLink item={item} />
            </>
          )}
          {item.registered_at ? (
            <p className="text-xs text-slate-400">Registered {new Date(item.registered_at).toLocaleString("en-IN")}</p>
          ) : null}
          {detailLink ? (
            <Link to={detailLink} className="inline-block text-xs font-semibold text-[#D92D20] hover:underline">View full profile →</Link>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => act(false)} data-testid={`reject-${kind}-${item.id}`}>
            <X className="mr-1 h-3 w-3" /> Reject
          </Button>
          <Button size="sm" className="bg-[#D92D20] hover:bg-[#B91C1C]" disabled={busy} onClick={() => act(true)} data-testid={`approve-${kind}-${item.id}`}>
            <Check className="mr-1 h-3 w-3" /> Verify & approve
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVerifications() {
  const [pending, setPending] = useState({ students: [], startups: [], institutions: [] });

  const load = () => api.get("/admin/pending").then(({ data }) => setPending(data));
  useEffect(() => { load(); }, []);

  const act = async (kind, id, approve) => {
    await api.post(`/admin/verify-${kind}/${id}`, { approve });
    load();
  };

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Verifications">
      <p className="mb-8 text-sm text-slate-600 dark:text-slate-400">
        Review new student, startup, and institution registrations. Approving or rejecting sends an email notification automatically.
      </p>

      <Section title="Startups awaiting verification" count={pending.startups.length}>
        {pending.startups.map((s) => (
          <PendingCard key={s.id} item={s} kind="startup" onAct={act} detailLink={`/admin/startups/${s.id}`} />
        ))}
      </Section>

      <Section title="Students awaiting approval" count={pending.students.length}>
        {pending.students.map((s) => (
          <PendingCard key={s.id} item={s} kind="student" onAct={act} detailLink={`/admin/students/${s.id}`} />
        ))}
      </Section>

      <Section title="Institutions awaiting verification" count={pending.institutions.length}>
        {pending.institutions.map((s) => (
          <PendingCard key={s.id} item={s} kind="institution" onAct={act} detailLink={`/admin/institutions/${s.id}`} />
        ))}
      </Section>
    </DashboardLayout>
  );
}

function Section({ title, count, children }) {
  const items = React.Children.toArray(children);
  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <span className="rounded-none bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">{count}</span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-none border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/20">
          All clear — no pending items.
        </div>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}
