import {
  IconHome, IconBriefcase, IconFileText, IconBell, IconUser, IconBookmark,
  IconLifeBuoy, IconMessageSquare, IconLayoutDashboard, IconFilePlus,
  IconListChecks, IconBuilding, IconCreditCard, IconUsers, IconBarChart3,
  IconShare2, IconGraduationCap, IconUserPlus, IconShieldCheck, IconInbox,
  IconSettings, IconActivity,
} from "@/components/icons/AppIcons";

export const STUDENT_NAV = [
  { to: "/student/dashboard", label: "Dashboard", icon: IconHome, end: true },
  { to: "/student/opportunities", label: "Browse Internships", icon: IconBriefcase },
  { to: "/student/applications", label: "My Applications", icon: IconFileText },
  { to: "/student/certification", label: "Certification", icon: IconShieldCheck },
  { to: "/student/messages", label: "Messages", icon: IconMessageSquare },
  { to: "/student/saved", label: "Saved", icon: IconBookmark },
  { to: "/student/notifications", label: "Notifications", icon: IconBell },
  { to: "/student/profile", label: "Profile", icon: IconUser },
  { to: "/student/help", label: "Help & Support", icon: IconLifeBuoy },
];

export const STARTUP_NAV = [
  { to: "/startup/dashboard", label: "Dashboard", icon: IconLayoutDashboard, end: true },
  { to: "/startup/post", label: "Post Internship", icon: IconFilePlus },
  { to: "/startup/opportunities", label: "Manage Internships", icon: IconListChecks },
  { to: "/startup/messages", label: "Messages", icon: IconMessageSquare },
  { to: "/startup/profile", label: "Company Profile", icon: IconBuilding },
  { to: "/startup/notifications", label: "Notifications", icon: IconBell },
  { to: "/startup/help", label: "Help & Support", icon: IconLifeBuoy },
];

export const INSTITUTION_NAV = [
  { to: "/institution/dashboard", label: "Dashboard", icon: IconLayoutDashboard, end: true },
  { to: "/institution/students", label: "Students", icon: IconUsers },
  { to: "/institution/onboard", label: "Onboard Students", icon: IconUserPlus },
  { to: "/institution/opportunities", label: "Internship Feed", icon: IconShare2 },
  { to: "/institution/analytics", label: "Analytics", icon: IconBarChart3 },
  { to: "/institution/notifications", label: "Notifications", icon: IconBell },
  { to: "/institution/profile", label: "Institution Profile", icon: IconGraduationCap },
  { to: "/institution/help", label: "Help & Support", icon: IconLifeBuoy },
];

export const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: IconLayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: IconUsers },
  { to: "/admin/verifications", label: "Verifications", icon: IconShieldCheck },
  { to: "/admin/applications", label: "Applications", icon: IconFileText },
  { to: "/admin/certificates", label: "Certificate Applies", icon: IconGraduationCap },
  { to: "/admin/opportunities", label: "All Internships", icon: IconBriefcase },
  { to: "/admin/billing", label: "Billing & Revenue", icon: IconCreditCard },
  { to: "/admin/activity", label: "Activity Feed", icon: IconActivity },
  { to: "/admin/enquiries", label: "Support & Enquiries", icon: IconInbox },
  { to: "/admin/brand", label: "Brand Settings", icon: IconSettings },
  { to: "/admin/help", label: "Help & Support", icon: IconLifeBuoy },
];
