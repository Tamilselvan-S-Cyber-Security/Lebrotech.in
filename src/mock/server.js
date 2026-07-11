// In-browser mock backend. Faithful port of the former Node/Express API
// (server/routes/index.js) so the frontend runs fully standalone — no server
// process required. Every handler mirrors the original response shape.

import { col, resetDb } from "./db";
import { scorePair, studentSummary } from "./matching";
import {
  DOMAINS, SKILLS, DEGREES, DEPARTMENTS, OPPORTUNITY_DEPARTMENTS,
  WORK_MODES, STIPEND_BUCKETS, DURATIONS,
  TEAM_SIZES, STARTUP_STAGES, INSTITUTION_TYPES, ACCREDITATIONS, APPLICATION_STAGES,
  PERKS, INDIAN_CITIES, CITY_TO_STATE, LANGUAGES, PLANS, DEFAULT_BRAND, DEMO_PASSWORD,
  ADMIN_EMAIL,
} from "./constants";

const SESSION_KEY = "oaxis_mock_session";
const ADMIN_API_BASE = process.env.REACT_APP_ADMIN_API_URL || "http://localhost:4000/api";
const ADMIN_API_DIRECT = process.env.REACT_APP_ADMIN_API_DIRECT || "http://localhost:4000/api";

function adminApiUrl(path) {
  let base = ADMIN_API_BASE.replace(/\/$/, "");
  if (!base.startsWith("http") && process.env.NODE_ENV === "development") {
    base = ADMIN_API_DIRECT.replace(/\/$/, "");
  } else if (!base.startsWith("http")) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    base = `${origin}${base}`;
  }
  return `${base}${path}`;
}

/** Fire-and-forget email via the admin Node server (nodemailer). */
function queueEmail(type, data) {
  fetch(adminApiUrl("/mail/send"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...data }),
  }).catch((err) => console.warn("[email]", err?.message || err));
}

function enrichPendingStudent(s) {
  const u = col("users").findOne({ id: s.user_id });
  return { ...s, email: u?.email, registered_at: u?.created_at };
}

function planLabelFromId(planId) {
  if (!planId || planId === "free") return "Free";
  return PLANS[planId]?.name || String(planId).replace(/_/g, " ");
}

function enrichPendingStartup(s) {
  const u = col("users").findOne({ id: s.user_id });
  return {
    ...s,
    email: u?.email || s.founder_email,
    registered_at: u?.created_at,
    selected_plan_id: s.selected_plan_id || "free",
    selected_plan_name: planLabelFromId(s.selected_plan_id),
  };
}

function enrichPendingInstitution(i) {
  const u = col("users").findOne({ id: i.user_id });
  return {
    ...i,
    email: u?.email || i.placement_email,
    registered_at: u?.created_at,
    selected_plan_id: i.selected_plan_id || "free",
    selected_plan_name: planLabelFromId(i.selected_plan_id),
  };
}

export class ApiError extends Error {
  constructor(status, detail) {
    super(typeof detail === "string" ? detail : "Request failed");
    this.status = status;
    this.detail = detail;
  }
}

function sendError(status, detail) {
  throw new ApiError(status, detail);
}

// ---------- small utilities ----------
function uuidv4() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowIso() {
  return new Date().toISOString();
}

function stripPassword(user) {
  if (!user) return user;
  const { password, password_hash, ...rest } = user;
  return rest;
}

function attachProfile(user) {
  const role = user?.role;
  let profile = null;
  if (role === "student") profile = col("students").findOne({ user_id: user.id });
  else if (role === "startup") profile = col("startups").findOne({ user_id: user.id });
  else if (role === "institution") profile = col("institutions").findOne({ user_id: user.id });
  return { user: stripPassword(user), profile };
}

function createNotification(userId, ntype, title, body, meta = {}) {
  col("notifications").insertOne({
    id: uuidv4(), user_id: userId, type: ntype, title, body, meta,
    is_read: false, created_at: nowIso(),
  });
}

function slugify(text) {
  return (text || "")
    .trim().toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "institution";
}

