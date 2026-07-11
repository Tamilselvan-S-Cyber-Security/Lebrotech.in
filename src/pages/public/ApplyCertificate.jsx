/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { IconCheckCircle, IconShieldCheck, IconAlertCircle } from "@/components/icons/AppIcons";
import {
  WORKSHOP_CERTIFICATE_PRICE_LABEL,
  INTEREST_TYPES,
  DEGREES,
  HEARD_ABOUT,
  MODES,
  getProgramsForType,
  getDurationsForType,
  getCertificatePrice,
  getInterestTypeMeta,
} from "@/lib/certificatePrograms";
import { profileDisplayName } from "@/lib/roles";

const EMPTY = {
  full_name: "", age: "", whatsapp: "", phone: "", email: "",
  school: "", college: "", degree: "",
  interest_type: "workshop", program: "",
  duration: "", duration_custom: "", mode: "online",
  experience: "", motivation: "", heard_about: "",
};

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <Label className="text-slate-700 dark:text-slate-300">{label}{required ? " *" : ""}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && !error ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-[#D92D20]"><IconAlertCircle className="h-3 w-3" /> {error}</p>
      ) : null}
    </div>
  );
}

const selectCls = "w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#D92D20] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white";

export default function ApplyCertificate() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      full_name: f.full_name || profileDisplayName(profile, user),
      email: f.email || user.email || "",
      school: f.school || profile?.college_name || "",
      college: f.college || profile?.college_name || "",
      degree: f.degree || profile?.degree || "",
      phone: f.phone || profile?.phone || "",
    }));
  }, [user, profile]);

  const price = useMemo(() => getCertificatePrice(form.interest_type), [form.interest_type]);
  const programs = useMemo(() => getProgramsForType(form.interest_type), [form.interest_type]);
  const durations = useMemo(() => getDurationsForType(form.interest_type), [form.interest_type]);
  const typeMeta = useMemo(() => getInterestTypeMeta(form.interest_type), [form.interest_type]);

  const set = (k, v) => setForm((f) => {
    const next = { ...f, [k]: v };
    if (k === "interest_type" && v !== f.interest_type) {
      next.program = "";
      next.duration = "";
      next.duration_custom = "";
    }
    return next;
  });

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.age || Number(form.age) < 10 || Number(form.age) > 100) e.age = "Enter a valid age";
    if (!/^\+?\d[\d\s-]{7,}$/.test(form.whatsapp.trim())) e.whatsapp = "Enter a valid WhatsApp number";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.school.trim()) e.school = "School / Institution is required";
    if (!form.program) e.program = "Please choose a program";
    if (!form.duration) e.duration = "Please choose a duration";
    if (form.duration === "Custom (type below)" && !form.duration_custom.trim()) e.duration_custom = "Type your preferred duration";
    if (!form.mode) e.mode = "Please choose a mode";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setBusy(true);
    const payload = {
      ...form,
      duration: form.duration === "Custom (type below)" ? form.duration_custom.trim() : form.duration,
      price: price.label,
      price_inr: price.amount,
      certificate_type: form.interest_type,
    };
    try {
      await api.post("/certificate-applications", payload);
      setDone(true);
      toast.success(`Application submitted! Confirmation email sent to ${form.email}.`);
    } catch {
      toast.error("Could not submit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <PublicLayout>
        <section className="theme-section flex min-h-[70vh] items-center justify-center px-6 py-20">
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <IconCheckCircle className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Application received!</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Thanks {form.full_name.split(" ")[0]}! Our team will contact you on WhatsApp ({form.whatsapp}) with payment
              and next steps for your <strong>{typeMeta.label}</strong> certificate ({price.label}).
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button onClick={() => navigate("/")} variant="outline">Back to home</Button>
              {user?.role === "student" ? (
                <Button onClick={() => navigate("/student/certification")} className="bg-[#D92D20] hover:bg-[#B91C1C]">
                  View my certification
                </Button>
              ) : (
                <Button onClick={() => { setForm(EMPTY); setDone(false); }} className="bg-[#D92D20] hover:bg-[#B91C1C]">Apply again</Button>
              )}
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-4xl px-6 py-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#D92D20]/10 px-4 py-1.5 text-sm font-bold text-[#D92D20]">
            <IconShieldCheck className="h-4 w-4" /> Workshop & course certificates
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Apply for your verified certificate
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            All students, all departments — enroll in a <strong>workshop</strong>, <strong>course</strong>, or <strong>internship</strong>
            {" "}and receive your official Lerbo Tech completion certificate.
          </p>
        </div>
      </section>

      <section className="theme-section py-14">
        <form onSubmit={submit} className="mx-auto max-w-3xl px-6" data-testid="certificate-form" noValidate>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Personal details</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full Name" required error={errors.full_name}>
              <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Enter your full name" />
            </Field>
            <Field label="Age" required error={errors.age}>
              <Input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="e.g. 21" />
            </Field>
            <Field label="WhatsApp Number" required error={errors.whatsapp}>
              <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Phone Number" hint="Optional">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Email Address" required error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Enter your email address" />
            </Field>
          </div>

          <h2 className="mt-10 font-display text-xl font-bold text-slate-900 dark:text-white">Educational background</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="School / Institution" required error={errors.school}>
              <Input value={form.school} onChange={(e) => set("school", e.target.value)} placeholder="School or college name" />
            </Field>
            <Field label="College" hint="Optional">
              <Input value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="College name" />
            </Field>
            <Field label="Degree / Department" hint="Any stream — engineering, commerce, arts, etc.">
              <select className={selectCls} value={form.degree} onChange={(e) => set("degree", e.target.value)}>
                <option value="">Select degree</option>
                {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>

          <h2 className="mt-10 font-display text-xl font-bold text-slate-900 dark:text-white">Certificate type & program</h2>
          <p className="mt-1 text-sm text-slate-500">Choose workshop for the {WORKSHOP_CERTIFICATE_PRICE_LABEL} marketing certificate offer.</p>
          <div className="mt-5 space-y-5">
            <Field label="I'm applying for" required>
              <select
                className={selectCls}
                value={form.interest_type}
                onChange={(e) => set("interest_type", e.target.value)}
                data-testid="interest-type-select"
              >
                {INTEREST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} — {t.priceLabel}{t.marketing ? " (marketing offer)" : ""}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">{typeMeta.desc}</p>
            </Field>
            <Field label={form.interest_type === "workshop" ? "Select workshop" : "Select program"} required error={errors.program}>
              <select className={selectCls} value={form.program} onChange={(e) => set("program", e.target.value)}>
                <option value="">Select an option</option>
                {programs.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Duration" required error={errors.duration}>
                <select className={selectCls} value={form.duration} onChange={(e) => set("duration", e.target.value)}>
                  <option value="">Select duration</option>
                  {durations.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Mode" required error={errors.mode}>
                <select className={selectCls} value={form.mode} onChange={(e) => set("mode", e.target.value)}>
                  {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </Field>
            </div>
            {form.duration === "Custom (type below)" ? (
              <Field label="Preferred duration" required error={errors.duration_custom}>
                <Input value={form.duration_custom} onChange={(e) => set("duration_custom", e.target.value)} placeholder="e.g. 45 days" />
              </Field>
            ) : null}
          </div>

          <h2 className="mt-10 font-display text-xl font-bold text-slate-900 dark:text-white">
            Additional information <span className="text-sm font-normal text-slate-500">(Optional)</span>
          </h2>
          <div className="mt-5 space-y-5">
            <Field label="Previous experience">
              <Textarea value={form.experience} onChange={(e) => set("experience", e.target.value)} rows={3} placeholder="Cybersecurity, programming, or related experience..." />
            </Field>
            <Field label="Why are you interested?">
              <Textarea value={form.motivation} onChange={(e) => set("motivation", e.target.value)} rows={3} placeholder="Your motivation and learning goals..." />
            </Field>
            <Field label="How did you hear about us?">
              <select className={selectCls} value={form.heard_about} onChange={(e) => set("heard_about", e.target.value)}>
                <option value="">Select an option</option>
                {HEARD_ABOUT.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 rounded-none border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:justify-between">
            <div>
              <div className="text-sm text-slate-500">
                {form.interest_type === "workshop" ? "Workshop certificate fee" : "Course / internship certificate fee"}
              </div>
              <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{price.label}</div>
              {form.interest_type === "workshop" ? (
                <p className="mt-1 text-xs text-[#D92D20]">Limited marketing offer — all departments eligible</p>
              ) : null}
            </div>
            <Button type="submit" size="lg" disabled={busy} data-testid="certificate-submit" className="w-full bg-[#D92D20] hover:bg-[#B91C1C] sm:w-auto">
              {busy ? "Submitting…" : `Apply — ${price.label}`}
            </Button>
          </div>
        </form>
      </section>
    </PublicLayout>
  );
}
