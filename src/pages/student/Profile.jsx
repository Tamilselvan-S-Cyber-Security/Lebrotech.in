/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STUDENT_NAV } from "@/lib/nav";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/assets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { IconUpload as Upload, IconFileText as FileText } from "@/components/icons/AppIcons";
import TagPicker from "@/components/TagPicker";

export default function StudentProfile() {
  const { profile, refresh, user } = useAuth();
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const photoRef = useRef();
  const resumeRef = useRef();

  useEffect(() => { api.get("/meta/constants").then(({ data }) => setMeta(data)); }, []);
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const save = async (e) => {
    e?.preventDefault();
    setBusy(true);
    try {
      await api.put("/students/me", form);
      toast.success("Profile saved");
      await refresh();
    } catch (err) { toast.error(formatApiError(err)); }
    finally { setBusy(false); }
  };

  const uploadPhoto = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/uploads/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Photo updated");
      await refresh();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  const uploadResume = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/uploads/resume", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Resume uploaded");
      await refresh();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  const photoSrc = resolveAssetUrl(profile?.photo_url);

  return (
    <DashboardLayout nav={STUDENT_NAV} title="Edit Profile">
      <form onSubmit={save} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Photo & Resume</h3>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {photoSrc && <AvatarImage src={photoSrc} />}
                <AvatarFallback className="bg-slate-900 text-xl font-bold text-white">{(form.full_name || "S")[0]}</AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" onClick={() => photoRef.current?.click()} data-testid="profile-upload-photo"><Upload className="mr-2 h-4 w-4" /> Upload photo</Button>
                <input type="file" accept="image/*" ref={photoRef} className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
                <div className="mt-1 text-xs text-slate-500">PNG, JPG · Max 3MB</div>
              </div>
            </div>
            <div className="flex items-center gap-4 lg:ml-auto">
              {profile?.resume_url ? (
                <a href={resolveAssetUrl(profile.resume_url)} target="_blank" rel="noreferrer" className="btn-link border-slate-200 bg-slate-50 text-slate-700">
                  <FileText className="h-4 w-4" /> Resume on file
                </a>
              ) : <span className="text-sm text-slate-500">No resume uploaded</span>}
              <Button type="button" variant="outline" onClick={() => resumeRef.current?.click()} data-testid="profile-upload-resume"><Upload className="mr-2 h-4 w-4" /> Upload resume (PDF)</Button>
              <input type="file" accept="application/pdf" ref={resumeRef} className="hidden" onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Basic info</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><Label>Full name</Label><Input value={form.full_name || ""} onChange={(e) => update("full_name", e.target.value)} data-testid="profile-full-name" /></div>
            <div><Label>Phone</Label><Input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} data-testid="profile-phone" /></div>
            <div><Label>City</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
            <div><Label>Bio</Label><Textarea rows={2} value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} maxLength={300} placeholder="Tell startups what kind of internship you're looking for…" /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Academic details</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><Label>College / University</Label><Input value={form.college_name_raw || ""} onChange={(e) => update("college_name_raw", e.target.value)} placeholder="Type your college name" /></div>
            <div>
              <Label>Degree</Label>
              <Select value={form.degree || ""} onValueChange={(v) => update("degree", v)}>
                <SelectTrigger data-testid="profile-degree"><SelectValue placeholder="Choose degree" /></SelectTrigger>
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
              <Label>Year of study</Label>
              <Select value={String(form.year_of_study || "")} onValueChange={(v) => update("year_of_study", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>{[1, 2, 3, 4, 5, 6].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Graduation year</Label><Input type="number" value={form.graduation_year || ""} onChange={(e) => update("graduation_year", Number(e.target.value))} /></div>
            <div><Label>CGPA / Percentage</Label><Input type="number" step="0.1" value={form.cgpa || ""} onChange={(e) => update("cgpa", Number(e.target.value))} /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0a0f1a]">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Skills, domains & preferences</h3>
          <div className="mt-4 space-y-6">
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Skills (add 3+)</Label>
              <div className="mt-1.5">
                <TagPicker
                  value={form.skills || []}
                  onChange={(v) => update("skills", v)}
                  options={meta?.skills || []}
                  placeholder="React, Python, SQL…"
                  dataTestId="profile-skills-input"
                  minRecommended={3}
                  labelCount
                  hint="Type your own or tap a skill below"
                  isLoading={!meta}
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Domains of interest</Label>
              <div className="mt-1.5">
                <TagPicker
                  value={form.domains || []}
                  onChange={(v) => update("domains", v)}
                  options={meta?.domains || []}
                  placeholder="Fintech, EdTech, SaaS…"
                  dataTestId="profile-domains-input"
                  minRecommended={1}
                  labelCount
                  hint="Pick industries you want to intern in"
                  isLoading={!meta}
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Languages known</Label>
              <div className="mt-1.5">
                <TagPicker
                  value={form.languages || []}
                  onChange={(v) => update("languages", v)}
                  options={meta?.languages || []}
                  placeholder="English, Hindi, Tamil…"
                  dataTestId="profile-languages-input"
                  labelCount
                  hint="Select all languages you can communicate in"
                  isLoading={!meta}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="min-w-0">
                <Label>Work mode</Label>
                <Select value={form.work_mode_pref || ""} onValueChange={(v) => update("work_mode_pref", v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Mode" /></SelectTrigger>
                  <SelectContent position="popper" className="z-[100] max-h-60">
                    {["remote", "hybrid", "onsite"].map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0">
                <Label>Expected stipend</Label>
                <Select value={form.expected_stipend || ""} onValueChange={(v) => update("expected_stipend", v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Stipend" /></SelectTrigger>
                  <SelectContent position="popper" className="z-[100] max-h-60">
                    {(meta?.stipend_buckets || []).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                <Label>Availability</Label>
                <Select value={form.availability || ""} onValueChange={(v) => update("availability", v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Availability" /></SelectTrigger>
                  <SelectContent position="popper" className="z-[100] max-h-60">
                    {["Immediately", "After 1 month", "After exams", "Summer only", "Part-time only"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="min-w-0"><Label>LinkedIn URL</Label><Input value={form.linkedin_url || ""} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
              <div className="min-w-0"><Label>Portfolio URL</Label><Input value={form.portfolio_url || ""} onChange={(e) => update("portfolio_url", e.target.value)} placeholder="https://yourportfolio.com" /></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={busy} data-testid="profile-save-button" className="bg-[#D92D20] hover:bg-[#B91C1C]">{busy ? "Saving…" : "Save profile"}</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
