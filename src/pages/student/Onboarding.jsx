/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
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
import { toast } from "sonner";
import TagPicker from "@/components/TagPicker";

const STEPS = [
  { n: 1, title: "Academic details" },
  { n: 2, title: "Skills & domains" },
  { n: 3, title: "Internship preferences" },
];

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const { profile, refresh } = useAuth();
  const [meta, setMeta] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/meta/constants").then(({ data }) => setMeta(data)); }, []);
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const skip = async () => {
    setBusy(true);
    try {
      const payload = { ...form, is_onboarded: true };
      await api.put("/students/me", payload);
      await refresh();
      toast.success("Profile setup skipped — you can finish it anytime from My Profile.");
      navigate("/student/dashboard");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    setBusy(true);
    try {
      await api.put("/students/me", form);
      await refresh();
      if (step < 3) setStep(step + 1);
      else {
        await api.put("/students/me", { is_onboarded: true });
        toast.success("Welcome to Lerbo Tech! Your internship profile is live.");
        navigate("/student/dashboard");
      }
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <OaxisLogo />
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm text-slate-500">Step {step} of 3</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex items-center gap-3">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= s.n ? "bg-[#D92D20] text-white" : "bg-slate-200 text-slate-500"}`}>{s.n}</div>
              {i < 2 && <div className={`h-0.5 flex-1 ${step > s.n ? "bg-[#D92D20]" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">{STEPS[step - 1].title}</h1>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Label>Full name</Label><Input value={form.full_name || ""} onChange={(e) => update("full_name", e.target.value)} data-testid="onb-full-name" /></div>
              <div><Label>Phone</Label><Input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} placeholder="+91..." /></div>
              <div><Label>City</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
              <div className="md:col-span-2"><Label>College / University</Label><Input value={form.college_name_raw || ""} onChange={(e) => update("college_name_raw", e.target.value)} data-testid="onb-college" /></div>
              <div>
                <Label>Degree</Label>
                <Select value={form.degree || ""} onValueChange={(v) => update("degree", v)}>
                  <SelectTrigger data-testid="onb-degree"><SelectValue placeholder="Choose degree" /></SelectTrigger>
                  <SelectContent>{(meta?.degrees || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={form.department || ""} onValueChange={(v) => update("department", v)}>
                  <SelectTrigger><SelectValue placeholder="Choose department" /></SelectTrigger>
                  <SelectContent>{(meta?.departments || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select value={String(form.year_of_study || "")} onValueChange={(v) => update("year_of_study", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Current year" /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5, 6].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Graduation year</Label><Input type="number" value={form.graduation_year || ""} onChange={(e) => update("graduation_year", Number(e.target.value))} placeholder="2026" /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Skills (add 3+)</Label>
                <div className="mt-1.5">
                  <TagPicker
                    value={form.skills || []}
                    onChange={(v) => update("skills", v)}
                    options={meta?.skills || []}
                    placeholder="React, Python, Data Analysis…"
                    dataTestId="onb-skills"
                    minRecommended={3}
                    labelCount
                    isLoading={!meta}
                  />
                </div>
              </div>
              <div>
                <Label>Domains of interest</Label>
                <div className="mt-1.5">
                  <TagPicker
                    value={form.domains || []}
                    onChange={(v) => update("domains", v)}
                    options={meta?.domains || []}
                    placeholder="Fintech, SaaS…"
                    dataTestId="onb-domains"
                    minRecommended={1}
                    labelCount
                    isLoading={!meta}
                  />
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea rows={3} maxLength={300} value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} placeholder="Tell startups what kind of internship you're looking for in 2-3 lines." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Work mode</Label>
                <Select value={form.work_mode_pref || ""} onValueChange={(v) => update("work_mode_pref", v)}>
                  <SelectTrigger data-testid="onb-work-mode"><SelectValue placeholder="Mode" /></SelectTrigger>
                  <SelectContent>{["remote", "hybrid", "onsite"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected stipend</Label>
                <Select value={form.expected_stipend || ""} onValueChange={(v) => update("expected_stipend", v)}>
                  <SelectTrigger data-testid="onb-stipend"><SelectValue placeholder="Stipend" /></SelectTrigger>
                  <SelectContent>{(meta?.stipend_buckets || []).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Availability</Label>
                <Select value={form.availability || ""} onValueChange={(v) => update("availability", v)}>
                  <SelectTrigger><SelectValue placeholder="When can you start?" /></SelectTrigger>
                  <SelectContent>{["Immediately", "After 1 month", "After exams", "Summer only", "Part-time only"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>LinkedIn URL</Label><Input value={form.linkedin_url || ""} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
              <div><Label>Portfolio URL</Label><Input value={form.portfolio_url || ""} onChange={(e) => update("portfolio_url", e.target.value)} placeholder="https://yoursite.com" /></div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" disabled={step === 1 || busy} onClick={() => setStep(step - 1)} className="w-full sm:w-auto">
              Back
            </Button>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={skip}
                disabled={busy}
                data-testid="onb-skip-button"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/20 dark:text-slate-200 sm:flex-none"
              >
                Skip
              </Button>
              <Button onClick={next} disabled={busy} data-testid="onb-next-button" className="flex-1 bg-[#D92D20] hover:bg-[#B91C1C] sm:flex-none">
                {busy ? "Saving…" : step === 3 ? "Finish" : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
