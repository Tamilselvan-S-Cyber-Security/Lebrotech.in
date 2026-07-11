/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IconCheckCircle } from "@/components/icons/AppIcons";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useBrand } from "@/lib/brand";

const initialForm = { full_name: "", email: "", mobile: "", user_type: "student", subject: "", message: "" };

export default function Contact() {
  const brand = useBrand();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.mobile || !form.subject || !form.message) {
      toast.error("Please fill all the required fields");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setSuccess(true);
      setForm(initialForm);
      toast.success(brand.support_response_sla || "Thanks — we'll be in touch shortly.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden py-24" data-testid="contact-page">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-2xl px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D92D20] dark:text-[#F87171]">Contact us</span>
            <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Let's talk.</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Questions about your internship certificate, verification, or partnerships? Send us a message — {brand.support_response_sla?.toLowerCase()}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center rounded-none border border-emerald-500/30 bg-emerald-500/10 p-10 text-center" data-testid="contact-success-card">
              <IconCheckCircle className="h-12 w-12 text-emerald-400" />
              <h3 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">Message received!</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">{brand.support_response_sla} A confirmation has been logged for our team.</p>
              <Button onClick={() => setSuccess(false)} variant="outline" className="mt-6 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10" data-testid="contact-send-another">Send another message</Button>
            </div>
          ) : (
            <form onSubmit={submit} data-testid="contact-form" className="space-y-4 rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-8 backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contact-name" className="text-slate-700 dark:text-slate-300">Full name *</Label>
                  <Input id="contact-name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} data-testid="contact-name" required className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="text-slate-700 dark:text-slate-300">Email *</Label>
                  <Input id="contact-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} data-testid="contact-email" required className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contact-mobile" className="text-slate-700 dark:text-slate-300">Mobile *</Label>
                  <Input id="contact-mobile" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="+91 ..." data-testid="contact-mobile" required className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <Label htmlFor="contact-user-type" className="text-slate-700 dark:text-slate-300">I am a *</Label>
                  <Select value={form.user_type} onValueChange={(v) => update("user_type", v)}>
                    <SelectTrigger id="contact-user-type" data-testid="contact-user-type" className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="contact-subject" className="text-slate-700 dark:text-slate-300">Subject *</Label>
                <Input id="contact-subject" value={form.subject} onChange={(e) => update("subject", e.target.value)} data-testid="contact-subject" required className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white" />
              </div>
              <div>
                <Label htmlFor="contact-message" className="text-slate-700 dark:text-slate-300">Message *</Label>
                <Textarea id="contact-message" rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} data-testid="contact-message" required className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="contact-submit">
                {submitting ? "Sending..." : "Send message"}
              </Button>
              <p className="text-center text-xs text-slate-500">By submitting, you agree to our <a className="underline hover:text-slate-900 dark:hover:text-white" href="/privacy">Privacy Policy</a>.</p>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
