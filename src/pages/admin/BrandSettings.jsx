/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconSave as Save, IconPhone as Phone, IconMail as Mail, IconMapPin as MapPin, IconLinkedin as Linkedin, IconInstagram as Instagram, IconClock as Clock } from "@/components/icons/AppIcons";
import { toast } from "sonner";
import { invalidateBrandCache, fetchBrand } from "@/lib/brand";

export default function AdminBrandSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/brand").then(({ data }) => {
      setForm({ ...data, address_text: (data.address_lines || []).join("\n") });
    });
  }, []);

  if (!form) {
    return <DashboardLayout nav={ADMIN_NAV} title="Brand Settings">Loading…</DashboardLayout>;
  }

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        phone: form.phone,
        email: form.email,
        address_lines: (form.address_text || "").split("\n").map((s) => s.trim()).filter(Boolean),
        linkedin_url: form.linkedin_url,
        instagram_url: form.instagram_url,
        business_hours: form.business_hours,
        support_response_sla: form.support_response_sla,
        copyright: form.copyright,
      };
      const { data } = await api.put("/admin/brand", payload);
      setForm({ ...data, address_text: (data.address_lines || []).join("\n") });
      invalidateBrandCache();
      await fetchBrand(true);
      toast.success("Brand settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Brand Settings">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-slate-900">Organization</h2>
          <p className="mt-1 text-sm text-slate-500">These details appear in the footer, contact page, help center, and emails.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="brand-name">Name</Label>
                <Input id="brand-name" value={form.name || ""} onChange={(e) => update("name", e.target.value)} data-testid="brand-name" />
              </div>
              <div>
                <Label htmlFor="brand-tagline">Tagline</Label>
                <Input id="brand-tagline" value={form.tagline || ""} onChange={(e) => update("tagline", e.target.value)} data-testid="brand-tagline" />
              </div>
            </div>
            <div>
              <Label htmlFor="brand-description">Footer Description</Label>
              <Textarea id="brand-description" rows={3} value={form.description || ""} onChange={(e) => update("description", e.target.value)} data-testid="brand-description" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="brand-phone"><Phone className="mr-1 inline h-3.5 w-3.5" /> Phone</Label>
                <Input id="brand-phone" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} data-testid="brand-phone" />
              </div>
              <div>
                <Label htmlFor="brand-email"><Mail className="mr-1 inline h-3.5 w-3.5" /> Email</Label>
                <Input id="brand-email" type="email" value={form.email || ""} onChange={(e) => update("email", e.target.value)} data-testid="brand-email" />
              </div>
            </div>

            <div>
              <Label htmlFor="brand-address"><MapPin className="mr-1 inline h-3.5 w-3.5" /> Registered Address (one line each)</Label>
              <Textarea id="brand-address" rows={5} value={form.address_text || ""} onChange={(e) => update("address_text", e.target.value)} data-testid="brand-address-text" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="brand-linkedin"><Linkedin className="mr-1 inline h-3.5 w-3.5" /> LinkedIn URL</Label>
                <Input id="brand-linkedin" value={form.linkedin_url || ""} onChange={(e) => update("linkedin_url", e.target.value)} data-testid="brand-linkedin" />
              </div>
              <div>
                <Label htmlFor="brand-instagram"><Instagram className="mr-1 inline h-3.5 w-3.5" /> Instagram URL</Label>
                <Input id="brand-instagram" value={form.instagram_url || ""} onChange={(e) => update("instagram_url", e.target.value)} data-testid="brand-instagram" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="brand-hours"><Clock className="mr-1 inline h-3.5 w-3.5" /> Business Hours</Label>
                <Input id="brand-hours" value={form.business_hours || ""} onChange={(e) => update("business_hours", e.target.value)} data-testid="brand-hours" />
              </div>
              <div>
                <Label htmlFor="brand-sla">Support SLA copy</Label>
                <Input id="brand-sla" value={form.support_response_sla || ""} onChange={(e) => update("support_response_sla", e.target.value)} data-testid="brand-sla" />
              </div>
            </div>

            <div>
              <Label htmlFor="brand-copyright">Copyright line</Label>
              <Input id="brand-copyright" value={form.copyright || ""} onChange={(e) => update("copyright", e.target.value)} data-testid="brand-copyright" />
            </div>

            <Button onClick={save} disabled={saving} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="brand-save-btn">
              <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-500">Live Preview</h3>
          <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div className="font-display text-lg font-extrabold text-slate-900">{form.name}</div>
            <div className="text-xs italic text-slate-500">{form.tagline}</div>
            <p className="text-xs text-slate-600">{form.description}</p>
            <div className="border-t border-slate-200 pt-3 text-xs text-slate-700">
              <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-rose-700" /> {form.phone}</div>
              <div className="mt-1 flex items-center gap-2"><Mail className="h-3 w-3 text-rose-700" /> {form.email}</div>
              <div className="mt-1 flex items-start gap-2"><MapPin className="mt-0.5 h-3 w-3 text-rose-700" /><div>{(form.address_text || "").split("\n").map((l, i) => <div key={`${l}-${i}`}>{l}</div>)}</div></div>
              <div className="mt-2 flex items-center gap-2"><Clock className="h-3 w-3 text-rose-700" /> {form.business_hours}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