function ensureUniqueSlug(base, excludeId = null) {
  let candidate = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = col("institutions").findOne({
      referral_slug: candidate,
      ...(excludeId ? { id: { $ne: excludeId } } : {}),
    });
    if (!existing) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

const STUDENT_COMPLETION_RULES = [
  [(s) => !!s.full_name, 5],
  [(s) => !!s.phone, 5],
  [(s) => !!(s.degree && s.department && s.year_of_study), 20],
  [(s) => !!s.photo_url, 5],
  [(s) => (s.skills?.length || 0) >= 3, 15],
  [(s) => (s.domains?.length || 0) >= 1, 10],
  [(s) => !!s.resume_url, 15],
  [(s) => !!(s.linkedin_url || s.portfolio_url), 10],
  [(s) => !!(s.work_mode_pref && s.expected_stipend), 10],
  [(s) => !!s.bio, 5],
];

function computeStudentCompletion(s) {
  const score = STUDENT_COMPLETION_RULES.reduce((sum, [pred, weight]) => sum + (pred(s) ? weight : 0), 0);
  return Math.min(score, 100);
}

// ---------- session / auth ----------
export function getSession() {
  try { return localStorage.getItem(SESSION_KEY) || null; } catch { return null; }
}
function setSession(userId) {
  try { localStorage.setItem(SESSION_KEY, userId); } catch { /* ignore */ }
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

function requireUser(req) {
  const token = req.token || getSession();
  if (!token) sendError(401, "Not authenticated");
  const user = col("users").findOne({ id: token });
  if (!user) sendError(401, "User not found");
  req.user = stripPassword(user);
  return req.user;
}

/** Attach user when a Bearer token is present — does not fail if missing. */
function optionalUser(req) {
  const token = req.token || getSession();
  if (!token) return null;
  const user = col("users").findOne({ id: token });
  if (!user) return null;
  req.user = stripPassword(user);
  return req.user;
}

function requireRole(req, ...roles) {
  requireUser(req);
  if (!roles.includes(req.user.role)) sendError(403, "Forbidden: insufficient role");
  // Only the admin role itself is locked to the authorized email.
  // Shared routes (e.g. startup+admin) must not reject startup/institution users.
  if (req.user.role === "admin" && (req.user.email || "").toLowerCase() !== ADMIN_EMAIL) {
    sendError(403, "Admin access is restricted to the authorized administrator account");
  }
  return req.user;
}

// ---------- brand ----------
function getBrandDoc() {
  let doc = col("brand_settings").findOne({ id: "default" });
  if (!doc) {
    doc = { ...DEFAULT_BRAND, updated_at: nowIso() };
    col("brand_settings").insertOne(doc);
  }
  return doc;
}

// ---------- opportunity querying ----------
function buildOppQuery(q) {
  const query = {};
  if (q.status !== undefined && q.status !== "") query.status = q.status || "active";
  else if (q.status === undefined) query.status = "active";
  if (q.domain) query.domain = q.domain;
  if (q.mode) query.mode = q.mode;
  if (q.stipend_range) query.stipend_range = q.stipend_range;
  if (q.duration) query.duration = q.duration;
  if (q.startup_id) query.startup_id = q.startup_id;
  if (q.skill) return { ...query, skills_required: { $in: [q.skill] } };
  if (q.q) {
    const rx = q.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return {
      ...query,
      $or: [
        { title: { $regex: rx, $options: "i" } },
        { startup_name: { $regex: rx, $options: "i" } },
        { description: { $regex: rx, $options: "i" } },
      ],
    };
  }
  return query;
}

function matchesOppSkills(opp, query) {
  if (!query.skills_required?.$in) return true;
  const skill = query.skills_required.$in[0];
  return (opp.skills_required || []).includes(skill);
}

function listOpportunities(q, limit = 100) {
  const built = buildOppQuery(q);
  const { skills_required, ...rest } = built;
  let rows = col("opportunities").find(rest, { sort: { created_at: -1 }, limit: Number(limit) || 100 });
  if (skills_required) rows = rows.filter((o) => matchesOppSkills(o, built));
  if (q.status === "") {
    rows = col("opportunities").find(
      Object.fromEntries(Object.entries(built).filter(([k]) => k !== "status")),
      { sort: { created_at: -1 }, limit: Number(limit) || 100 },
    );
    if (skills_required) rows = rows.filter((o) => matchesOppSkills(o, built));
  }
  return rows;
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

function isAllowedProofUpload(file) {
  if (!file) return false;
  const name = String(file.name || "").toLowerCase();
  const ext = name.includes(".") ? name.split(".").pop() : "";
  if (PROOF_EXT.has(ext)) return true;
  if (file.type && PROOF_MIME.has(file.type)) return true;
  return false;
}

function proofContentType(file) {
  if (file?.type && PROOF_MIME.has(file.type)) return file.type;
  const ext = String(file?.name || "").toLowerCase().split(".").pop();
  const map = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext] || "application/octet-stream";
}

function num(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

// ---------- routes ----------
// Each: [method, pattern, handler]. Handler receives req = { params, query, body, user, file, token }.
const routes = [];
const R = (method, pattern, handler) => routes.push({ method, pattern, handler });

// AUTH
R("POST", "/auth/register", (req) => {
  const {
    email, password, role, full_name, startup_name, institution_name, institution_slug,
    phone, college_name, founder_name, website, city, state, placement_officer, plan_id,
  } = req.body || {};
  const normalized = (email || "").toLowerCase().trim();
  if (!["student", "startup", "institution"].includes(role)) sendError(400, "Invalid role");
  if (!normalized || !password || password.length < 8) sendError(400, "Invalid registration data");
  if (col("users").findOne({ email: normalized })) sendError(409, "Email already registered");

  let selectedPlanId = null;
  if (plan_id) {
    // All roles are free — ignore legacy paid plan ids.
    if (plan_id === "free" || plan_id === "institution_enterprise" || plan_id === "student_registration") {
      selectedPlanId = "free";
    } else if (PLANS[plan_id]?.audience === role) {
      selectedPlanId = plan_id;
    } else {
      selectedPlanId = "free";
    }
  }

  const userId = uuidv4();
  const now = nowIso();
  const user = {
    id: userId, email: normalized, password,
    role, is_verified: false, is_active: true, created_at: now, updated_at: now,
  };
  col("users").insertOne(user);

  const normalizedPhone = phone ? String(phone).replace(/\s/g, "") : null;

  if (role === "student") {
    let collegeId = null;
    let collegeName = college_name?.trim() || null;
    if (institution_slug) {
      const inst = col("institutions").findOne({ referral_slug: institution_slug.toLowerCase() });
      if (inst) { collegeId = inst.id; collegeName = inst.name; }
    }
    col("students").insertOne({
      id: uuidv4(), user_id: userId, full_name: full_name || "", email: normalized,
      phone: normalizedPhone, college_id: collegeId, college_name_raw: collegeName,
      degree: null, department: null, year_of_study: null, graduation_year: null, cgpa: null, city: city || null,
      photo_url: null, resume_url: null, linkedin_url: null, portfolio_url: null,
      bio: "", skills: [], domains: [], work_mode_pref: null, expected_stipend: null,
      availability: null, languages: [], profile_completion: 10, is_approved: false, is_onboarded: false,
      referred_by_institution: institution_slug ? institution_slug.toLowerCase() : null,
      created_at: now,
    });
  } else if (role === "startup") {
    col("startups").insertOne({
      id: uuidv4(), user_id: userId, name: startup_name || "", logo_url: null, website: website || null,
      linkedin_url: null, industry: null, stage: null, team_size: null, city: city || null, state: state || null,
      description: "", founder_name: founder_name || "", founder_linkedin: null, founder_email: normalized,
      founder_phone: normalizedPhone, dpiit_recognized: false, is_verified: false, subscription_tier: "free",
      selected_plan_id: selectedPlanId || "free", is_onboarded: false,
      proof_url: null, proof_filename: null, proof_content_type: null, proof_uploaded_at: null,
      created_at: now,
    });
  } else {
    const instName = institution_name || "";
    const referralSlug = instName ? ensureUniqueSlug(slugify(instName)) : null;
    col("institutions").insertOne({
      id: uuidv4(), user_id: userId, name: instName, type: null, city: city || null, state: state || null,
      accreditation: [], website: website || null, logo_url: null, placement_officer: placement_officer || "", placement_email: normalized,
      placement_phone: normalizedPhone, student_count_range: null, departments: [], is_verified: false, plan_tier: "free",
      selected_plan_id: selectedPlanId || "free", referral_slug: referralSlug, is_onboarded: false,
      proof_url: null, proof_filename: null, proof_content_type: null, proof_uploaded_at: null,
      created_at: now,
    });
  }

  setSession(userId);
  const profileOut = attachProfile(user);
  const displayName = role === "student" ? full_name
    : role === "startup" ? startup_name
    : institution_name;
  queueEmail("registration_welcome", { email: normalized, role, name: displayName?.trim() });
  queueEmail("admin_new_registration", {
    entityType: role,
    name: displayName?.trim() || normalized,
    email: normalized,
    details: JSON.stringify({ ...req.body, selected_plan: planLabelFromId(selectedPlanId || "free") }, null, 2),
  });
  return { ...profileOut, access_token: userId };
});

R("POST", "/auth/login", (req) => {
  const email = (req.body?.email || "").toLowerCase().trim();
  const password = req.body?.password || "";
  const user = col("users").findOne({ email });
  if (!user || user.password !== password) sendError(401, "Invalid email or password");
  if (user.is_active === false) sendError(403, "Account is disabled");
  col("users").updateOne({ id: user.id }, { $set: { last_login: nowIso() } });
  setSession(user.id);
  return { ...attachProfile(user), access_token: user.id };
});

// Social / Firebase bridge. After a successful Firebase sign-in (Google, GitHub,
// or email/password) the client calls this with the verified email. If a matching
// mock user exists we log them in; otherwise we provision a new account so the
// rest of the app (dashboards, roles, profiles) keeps working.
R("POST", "/auth/social", (req) => {
  const { email, full_name, provider, photo_url } = req.body || {};
  const requestedRole = req.body?.role;
  const normalized = (email || "").toLowerCase().trim();
  if (!normalized) sendError(400, "Social sign-in did not return an email address");

  let user = col("users").findOne({ email: normalized });
  if (user) {
    if (user.is_active === false) sendError(403, "Account is disabled");
    col("users").updateOne(
      { id: user.id },
      { $set: { last_login: nowIso(), auth_provider: provider || user.auth_provider || "password" } },
    );
    setSession(user.id);
    return { ...attachProfile(user), access_token: user.id, is_new: false };
  }

  const role = ["student", "startup", "institution"].includes(requestedRole) ? requestedRole : "student";
  const userId = uuidv4();
  const now = nowIso();
  user = {
    id: userId, email: normalized, password: null,
    role, is_verified: false, is_active: true,
    auth_provider: provider || "social", created_at: now, updated_at: now, last_login: now,
  };
  col("users").insertOne(user);

  const displayName = (full_name || "").trim() || normalized.split("@")[0];
  if (role === "student") {
    col("students").insertOne({
      id: uuidv4(), user_id: userId, full_name: displayName, email: normalized,
      phone: null, college_id: null, college_name_raw: null,
      degree: null, department: null, year_of_study: null, graduation_year: null, cgpa: null, city: null,
      photo_url: photo_url || null, resume_url: null, linkedin_url: null, portfolio_url: null,
      bio: "", skills: [], domains: [], work_mode_pref: null, expected_stipend: null,
      availability: null, languages: [], profile_completion: 10, is_approved: false, is_onboarded: false,
      referred_by_institution: null, created_at: now,
    });
  } else if (role === "startup") {
    col("startups").insertOne({
      id: uuidv4(), user_id: userId, name: displayName, logo_url: photo_url || null, website: null,
      linkedin_url: null, industry: null, stage: null, team_size: null, city: null, state: null,
      description: "", founder_name: displayName, founder_linkedin: null, founder_email: normalized,
      founder_phone: null, dpiit_recognized: false, is_verified: false, subscription_tier: "free", is_onboarded: false,
      proof_url: null, proof_filename: null, proof_content_type: null, proof_uploaded_at: null,
      created_at: now,
    });
  } else {
    col("institutions").insertOne({
      id: uuidv4(), user_id: userId, name: displayName, type: null, city: null, state: null,
      accreditation: [], website: null, logo_url: photo_url || null, placement_officer: displayName, placement_email: normalized,
      placement_phone: null, student_count_range: null, departments: [], is_verified: false, plan_tier: "free", is_onboarded: false,
      proof_url: null, proof_filename: null, proof_content_type: null, proof_uploaded_at: null,
      created_at: now,
    });
  }

  setSession(userId);
  const profileOut = attachProfile(user);
  queueEmail("registration_welcome", { email: normalized, role, name: displayName });
  queueEmail("admin_new_registration", {
    entityType: role,
    name: displayName,
    email: normalized,
    details: `Signed up via ${provider || "social"}`,
  });
  return { ...profileOut, access_token: userId, is_new: true };
});

R("POST", "/auth/logout", () => {
  clearSession();
  return { ok: true };
});

R("GET", "/auth/me", (req) => {
  requireUser(req);
  return attachProfile(req.user);
});

// META / STATS / BRAND
R("GET", "/meta/constants", () => ({
  domains: DOMAINS, skills: SKILLS, degrees: DEGREES, departments: DEPARTMENTS,
  opportunity_departments: OPPORTUNITY_DEPARTMENTS,
  work_modes: WORK_MODES, stipend_buckets: STIPEND_BUCKETS, durations: DURATIONS,
  team_sizes: TEAM_SIZES, startup_stages: STARTUP_STAGES, institution_types: INSTITUTION_TYPES,
  accreditations: ACCREDITATIONS, perks: PERKS, cities: INDIAN_CITIES,
  city_to_state: CITY_TO_STATE, languages: LANGUAGES, application_stages: APPLICATION_STAGES,
}));

R("GET", "/stats/public", () => {
  const students = Math.max(col("students").count(), 520);
  const startups = Math.max(col("startups").count(), 180);
  const institutions = Math.max(col("institutions").count(), 95);
  const activeOpps = Math.max(col("opportunities").count({ status: "active" }), 240);
  const completedApps = col("applications").count({ status: "completed" });
  const certApplies = col("certificate_applications").count();
  const certificatesDistributed = Math.max(completedApps + certApplies, 1000);
  return {
    students,
    active_students: Math.max(col("students").count({ is_approved: true }), 480),
    startups,
    verified_startups: Math.max(col("startups").count({ is_verified: true }), 150),
    institutions,
    active_opportunities: activeOpps,
    total_opportunities: col("opportunities").count(),
    applications: col("applications").count(),
    selected: col("applications").find().filter((a) => ["offer", "hired"].includes(a.status)).length,
    completed: completedApps,
    certificates_distributed: certificatesDistributed,
  };
});

R("GET", "/brand", () => getBrandDoc());
R("GET", "/admin/brand", (req) => { requireRole(req, "admin"); return getBrandDoc(); });
R("PUT", "/admin/brand", (req) => {
  requireRole(req, "admin");
  const updates = { ...req.body, updated_at: nowIso() };
  delete updates.id;
  col("brand_settings").updateOne({ id: "default" }, { $set: updates });
  return getBrandDoc();
});

// STUDENTS
R("PUT", "/students/me", (req) => {
  requireRole(req, "student");
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([, v]) => v != null));
  const student = col("students").findOne({ user_id: req.user.id });
  const merged = { ...student, ...updates };
  merged.profile_completion = computeStudentCompletion(merged);
  col("students").updateOne(
    { user_id: req.user.id },
    { $set: { ...updates, profile_completion: merged.profile_completion } },
  );
  return col("students").findOne({ user_id: req.user.id });
});

R("GET", "/students/:studentId", (req) => {
  requireUser(req);
  const student = col("students").findOne({ id: req.params.studentId });
  if (!student) sendError(404, "Student not found");
  return student;
});

R("GET", "/students", (req) => {
  requireUser(req);
  const query = {};
  if (req.query.college_id) query.college_id = req.query.college_id;
  const limit = num(req.query.limit, 50);
  let rows = col("students").find(query, { limit });
  if (req.query.skill) rows = rows.filter((s) => (s.skills || []).includes(req.query.skill));
  if (req.query.domain) rows = rows.filter((s) => (s.domains || []).includes(req.query.domain));
  return rows;
});

// STARTUPS
R("PUT", "/startups/me", (req) => {
  requireRole(req, "startup");
  const blocked = new Set(["id", "user_id", "is_verified", "is_rejected", "verified_at", "created_at", "proof_url", "proof_filename", "proof_content_type", "proof_uploaded_at"]);
  const updates = Object.fromEntries(
    Object.entries(req.body || {}).filter(([k, v]) => v != null && !blocked.has(k)),
  );
  col("startups").updateOne({ user_id: req.user.id }, { $set: updates });
  return col("startups").findOne({ user_id: req.user.id });
});

R("GET", "/startups/:startupId", (req) => {
  const startup = col("startups").findOne({ id: req.params.startupId });
  if (!startup) sendError(404, "Startup not found");
  return startup;
});

R("GET", "/startups", (req) => {
  requireUser(req);
  return col("startups").find({}, { limit: num(req.query.limit, 50) });
});

// INSTITUTIONS
R("PUT", "/institutions/me", (req) => {
  requireRole(req, "institution");
  const blocked = new Set(["id", "user_id", "is_verified", "is_rejected", "verified_at", "created_at", "proof_url", "proof_filename", "proof_content_type", "proof_uploaded_at", "referral_slug"]);
  const updates = Object.fromEntries(
    Object.entries(req.body || {}).filter(([k, v]) => v != null && !blocked.has(k)),
  );
  col("institutions").updateOne({ user_id: req.user.id }, { $set: updates });
  return col("institutions").findOne({ user_id: req.user.id });
});

R("GET", "/institutions", () => col("institutions").find({}, { limit: 500 }));

R("GET", "/institutions/by-slug/:slug", (req) => {
  const inst = col("institutions").findOne({ referral_slug: req.params.slug.toLowerCase() });
  if (!inst) sendError(404, "Institution not found");
  return {
    id: inst.id, name: inst.name, city: inst.city, state: inst.state,
    referral_slug: inst.referral_slug, logo_url: inst.logo_url,
  };
});

R("GET", "/institutions/me/referral", (req) => {
  requireRole(req, "institution");
  const inst = col("institutions").findOne({ user_id: req.user.id });
  if (!inst) sendError(404, "Institution profile not found");
  if (!inst.referral_slug) {
    const slug = ensureUniqueSlug(slugify(inst.name), inst.id);
    col("institutions").updateOne({ id: inst.id }, { $set: { referral_slug: slug } });
    inst.referral_slug = slug;
  }
  return { slug: inst.referral_slug, institution_id: inst.id, institution_name: inst.name };
});

R("GET", "/institutions/me/students", (req) => {
  requireRole(req, "institution");
  const inst = col("institutions").findOne({ user_id: req.user.id });
  if (!inst) return [];
  return col("students").find({ college_id: inst.id });
});

R("POST", "/institutions/students", (req) => {
  requireRole(req, "institution");
  const inst = col("institutions").findOne({ user_id: req.user.id });
  const body = req.body || {};
  const email = (body.email || "").toLowerCase().trim();
  const existingUser = col("users").findOne({ email });
  if (existingUser) {
    const student = col("students").findOne({ user_id: existingUser.id });
    if (student && student.college_id === inst.id) return { status: "duplicate", student_id: student.id, email };
    if (student) {
      col("students").updateOne({ id: student.id }, { $set: { college_id: inst.id, college_name_raw: inst.name } });
      return { status: "mapped", student_id: student.id, email };
    }
  }
  const userId = uuidv4();
  const studentId = uuidv4();
  col("users").insertOne({
    id: userId, email, password: DEMO_PASSWORD,
    role: "student", is_verified: true, is_active: true, created_at: nowIso(), updated_at: nowIso(),
  });
  col("students").insertOne({
    id: studentId, user_id: userId, full_name: body.full_name, email,
    phone: body.mobile || null, college_id: inst.id, college_name_raw: inst.name,
    register_number: body.register_number || null, department: body.department || null,
    year_of_study: body.year_of_study || null, degree: null, graduation_year: null, cgpa: null, city: null,
    photo_url: null, resume_url: null, linkedin_url: body.linkedin_url || null, portfolio_url: null,
    bio: "", skills: body.skills || [], domains: [], work_mode_pref: null, expected_stipend: null,
    availability: null, languages: [], profile_completion: 20, is_approved: true, is_onboarded: false,
    onboarded_by: "institution", created_at: nowIso(),
  });
  return { status: "created", student_id: studentId, email };
});

R("POST", "/institutions/students/bulk", async (req) => {
  requireRole(req, "institution", "admin");
  const inst = col("institutions").findOne({ user_id: req.user.id });
  if (!inst) sendError(404, "Institution not found");
  if (!req.file) sendError(400, "No file uploaded");
  if (req.file.name?.toLowerCase().endsWith(".xlsx")) {
    sendError(400, "In standalone mode, upload a .csv file. Use the template download above.");
  }
  const text = await req.file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  const rows = lines.slice(1).map((l) => l.split(",").map((c) => c.trim()));
  const created = [];
  const mapped = [];
  const failed = [];
  rows.forEach((row, i) => {
    const [fullName, registerNumber, department, year, email, mobile, gender, skills, linkedin] = row;
    if (!email) { failed.push({ row: i + 2, name: fullName || "", email: "", error: "Missing email" }); return; }
    const normalized = String(email).toLowerCase().trim();
    const existingUser = col("users").findOne({ email: normalized });
    if (existingUser) {
      const student = col("students").findOne({ user_id: existingUser.id });
      if (student) {
        col("students").updateOne({ id: student.id }, { $set: { college_id: inst.id, college_name_raw: inst.name } });
        mapped.push({ email: normalized, student_id: student.id });
        return;
      }
    }
    const userId = uuidv4();
    const studentId = uuidv4();
    col("users").insertOne({
      id: userId, email: normalized, password: DEMO_PASSWORD,
      role: "student", is_verified: true, is_active: true, created_at: nowIso(), updated_at: nowIso(),
    });
    col("students").insertOne({
      id: studentId, user_id: userId, full_name: fullName || "", email: normalized,
      register_number: registerNumber || null, department: department || null,
      year_of_study: year ? Number(year) : null, phone: mobile || null,
      gender: gender || null, college_id: inst.id, college_name_raw: inst.name,
      degree: null, graduation_year: null, cgpa: null, city: null,
      photo_url: null, resume_url: null, linkedin_url: linkedin || null, portfolio_url: null,
      bio: "", skills: skills ? String(skills).split(/[;|]/).map((s) => s.trim()).filter(Boolean) : [], domains: [],
      work_mode_pref: null, expected_stipend: null, availability: null, languages: [],
      profile_completion: 20, is_approved: true, is_onboarded: false, onboarded_by: "institution", created_at: nowIso(),
    });
    created.push({ email: normalized, student_id: studentId });
  });
  return {
    summary: { total_rows: rows.length, created: created.length, mapped: mapped.length, failed: failed.length },
    created, mapped, failed,
  };
});

R("GET", "/institutions/:institutionId/stats", (req) => {
  requireRole(req, "institution", "admin");
  const institutionId = req.params.institutionId;
  const students = col("students").find({ college_id: institutionId });
  const studentIds = students.map((s) => s.id);
  const deptByStudent = Object.fromEntries(students.map((s) => [s.id, s.department || "Other"]));
  const apps = col("applications").find({ student_id: { $in: studentIds } });
  const deptApps = {};
  const months = {};
  const startupApps = {};
  for (const a of apps) {
    const d = deptByStudent[a.student_id] || "Other";
    deptApps[d] = (deptApps[d] || 0) + 1;
    try {
      const m = new Date(a.applied_at).toLocaleString("en-US", { month: "short", year: "numeric" });
      months[m] = (months[m] || 0) + 1;
    } catch { /* ignore */ }
    startupApps[a.startup_name || ""] = (startupApps[a.startup_name || ""] || 0) + 1;
  }
  const completed = students.filter((s) => (s.profile_completion || 0) >= 70).length;
  return {
    total_students: students.length,
    profile_complete: completed,
    active_last_30_days: completed,
    total_applications: apps.length,
    shortlisted: apps.filter((a) => ["shortlisted", "interview", "offer", "hired"].includes(a.status)).length,
    hired: apps.filter((a) => a.status === "hired").length,
    departments: Object.entries(deptApps).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    monthly_trend: Object.entries(months).map(([month, applications]) => ({ month, applications })),
    top_startups: Object.entries(startupApps).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count })),
  };
});

