/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconStar as Star, IconPlus as Plus, IconExternalLink as ExternalLink } from "@/components/icons/AppIcons";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const MODES = ["remote", "hybrid", "onsite"];

function OppActions({ opp, onToggleFeatured, onClose }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => onToggleFeatured(e, opp)}
        data-testid={`admin-feature-${opp.id}`}
        className={`w-full sm:w-auto ${opp.is_featured ? "border-amber-300 text-amber-700" : ""}`}
      >
        <Star className="mr-1 h-3 w-3" /> {opp.is_featured ? "Unfeature" : "Feature"}
      </Button>
      {opp.status === "active" ? (
        <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={(e) => onClose(e, opp.id)} data-testid={`admin-close-${opp.id}`}>
          Close
        </Button>
      ) : null}
    </div>
  );
}

function FeaturedBadge({ featured }) {
  if (!featured) return <span className="text-xs text-slate-600 dark:text-slate-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
      <Star className="h-3 w-3" /> Featured
    </span>
  );
}

const initialOppForm = {
  title: "", domain: "Cyber Security", mode: "remote", duration: "3 months",
  stipend_range: "₹10,000 – ₹15,000 / month", description: "",
  skills_required_csv: "", eligibility_degrees_csv: "", eligibility_years_csv: "",
  city: "", openings: 1, is_featured: false, image_url: "",
};

