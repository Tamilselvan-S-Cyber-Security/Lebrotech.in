/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INSTITUTION_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import { downloadStudentTemplate } from "@/lib/downloads";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  IconDownload as Download, IconUserPlus as UserPlus, IconUpload as Upload, IconLink as LinkIcon, IconCopy as Copy, IconCheckCircle as CheckCircle2,
  IconXCircle as XCircle, IconAlertCircle as AlertCircle, IconRefreshCw as RefreshCw,
} from "@/components/icons/AppIcons";
import { toast } from "sonner";

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
}

const initialForm = {
  full_name: "", register_number: "", department: "", year_of_study: "",
  email: "", mobile: "", gender: "", skills_csv: "", linkedin_url: "",
};

export default function InstitutionOnboardStudents() {
  const [referral, setReferral] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [adding, setAdding] = useState(false);
  const [students, setStudents] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const { data } = await api.get("/institutions/me/students");
      setStudents(data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    api.get("/institutions/me/referral").then(({ data }) => setReferral(data)).catch(() => {});
    loadStudents();
  }, [loadStudents]);

  const referralUrl = referral
    ? `${window.location.origin}/register?institution=${referral.slug}`
    : "";

  const copyReferral = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Could not copy");
    }
  };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submitIndividual = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email) return toast.error("Name and email are required");
    setAdding(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        register_number: form.register_number || undefined,
        department: form.department || undefined,
        year_of_study: form.year_of_study ? Number(form.year_of_study) : undefined,
        mobile: form.mobile || undefined,
        gender: form.gender || undefined,
        linkedin_url: form.linkedin_url || undefined,
        skills: form.skills_csv ? form.skills_csv.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      };
      const { data } = await api.post("/institutions/students", payload);
      const msg = data.status === "created" ? "Student added"
        : data.status === "mapped" ? "Existing student mapped to your institution"
        : "Already in your institution";
      toast.success(msg);
      setForm(initialForm);
      await loadStudents();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setAdding(false);
    }
  };

  const downloadTemplate = () => {
    downloadStudentTemplate();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|csv)$/i)) {
      toast.error("Upload a .csv or .xlsx file");
      return;
    }
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/institutions/students/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(data);
      toast.success(`Processed ${data.summary.total_rows} rows`);
      await loadStudents();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setUploading(false);
      e.target.value = ""; // reset
    }
  };

  return (
    <DashboardLayout nav={INSTITUTION_NAV} title="Student Onboarding">
      {/* Referral link block */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-amber-50 p-6" data-testid="referral-block">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-rose-700 shadow-sm">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-slate-900">Your institution referral link</h2>
            <p className="mt-1 text-sm text-slate-600">Share this link — any student who signs up through it is auto-mapped to your institution.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input value={referralUrl} readOnly data-testid="referral-link-input" className="font-mono text-xs" />
              <Button onClick={copyReferral} variant="outline" data-testid="referral-copy-btn" disabled={!referralUrl}>
                {copied ? <CheckCircle2 className="mr-1 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Individual / Bulk */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <Tabs defaultValue="individual">
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
            <TabsTrigger value="individual" data-testid="tab-individual"><UserPlus className="mr-1 h-4 w-4" /> Individual</TabsTrigger>
            <TabsTrigger value="bulk" data-testid="tab-bulk"><Upload className="mr-1 h-4 w-4" /> Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="mt-6">
            <form onSubmit={submitIndividual} className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="individual-form">
              <div>
                <Label>Full name *</Label>
                <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} data-testid="onboard-name" required />
              </div>
              <div>
                <Label>Register number</Label>
                <Input value={form.register_number} onChange={(e) => update("register_number", e.target.value)} data-testid="onboard-regno" />
              </div>
              <div>
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => update("department", e.target.value)} data-testid="onboard-dept" />
              </div>
              <div>
                <Label>Year of study</Label>
                <Input type="number" min="1" max="6" value={form.year_of_study} onChange={(e) => update("year_of_study", e.target.value)} data-testid="onboard-year" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} data-testid="onboard-email" required />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input value={form.mobile} onChange={(e) => update("mobile", e.target.value)} data-testid="onboard-mobile" />
              </div>
              <div>
                <Label>Gender</Label>
                <Input value={form.gender} onChange={(e) => update("gender", e.target.value)} placeholder="Male / Female / Other" data-testid="onboard-gender" />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} data-testid="onboard-linkedin" />
              </div>
              <div className="sm:col-span-2">
                <Label>Skills (comma separated)</Label>
                <Input value={form.skills_csv} onChange={(e) => update("skills_csv", e.target.value)} placeholder="React, Python, Excel" data-testid="onboard-skills" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={adding} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="onboard-individual-submit">
                  {adding ? "Adding…" : "Add Student"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="mt-6">
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Download the Excel template</h3>
                    <p className="text-sm text-slate-500">Columns: Student Name, Register Number, Department, Year, Email Address, Mobile Number, Gender, Skills, LinkedIn URL.</p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate} data-testid="download-template-btn">
                    <Download className="mr-2 h-4 w-4" /> Download Template
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900">Upload filled Excel</h3>
                <p className="mt-1 text-sm text-slate-500">We'll validate and report which rows were created, mapped or failed.</p>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={onFileChange}
                  disabled={uploading}
                  data-testid="bulk-upload-input"
                  className="mt-3 block w-full text-sm text-slate-700 file:mr-4 file:rounded-none file:border-0 file:bg-[#D92D20] file:px-2 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-[#B91C1C]"
                />
                {uploading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Processing rows…
                  </div>
                ) : null}
              </div>

              {uploadResult ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6" data-testid="upload-result">
                  <h4 className="font-display text-lg font-bold text-slate-900">Upload Summary</h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Rows</div>
                      <div className="font-display text-2xl font-extrabold">{uploadResult.summary.total_rows}</div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Created</div>
                      <div className="font-display text-2xl font-extrabold text-emerald-700">{uploadResult.summary.created}</div>
                    </div>
                    <div className="rounded-lg bg-sky-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-sky-700">Mapped</div>
                      <div className="font-display text-2xl font-extrabold text-sky-700">{uploadResult.summary.mapped}</div>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-rose-700">Failed</div>
                      <div className="font-display text-2xl font-extrabold text-rose-700">{uploadResult.summary.failed}</div>
                    </div>
                  </div>

                  {uploadResult.failed?.length > 0 ? (
                    <div className="mt-4">
                      <div className="mb-2 text-sm font-semibold text-slate-900">Failures</div>
                      <ul className="space-y-1 text-xs">
                        {uploadResult.failed.map((f, i) => (
                          <li key={`${f.row}-${i}`} className="flex items-start gap-2 rounded-md bg-rose-50 p-2 text-rose-800">
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>Row {f.row} ({f.name || f.email}): {f.error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent students */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Students on your institution</h3>
            <p className="text-xs text-slate-500">{students.length} total · added via direct onboarding, referral link, or self-signup.</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadStudents}><RefreshCw className="mr-1 h-3 w-3" /> Refresh</Button>
        </div>
        {students.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500" data-testid="my-students-empty">
            <AlertCircle className="mx-auto mb-2 h-6 w-6 text-slate-600 dark:text-slate-400" />
            No students yet. Add them above or share your referral link.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100" data-testid="my-students-list">
            {students.slice(0, 30).map((s) => (
              <li key={s.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{s.full_name}</div>
                  <div className="truncate text-xs text-slate-500">{s.email} · {s.department || "—"} · Year {s.year_of_study || "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{s.profile_completion || 0}% profile</Badge>
                  {s.onboarded_by === "institution" ? <Badge className="bg-amber-100 text-amber-700 text-[10px]">Onboarded by you</Badge> : null}
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">{fmt(s.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