// OPPORTUNITIES
R("POST", "/opportunities", (req) => {
  requireRole(req, "startup");
  const startup = col("startups").findOne({ user_id: req.user.id });
  if (!startup) sendError(400, "Complete your startup profile first");
  const body = req.body || {};
  const deadline = new Date(body.deadline);
  if (deadline < new Date()) sendError(400, "Deadline cannot be in the past");
  const imageUrl = (() => {
    const v = String(body.image_url || "").trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
    return null;
  })();
  const opp = {
    id: uuidv4(), startup_id: startup.id, startup_name: startup.name,
    title: body.title, type: "internship", department: body.department, domain: body.domain,
    duration: body.duration, mode: body.mode, city: body.city || null,
    stipend_range: body.stipend_range, skills_required: body.skills_required || [],
    description: body.description, perks: body.perks || [],
    eligibility_years: body.eligibility_years || [], eligibility_degrees: body.eligibility_degrees || [],
    openings: body.openings || 1, deadline: deadline.toISOString(),
    apply_method: body.apply_method || "platform", apply_link: body.apply_link || null,
    image_url: imageUrl,
    status: "active", is_featured: false, view_count: 0,
    created_at: nowIso(), expires_at: deadline.toISOString(),
  };
  col("opportunities").insertOne(opp);
  return opp;
});

