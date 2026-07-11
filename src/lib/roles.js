import { STUDENT_NAV, STARTUP_NAV, INSTITUTION_NAV, ADMIN_NAV } from "@/lib/nav";

export const ROLES = ["student", "startup", "institution", "admin"];

export const ROLE_PREFIX = {
  student: "/student",
  startup: "/startup",
  institution: "/institution",
  admin: "/admin",
};

const NAV_BY_ROLE = {
  student: STUDENT_NAV,
  startup: STARTUP_NAV,
  institution: INSTITUTION_NAV,
  admin: ADMIN_NAV,
};

const LOGIN_COPY = {
  student: "Log in to track applications, verification, and your internship certificate.",
  startup: "Log in to manage internship postings, applicants, and certificates.",
  institution: "Log in to your campus dashboard — students, analytics, and certificates.",
  admin: "Log in to the Lerbo Tech admin console.",
};

const REGISTER_LABEL = {
  student: "Create student account",
  startup: "Register your startup",
  institution: "Register your institution",
};

/** Dashboard entry path after login — never send non-students to /student routes. */
export function roleHome(role) {
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "startup":
      return "/startup/dashboard";
    case "institution":
      return "/institution/dashboard";
    case "admin":
      return "/admin/security";
    default:
      return "/";
  }
}

export function navForRole(role) {
  return NAV_BY_ROLE[role] || STUDENT_NAV;
}

export function loginCopyForRole(role) {
  return LOGIN_COPY[role] || "Log in to continue on Lerbo Tech.";
}

export function registerLabelForRole(role) {
  return REGISTER_LABEL[role] || "Create an account";
}

export function isValidRole(role) {
  return ROLES.includes(role);
}

/** True when path belongs to the signed-in role's dashboard area. */
export function isPathForRole(path, role) {
  if (!path || !role) return false;
  const prefix = ROLE_PREFIX[role];
  if (!prefix) return false;
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Sanitize ?next= or router state — block cross-role redirects (e.g. startup → /student/*). */
export function resolvePostLoginPath(role, nextPath) {
  const home = roleHome(role);
  if (!nextPath || typeof nextPath !== "string") return home;
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return home;
  if (isPathForRole(nextPath, role)) return nextPath;
  return home;
}

/** Onboarding gate — send new or incomplete profiles to setup first. */
export function onboardingPath(role, profile) {
  if (!profile) return null;
  if (role === "student" && profile.is_onboarded === false) return "/student/onboarding";
  if (role === "startup" && profile.is_onboarded === false) return "/startup/onboarding";
  return null;
}

/** After login or when a signed-in user hits a guest-only page. */
export function resolvePostAuthPath(user, profile, nextPath) {
  if (!user?.role) return "/";
  const onboarding = onboardingPath(user.role, profile);
  if (onboarding) return onboarding;
  return resolvePostLoginPath(user.role, nextPath);
}

/** Where to send a user immediately after successful registration. */
export function postRegisterPath(role) {
  if (role === "student") return "/student/onboarding";
  if (role === "startup") return "/startup/onboarding";
  if (role === "institution") return "/institution/dashboard";
  return roleHome(role);
}

/** Sidebar / header display name — role-aware, not student-only. */
export function profileDisplayName(profile, user) {
  if (!profile && !user) return "User";
  if (profile?.full_name) return profile.full_name;
  if (profile?.name) return profile.name;
  if (profile?.founder_name) return profile.founder_name;
  if (profile?.placement_officer) return profile.placement_officer;
  if (profile?.institution_name) return profile.institution_name;
  return user?.email?.split("@")[0] || "User";
}

const ROLE_GREETING_FALLBACK = {
  student: "Student",
  startup: "Founder",
  institution: "Partner",
};

/** Dashboard header — "Hi, Arun 👋" for every role. */
export function dashboardGreeting(profile, user, role) {
  const name = profileDisplayName(profile, user);
  const first = name.split(/\s+/).filter(Boolean)[0]
    || ROLE_GREETING_FALLBACK[role]
    || "there";
  return `Hi, ${first} 👋`;
}

export function profileEditPath(role) {
  switch (role) {
    case "student":
      return "/student/profile";
    case "startup":
      return "/startup/profile";
    case "institution":
      return "/institution/profile";
    default:
      return null;
  }
}

export function notificationsPath(role) {
  if (!role || role === "admin") return null;
  return `/${role}/notifications`;
}
