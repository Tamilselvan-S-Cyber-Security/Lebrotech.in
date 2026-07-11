/* Plan catalogue — startups, institutions, and students are free (no paid subscriptions). */

/** @deprecated Kept for admin catalogue compatibility; students are free. */
export const STUDENT_PLAN = {
  id: "free",
  name: "Student Access",
  audience: "student",
  price: "₹0",
  period: "Free forever",
  duration: "Lifetime",
  buttonText: "Create free account",
  razorpayLink: null,
  popular: true,
  features: [
    "Complete profile creation",
    "Unlimited internship applications",
    "Verification & validation pipeline",
    "Certificate status tracking",
    "Verified certificate-eligible internships",
    "Internship completion certificate",
    "Download and share your certificate",
    "Profile visibility to verified startups",
  ],
};

/** Startups — free only (no monthly paid plans). */
export const STARTUP_PLANS = [
  {
    id: "free",
    name: "Free",
    audience: "startup",
    price: "₹0",
    period: "Free forever",
    razorpayLink: null,
    popular: true,
    buttonText: "Register free",
    features: [
      "Unlimited internship postings",
      "Applicant pipeline & messaging",
      "Startup profile & verification badge",
      "Issue verified internship certificates",
      "Candidate search & bookmarks",
      "Internship analytics",
    ],
  },
];

/** Institutions — free only (no paid campus / monthly plans). */
export const INSTITUTION_PLANS = [
  {
    id: "free",
    name: "Free Partner",
    audience: "institution",
    price: "₹0",
    period: "Free forever",
    razorpayLink: null,
    popular: true,
    buttonText: "Register free",
    features: [
      "Unlimited students",
      "Bulk student upload",
      "Internship sharing feed",
      "Institution referral link",
      "Certificate & placement analytics",
      "Department-wise reports",
    ],
  },
];

export const ALL_PLANS = [STUDENT_PLAN, ...STARTUP_PLANS, ...INSTITUTION_PLANS];

export const PRICING_SECTIONS = [
  { id: "student", title: "For Students", subtitle: "Free to apply, verify, and earn your internship certificate.", plans: [STUDENT_PLAN] },
  { id: "startup", title: "For Startups", subtitle: "Post certificate-eligible internships free — no monthly fees.", plans: STARTUP_PLANS },
  { id: "institution", title: "For Institutions", subtitle: "Campus dashboard free — track certificates with no subscription.", plans: INSTITUTION_PLANS },
];

export function getPlanById(id) {
  return ALL_PLANS.find((p) => p.id === id);
}

/** Public marketing pages → register with role + optional plan pre-selected. */
export function getRegisterLink(role, planId) {
  const params = new URLSearchParams({ role });
  if (planId && planId !== "free") params.set("plan", planId);
  return `/register?${params.toString()}`;
}

export function planLabel(planId) {
  if (!planId || planId === "free" || planId === "student_registration") return "Free";
  return getPlanById(planId)?.name || planId.replace(/_/g, " ");
}

/** True when a plan requires Razorpay / billing after register. Always false — all roles are free. */
export function planRequiresBilling() {
  return false;
}