R("GET", "/opportunities", (req) => {
  if (req.query.status === "") {
    const q = { ...req.query };
    delete q.status;
    const built = buildOppQuery({ ...q, status: null });
    delete built.status;
    let rows = col("opportunities").find(built, { sort: { created_at: -1 }, limit: num(req.query.limit, 100) });
    if (req.query.skill) rows = rows.filter((o) => (o.skills_required || []).includes(req.query.skill));
    return rows;
  }
  return listOpportunities(req.query, req.query.limit);
});

R("GET", "/opportunities/:oppId", (req) => {
  const opp = col("opportunities").findOne({ id: req.params.oppId });
  if (!opp) sendError(404, "Opportunity not found");
  col("opportunities").updateOne({ id: opp.id }, { $inc: { view_count: 1 } });
  return { ...opp, view_count: (opp.view_count || 0) + 1 };
});

R("PATCH", "/opportunities/:oppId/status", (req) => {
  requireRole(req, "startup", "admin");
  const status = req.body?.status;
  if (!["draft", "active", "paused", "closed"].includes(status)) sendError(400, "Invalid status");
  col("opportunities").updateOne({ id: req.params.oppId }, { $set: { status } });
  return { ok: true };
});

R("POST", "/opportunities/:oppId/apply", (req) => {
  requireRole(req, "student");
  const opp = col("opportunities").findOne({ id: req.params.oppId });
  if (!opp) sendError(404, "Opportunity not found");
  if (opp.status !== "active") sendError(400, "Opportunity is not accepting applications");
  const student = col("students").findOne({ user_id: req.user.id });
  if (!student) sendError(400, "Complete your student profile first");
  if (col("applications").findOne({ opportunity_id: opp.id, student_id: student.id })) {
    sendError(409, "You have already applied to this opportunity");
  }
  const appDoc = {
    id: uuidv4(), opportunity_id: opp.id, opportunity_title: opp.title,
    startup_id: opp.startup_id, startup_name: opp.startup_name,
    student_id: student.id, student_name: student.full_name,
    status: "applied", cover_note: req.body?.cover_note || null,
    startup_notes: null, applied_at: nowIso(), updated_at: nowIso(),
  };
  col("applications").insertOne(appDoc);
  const startup = col("startups").findOne({ id: opp.startup_id });
  if (startup) {
    createNotification(startup.user_id, "application_received", "New application received",
      `${student.full_name} applied to ${opp.title}`, { application_id: appDoc.id, opportunity_id: opp.id });
    queueEmail("application_notify_startup", {
      startupEmail: startup.founder_email,
      studentName: student.full_name,
      oppTitle: opp.title,
    });
  }
  queueEmail("application_submitted", {
    studentEmail: student.email || req.user.email,
    studentName: student.full_name,
    oppTitle: opp.title,
    startupName: opp.startup_name,
  });
  return appDoc;
});

R("GET", "/applications/me", (req) => {
  requireUser(req);
  if (req.user.role === "student") {
    const student = col("students").findOne({ user_id: req.user.id });
    if (!student) return [];
    return col("applications").find({ student_id: student.id }, { sort: { applied_at: -1 }, limit: 500 });
  }
  if (req.user.role === "startup") {
    const startup = col("startups").findOne({ user_id: req.user.id });
    if (!startup) return [];
    return col("applications").find({ startup_id: startup.id }, { sort: { applied_at: -1 }, limit: 500 });
  }
  return [];
});

R("GET", "/opportunities/:oppId/applicants", (req) => {
  requireRole(req, "startup", "admin");
  return col("applications").find({ opportunity_id: req.params.oppId }, { sort: { applied_at: -1 }, limit: 500 });
});

R("PATCH", "/applications/:appId/status", (req) => {
  requireRole(req, "startup", "admin");
  const newStatus = req.body?.status;
  if (!APPLICATION_STAGES.includes(newStatus)) sendError(400, "Invalid status");
  const appDoc = col("applications").findOne({ id: req.params.appId });
  if (!appDoc) sendError(404, "Application not found");
  const updateSet = { status: newStatus, updated_at: nowIso() };
  if (req.body?.startup_notes != null) updateSet.startup_notes = req.body.startup_notes;
  col("applications").updateOne({ id: appDoc.id }, { $set: updateSet });
  const student = col("students").findOne({ id: appDoc.student_id });
  if (student) {
    const msgs = {
      reviewed: ["Your application was reviewed", `${appDoc.startup_name} viewed your application for ${appDoc.opportunity_title}`],
      shortlisted: ["You've been shortlisted!", `Great news — you've been shortlisted for ${appDoc.opportunity_title} at ${appDoc.startup_name}`],
      interview: ["Interview scheduled", `You have an interview for ${appDoc.opportunity_title} at ${appDoc.startup_name}`],
      offer: ["You've received an offer", `Congratulations — ${appDoc.startup_name} has extended an offer for ${appDoc.opportunity_title}`],
      hired: ["You've been hired!", `You've been hired at ${appDoc.startup_name}. Congratulations!`],
      rejected: ["Application update", `Your application for ${appDoc.opportunity_title} was not moved forward this time. Keep applying!`],
    };
    const [title, body] = msgs[newStatus] || ["Application update", ""];
    if (title) createNotification(student.user_id, "application_status", title, body, { application_id: appDoc.id });
  }
  return col("applications").findOne({ id: appDoc.id });
});

