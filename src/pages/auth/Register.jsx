/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect, react-hooks/purity */
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import OaxisLogo from "@/components/OaxisLogo";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import api, { formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  IconEye, IconEyeOff, IconGraduationCap, IconBriefcase, IconBuilding2,
  IconCheckCircle, IconAlertCircle, IconUpload, IconFileText, IconX,
} from "@/components/icons/AppIcons";
import {
  validateRegisterForm, normalizePhone, passwordStrength,
  PROOF_ACCEPT, validateProofFile,
} from "@/lib/registerValidation";
import { getPlanById } from "@/lib/plans";
import { postRegisterPath, resolvePostAuthPath } from "@/lib/roles";
import AlreadySignedIn from "@/components/AlreadySignedIn";

const PENDING_PLAN_KEY = "pending_plan_id";

const ROLES = [
  { v: "student", label: "Student", icon: IconGraduationCap },
  { v: "startup", label: "Startup", icon: IconBriefcase },
  { v: "institution", label: "Institution", icon: IconBuilding2 },
];

function RegisterRolePicker({ role, onRoleChange, referralInstitution }) {
  return (
    <div
      className="sticky top-0 z-30 -mx-5 border-b border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 dark:border-white/10 dark:bg-[#050810]/95"
      data-testid="register-role-picker"
    >
      <p className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        Register as
      </p>
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => {
          const isActive = role === r.v;
          const disabled = Boolean(referralInstitution) && r.v !== "student";
          const Icon = r.icon;
          return (
            <button
              key={r.v}
              type="button"
              data-testid={`register-role-${r.v}`}
              disabled={disabled}
              onClick={() => onRoleChange(r.v)}
              className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2.5 transition-all sm:min-h-11 sm:flex-row sm:gap-2 sm:px-3 ${
                isActive
                  ? "border-[#D92D20] bg-[#D92D20] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-center text-[11px] font-semibold leading-tight sm:text-sm">{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  email: "",
  password: "",
  confirm_password: "",
  full_name: "",
  phone: "",
  college_name: "",
  startup_name: "",
  founder_name: "",
  website: "",
  city: "",
  institution_name: "",
  placement_officer: "",
  proof_file: null,
  accept_terms: false,
};

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ProofUploadField({ file, error, onSelect, onClear, role }) {
  const inputRef = useRef(null);
  const hint =
    role === "startup"
      ? "Company registration, GST, DPIIT, or founder ID proof"
      : "College affiliation, AISHE, UGC, or placement authorization letter";

  return (
    <div data-testid="register-proof-upload">
      <Label className="text-slate-700 dark:text-slate-300">
        Verification proof document *
      </Label>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
      <div
        className={`mt-2 rounded-lg border border-dashed p-4 ${
          error ? "border-[#D92D20] bg-[#D92D20]/5" : "border-slate-300 bg-slate-50 dark:border-white/15 dark:bg-white/5"
        }`}
      >
        {file ? (
          <div className="flex items-start gap-3">
            <IconFileText className="mt-0.5 h-5 w-5 shrink-0 text-[#D92D20]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-white/10"
              aria-label="Remove proof file"
              data-testid="register-proof-clear"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              data-testid="register-proof-button"
              className="border-slate-300"
            >
              <IconUpload className="mr-2 h-4 w-4" /> Choose proof file
            </Button>
            <p className="mt-2 text-[11px] text-slate-500">
              PDF, PNG, JPG, WEBP, GIF, DOC, DOCX · Max 5MB
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={PROOF_ACCEPT}
          className="hidden"
          data-testid="register-proof-input"
          onChange={(e) => {
            const next = e.target.files?.[0] || null;
            e.target.value = "";
            if (!next) return;
            const err = validateProofFile(next);
            if (err) {
              toast.error(err);
              return;
            }
            onSelect(next);
          }}
        />
        {file ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 text-xs font-semibold text-[#D92D20] hover:underline"
          >
            Replace file
          </button>
        ) : null}
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-[#D92D20]" role="alert">
      <IconAlertCircle className="h-3 w-3 shrink-0" /> {msg}
    </p>
  );
}

function FormField({ id, label, required, error, children, hint }) {
  return (
    <div>
      <Label htmlFor={id} className="text-slate-700 dark:text-slate-300">
        {label}{required ? " *" : ""}
      </Label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      <FieldError msg={error} />
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, user, profile, loading } = useAuth();

  const initialRole = useMemo(() => {
    const r = params.get("role");
    if (params.get("institution")) return "student";
    return ROLES.find((x) => x.v === r) ? r : "student";
  }, [params]);

  const selectedPlan = useMemo(() => {
    const planId = params.get("plan");
    if (!planId) return null;
    const plan = getPlanById(planId);
    if (!plan || plan.audience !== initialRole) return null;
    return plan;
  }, [params, initialRole]);

  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [referralInstitution, setReferralInstitution] = useState(null);
  const institutionSlug = params.get("institution");

  useEffect(() => {
    if (!institutionSlug) {
      setReferralInstitution(null);
      return;
    }
    api.get(`/institutions/by-slug/${institutionSlug}`)
      .then(({ data }) => setReferralInstitution(data))
      .catch(() => setReferralInstitution(null));
  }, [institutionSlug]);

  const update = (k, v) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (touched[k]) {
        setErrors(validateRegisterForm(role, { ...next, institution_slug: referralInstitution?.referral_slug }));
      }
      return next;
    });
  };

  const blur = (k) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validateRegisterForm(role, { ...form, institution_slug: referralInstitution?.referral_slug }));
  };

  const setProofFile = (file) => {
    setTouched((t) => ({ ...t, proof_file: true }));
    setForm((f) => {
      const next = { ...f, proof_file: file };
      setErrors(validateRegisterForm(role, { ...next, institution_slug: referralInstitution?.referral_slug }));
      return next;
    });
  };

  const onRoleChange = (nextRole) => {
    setRole(nextRole);
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    if (params.get("plan")) {
      navigate(`/register?role=${nextRole}`, { replace: true });
    }
  };

  const pwStrength = passwordStrength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validation = validateRegisterForm(role, {
      ...form,
      institution_slug: referralInstitution?.referral_slug,
    });
    setErrors(validation);
    if (Object.keys(validation).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setBusy(true);
    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role,
      phone: normalizePhone(form.phone),
      city: form.city?.trim() || undefined,
      website: form.website?.trim() || undefined,
    };

    if (role === "student") {
      payload.full_name = form.full_name.trim();
      if (!referralInstitution) payload.college_name = form.college_name.trim();
      if (referralInstitution) payload.institution_slug = referralInstitution.referral_slug;
    } else if (role === "startup") {
      payload.startup_name = form.startup_name.trim();
      payload.founder_name = form.founder_name.trim();
    } else {
      payload.institution_name = form.institution_name.trim();
      payload.placement_officer = form.placement_officer.trim();
    }

    if (selectedPlan?.id) payload.plan_id = selectedPlan.id;

    const res = await register(payload);
    if (!res.ok) {
      setBusy(false);
      toast.error(res.error || "Sign up failed");
      return;
    }

    if ((role === "startup" || role === "institution") && form.proof_file) {
      try {
        const fd = new FormData();
        fd.append("file", form.proof_file);
        await api.post("/uploads/proof", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } catch (err) {
        setBusy(false);
        toast.error(formatApiError(err) || "Account created, but proof upload failed. Upload it from your profile.");
        navigate(postRegisterPath(role), { replace: true });
        return;
      }
    }

    setBusy(false);
    sessionStorage.removeItem(PENDING_PLAN_KEY);
    toast.success(`Account created! A confirmation email was sent to ${payload.email}. Verification pending.`);
    navigate(postRegisterPath(role), { replace: true });
  };

  const finishSocial = (res) => {
    if (!res.ok) {
      toast.error(res.error || "Sign up failed");
      return;
    }
    const r = res.user?.role || role;
    toast.success(res.isNew ? `Account created! Confirmation email sent to ${res.user?.email}.` : `Welcome back, ${res.user?.email}`);
    if (!res.isNew) {
      navigate(resolvePostAuthPath(res.user, res.profile), { replace: true });
      return;
    }
    navigate(postRegisterPath(r), { replace: true });
  };

  if (loading) {
    return (
      <div className="theme-section flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#D92D20]" />
      </div>
    );
  }

  if (user) {
    return <AlreadySignedIn page="register" />;
  }

  return (
    <div className="theme-section min-h-screen px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="inline-flex">
          <OaxisLogo />
        </Link>

        <div className="mt-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Create your account.
          </h1>
          <p className="mt-2 text-slate-600 sm:text-base dark:text-slate-400">
            Register with verified details to apply, get validated, and earn your internship certificate.
          </p>
        </div>

        <div className="mt-5">
          <RegisterRolePicker
            role={role}
            onRoleChange={onRoleChange}
            referralInstitution={referralInstitution}
          />
        </div>

        <div className="pb-10 pt-5">
          {selectedPlan ? (
            <div className="mb-5 rounded-lg border border-[#D92D20]/30 bg-[#D92D20]/5 p-4 text-sm" data-testid="register-plan-banner">
              <div className="font-semibold text-slate-900 dark:text-white">
                Selected plan: {selectedPlan.name} — {selectedPlan.price}{selectedPlan.suffix || ""}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Complete registration with verified details. After admin approval, your {role} account opens with dashboard access.
              </div>
            </div>
          ) : null}
          {referralInstitution ? (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm" data-testid="referral-banner">
              <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <div className="font-semibold text-emerald-700 dark:text-emerald-300">Joining via <span className="font-bold">{referralInstitution.name}</span></div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400/80">College mapped automatically — verification required after signup.</div>
              </div>
            </div>
          ) : null}

          <div className="mb-5">
            <SocialAuthButtons role={role} label="Sign up" onSuccess={finishSocial} />
          </div>

          <form onSubmit={submit} className="space-y-4" data-testid="register-form" noValidate>
            {role === "student" && (
              <>
                <FormField id="full-name" label="Full name" required error={touched.full_name ? errors.full_name : ""}>
                  <Input
                    id="full-name"
                    data-testid="register-full-name"
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    onBlur={() => blur("full_name")}
                    placeholder="As on college ID"
                    className={errors.full_name && touched.full_name ? "border-[#D92D20]" : ""}
                  />
                </FormField>
                {!referralInstitution && (
                  <FormField id="college-name" label="College / University" required error={touched.college_name ? errors.college_name : ""}>
                    <Input
                      id="college-name"
                      data-testid="register-college-name"
                      value={form.college_name}
                      onChange={(e) => update("college_name", e.target.value)}
                      onBlur={() => blur("college_name")}
                      placeholder="e.g. BITS Pilani"
                      className={errors.college_name && touched.college_name ? "border-[#D92D20]" : ""}
                    />
                  </FormField>
                )}
                <FormField id="student-phone" label="Mobile number" required error={touched.phone ? errors.phone : ""} hint="+91 98765 43210">
                  <Input
                    id="student-phone"
                    data-testid="register-phone"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    onBlur={() => blur("phone")}
                    placeholder="+91 9876543210"
                    className={errors.phone && touched.phone ? "border-[#D92D20]" : ""}
                  />
                </FormField>
              </>
            )}

            {role === "startup" && (
              <>
                <FormField id="startup-name" label="Startup name" required error={touched.startup_name ? errors.startup_name : ""}>
                  <Input
                    id="startup-name"
                    data-testid="register-startup-name"
                    value={form.startup_name}
                    onChange={(e) => update("startup_name", e.target.value)}
                    onBlur={() => blur("startup_name")}
                    className={errors.startup_name && touched.startup_name ? "border-[#D92D20]" : ""}
                  />
                </FormField>
                <FormField id="founder-name" label="Founder / contact name" required error={touched.founder_name ? errors.founder_name : ""}>
                  <Input
                    id="founder-name"
                    data-testid="register-founder-name"
                    value={form.founder_name}
                    onChange={(e) => update("founder_name", e.target.value)}
                    onBlur={() => blur("founder_name")}
                    className={errors.founder_name && touched.founder_name ? "border-[#D92D20]" : ""}
                  />
                </FormField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField id="startup-city" label="City" required error={touched.city ? errors.city : ""}>
                    <Input
                      id="startup-city"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      onBlur={() => blur("city")}
                      placeholder="Bengaluru"
                      className={errors.city && touched.city ? "border-[#D92D20]" : ""}
                    />
                  </FormField>
                  <FormField id="startup-website" label="Website" error={touched.website ? errors.website : ""} hint="Optional">
                    <Input
                      id="startup-website"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                      onBlur={() => blur("website")}
                      placeholder="https://yourstartup.in"
                      className={errors.website && touched.website ? "border-[#D92D20]" : ""}
                    />
                  </FormField>
                </div>
                <FormField id="startup-phone" label="Contact mobile" required error={touched.phone ? errors.phone : ""}>
                  <Input
                    id="startup-phone"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    onBlur={() => blur("phone")}
                    placeholder="+91 9876543210"
                    className={errors.phone && touched.phone ? "border-[#D92D20]" : ""}
                  />
                </FormField>
                <ProofUploadField
                  role="startup"
                  file={form.proof_file}
                  error={touched.proof_file ? errors.proof_file : ""}
                  onSelect={setProofFile}
                  onClear={() => setProofFile(null)}
                />
              </>
            )}

            {role === "institution" && (
              <>
                <FormField id="institution-name" label="Institution name" required error={touched.institution_name ? errors.institution_name : ""}>
                  <Input
                    id="institution-name"
                    data-testid="register-institution-name"
                    value={form.institution_name}
                    onChange={(e) => update("institution_name", e.target.value)}
                    onBlur={() => blur("institution_name")}
                    className={errors.institution_name && touched.institution_name ? "border-[#D92D20]" : ""}
                  />
                </FormField>
                <FormField id="placement-officer" label="Placement officer name" required error={touched.placement_officer ? errors.placement_officer : ""}>
                  <Input
                    id="placement-officer"
                    data-testid="register-placement-officer"
                    value={form.placement_officer}
                    onChange={(e) => update("placement_officer", e.target.value)}
                    onBlur={() => blur("placement_officer")}
                    className={errors.placement_officer && touched.placement_officer ? "border-[#D92D20]" : ""}
                  />
                </FormField>
                <FormField id="institution-city" label="City" required error={touched.city ? errors.city : ""}>
                  <Input
                    id="institution-city"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    onBlur={() => blur("city")}
                    placeholder="Chennai"
                    className={errors.city && touched.city ? "border-[#D92D20]" : ""}
                  />
                </FormField>
                <FormField id="institution-phone" label="Contact mobile" required error={touched.phone ? errors.phone : ""}>
                  <Input
                    id="institution-phone"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    onBlur={() => blur("phone")}
                    placeholder="+91 9876543210"
                    className={errors.phone && touched.phone ? "border-[#D92D20]" : ""}
                  />
                </FormField>
                <ProofUploadField
                  role="institution"
                  file={form.proof_file}
                  error={touched.proof_file ? errors.proof_file : ""}
                  onSelect={setProofFile}
                  onClear={() => setProofFile(null)}
                />
              </>
            )}

            <FormField
              id="register-email"
              label={role === "institution" ? "Official institution email" : "Email"}
              required
              error={touched.email ? errors.email : ""}
              hint={role === "institution" ? "Use college/university domain for faster verification" : undefined}
            >
              <Input
                id="register-email"
                type="email"
                data-testid="register-email-input"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => blur("email")}
                placeholder={role === "institution" ? "placement@college.edu.in" : "you@example.com"}
                className={errors.email && touched.email ? "border-[#D92D20]" : ""}
              />
            </FormField>

            <FormField id="register-password" label="Password" required error={touched.password ? errors.password : ""}>
              <div className="relative">
                <Input
                  id="register-password"
                  type={show ? "text" : "password"}
                  data-testid="register-password-input"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  onBlur={() => blur("password")}
                  className={errors.password && touched.password ? "border-[#D92D20]" : ""}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {form.password ? (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-none transition-colors ${
                          pwStrength.score >= i
                            ? i <= 1 ? "bg-red-500" : i <= 2 ? "bg-amber-500" : i <= 3 ? "bg-sky-500" : "bg-emerald-500"
                            : "bg-slate-100 dark:bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-slate-500">{pwStrength.label} — 8+ chars, upper, lower, number</p>
                </div>
              ) : null}
            </FormField>

            <FormField id="confirm-password" label="Confirm password" required error={touched.confirm_password ? errors.confirm_password : ""}>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={(e) => update("confirm_password", e.target.value)}
                  onBlur={() => blur("confirm_password")}
                  className={errors.confirm_password && touched.confirm_password ? "border-[#D92D20]" : ""}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Checkbox
                  checked={form.accept_terms}
                  onCheckedChange={(v) => update("accept_terms", !!v)}
                  data-testid="register-accept-terms"
                  className="mt-0.5"
                />
                <span>
                  I confirm all details are correct. I agree to{" "}
                  <Link to="/terms" className="font-semibold text-[#D92D20] dark:text-[#F87171] hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="font-semibold text-[#D92D20] dark:text-[#F87171] hover:underline">Privacy Policy</Link>.
                  {role === "student" ? " My profile will be verified before certificate issuance." : " Account verification is required before full access."}
                </span>
              </label>
              <FieldError msg={touched.accept_terms ? errors.accept_terms : ""} />
            </div>

            <Button type="submit" disabled={busy} data-testid="register-submit-button" className="w-full bg-[#D92D20] hover:bg-[#B91C1C]">
              {busy ? "Creating…" : "Create account & verify details"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to={role ? `/login?role=${role}` : "/login"}
              className="font-semibold text-[#D92D20] dark:text-[#F87171] hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
