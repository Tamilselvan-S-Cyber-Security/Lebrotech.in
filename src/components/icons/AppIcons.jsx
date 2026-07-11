import React from "react";

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function I({ className = "h-5 w-5", children, ...props }) {
  return (
    <svg {...base} className={className} {...props}>
      {children}
    </svg>
  );
}

/* Navigation & layout */
export function IconHome(p) { return <I {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" fill="currentColor" fillOpacity="0.1" /><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" /></I>; }
export function IconLayoutDashboard(p) { return <I {...p}><rect x="3" y="3" width="8" height="10" rx="1" fill="currentColor" fillOpacity="0.12" /><rect x="3" y="3" width="8" height="10" rx="1" /><rect x="13" y="3" width="8" height="6" rx="1" /><rect x="13" y="11" width="8" height="10" rx="1" fill="currentColor" fillOpacity="0.12" /><rect x="13" y="11" width="8" height="10" rx="1" /><rect x="3" y="15" width="8" height="6" rx="1" /></I>; }
export function IconMenu(p) { return <I {...p}><path d="M4 7h16M4 12h16M4 17h16" strokeWidth={2} /></I>; }
export function IconX(p) { return <I {...p}><path d="M6 6l12 12M18 6 6 18" strokeWidth={2} /></I>; }
export function IconChevronRight(p) { return <I {...p}><path d="m9 6 6 6-6 6" strokeWidth={2} /></I>; }
export function IconChevronLeft(p) { return <I {...p}><path d="m15 6-6 6 6 6" strokeWidth={2} /></I>; }
export function IconChevronDown(p) { return <I {...p}><path d="m6 9 6 6 6-6" strokeWidth={2} /></I>; }
export function IconArrowRight(p) { return <I {...p}><path d="M5 12h14M13 6l6 6-6 6" strokeWidth={2} /></I>; }
export function IconArrowLeft(p) { return <I {...p}><path d="M19 12H5M11 6l-6 6 6 6" strokeWidth={2} /></I>; }

/* People & orgs */
export function IconUsers(p) { return <I {...p}><circle cx="9" cy="7" r="3" fill="currentColor" fillOpacity="0.12" /><circle cx="9" cy="7" r="3" /><path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" /><circle cx="17" cy="8" r="2.5" /><path d="M21 20v-1a3.5 3.5 0 0 0-3-3.5" /></I>; }
export function IconUser(p) { return <I {...p}><circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.12" /><circle cx="12" cy="8" r="4" /><path d="M5 20v-1a7 7 0 0 1 14 0v1" /></I>; }
export function IconUserPlus(p) { return <I {...p}><circle cx="9" cy="7" r="3" /><path d="M3 20v-1a5 5 0 0 1 5-5h1" /><path d="M16 11v6M13 14h6" strokeWidth={2} /></I>; }
export function IconGraduationCap(p) { return <I {...p}><path d="M12 3 2 8l10 5 10-5-10-5Z" fill="currentColor" fillOpacity="0.12" /><path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="M6 10v4c0 2 2.7 4 6 4s6-2 6-4v-4" /></I>; }
export function IconBuilding(p) { return <I {...p}><rect x="4" y="3" width="16" height="18" fill="currentColor" fillOpacity="0.1" /><rect x="4" y="3" width="16" height="18" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" strokeWidth={1.25} /></I>; }
export function IconBuilding2(p) { return <I {...p}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" /></I>; }

/* Work & content */
export function IconBriefcase(p) { return <I {...p}><rect x="3" y="7" width="18" height="13" rx="1" fill="currentColor" fillOpacity="0.12" /><rect x="3" y="7" width="18" height="13" rx="1" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></I>; }
export function IconFileText(p) { return <I {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" fill="currentColor" fillOpacity="0.12" /><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></I>; }
export function IconFilePlus(p) { return <I {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M14 3v6h6M12 13v6M9 16h6" strokeWidth={2} /></I>; }
export function IconListChecks(p) { return <I {...p}><path d="M11 6h9M11 12h9M11 18h9" /><path d="m4 6 1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17" strokeWidth={2} /></I>; }
export function IconBookmark(p) { return <I {...p}><path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-3-6 3V4Z" fill="currentColor" fillOpacity="0.12" /><path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-3-6 3V4Z" /></I>; }
export function IconMessageSquare(p) { return <I {...p}><path d="M21 11.5a8.4 8.4 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.4 8.4 0 0 1-3.9-1l-4.6 1.5 1.5-4.6a8.4 8.4 0 0 1-1-3.9 8.5 8.5 0 0 1 3.1-6.6 8.4 8.4 0 0 1 5.4-1.9h.5a8.5 8.5 0 0 1 8 8v.5Z" fill="currentColor" fillOpacity="0.1" /><path d="M21 11.5a8.4 8.4 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.4 8.4 0 0 1-3.9-1l-4.6 1.5 1.5-4.6a8.4 8.4 0 0 1-1-3.9 8.5 8.5 0 0 1 3.1-6.6 8.4 8.4 0 0 1 5.4-1.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></I>; }
export function IconSend(p) { return <I {...p}><path d="m22 2-7 20-4-9-9-4 20-7Z" fill="currentColor" fillOpacity="0.12" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M11 13l11-11" /></I>; }
export function IconInbox(p) { return <I {...p}><path d="M22 12h-6l-2 3H10l-2-3H2" /><rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" fillOpacity="0.1" /><rect x="2" y="4" width="20" height="16" rx="2" /></I>; }
export function IconShare2(p) { return <I {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 3.9M15.4 6.6 8.6 10.5" /></I>; }
export function IconExternalLink(p) { return <I {...p}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeWidth={2} /></I>; }
export function IconLink(p) { return <I {...p}><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.5-1.5" /></I>; }
export function IconUpload(p) { return <I {...p}><path d="M12 16V4M8 8l4-4 4 4" strokeWidth={2} /><path d="M4 20h16" /></I>; }
export function IconDownload(p) { return <I {...p}><path d="M12 4v12M8 12l4 4 4-4" strokeWidth={2} /><path d="M4 20h16" /></I>; }
export function IconEye(p) { return <I {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.15" /><circle cx="12" cy="12" r="3" /></I>; }
export function IconEyeOff(p) { return <I {...p}><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" /><path d="M6.7 6.7C4.6 8.1 3 10 2 12s3.5 7 10 7c1.8 0 3.4-.4 4.8-1.1M9.9 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.4 18.4 0 0 1-2.9 4.1" /><path d="m2 2 20 20" strokeWidth={2} /></I>; }
export function IconSearch(p) { return <I {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeWidth={2} /></I>; }
export function IconPlus(p) { return <I {...p}><path d="M12 5v14M5 12h14" strokeWidth={2} /></I>; }
export function IconGripVertical(p) { return <I {...p}><circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" /></I>; }

/* Status & feedback */
export function IconCheck(p) { return <I {...p}><path d="m5 12 4 4L19 6" strokeWidth={2} /></I>; }
export function IconCheckCircle(p) { return <I {...p}><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.12" /><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" strokeWidth={2} /></I>; }
export function IconCheckCheck(p) { return <I {...p}><path d="m5 12 3 3 4-4M12 17l3 3 7-7" strokeWidth={2} /></I>; }
export function IconShieldCheck(p) { return <I {...p}><path d="M12 2 4 5.5v6.3c0 3.9 3.4 7.5 8 9.2 4.6-1.7 8-5.3 8-9.2V5.5L12 2Z" fill="currentColor" fillOpacity="0.12" /><path d="M12 2 4 5.5v6.3c0 3.9 3.4 7.5 8 9.2 4.6-1.7 8-5.3 8-9.2V5.5L12 2Z" /><path d="m9 12 2 2 4-4" strokeWidth={2} /></I>; }
export function IconAlertCircle(p) { return <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" strokeWidth={2} /></I>; }
export function IconBell(p) { return <I {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></I>; }
export function IconSparkles(p) { return <I {...p}><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" fill="currentColor" fillOpacity="0.15" /><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></I>; }
export function IconStar(p) { return <I {...p}><path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7Z" fill="currentColor" fillOpacity="0.15" /><path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7Z" /></I>; }
export function IconTrendingUp(p) { return <I {...p}><path d="m3 17 6-6 4 4 8-10" strokeWidth={2} /><path d="M14 5h7v7" strokeWidth={2} /></I>; }
export function IconQuote(p) { return <I {...p}><path d="M7 7h4v6H7V7ZM13 7h4v6h-4V7Z" fill="currentColor" fillOpacity="0.2" stroke="none" /><path d="M3 11c0-3 2-5 5-5v3c-1.5 0-2 1-2 2h2v4H3v-4ZM13 11c0-3 2-5 5-5v3c-1.5 0-2 1-2 2h2v4h-5v-4Z" /></I>; }
export function IconLifeBuoy(p) { return <I {...p}><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" /><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M7.5 7.5l2 2M14.5 14.5l2 2M16.5 7.5l-2 2M9.5 14.5l-2 2" /></I>; }
export function IconHelpCircle(p) { return <I {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 2-3 2-3 4M12 17h.01" strokeWidth={2} /></I>; }
export function IconRefreshCw(p) { return <I {...p}><path d="M21 12a9 9 0 1 1-2.6-6.3" /><path d="M21 3v6h-6" strokeWidth={2} /></I>; }
export function IconPower(p) { return <I {...p}><path d="M12 2v10" strokeWidth={2} /><path d="M6.3 6.3a8 8 0 1 0 11.4 0" /></I>; }
export function IconPowerOff(p) { return <I {...p}><path d="M12 2v10" strokeWidth={2} /><path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" /><path d="m2 2 20 20" strokeWidth={2} /></I>; }
export function IconSave(p) { return <I {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" fill="currentColor" fillOpacity="0.1" /><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></I>; }
export function IconActivity(p) { return <I {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeWidth={2} /></I>; }
export function IconShieldAlert(p) { return <I {...p}><path d="M12 2 4 5.5v6.3c0 3.9 3.4 7.5 8 9.2 4.6-1.7 8-5.3 8-9.2V5.5L12 2Z" /><path d="M12 9v4M12 17h.01" strokeWidth={2} /></I>; }

/* Finance & data */
export function IconCreditCard(p) { return <I {...p}><rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" fillOpacity="0.1" /><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></I>; }
export function IconBarChart3(p) { return <I {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20V7" strokeWidth={2} /></I>; }
export function IconIndianRupee(p) { return <I {...p}><path d="M6 4h12M6 8h9a3 3 0 0 1 0 6H6M6 14h10" strokeWidth={2} /></I>; }

/* Location & time */
export function IconMapPin(p) { return <I {...p}><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" fill="currentColor" fillOpacity="0.12" /><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></I>; }
export function IconCalendar(p) { return <I {...p}><rect x="3" y="5" width="18" height="16" rx="2" fill="currentColor" fillOpacity="0.1" /><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></I>; }
export function IconClock(p) { return <I {...p}><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" /><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeWidth={2} /></I>; }
export function IconGlobe(p) { return <I {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></I>; }

/* Social & contact */
export function IconMail(p) { return <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" fillOpacity="0.1" /><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></I>; }
export function IconPhone(p) { return <I {...p}><path d="M6.6 3.5A2 2 0 0 0 4.8 5.4c-.6 3.2-.6 6.8 0 10a2 2 0 0 0 1.8 1.9l2-.5a1 1 0 0 1 1 .5l.8 1.6a12 12 0 0 0 5.1 5.1l1.6.8a1 1 0 0 1 .5 1l-.5 2a2 2 0 0 0 1.9 1.8c3.2.6 6.8.6 10 0a2 2 0 0 0 1.9-1.8l-.5-2a1 1 0 0 1 .5-1l1.6-.8a12 12 0 0 0 5.1-5.1l.8-1.6a1 1 0 0 1 1-.5l2 .5a2 2 0 0 0 1.8-1.9c.6-3.2.6-6.8 0-10a2 2 0 0 0-1.8-1.9l-2 .5a1 1 0 0 1-1-.5l-.8-1.6a12 12 0 0 0-5.1-5.1l-1.6-.8a1 1 0 0 1-.5-1l.5-2A2 2 0 0 0 18.4 3.5c-3.2-.6-6.8-.6-10 0Z" fill="currentColor" fillOpacity="0.1" /><path d="M6.6 3.5A2 2 0 0 0 4.8 5.4c-.6 3.2-.6 6.8 0 10a2 2 0 0 0 1.8 1.9l2-.5a1 1 0 0 1 1 .5l.8 1.6a12 12 0 0 0 5.1 5.1l1.6.8a1 1 0 0 1 .5 1l-.5 2a2 2 0 0 0 1.9 1.8c3.2.6 6.8.6 10 0a2 2 0 0 0 1.9-1.8l-.5-2a1 1 0 0 1 .5-1l1.6-.8a12 12 0 0 0 5.1-5.1l.8-1.6a1 1 0 0 1 1-.5l2 .5a2 2 0 0 0 1.8-1.9c.6-3.2.6-6.8 0-10a2 2 0 0 0-1.8-1.9l-2 .5a1 1 0 0 1-1-.5l-.8-1.6a12 12 0 0 0-5.1-5.1l-1.6-.8a1 1 0 0 1-.5-1l.5-2A2 2 0 0 0 18.4 3.5c-3.2-.6-6.8-.6-10 0Z" /></I>; }
export function IconLinkedin(p) { return <I {...p}><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 11v5M8 8v.01M12 16v-3a2 2 0 0 1 4 0v3" strokeWidth={2} /></I>; }
export function IconInstagram(p) { return <I {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" /></I>; }
export function IconLogOut(p) { return <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" strokeWidth={2} /></I>; }
export function IconSettings(p) { return <I {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></I>; }
export function IconSun(p) { return <I {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></I>; }
export function IconTrash2(p) { return <I {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" strokeWidth={2} /></I>; }
export function IconCopy(p) { return <I {...p}><rect x="9" y="9" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.1" /><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></I>; }
export function IconXCircle(p) { return <I {...p}><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" /><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" strokeWidth={2} /></I>; }