R("POST", "/saved/opportunities/:oppId", (req) => {
  requireRole(req, "student");
  const student = col("students").findOne({ user_id: req.user.id });
  col("saved_opportunities").upsert(
    { student_id: student.id, opportunity_id: req.params.oppId },
    { saved_at: nowIso() },
  );
  return { ok: true };
});

R("DELETE", "/saved/opportunities/:oppId", (req) => {
  requireRole(req, "student");
  const student = col("students").findOne({ user_id: req.user.id });
  col("saved_opportunities").deleteOne({ student_id: student.id, opportunity_id: req.params.oppId });
  return { ok: true };
});

R("GET", "/saved/opportunities", (req) => {
  requireRole(req, "student");
  const student = col("students").findOne({ user_id: req.user.id });
  const saved = col("saved_opportunities").find({ student_id: student.id });
  const ids = saved.map((s) => s.opportunity_id);
  return col("opportunities").find({ id: { $in: ids } });
});

// MATCHING
R("GET", "/matching/student-recommendations", (req) => {
  requireRole(req, "student");
  const student = col("students").findOne({ user_id: req.user.id });
  if (!student) sendError(400, "Complete your student profile first");
  const appliedIds = col("applications").distinct("opportunity_id", { student_id: student.id });
  const opps = col("opportunities").find({ status: "active", id: { $nin: appliedIds } });
  const scored = opps.map((opp) => {
    const result = scorePair(student, opp);
    return result.score > 0 ? { ...opp, match_score: result.score, match_reasons: result.reasons } : null;
  }).filter(Boolean).sort((a, b) => b.match_score - a.match_score);
  return scored.slice(0, num(req.query.limit, 12));
});

R("GET", "/matching/startup-recommendations/:oppId", (req) => {
  requireRole(req, "startup", "admin");
  const opp = col("opportunities").findOne({ id: req.params.oppId });
  if (!opp) sendError(404, "Opportunity not found");
  if (req.user.role === "startup") {
    const startup = col("startups").findOne({ user_id: req.user.id });
    if (!startup || opp.startup_id !== startup.id) sendError(403, "Forbidden");
  }
  const appliedIds = col("applications").distinct("student_id", { opportunity_id: opp.id });
  const students = col("students").find({ is_approved: true, id: { $nin: appliedIds } });
  const scored = students.map((s) => {
    const result = scorePair(s, opp);
    return result.score > 0 ? studentSummary(s, result) : null;
  }).filter(Boolean).sort((a, b) => b.match_score - a.match_score);
  return scored.slice(0, num(req.query.limit, 12));
});

R("GET", "/matching/startup-recommendations", (req) => {
  requireRole(req, "startup");
  const startup = col("startups").findOne({ user_id: req.user.id });
  if (!startup) return [];
  const opp = col("opportunities").find({ startup_id: startup.id, status: "active" }, { sort: { created_at: -1 }, limit: 1 })[0];
  if (!opp) return [];
  const appliedIds = col("applications").distinct("student_id", { opportunity_id: opp.id });
  const students = col("students").find({ is_approved: true, id: { $nin: appliedIds } });
  const scored = students.map((s) => {
    const result = scorePair(s, opp);
    return result.score > 0 ? studentSummary(s, result, { for_opportunity_id: opp.id, for_opportunity_title: opp.title }) : null;
  }).filter(Boolean).sort((a, b) => b.match_score - a.match_score);
  return scored.slice(0, num(req.query.limit, 8));
});

// NOTIFICATIONS
R("GET", "/notifications", (req) => {
  requireUser(req);
  return col("notifications").find({ user_id: req.user.id }, { sort: { created_at: -1 }, limit: 100 });
});

R("POST", "/notifications/read-all", (req) => {
  requireUser(req);
  col("notifications").updateMany({ user_id: req.user.id }, { $set: { is_read: true } });
  return { ok: true };
});

R("POST", "/notifications/:nid/read", (req) => {
  requireUser(req);
  col("notifications").updateOne({ id: req.params.nid, user_id: req.user.id }, { $set: { is_read: true } });
  return { ok: true };
});

// MESSAGES
function resolveThread(applicationId, user) {
  const app = col("applications").findOne({ id: applicationId });
  if (!app) return { error: [404, "Application not found"] };
  if (user.role === "admin") return { app, side: "admin" };
  const student = col("students").findOne({ user_id: user.id });
  const startup = col("startups").findOne({ user_id: user.id });
  if (student && app.student_id === student.id) return { app, side: "student" };
  if (startup && app.startup_id === startup.id) return { app, side: "startup" };
  return { error: [403, "Not a participant in this thread"] };
}

R("GET", "/messages/threads", (req) => {
  requireRole(req, "student", "startup");
  let apps = [];
  if (req.user.role === "student") {
    const student = col("students").findOne({ user_id: req.user.id });
    apps = col("applications").find({ student_id: student?.id });
  } else {
    const startup = col("startups").findOne({ user_id: req.user.id });
    apps = col("applications").find({ startup_id: startup?.id });
  }
  const threads = apps.map((app) => {
    const msgs = col("messages").find({ application_id: app.id }, { sort: { created_at: -1 }, limit: 1 });
    const unread = col("messages").find({
      application_id: app.id, is_read: false, sender_role: { $ne: req.user.role },
    }).length;
    return {
      application_id: app.id,
      opportunity_title: app.opportunity_title,
      student_name: app.student_name,
      startup_name: app.startup_name,
      application_status: app.status,
      last_message: msgs[0]?.body || null,
      last_message_at: msgs[0]?.created_at || app.applied_at,
      has_messages: msgs.length > 0,
      unread_count: unread,
    };
  }).sort((a, b) => {
    if (a.has_messages !== b.has_messages) return b.has_messages - a.has_messages;
    return (b.last_message_at || "").localeCompare(a.last_message_at || "");
  });
  return threads;
});

R("GET", "/messages/unread/count", (req) => {
  requireRole(req, "student", "startup");
  const count = col("messages").find({ is_read: false, sender_role: { $ne: req.user.role } })
    .filter((m) => {
      const { error } = resolveThread(m.application_id, req.user);
      return !error;
    }).length;
  return { count };
});

R("POST", "/messages/:applicationId/read", (req) => {
  requireUser(req);
  const { error } = resolveThread(req.params.applicationId, req.user);
  if (error) sendError(error[0], error[1]);
  for (const m of col("messages").find({ application_id: req.params.applicationId })) {
    if (m.sender_role !== req.user.role && !m.is_read) {
      col("messages").updateOne({ id: m.id }, { $set: { is_read: true } });
    }
  }
  return { ok: true };
});

R("POST", "/messages/:applicationId", (req) => {
  requireUser(req);
  const { app, error } = resolveThread(req.params.applicationId, req.user);
  if (error) sendError(error[0], error[1]);
  const body = (req.body?.body || "").trim();
  if (!body || body.length > 4000) sendError(400, "Invalid message body");
  const msg = {
    id: uuidv4(), application_id: app.id, sender_id: req.user.id,
    sender_role: req.user.role, body, is_read: false, created_at: nowIso(),
  };
  col("messages").insertOne(msg);
  const otherRole = req.user.role === "student" ? "startup" : "student";
  const otherUserId = otherRole === "student"
    ? col("students").findOne({ id: app.student_id })?.user_id
    : col("startups").findOne({ id: app.startup_id })?.user_id;
  if (otherUserId) {
    createNotification(otherUserId, "message", "New message", body.slice(0, 120), { application_id: app.id });
  }
  return msg;
});

R("GET", "/messages/:applicationId", (req) => {
  requireUser(req);
  const { error } = resolveThread(req.params.applicationId, req.user);
  if (error) sendError(error[0], error[1]);
  let msgs = col("messages").find({ application_id: req.params.applicationId }, { sort: { created_at: 1 } });
  if (req.query.since) msgs = msgs.filter((m) => m.created_at > req.query.since);
  return msgs;
});

