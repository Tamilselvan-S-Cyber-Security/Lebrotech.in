import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { dashboardGreeting, roleHome } from "@/lib/roles";

/** Shown on role marketing pages when the signed-in user matches that role. */
export default function RoleWelcomeBanner({ expectedRole }) {
  const { user, profile } = useAuth();
  if (!user || user.role !== expectedRole) return null;

  return (
    <div
      className="mb-6 rounded-none border border-[#D92D20]/25 bg-[#D92D20]/5 px-5 py-4 sm:mb-8"
      data-testid={`${expectedRole}-welcome-banner`}
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {dashboardGreeting(profile, user, expectedRole)}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {expectedRole === "startup"
              ? "Manage internships, applicants, and billing from your startup dashboard."
              : "Track students, certificates, and campus analytics from your institution dashboard."}
          </p>
        </div>
        <Link to={roleHome(expectedRole)}>
          <Button className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid={`${expectedRole}-welcome-dashboard`}>
            Go to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
