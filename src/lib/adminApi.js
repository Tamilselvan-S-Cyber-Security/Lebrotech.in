const ADMIN_API_BASE = (process.env.REACT_APP_ADMIN_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
const ADMIN_API_DIRECT = (process.env.REACT_APP_ADMIN_API_DIRECT || "http://localhost:4000/api").replace(/\/$/, "");

export const ADMIN_SESSION_KEY = "lerbo_admin_totp_token";
export const ADMIN_EMAIL = "tamilselvan@cyberwolf360.in";

function adminUrl(path) {
  const configured = ADMIN_API_BASE.replace(/\/$/, "");
  if (configured.startsWith("http")) return `${configured}${path}`;

  // Local dev: call admin API directly (CORS enabled). Webpack /admin-api proxy breaks POST.
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `${ADMIN_API_DIRECT.replace(/\/$/, "")}${path}`;
    }
    return `${window.location.origin}${configured}${path}`;
  }
  return `${configured}${path}`;
}

async function adminFetch(path, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(adminUrl(path), {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || data.message || "Admin API request failed");
    return data;
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Admin API request timed out. Start the admin server: cd admin && npm run dev");
    }
    if (/failed to fetch|networkerror|load failed/i.test(err?.message || "")) {
      const hint = ADMIN_API_BASE.includes("localhost")
        ? "Cannot reach admin API on port 4000. Run: cd admin && npm run dev"
        : `Cannot reach admin API at ${ADMIN_API_BASE}. Check REACT_APP_ADMIN_API_URL and CORS_ORIGINS.`;
      throw new Error(hint);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function getAdminSessionToken() {
  try { return sessionStorage.getItem(ADMIN_SESSION_KEY); } catch { return null; }
}

export function setAdminSessionToken(token) {
  try {
    if (token) sessionStorage.setItem(ADMIN_SESSION_KEY, token);
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch { /* ignore */ }
}

export async function fetchAdminHealth() {
  return adminFetch("/health");
}

export async function fetchTotpSetup(email) {
  return adminFetch(`/admin/totp/setup?email=${encodeURIComponent(email)}`);
}

export async function sendAdminOtp(email) {
  return adminFetch("/admin/otp/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  }, 60000);
}

export async function verifyAdminOtp(email, code, challenge) {
  return adminFetch("/admin/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code, challenge }),
  });
}

export async function verifyAdminTotp(email, code, challenge) {
  return adminFetch("/admin/totp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code, challenge }),
  });
}

export async function checkAdminSession(token) {
  try {
    const data = await adminFetch("/admin/totp/check", {
      method: "POST",
      body: JSON.stringify({ token: token || getAdminSessionToken() }),
    });
    return data.ok === true;
  } catch {
    return false;
  }
}

export function isAuthorizedAdminEmail(email) {
  return (email || "").toLowerCase().trim() === ADMIN_EMAIL;
}