// UPLOADS
R("POST", "/uploads/resume", async (req) => {
  requireRole(req, "student");
  if (!req.file?.name?.toLowerCase().endsWith(".pdf")) sendError(400, "Only PDF files are accepted for resumes");
  if (req.file.size > 5 * 1024 * 1024) sendError(400, "File too large (max 5MB)");
  const dataUrl = await fileToDataUrl(req.file);
  const fileId = uuidv4();
  col("files").insertOne({
    id: fileId, user_id: req.user.id, data_url: dataUrl,
    original_filename: req.file.name, content_type: "application/pdf",
    size: req.file.size, is_deleted: false, created_at: nowIso(),
  });
  col("students").updateOne({ user_id: req.user.id }, { $set: { resume_url: dataUrl } });
  return { file_id: fileId, url: dataUrl, filename: req.file.name, size: req.file.size };
});

R("POST", "/uploads/photo", async (req) => {
  requireUser(req);
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowed.includes(req.file?.type)) sendError(400, "Only PNG/JPG/WEBP images allowed");
  if (req.file.size > 3 * 1024 * 1024) sendError(400, "Image too large (max 3MB)");
  const dataUrl = await fileToDataUrl(req.file);
  const fileId = uuidv4();
  col("files").insertOne({
    id: fileId, user_id: req.user.id, data_url: dataUrl,
    original_filename: req.file.name, content_type: req.file.type,
    size: req.file.size, is_deleted: false, created_at: nowIso(),
  });
  if (req.user.role === "student") col("students").updateOne({ user_id: req.user.id }, { $set: { photo_url: dataUrl } });
  else if (req.user.role === "startup") col("startups").updateOne({ user_id: req.user.id }, { $set: { logo_url: dataUrl } });
  else if (req.user.role === "institution") col("institutions").updateOne({ user_id: req.user.id }, { $set: { logo_url: dataUrl } });
  return { file_id: fileId, url: dataUrl, filename: req.file.name, size: req.file.size };
});

R("POST", "/uploads/proof", async (req) => {
  requireRole(req, "startup", "institution");
  if (!req.file) sendError(400, "No proof document uploaded");
  if (!isAllowedProofUpload(req.file)) {
    sendError(400, "Only PDF, images (PNG/JPG/WEBP/GIF), or Word (.doc/.docx) are accepted");
  }
  if (req.file.size > 5 * 1024 * 1024) sendError(400, "File too large (max 5MB)");
  const dataUrl = await fileToDataUrl(req.file);
  const contentType = proofContentType(req.file);
  const fileId = uuidv4();
  const now = nowIso();
  col("files").insertOne({
    id: fileId, user_id: req.user.id, data_url: dataUrl,
    original_filename: req.file.name, content_type: contentType,
    size: req.file.size, kind: "verification_proof", is_deleted: false, created_at: now,
  });
  const proofFields = {
    proof_url: dataUrl,
    proof_filename: req.file.name,
    proof_content_type: contentType,
    proof_uploaded_at: now,
  };
  if (req.user.role === "startup") col("startups").updateOne({ user_id: req.user.id }, { $set: proofFields });
  else col("institutions").updateOne({ user_id: req.user.id }, { $set: proofFields });
  return { file_id: fileId, url: dataUrl, filename: req.file.name, size: req.file.size, content_type: contentType };
});

// CONTACT
R("POST", "/contact", (req) => {
  const body = req.body || {};
  const id = uuidv4();
  col("contact_enquiries").insertOne({
    id, ...body, status: "new", admin_response: null, created_at: nowIso(), updated_at: nowIso(),
  });
  return { ok: true, id };
});

