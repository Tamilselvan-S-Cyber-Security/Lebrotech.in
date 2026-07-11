/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconCheckCircle as CheckCircle2, IconMail as Mail } from "@/components/icons/AppIcons";
import api, { formatApiError } from "@/lib/api";
import { useBrand } from "@/lib/brand";
import { toast } from "sonner";

const blank = {
  institution_name: "", contact_person: "", designation: "",
  email: "", mobile: "", num_campuses: "", num_students: "",
  current_erp: "", notes: "",
};

export default function EnterpriseEnquiryDialog({ open, onOpenChange }) {
  const brand = useBrand();
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.institution_name || !form.contact_person || !form.email || !form.mobile) {
      toast.error("Institution name, contact person, email and mobile are required");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        num_campuses: form.num_campuses ? Number(form.num_campuses) : undefined,
        num_students: form.num_students ? Number(form.num_students) : undefined,
      };
      await api.post("/billing/enterprise-enquiry", payload);
      setDone(true);
      setForm(blank);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setDone(false);
    setForm(blank);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(true); }}>
      <DialogContent className="max-w-2xl" data-testid="enterprise-enquiry-dialog">
        {done ? (
          <div className="py-8 text-center" data-testid="enterprise-success">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">Thank you!</h3>
            <p className="mt-2 text-sm text-slate-600">Thank you for your interest in the Lerbo Tech Enterprise Plan. Our team will contact you shortly.</p>
            <p className="mt-4 text-xs text-slate-500">For urgent enquiries, email <a className="font-semibold text-rose-700" href={`mailto:${brand.email}`}><Mail className="inline h-3 w-3" /> {brand.email}</a></p>
            <Button onClick={close} className="mt-6">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request Enterprise Proposal</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Institution name *</Label>
                <Input value={form.institution_name} onChange={(e) => update("institution_name", e.target.value)} data-testid="enterprise-institution-name" />
              </div>
              <div>
                <Label>Contact person *</Label>
                <Input value={form.contact_person} onChange={(e) => update("contact_person", e.target.value)} data-testid="enterprise-contact-person" />
              </div>
              <div>
                <Label>Designation</Label>
                <Input value={form.designation} onChange={(e) => update("designation", e.target.value)} placeholder="e.g. TPO, Dean" data-testid="enterprise-designation" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} data-testid="enterprise-email" />
              </div>
              <div>
                <Label>Mobile *</Label>
                <Input value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="+91 ..." data-testid="enterprise-mobile" />
              </div>
              <div>
                <Label>Number of campuses</Label>
                <Input type="number" min="1" value={form.num_campuses} onChange={(e) => update("num_campuses", e.target.value)} data-testid="enterprise-campuses" />
              </div>
              <div>
                <Label>Number of students</Label>
                <Input type="number" min="1" value={form.num_students} onChange={(e) => update("num_students", e.target.value)} data-testid="enterprise-students" />
              </div>
              <div className="sm:col-span-2">
                <Label>Current ERP system (optional)</Label>
                <Input value={form.current_erp} onChange={(e) => update("current_erp", e.target.value)} placeholder="e.g. SAP, Tally, in-house" data-testid="enterprise-erp" />
              </div>
              <div className="sm:col-span-2">
                <Label>Requirements / Notes</Label>
                <Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} data-testid="enterprise-notes" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button onClick={submit} disabled={busy} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="enterprise-submit">
                {busy ? "Sending…" : "Submit enquiry"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
