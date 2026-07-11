/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STARTUP_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import OpportunityImage, { normalizeImageUrl } from "@/components/OpportunityImage";

const today = () => new Date().toISOString().split("T")[0];

export default function StartupPostOpportunity() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "internship", department: "", domain: "", duration: "3 months",
    mode: "remote", city: "", stipend_range: "₹10-20K", skills_required: [],
    description: "", perks: [], eligibility_years: [], eligibility_degrees: [],
    openings: 1, deadline: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    apply_method: "platform", apply_link: "", image_url: "",
  });

  useEffect(() => { api.get("/meta/constants").then(({ data }) => setMeta(data)); }, []);

  const update = (k, v) => setForm({ ...form, [k]: v });
  const toggle = (k, val) => {
    const list = form[k] || [];
    update(k, list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.skills_required.length || !form.deadline) {
      toast.error("Fill in title, description, skills and deadline");
      return;
    }
    if (form.image_url?.trim() && !normalizeImageUrl(form.image_url)) {
      toast.error("Enter a valid image URL (https://...)");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        type: "internship",
        deadline: new Date(form.deadline).toISOString(),
        image_url: normalizeImageUrl(form.image_url),
      };
      const { data } = await api.post("/opportunities", payload);
      toast.success("Posted! Your internship is now live.");
      navigate(`/startup/applicants/${data.id}`);
    } catch (err) { toast.error(formatApiError(err)); }
    finally { setBusy(false); }
  };

  const previewUrl = normalizeImageUrl(form.image_url);

  return (
    <DashboardLayout nav={STARTUP_NAV} title="Post an Internship">
      <form onSubmit={submit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Internship basics</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Label>Internship title</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., Frontend Developer Intern" data-testid="post-title" required /></div>
            <div>
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => update("department", v)}>
                <SelectTrigger data-testid="post-department"><SelectValue placeholder="e.g. Cyber Security" /></SelectTrigger>
                <SelectContent>
                  {(meta?.opportunity_departments || meta?.departments || []).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Domain</Label>
              <Select value={form.domain} onValueChange={(v) => update("domain", v)}>
                <SelectTrigger data-testid="post-domain"><SelectValue placeholder="e.g. Ethical Hacking" /></SelectTrigger>
                <SelectContent>{(meta?.domains || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration</Label>
              <Select value={form.duration} onValueChange={(v) => update("duration", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(meta?.durations || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Work mode</Label>
              <Select value={form.mode} onValueChange={(v) => update("mode", v)}>
                <SelectTrigger data-testid="post-mode"><SelectValue /></SelectTrigger>
                <SelectContent>{["remote", "hybrid", "onsite"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.mode !== "remote" && <div><Label>City</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g., Bengaluru" /></div>}
            <div>
              <Label>Stipend</Label>
              <Select value={form.stipend_range} onValueChange={(v) => update("stipend_range", v)}>
                <SelectTrigger data-testid="post-stipend"><SelectValue /></SelectTrigger>
                <SelectContent>{(meta?.stipend_buckets || []).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Number of openings</Label><Input type="number" min={1} value={form.openings} onChange={(e) => update("openings", Number(e.target.value))} /></div>
            <div><Label>Application deadline</Label><Input type="date" min={today()} value={form.deadline} onChange={(e) => update("deadline", e.target.value)} data-testid="post-deadline" /></div>
            <div className="md:col-span-2">
              <Label>Cover image URL <span className="font-normal text-slate-500">(optional)</span></Label>
              <Input
                value={form.image_url}
                onChange={(e) => update("image_url", e.target.value)}
                placeholder="https://example.com/internship-banner.jpg"
                data-testid="post-image-url"
              />
              <p className="mt-1 text-xs text-slate-500">Paste a public image link (PNG/JPG/WEBP). Shown on /opportunities cards.</p>
              {previewUrl ? (
                <OpportunityImage src={previewUrl} alt="Cover preview" className="mt-3 h-40 w-full rounded-xl border border-slate-200" />
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Description & requirements</h3>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Internship description</Label>
              <Textarea rows={6} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What will the intern work on? Stack, mentor, outcomes, learning..." data-testid="post-description" />
            </div>
            <div>
              <Label>Skills required (comma-separated)</Label>
              <Input
                value={form.skills_required.join(", ")}
                onChange={(e) => update("skills_required", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="React, TypeScript"
                data-testid="post-skills"
              />
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {(meta?.skills || [])
                  .filter((s) => /hack|security|test|qa|nmap|burp|owasp|selenium|cypress|penetrat|kali|splunk|ceh/i.test(s) || ["React", "Python", "Linux", "AWS", "SQL"].includes(s))
                  .slice(0, 16)
                  .map((s) => (
                  <button type="button" key={s} onClick={() => { if (!form.skills_required.includes(s)) update("skills_required", [...form.skills_required, s]); }} className="rounded-none border border-slate-200 bg-white px-1.5 py-0.5 hover:bg-slate-50">+ {s}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Perks</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {(meta?.perks || []).map((p) => (
                  <label key={p} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox checked={form.perks.includes(p)} onCheckedChange={() => toggle("perks", p)} /> {p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Eligible years</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <label key={y} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox checked={form.eligibility_years.includes(y)} onCheckedChange={() => toggle("eligibility_years", y)} /> Year {y}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Eligible degrees</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {(meta?.degrees || []).map((d) => (
                  <label key={d} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox checked={form.eligibility_degrees.includes(d)} onCheckedChange={() => toggle("eligibility_degrees", d)} /> {d}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/startup/opportunities")}>Cancel</Button>
          <Button type="submit" disabled={busy} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="post-submit">{busy ? "Posting…" : "Post internship"}</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