// CERTIFICATE APPLICATIONS (workshop ₹199 · course/internship ₹1200)
R("POST", "/certificate-applications", (req) => {
  const body = req.body || {};
  const normalizedEmail = (body.email || "").toLowerCase().trim();
  if (!body.full_name || !normalizedEmail || !body.program) {
    sendError(400, "Missing required fields");
  }
  const user = optionalUser(req);
  const id = uuidv4();
  const doc = {
    id,
    ...body,
    email: normalizedEmail,
    user_id: user?.id || body.user_id || null,
    status: "new",
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  col("certificate_applications").insertOne(doc);
  queueEmail("certificate_application", {
    email: normalizedEmail,
    name: body.full_name,
    program: body.program,
    interestType: body.interest_type,
    duration: body.duration,
    mode: body.mode,
    price: body.price,
  });
  queueEmail("admin_new_certificate", {
    name: body.full_name,
    email: normalizedEmail,
    program: body.program,
    whatsapp: body.whatsapp,
    phone: body.phone,
    age: body.age,
    school: body.school,
    college: body.college,
    degree: body.degree,
    interestType: body.interest_type,
    duration: body.duration,
    mode: body.mode,
    price: body.price,
    experience: body.experience,
    motivation: body.motivation,
    heard_about: body.heard_about,
    applicationId: id,
  });
  return { ok: true, id };
});

R("GET", "/certificate-applications/me", (req) => {
  requireRole(req, "student");
  const email = (req.user.email || "").toLowerCase();
  const items = col("certificate_applications").find({}, { sort: { created_at: -1 }, limit: 500 });
  return items.filter(
    (a) => a.user_id === req.user.id || (a.email || "").toLowerCase() === email,
  );
});

R("GET", "/admin/certificate-applications", (req) => {
  requireRole(req, "admin");
  const limit = Math.min(num(req.query.limit, 200), 500);
  return col("certificate_applications").find({}, { sort: { created_at: -1 }, limit });
});

R("PATCH", "/admin/certificate-applications/:id", (req) => {
  requireRole(req, "admin");
  const updates = { ...req.body, updated_at: nowIso() };
  delete updates.id;
  col("certificate_applications").updateOne({ id: req.params.id }, { $set: updates });
  return col("certificate_applications").findOne({ id: req.params.id });
});

R("GET", "/admin/enquiries", (req) => {
  requireRole(req, "admin");
  let items = col("contact_enquiries").find({}, { sort: { created_at: -1 }, limit: num(req.query.limit, 200) });
  if (req.query.user_type) items = items.filter((i) => i.user_type === req.query.user_type);
  if (req.query.status) items = items.filter((i) => i.status === req.query.status);
  const all = col("contact_enquiries").find();
  return {
    items,
    stats: {
      total: all.length,
      new: all.filter((i) => i.status === "new").length,
      in_progress: all.filter((i) => i.status === "in_progress").length,
      resolved: all.filter((i) => i.status === "resolved").length,
    },
  };
});

R("PATCH", "/admin/enquiries/:enquiryId", (req) => {
  requireRole(req, "admin");
  const updates = { ...req.body, updated_at: nowIso() };
  col("contact_enquiries").updateOne({ id: req.params.enquiryId }, { $set: updates });
  return col("contact_enquiries").findOne({ id: req.params.enquiryId });
});

// BILLING
function enrichBillingAttempt(attempt) {
  const user = col("users").findOne({ id: attempt.user_id });
  const plan = PLANS[attempt.plan_id];
  return {
    ...attempt,
    user_email: user?.email || "—",
    user_role: user?.role || "—",
    razorpay_link: plan?.razorpay_link || null,
    plan_period: plan?.period || null,
    plan_tier: plan?.tier || null,
  };
}

R("GET", "/billing/plans", () => PLANS);

R("POST", "/billing/initiate", (req) => {
  requireUser(req);
  sendError(400, "Lerbo Tech is free for students, startups, and institutions — no paid plans");
});

R("POST", "/billing/confirm", (req) => {
  requireUser(req);
  const attempt = col("subscription_attempts").findOne({ id: req.body?.attempt_id, user_id: req.user.id });
  if (!attempt) sendError(404, "Payment attempt not found");
  col("subscription_attempts").updateOne({ id: attempt.id }, {
    $set: {
      status: "pending_verification",
      payment_reference: req.body?.payment_reference || null,
      confirmed_at: nowIso(),
    },
  });
  return { ok: true, status: "pending_verification" };
});

R("GET", "/billing/me", (req) => {
  requireUser(req);
  let tier = "free";
  let status = null;
  let expires = null;
  if (req.user.role === "student") {
    const s = col("students").findOne({ user_id: req.user.id });
    tier = s?.subscription_tier || "free";
    status = s?.subscription_status || null;
    expires = s?.subscription_expires_at || null;
  } else if (req.user.role === "startup") {
    const s = col("startups").findOne({ user_id: req.user.id });
    tier = s?.subscription_tier || "free";
    status = s?.subscription_status || null;
    expires = s?.subscription_expires_at || null;
  } else if (req.user.role === "institution") {
    const i = col("institutions").findOne({ user_id: req.user.id });
    tier = i?.plan_tier || "free";
    status = i?.subscription_status || null;
    expires = i?.subscription_expires_at || null;
  }
  const latest = col("subscription_attempts").find({ user_id: req.user.id }, { sort: { created_at: -1 }, limit: 1 })[0] || null;
  return { subscription_tier: tier, subscription_status: status, subscription_expires_at: expires, latest_attempt: latest };
});

R("POST", "/billing/enterprise-enquiry", (req) => {
  const id = uuidv4();
  col("enterprise_enquiries").insertOne({ id, ...req.body, created_at: nowIso() });
  return { ok: true, id };
});

R("GET", "/admin/billing/attempts", (req) => {
  requireRole(req, "admin");
  let items = col("subscription_attempts").find({}, { sort: { created_at: -1 } });
  if (req.query.status) items = items.filter((i) => i.status === req.query.status);
  const all = col("subscription_attempts").find();
  return {
    items: items.map(enrichBillingAttempt),
    stats: {
      total: all.length,
      initiated: all.filter((i) => i.status === "initiated").length,
      pending_verification: all.filter((i) => i.status === "pending_verification").length,
      approved: all.filter((i) => i.status === "approved").length,
      rejected: all.filter((i) => i.status === "rejected").length,
      revenue_inr: all.filter((i) => i.status === "approved").reduce((s, i) => s + (i.amount_inr || 0), 0),
    },
  };
});

R("GET", "/admin/billing/plans", (req) => {
  requireRole(req, "admin");
  const all = col("subscription_attempts").find();
  return Object.entries(PLANS).map(([id, plan]) => ({
    id,
    ...plan,
    attempts_total: all.filter((a) => a.plan_id === id).length,
    attempts_pending: all.filter((a) => a.plan_id === id && a.status === "pending_verification").length,
    attempts_approved: all.filter((a) => a.plan_id === id && a.status === "approved").length,
    attempts_rejected: all.filter((a) => a.plan_id === id && a.status === "rejected").length,
  }));
});

R("PATCH", "/admin/billing/attempts/:attemptId/verify", (req) => {
  requireRole(req, "admin");
  const attempt = col("subscription_attempts").findOne({ id: req.params.attemptId });
  if (!attempt) sendError(404, "Attempt not found");
  const action = req.body?.action;
  if (!["approve", "reject"].includes(action)) sendError(400, "Invalid action");
  const status = action === "approve" ? "approved" : "rejected";
  col("subscription_attempts").updateOne({ id: attempt.id }, {
    $set: { status, admin_note: req.body?.note || null, verified_at: nowIso() },
  });
  if (action === "approve") {
    const plan = PLANS[attempt.plan_id];
    const user = col("users").findOne({ id: attempt.user_id });
    if (user?.role === "startup") {
      col("startups").updateOne({ user_id: user.id }, { $set: { subscription_tier: plan?.tier || "starter", subscription_status: "active" } });
    } else if (user?.role === "institution") {
      col("institutions").updateOne({ user_id: user.id }, { $set: { plan_tier: plan?.tier || "campus_partner", subscription_status: "active" } });
    } else if (user?.role === "student") {
      col("students").updateOne({ user_id: user.id }, { $set: { subscription_tier: "registered", subscription_status: "active" } });
    }
  }
  return { ok: true, status };
});

R("GET", "/admin/billing/enterprise-enquiries", (req) => {
  requireRole(req, "admin");
  return col("enterprise_enquiries").find({}, { sort: { created_at: -1 } });
});

// ADMIN
R("GET", "/admin/stats", (req) => {
  requireRole(req, "admin");
  const students = col("students").count();
  return {
    students, startups: col("startups").count(), institutions: col("institutions").count(),
    opportunities: col("opportunities").count({ status: "active" }),
    applications: col("applications").count(),
    pending_startups: col("startups").count({ is_verified: false }),
    pending_students: col("students").count({ is_approved: false }),
    dau: Math.max(Math.floor(students / 4), 10),
    wau: Math.max(Math.floor(students / 2), 25),
  };
});

R("GET", "/admin/users", (req) => {
  requireRole(req, "admin");
  let users = col("users").find(req.query.role ? { role: req.query.role } : {}, { sort: { created_at: -1 }, limit: 500 });
  users = users.map((u) => {
    const out = stripPassword(u);
    if (u.role === "student") out.profile_id = col("students").findOne({ user_id: u.id })?.id;
    else if (u.role === "startup") out.profile_id = col("startups").findOne({ user_id: u.id })?.id;
    else if (u.role === "institution") out.profile_id = col("institutions").findOne({ user_id: u.id })?.id;
    return out;
  });
  return users;
});

R("POST", "/admin/verify-startup/:id", (req) => {
  requireRole(req, "admin");
  const approve = req.body?.approve !== false;
  const startup = col("startups").findOne({ id: req.params.id });
  if (!startup) sendError(404, "Startup not found");
  col("startups").updateOne(
    { id: req.params.id },
    { $set: { is_verified: approve, is_rejected: !approve, verified_at: approve ? nowIso() : null } },
  );
  col("users").updateOne({ id: startup.user_id }, { $set: { is_verified: approve } });
  const user = col("users").findOne({ id: startup.user_id });
  queueEmail(approve ? "verification_approved" : "verification_rejected", {
    email: user?.email || startup.founder_email,
    name: startup.name,
    entityType: "startup",
  });
  return { ok: true, approved: approve };
});

R("POST", "/admin/verify-student/:id", (req) => {
  requireRole(req, "admin");
  const approve = req.body?.approve !== false;
  const student = col("students").findOne({ id: req.params.id });
  if (!student) sendError(404, "Student not found");
  col("students").updateOne(
    { id: req.params.id },
    { $set: { is_approved: approve, is_rejected: !approve, approved_at: approve ? nowIso() : null } },
  );
  col("users").updateOne({ id: student.user_id }, { $set: { is_verified: approve } });
  const user = col("users").findOne({ id: student.user_id });
  queueEmail(approve ? "verification_approved" : "verification_rejected", {
    email: user?.email || student.email,
    name: student.full_name,
    entityType: "student",
  });
  return { ok: true, approved: approve };
});

R("POST", "/admin/verify-institution/:id", (req) => {
  requireRole(req, "admin");
  const approve = req.body?.approve !== false;
  const inst = col("institutions").findOne({ id: req.params.id });
  if (!inst) sendError(404, "Institution not found");
  const updates = { is_verified: approve, is_rejected: !approve, verified_at: approve ? nowIso() : null };
  if (approve && !inst.referral_slug && inst.name) {
    updates.referral_slug = ensureUniqueSlug(slugify(inst.name), inst.id);
  }
  col("institutions").updateOne({ id: req.params.id }, { $set: updates });
  col("users").updateOne({ id: inst.user_id }, { $set: { is_verified: approve } });
  const user = col("users").findOne({ id: inst.user_id });
  queueEmail(approve ? "verification_approved" : "verification_rejected", {
    email: user?.email || inst.placement_email,
    name: inst.name,
    entityType: "institution",
  });
  return { ok: true, approved: approve };
});

R("PATCH", "/admin/users/:userId/active", (req) => {
  requireRole(req, "admin");
  if (req.params.userId === req.user.id && req.body?.is_active === false) {
    sendError(400, "You cannot disable your own admin account");
  }
  const result = col("users").updateOne({ id: req.params.userId }, { $set: { is_active: !!req.body?.is_active } });
  if (!result.matchedCount) sendError(404, "User not found");
  return { ok: true, is_active: !!req.body?.is_active };
});

R("PATCH", "/admin/opportunities/:oppId/feature", (req) => {
  requireRole(req, "admin");
  const result = col("opportunities").updateOne({ id: req.params.oppId }, { $set: { is_featured: !!req.body?.is_featured } });
  if (!result.matchedCount) sendError(404, "Opportunity not found");
  return { ok: true, is_featured: !!req.body?.is_featured };
});

R("GET", "/admin/pending", (req) => {
  requireRole(req, "admin");
  const pendingFilter = { is_rejected: { $ne: true } };
  return {
    students: col("students").find({ is_approved: false, ...pendingFilter }, { limit: 100 }).map(enrichPendingStudent),
    startups: col("startups").find({ is_verified: false, ...pendingFilter }, { limit: 100 }).map(enrichPendingStartup),
    institutions: col("institutions").find({ is_verified: false, ...pendingFilter }, { limit: 100 }).map(enrichPendingInstitution),
  };
});

R("GET", "/admin/applications", (req) => {
  requireRole(req, "admin");
  const limit = Math.min(num(req.query.limit, 100), 500);
  return col("applications").find({}, { sort: { applied_at: -1 }, limit }).map((app) => {
    const student = col("students").findOne({ id: app.student_id });
    const user = student ? col("users").findOne({ id: student.user_id }) : null;
    return {
      ...app,
      student_email: student?.email || user?.email,
      student_college: student?.college_name_raw,
      student_phone: student?.phone,
      student_degree: student?.degree,
    };
  });
});

R("GET", "/admin/search", (req) => {
  requireRole(req, "admin");
  const q = (req.query.q || "").trim();
  if (!q) return { results: [] };
  const rx = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = { $regex: rx, $options: "i" };
  const results = [];
  for (const s of col("students").find({ $or: [{ full_name: pattern }, { email: pattern }] }, { limit: 8 })) {
    results.push({ kind: "student", id: s.id, title: s.full_name || s.email, subtitle: `${s.department || ""} · ${s.college_name_raw || ""}`.trim(), extra: s.email, url: `/admin/students/${s.id}` });
  }
  for (const s of col("startups").find({ $or: [{ name: pattern }, { industry: pattern }] }, { limit: 8 })) {
    results.push({ kind: "startup", id: s.id, title: s.name, subtitle: `${s.industry || "—"}${s.is_verified ? " · Verified" : ""}`, extra: s.founder_email, url: `/admin/startups/${s.id}` });
  }
  for (const i of col("institutions").find({ $or: [{ name: pattern }, { city: pattern }] }, { limit: 8 })) {
    results.push({ kind: "institution", id: i.id, title: i.name, subtitle: `${i.city || ""}, ${i.state || ""}`.replace(/^, |, $/g, ""), extra: i.referral_slug, url: `/admin/institutions/${i.id}` });
  }
  for (const o of col("opportunities").find({ $or: [{ title: pattern }, { startup_name: pattern }, { domain: pattern }] }, { limit: 8 })) {
    results.push({ kind: "internship", id: o.id, title: o.title, subtitle: `${o.startup_name || ""} · ${o.domain || ""}`.trim(), extra: o.is_featured ? "Featured" : o.status, url: `/admin/opportunities/${o.id}` });
  }
  return { results };
});

R("GET", "/admin/activity", (req) => {
  requireRole(req, "admin");
  const limit = Math.min(num(req.query.limit, 50), 200);
  const since = req.query.since;
  const events = [];
  const sinceFilter = (ts) => !since || ts > since;
  for (const u of col("users").find({}, { sort: { created_at: -1 }, limit })) {
    if (sinceFilter(u.created_at)) events.push({ kind: "user.created", title: `New ${u.role} signed up`, subtitle: u.email, ts: u.created_at, entity_role: u.role, entity_id: u.id });
  }
  for (const o of col("opportunities").find({}, { sort: { created_at: -1 }, limit })) {
    if (sinceFilter(o.created_at)) events.push({ kind: "opportunity.posted", title: "Internship posted", subtitle: `${o.title} · ${o.startup_name}`, ts: o.created_at, entity_role: "internship", entity_id: o.id });
  }
  for (const a of col("applications").find({}, { sort: { applied_at: -1 }, limit })) {
    if (sinceFilter(a.applied_at)) events.push({ kind: "application.created", title: `${a.student_name} applied`, subtitle: `${a.opportunity_title} · ${a.startup_name}`, ts: a.applied_at, entity_role: "application", entity_id: a.id });
  }
  events.sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
  return { items: events.slice(0, limit), count: events.length };
});

R("GET", "/admin/students/:id/detail", (req) => {
  requireRole(req, "admin");
  const student = col("students").findOne({ id: req.params.id });
  if (!student) sendError(404, "Student not found");
  const user = stripPassword(col("users").findOne({ id: student.user_id }));
  return {
    student, user,
    applications: col("applications").find({ student_id: student.id }),
    saved: col("saved_opportunities").find({ student_id: student.id }),
    institution: student.college_id ? col("institutions").findOne({ id: student.college_id }) : null,
  };
});

R("GET", "/admin/startups/:id/detail", (req) => {
  requireRole(req, "admin");
  const startup = col("startups").findOne({ id: req.params.id });
  if (!startup) sendError(404, "Startup not found");
  const user = stripPassword(col("users").findOne({ id: startup.user_id }));
  const opps = col("opportunities").find({ startup_id: startup.id });
  const apps = col("applications").find({ startup_id: startup.id });
  return {
    startup, user, opportunities: opps, applications: apps,
    stats: { postings: opps.length, applications: apps.length, hired: apps.filter((a) => a.status === "hired").length },
  };
});

R("GET", "/admin/institutions/:id/detail", (req) => {
  requireRole(req, "admin");
  const institution = col("institutions").findOne({ id: req.params.id });
  if (!institution) sendError(404, "Institution not found");
  const user = stripPassword(col("users").findOne({ id: institution.user_id }));
  const students = col("students").find({ college_id: institution.id });
  return {
    institution, user, students,
    stats: { students: students.length, applications: col("applications").find({ student_id: { $in: students.map((s) => s.id) } }).length },
  };
});

R("GET", "/admin/opportunities/:id/detail", (req) => {
  requireRole(req, "admin");
  const opportunity = col("opportunities").findOne({ id: req.params.id });
  if (!opportunity) sendError(404, "Opportunity not found");
  const apps = col("applications").find({ opportunity_id: opportunity.id });
  return {
    opportunity, applications: apps,
    stats: { applicants: apps.length, shortlisted: apps.filter((a) => a.status === "shortlisted").length },
  };
});

R("POST", "/admin/admins", (req) => {
  requireRole(req, "admin");
  const email = (req.body?.email || "").toLowerCase().trim();
  const password = req.body?.password || "";
  if (!email || password.length < 8) sendError(400, "Invalid admin data");
  if (col("users").findOne({ email })) sendError(409, "Email already registered");
  const id = uuidv4();
  col("users").insertOne({
    id, email, password, role: "admin",
    is_verified: true, is_active: true, created_at: nowIso(), updated_at: nowIso(),
  });
  return { ok: true, id, email };
});

R("POST", "/admin/opportunities", (req) => {
  requireRole(req, "admin");
  const body = req.body || {};
  let startupId = body.startup_id;
  let startupName = body.startup_name_freeform;
  if (startupId) {
    const s = col("startups").findOne({ id: startupId });
    if (!s) sendError(400, "Startup not found");
    startupName = s.name;
  } else if (!startupName) sendError(400, "startup_id or startup_name_freeform required");
  const deadline = body.application_deadline ? new Date(body.application_deadline) : new Date(Date.now() + 30 * 86400000);
  const imageUrl = (() => {
    const v = String(body.image_url || "").trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
    return null;
  })();
  const opp = {
    id: uuidv4(), startup_id: startupId || null, startup_name: startupName || "Unknown",
    title: body.title, type: "internship", department: body.department || "General",
    domain: body.domain, duration: body.duration || "3 months", mode: body.mode || "remote",
    city: body.city || null, stipend_range: body.stipend_range || "Negotiable",
    skills_required: body.skills_required || [], description: body.description || "",
    perks: body.perks || [], eligibility_years: body.eligibility_years || [],
    eligibility_degrees: body.eligibility_degrees || [], openings: body.openings || 1,
    deadline: deadline.toISOString(), apply_method: "platform", apply_link: null,
    image_url: imageUrl,
    status: "active", is_featured: !!body.is_featured, view_count: 0,
    created_at: nowIso(), expires_at: deadline.toISOString(),
  };
  col("opportunities").insertOne(opp);
  return opp;
});

R("GET", "/admin/startups-list", (req) => {
  requireRole(req, "admin");
  return col("startups").find({}, { limit: 500 }).map((s) => ({
    id: s.id, name: s.name, industry: s.industry, is_verified: s.is_verified,
  }));
});

// ---------- dispatcher ----------
function compile(pattern) {
  const names = [];
  const rx = pattern.replace(/:[^/]+/g, (m) => { names.push(m.slice(1)); return "([^/]+)"; });
  return { re: new RegExp(`^${rx}$`), names };
}
for (const r of routes) r._c = compile(r.pattern);

export async function handleRequest(method, rawPath, body, config = {}) {
  const [pathOnly, queryStr] = String(rawPath).split("?");
  const query = {};
  if (queryStr) {
    for (const [k, v] of new URLSearchParams(queryStr).entries()) query[k] = v;
  }
  if (config.params) {
    for (const [k, v] of Object.entries(config.params)) {
      if (v !== undefined && v !== null) query[k] = v;
    }
  }

  const m = method.toUpperCase();
  for (const route of routes) {
    if (route.method !== m) continue;
    const match = route._c.re.exec(pathOnly);
    if (!match) continue;
    const params = {};
    route._c.names.forEach((n, i) => { params[n] = decodeURIComponent(match[i + 1]); });

    let token = null;
    const auth = config.headers?.Authorization || config.headers?.authorization;
    if (auth && auth.startsWith("Bearer ")) token = auth.slice(7);

    let file = null;
    let payload = body;
    if (body instanceof FormData) {
      file = body.get("file");
      payload = {};
      for (const [k, v] of body.entries()) { if (k !== "file") payload[k] = v; }
    }

    const req = { params, query, body: payload, file, token };
    const data = await route.handler(req);
    return { data, status: 200 };
  }

  throw new ApiError(404, `No mock route for ${m} ${pathOnly}`);
}

export { resetDb };
