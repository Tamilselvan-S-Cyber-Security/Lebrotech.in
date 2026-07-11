// Certificate program catalogue for the "Apply for Certificate" flow.

/** Marketing price — workshop completion certificates */
export const WORKSHOP_CERTIFICATE_PRICE = 199;
export const WORKSHOP_CERTIFICATE_PRICE_LABEL = "₹199";

/** Full course / internship certificate fee */
export const CERTIFICATE_PRICE = 1200;
export const CERTIFICATE_PRICE_LABEL = "₹1,200";

/** @deprecated use WORKSHOP_CERTIFICATE_PRICE_LABEL for marketing CTAs */
export const MARKETING_CERTIFICATE_PRICE_LABEL = WORKSHOP_CERTIFICATE_PRICE_LABEL;

export const PROGRAM_CATEGORIES = [
  { value: "cyber_security", label: "Cyber Security" },
  { value: "cloud_security", label: "Cloud Security" },
  { value: "full_stack", label: "Full Stack" },
];

export const PROGRAMS = [
  "Cyber Security Basic",
  "Cyber Security Advance",
  "AI & LLM Security Internship",
  "VAPT Internship",
  "Red Teaming Internship",
  "Cloud Security Internship",
  "IoT Security Internship",
  "Web3 Security Internship",
  "MERN Stack Security Internship",
  "Ethical Hacking Internship",
];

export const WORKSHOP_PROGRAMS = [
  "Cyber Security Basics Workshop",
  "Ethical Hacking Workshop",
  "VAPT & Penetration Testing Workshop",
  "Cloud Security Workshop",
  "Full Stack Security Workshop",
  "AI & LLM Security Workshop",
  "Web Application Security Workshop",
  "Network Security Workshop",
  "Digital Forensics Workshop",
  "SOC Analyst Workshop",
];

export const INTEREST_TYPES = [
  {
    value: "workshop",
    label: "Workshop",
    desc: "Short hands-on workshop with verified completion certificate",
    priceLabel: WORKSHOP_CERTIFICATE_PRICE_LABEL,
    marketing: true,
  },
  {
    value: "course",
    label: "Course",
    desc: "Structured course with full certificate program",
    priceLabel: CERTIFICATE_PRICE_LABEL,
  },
  {
    value: "internship",
    label: "Internship",
    desc: "Internship track with completion certificate",
    priceLabel: CERTIFICATE_PRICE_LABEL,
  },
];

export const WORKSHOP_DURATIONS = [
  "1 Day",
  "2 Days",
  "3 Days",
  "1 Week",
  "2 Weeks",
  "Custom (type below)",
];

export const DURATIONS = [
  "1 Month",
  "2 Months",
  "3 Months",
  "6 Months",
  "Custom (type below)",
];

export const MODES = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

export const DEGREES = [
  "Diploma",
  "B.E / B.Tech",
  "B.Sc",
  "BCA",
  "B.Com",
  "B.A",
  "BBA",
  "M.E / M.Tech",
  "M.Sc",
  "MCA",
  "MBA",
  "Other",
];

export const HEARD_ABOUT = [
  "Instagram",
  "LinkedIn",
  "YouTube",
  "Friend / Referral",
  "College / Institution",
  "Google Search",
  "WhatsApp",
  "Other",
];

export function getProgramsForType(interestType) {
  return interestType === "workshop" ? WORKSHOP_PROGRAMS : PROGRAMS;
}

export function getDurationsForType(interestType) {
  return interestType === "workshop" ? WORKSHOP_DURATIONS : DURATIONS;
}

export function getCertificatePrice(interestType) {
  if (interestType === "workshop") {
    return { amount: WORKSHOP_CERTIFICATE_PRICE, label: WORKSHOP_CERTIFICATE_PRICE_LABEL };
  }
  return { amount: CERTIFICATE_PRICE, label: CERTIFICATE_PRICE_LABEL };
}

export function getInterestTypeMeta(interestType) {
  return INTEREST_TYPES.find((t) => t.value === interestType) || INTEREST_TYPES[0];
}
