const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const NAME_RE = /^[a-zA-Z\s.'-]{2,80}$/;

export const PROOF_MAX_BYTES = 5 * 1024 * 1024;
export const PROOF_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,application/pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const PROOF_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const PROOF_EXT = new Set(["pdf", "png", "jpg", "jpeg", "webp", "gif", "doc", "docx"]);

export function isAllowedProofFile(file) {
  if (!file) return false;
  const name = String(file.name || "").toLowerCase();
  const ext = name.includes(".") ? name.split(".").pop() : "";
  if (PROOF_EXT.has(ext)) return true;
  if (file.type && PROOF_MIME.has(file.type)) return true;
  return false;
}

export function validateProofFile(file) {
  if (!file) return "Verification proof document is required";
  if (!isAllowedProofFile(file)) {
    return "Upload PDF, image (PNG/JPG/WEBP/GIF), or Word (.doc/.docx)";
  }
  if (file.size > PROOF_MAX_BYTES) return "File too large (max 5MB)";
  return "";
}

export function normalizePhone(v) {
  const digits = String(v || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return String(v || "").trim();
}

export function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/\d/.test(password)) errors.push("One number");
  return errors;
}

export function passwordStrength(password) {
  const checks = validatePassword(password);
  if (!password) return { score: 0, label: "Enter password", checks };
  if (checks.length >= 3) return { score: 1, label: "Weak", checks };
  if (checks.length === 1) return { score: 3, label: "Good", checks };
  if (checks.length === 0) return { score: 4, label: "Strong", checks };
  return { score: 2, label: "Fair", checks };
}

function fieldError(value, rules) {
  for (const rule of rules) {
    const err = rule(value);
    if (err) return err;
  }
  return "";
}

export function validateRegisterForm(role, form) {
  const errors = {};

  const emailErr = fieldError(form.email, [
    (v) => (!v?.trim() ? "Email is required" : ""),
    (v) => (!EMAIL_RE.test(v.trim()) ? "Enter a valid email address" : ""),
  ]);
  if (emailErr) errors.email = emailErr;

  const pwChecks = validatePassword(form.password);
  if (pwChecks.length) errors.password = pwChecks[0];

  if (form.password !== form.confirm_password) {
    errors.confirm_password = "Passwords do not match";
  }

  if (!form.accept_terms) {
    errors.accept_terms = "You must accept the terms to register";
  }

  if (role === "student") {
    const nameErr = fieldError(form.full_name, [
      (v) => (!v?.trim() ? "Full name is required" : ""),
      (v) => (v.trim().split(/\s+/).length < 2 ? "Enter first and last name" : ""),
      (v) => (!NAME_RE.test(v.trim()) ? "Name can only contain letters" : ""),
    ]);
    if (nameErr) errors.full_name = nameErr;

    const phoneErr = fieldError(form.phone, [
      (v) => (!v?.trim() ? "Mobile number is required" : ""),
      (v) => (!PHONE_RE.test(normalizePhone(v)) ? "Enter valid 10-digit Indian mobile (+91)" : ""),
    ]);
    if (phoneErr) errors.phone = phoneErr;

    if (!form.college_name?.trim() && !form.institution_slug) {
      errors.college_name = "College / university name is required";
    }
  }

  if (role === "startup") {
    const startupErr = fieldError(form.startup_name, [
      (v) => (!v?.trim() ? "Startup name is required" : ""),
      (v) => (v.trim().length < 2 ? "Startup name is too short" : ""),
    ]);
    if (startupErr) errors.startup_name = startupErr;

    const founderErr = fieldError(form.founder_name, [
      (v) => (!v?.trim() ? "Founder / contact name is required" : ""),
      (v) => (!NAME_RE.test(v.trim()) ? "Enter a valid name" : ""),
    ]);
    if (founderErr) errors.founder_name = founderErr;

    const phoneErr = fieldError(form.phone, [
      (v) => (!v?.trim() ? "Contact mobile is required" : ""),
      (v) => (!PHONE_RE.test(normalizePhone(v)) ? "Enter valid 10-digit Indian mobile" : ""),
    ]);
    if (phoneErr) errors.phone = phoneErr;

    if (form.website?.trim() && !URL_RE.test(form.website.trim())) {
      errors.website = "Enter a valid website URL (https://...)";
    }

    if (!form.city?.trim()) errors.city = "City is required";

    const proofErr = validateProofFile(form.proof_file);
    if (proofErr) errors.proof_file = proofErr;
  }

  if (role === "institution") {
    const instErr = fieldError(form.institution_name, [
      (v) => (!v?.trim() ? "Institution name is required" : ""),
      (v) => (v.trim().length < 3 ? "Institution name is too short" : ""),
    ]);
    if (instErr) errors.institution_name = instErr;

    const officerErr = fieldError(form.placement_officer, [
      (v) => (!v?.trim() ? "Placement officer name is required" : ""),
      (v) => (!NAME_RE.test(v.trim()) ? "Enter a valid name" : ""),
    ]);
    if (officerErr) errors.placement_officer = officerErr;

    const phoneErr = fieldError(form.phone, [
      (v) => (!v?.trim() ? "Contact mobile is required" : ""),
      (v) => (!PHONE_RE.test(normalizePhone(v)) ? "Enter valid 10-digit Indian mobile" : ""),
    ]);
    if (phoneErr) errors.phone = phoneErr;

    if (!form.city?.trim()) errors.city = "City is required";

    const emailDomain = (form.email || "").split("@")[1] || "";
    if (emailDomain && !/\.(edu|ac|gov|org|in)$/i.test(emailDomain) && !emailDomain.includes("college") && !emailDomain.includes("university")) {
      errors.email = "Use official institution email (e.g. .edu, .ac.in, college domain)";
    }

    const proofErr = validateProofFile(form.proof_file);
    if (proofErr) errors.proof_file = proofErr;
  }

  return errors;
}
