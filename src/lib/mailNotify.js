// Frontend helper — sends email requests to the admin Node server (nodemailer).
// Nodemailer runs server-side only; the browser calls /admin-api/mail/send (proxied in dev).

const ADMIN_API_BASE = (process.env.REACT_APP_ADMIN_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
const ADMIN_API_DIRECT = (process.env.REACT_APP_ADMIN_API_DIRECT || "http://localhost:4000/api").replace(/\/$/, "");

function adminUrl(path) {
  let base = ADMIN_API_BASE;
  if (!base.startsWith("http") && process.env.NODE_ENV === "development") {
    base = ADMIN_API_DIRECT;
  } else if (!base.startsWith("http")) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    base = `${origin}${base}`;
  }
  return `${base.replace(/\/$/, "")}${path}`;
}

/**
 * Send a typed transactional email via the admin mail server.
 * @param {"registration_welcome"|"verification_approved"|"verification_rejected"|"application_submitted"|"application_notify_startup"|"admin_new_registration"} type
 * @param {Record<string, unknown>} data
 */
export async function sendMailNotification(type, data) {
  const res = await fetch(adminUrl("/mail/send"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...data }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || "Failed to send email");
  return json;
}

export const MAIL_EVENTS = {
  REGISTRATION: "registration_welcome",
  ADMIN_NEW_REG: "admin_new_registration",
  VERIFIED: "verification_approved",
  REJECTED: "verification_rejected",
  APPLICATION: "application_submitted",
  STARTUP_APPLICANT: "application_notify_startup",
};