export default function AdminOpportunities() {
  const [opps, setOpps] = useState([]);
  const [startups, setStartups] = useState([]);
  const [meta, setMeta] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState("existing"); // 'existing' | 'freeform'
  const [selectedStartupId, setSelectedStartupId] = useState("");
  const [freeformName, setFreeformName] = useState("");
  const [form, setForm] = useState(initialOppForm);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    api.get("/opportunities?status=&limit=200").then(({ data }) => setOpps(data));
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get("/meta/constants").then(({ data }) => setMeta(data)); }, []);

  useEffect(() => {
    if (showCreate && startups.length === 0) {
      api.get("/admin/startups-list").then(({ data }) => setStartups(data));
    }
  }, [showCreate, startups.length]);

  const close = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await api.patch(`/opportunities/${id}/status`, { status: "closed" });
      toast.success("Internship closed");
      load();
    } catch (err) { toast.error(formatApiError(err)); }
  };
  const toggleFeatured = async (e, o) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await api.patch(`/admin/opportunities/${o.id}/feature`, { is_featured: !o.is_featured });
      toast.success(o.is_featured ? "Removed from featured" : "Marked as featured");
      load();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  const submitCreate = async () => {
    if (!form.title || !form.description) return toast.error("Title and description are required");
    if (createMode === "existing" && !selectedStartupId) return toast.error("Pick a startup");
    if (createMode === "freeform" && !freeformName.trim()) return toast.error("Enter the startup name");
    setCreating(true);
    try {
      const payload = {
        ...form,
        openings: Number(form.openings) || 1,
        skills_required: form.skills_required_csv ? form.skills_required_csv.split(",").map((s) => s.trim()).filter(Boolean) : [],
        eligibility_degrees: form.eligibility_degrees_csv ? form.eligibility_degrees_csv.split(",").map((s) => s.trim()).filter(Boolean) : [],
        eligibility_years: form.eligibility_years_csv ? form.eligibility_years_csv.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)) : [],
      };
      delete payload.skills_required_csv;
      delete payload.eligibility_degrees_csv;
      delete payload.eligibility_years_csv;
      if (createMode === "existing") {
        payload.startup_id = selectedStartupId;
      } else {
        payload.startup_name_freeform = freeformName.trim();
      }
      await api.post("/admin/opportunities", payload);
      toast.success("Internship created");
      setShowCreate(false);
      setForm(initialOppForm);
      setSelectedStartupId("");
      setFreeformName("");
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout nav={ADMIN_NAV} title="All internships">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button onClick={() => setShowCreate(true)} className="w-full bg-[#D92D20] hover:bg-[#B91C1C] sm:w-auto" data-testid="admin-create-opp-btn">
          <Plus className="mr-1 h-4 w-4" /> Create internship
        </Button>
      </div>

      {opps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-white/20 dark:bg-slate-900">
          No internships yet. Create one to get started.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {opps.map((o) => (
              <article
                key={o.id}
                data-testid={`admin-opp-row-${o.id}`}
                className="opp-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/opportunities/${o.id}`}
                      data-testid={`open-opp-${o.id}`}
                      className="opp-card-title inline-flex items-center gap-1 font-semibold text-slate-900 transition-colors hover:text-[#D92D20] dark:text-white dark:hover:text-[#F87171]"
                    >
                      <span className="line-clamp-2">{o.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                    </Link>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{o.startup_name}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-slate-500">Domain</dt>
                    <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{o.domain}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-slate-500">Created</dt>
                    <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{o.created_at?.split("T")[0]}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-semibold uppercase tracking-wider text-slate-500">Featured</dt>
                    <dd className="mt-0.5"><FeaturedBadge featured={o.is_featured} /></dd>
                  </div>
                </dl>

                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10">
                  <OppActions opp={o} onToggleFeatured={toggleFeatured} onClose={close} />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block dark:border-white/10 dark:bg-slate-900">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3">Internship</th>
                  <th className="px-4 py-3">Startup</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {opps.map((o) => (
                  <tr key={o.id} data-testid={`admin-opp-row-${o.id}`} className="transition-colors hover:bg-[#D92D20]/5 dark:hover:bg-[#D92D20]/10">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      <Link to={`/admin/opportunities/${o.id}`} data-testid={`open-opp-${o.id}`} className="inline-flex items-center gap-1 transition-colors hover:text-[#D92D20] dark:hover:text-[#F87171]">
                        {o.title} <ExternalLink className="h-3 w-3 opacity-50" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{o.startup_name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{o.domain}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3"><FeaturedBadge featured={o.is_featured} /></td>
                    <td className="px-4 py-3 text-slate-500">{o.created_at?.split("T")[0]}</td>
                    <td className="px-4 py-3 text-right">
                      <OppActions opp={o} onToggleFeatured={toggleFeatured} onClose={close} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto" data-testid="admin-create-opp-dialog">
          <DialogHeader>
            <DialogTitle>Create internship listing</DialogTitle>
          </DialogHeader>

          <Tabs value={createMode} onValueChange={setCreateMode}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="existing" data-testid="create-mode-existing">Existing startup</TabsTrigger>
              <TabsTrigger value="freeform" data-testid="create-mode-freeform">Free-form name</TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="mt-4">
              <Label>Startup *</Label>
              <Select value={selectedStartupId} onValueChange={setSelectedStartupId}>
                <SelectTrigger data-testid="create-startup-select"><SelectValue placeholder="Select a startup" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {startups.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}{s.is_verified ? " ✓" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="freeform" className="mt-4">
              <Label>Startup name (free-form) *</Label>
              <Input value={freeformName} onChange={(e) => setFreeformName(e.target.value)} placeholder="e.g. PromoCo Studios" data-testid="create-freeform-name" />
              <p className="mt-1 text-xs text-amber-700">This listing will not be linked to a real Lerbo Tech startup account.</p>
            </TabsContent>
          </Tabs>

          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="create-opp-title" />
            </div>
            <div>
              <Label>Domain</Label>
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger data-testid="create-opp-domain"><SelectValue /></SelectTrigger>
                <SelectContent>{(meta?.domains || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mode</Label>
              <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                <SelectTrigger data-testid="create-opp-mode"><SelectValue /></SelectTrigger>
                <SelectContent>{MODES.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration</Label>
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 months" />
            </div>
            <div>
              <Label>Stipend range</Label>
              <Input value={form.stipend_range} onChange={(e) => setForm({ ...form, stipend_range: e.target.value })} />
            </div>
            <div>
              <Label>City (for non-remote)</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <Label>Openings</Label>
              <Input type="number" min="1" value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Cover image URL (optional)</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/banner.jpg" data-testid="create-opp-image-url" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description *</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="create-opp-description" />
            </div>
            <div className="sm:col-span-2">
              <Label>Required skills (comma-separated)</Label>
              <Input value={form.skills_required_csv} onChange={(e) => setForm({ ...form, skills_required_csv: e.target.value })} placeholder="React, TypeScript, Tailwind" />
            </div>
            <div>
              <Label>Eligible degrees (comma)</Label>
              <Input value={form.eligibility_degrees_csv} onChange={(e) => setForm({ ...form, eligibility_degrees_csv: e.target.value })} placeholder="B.Tech, BCA" />
            </div>
            <div>
              <Label>Eligible years (comma)</Label>
              <Input value={form.eligibility_years_csv} onChange={(e) => setForm({ ...form, eligibility_years_csv: e.target.value })} placeholder="3, 4" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="opp-featured" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} data-testid="create-opp-featured" />
              <Label htmlFor="opp-featured" className="cursor-pointer">Publish as Featured</Label>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={submitCreate} disabled={creating} className="w-full bg-[#D92D20] hover:bg-[#B91C1C] sm:w-auto" data-testid="create-opp-submit">
              {creating ? "Creating..." : "Create internship"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
