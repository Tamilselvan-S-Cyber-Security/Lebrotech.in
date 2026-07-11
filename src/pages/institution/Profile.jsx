/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INSTITUTION_NAV } from "@/lib/nav";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/assets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { IconUpload as Upload, IconFileText as FileText } from "@/components/icons/AppIcons";
import { PROOF_ACCEPT, validateProofFile } from "@/lib/registerValidation";

export default function InstitutionProfile() {
  const { profile, refresh } = useAuth();
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const proofRef = useRef();

  useEffect(() => { api.get("/meta/constants").then(({ data }) => setMeta(data)); }, []);
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const save = async (e) => {
    e?.preventDefault();
    setBusy(true);
    try {
      await api.put("/institutions/me", form);
      toast.success("Institution profile saved");
      await refresh();
    } catch (err) { toast.error(formatApiError(err)); }
    finally { setBusy(false); }
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

  const proofSrc = resolveAssetUrl(profile?.proof_url);

  return (
    <DashboardLayout nav={INSTITUTION_NAV} title="Institution Profile">
      <form onSubmit={save} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Label>Institution name</Label><Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.type || ""} onValueChange={(v) => update("type", v)}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>{(meta?.institution_types || []).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>City</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
            <div><Label>State</Label><Input value={form.state || ""} onChange={(e) => update("state", e.target.value)} /></div>
            <div><Label>Website</Label><Input value={form.website || ""} onChange={(e) => update("website", e.target.value)} placeholder="https://..." /></div>
            <div className="md:col-span-2"><Label>Placement officer</Label><Input value={form.placement_officer || ""} onChange={(e) => update("placement_officer", e.target.value)} /></div>
            <div>
              <Label>Total students</Label>
              <Select value={form.student_count_range || ""} onValueChange={(v) => update("student_count_range", v)}>
                <SelectTrigger><SelectValue placeholder="Range" /></SelectTrigger>
                <SelectContent>{["<500", "500-1000", "1000-3000", "3000-10000", "10000+"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Accreditation</Label>
              <Input value={(form.accreditation || []).join(", ")} onChange={(e) => update("accreditation", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="NAAC, NBA" />
            </div>
            <div className="md:col-span-2"><Label>Departments (comma-separated)</Label><Input value={(form.departments || []).join(", ")} onChange={(e) => update("departments", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></div>
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
            <Button type="button" variant="outline" onClick={() => proofRef.current?.click()} data-testid="institution-upload-proof">
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

        <div className="flex justify-end"><Button type="submit" disabled={busy} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="inst-save-profile">{busy ? "Saving…" : "Save"}</Button></div>
      </form>
    </DashboardLayout>
  );
}
