/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import OaxisLogo from "@/components/OaxisLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const PENDING_PLAN_KEY = "pending_plan_id";

export default function StartupOnboarding() {
  const navigate = useNavigate();
  const { profile, refresh } = useAuth();
  const [meta, setMeta] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/meta/constants").then(({ data }) => setMeta(data)); }, []);
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const next = async () => {
    setBusy(true);
    try {
      await api.put("/startups/me", form);
      await refresh();
      if (step < 2) setStep(2);
      else {
        await api.put("/startups/me", { is_onboarded: true });
        toast.success("Startup profile saved. Ready to post your first internship.");
        sessionStorage.removeItem(PENDING_PLAN_KEY);
        navigate("/startup/dashboard");
      }
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"><OaxisLogo /><div className="text-sm text-slate-500">Step {step} of 2</div></div></header>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">{step === 1 ? "Startup details" : "Founder & contact"}</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8">
          {step === 1 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Label>Startup name</Label><Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} data-testid="onb-startup-name" /></div>
              <div><Label>Website</Label><Input value={form.website || ""} onChange={(e) => update("website", e.target.value)} placeholder="https://..." /></div>
              <div>
                <Label>Industry</Label>
                <Select value={form.industry || ""} onValueChange={(v) => update("industry", v)}>
                  <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
                  <SelectContent>{(meta?.domains || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stage</Label>
                <Select value={form.stage || ""} onValueChange={(v) => update("stage", v)}>
                  <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
                  <SelectContent>{(meta?.startup_stages || []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Team size</Label>
                <Select value={form.team_size || ""} onValueChange={(v) => update("team_size", v)}>
                  <SelectTrigger><SelectValue placeholder="Team size" /></SelectTrigger>
                  <SelectContent>{(meta?.team_sizes || []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>HQ City</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
              <div><Label>HQ State</Label><Input value={form.state || ""} onChange={(e) => update("state", e.target.value)} /></div>
              <div className="md:col-span-2"><Label>Elevator pitch (max 500 chars)</Label><Textarea rows={4} maxLength={500} value={form.description || ""} onChange={(e) => update("description", e.target.value)} /></div>
              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <Checkbox checked={!!form.dpiit_recognized} onCheckedChange={(v) => update("dpiit_recognized", !!v)} /> DPIIT recognized
                </label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Label>Founder full name</Label><Input value={form.founder_name || ""} onChange={(e) => update("founder_name", e.target.value)} data-testid="onb-founder-name" /></div>
              <div className="md:col-span-2"><Label>Founder LinkedIn</Label><Input value={form.founder_linkedin || ""} onChange={(e) => update("founder_linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
            </div>
          )}
          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button>
            <Button onClick={next} disabled={busy} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="onb-startup-next">{busy ? "Saving…" : step === 2 ? "Finish" : "Continue"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
