/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STARTUP_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconUpload as Upload, IconFileText as FileText } from "@/components/icons/AppIcons";
import { toast } from "sonner";
import { PROOF_ACCEPT, validateProofFile } from "@/lib/registerValidation";

export default function StartupProfile() {
  const { profile, refresh } = useAuth();
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const logoRef = useRef();
  const proofRef = useRef();

  useEffect(() => { api.get("/meta/constants").then(({ data }) => setMeta(data)); }, []);
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const save = async (e) => {
    e?.preventDefault();
    setBusy(true);
    try {
      await api.put("/startups/me", form);
      toast.success("Company profile saved");
      await refresh();
    } catch (err) { toast.error(formatApiError(err)); }
    finally { setBusy(false); }
  };

  const uploadLogo = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/uploads/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Logo updated");
      await refresh();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const uploadProof = async (file) => {
    const err = validateProofFile(file);
    if (err) { toast.error(err); return; }
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/uploads/proof", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Verification proof uploaded");
      await refresh();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const logoSrc = resolveAssetUrl(profile?.logo_url);
  const proofSrc = resolveAssetUrl(profile?.proof_url);

  return (
    <DashboardLayout nav={STARTUP_NAV} title="Company Profile">
      <form onSubmit={save} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Logo & basics</h3>
          <div className="mt-4 flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-2xl">
              {logoSrc && <AvatarImage src={logoSrc} className="object-cover" />}
              <AvatarFallback className="rounded-2xl bg-slate-900 text-xl font-bold text-white">{(form.name || "S")[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" onClick={() => logoRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload logo</Button>
              <input type="file" accept="image/*" ref={logoRef} className="hidden" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><Label>Startup name</Label><Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} data-testid="startup-name" /></div>
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
            <div><Label>City</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
            <div><Label>State</Label><Input value={form.state || ""} onChange={(e) => update("state", e.target.value)} /></div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm">
                <Checkbox checked={!!form.dpiit_recognized} onCheckedChange={(v) => update("dpiit_recognized", !!v)} /> DPIIT recognized
              </label>
            </div>
            <div className="md:col-span-2"><Label>About (max 500 chars)</Label><Textarea rows={4} maxLength={500} value={form.description || ""} onChange={(e) => update("description", e.target.value)} placeholder="Elevator pitch for your startup." /></div>
            <div><Label>Founder name</Label><Input value={form.founder_name || ""} onChange={(e) => update("founder_name", e.target.value)} /></div>
            <div><Label>Founder LinkedIn</Label><Input value={form.founder_linkedin || ""} onChange={(e) => update("founder_linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold">Verification proof</h3>
          <p className="mt-1 text-sm text-slate-500">PDF, image, or Word document used for admin verification · Max 5MB</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {proofSrc ? (
              <a href={proofSrc} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#D92D20] hover:underline">
                <FileText className="h-4 w-4" /> {profile?.proof_filename || "Proof on file"}
              </a>
            ) : (
              <span className="text-sm text-slate-500">No proof uploaded yet</span>
            )}
            <Button type="button" variant="outline" onClick={() => proofRef.current?.click()} data-testid="startup-upload-proof">
              <Upload className="mr-2 h-4 w-4" /> {proofSrc ? "Replace proof" : "Upload proof"}
            </Button>
            <input
              type="file"
              accept={PROOF_ACCEPT}
              ref={proofRef}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadProof(e.target.files[0])}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={busy} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="startup-save-profile">{busy ? "Saving…" : "Save profile"}</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
