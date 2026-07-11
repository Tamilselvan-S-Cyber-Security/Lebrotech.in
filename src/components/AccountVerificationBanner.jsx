import React from "react";
import { IconAlertCircle } from "@/components/icons/AppIcons";

export default function AccountVerificationBanner({ profile }) {
  if (!profile || profile.is_verified) return null;

  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
      data-testid="account-verification-banner"
    >
      <IconAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <div className="font-semibold">Account verification pending</div>
        <div className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/80">
          We review startup and institution registrations within 24 hours. Upload a verification proof (PDF, image, or Word) on your profile if you have not already. You'll get an email when approved and your dashboard is fully activated.
        </div>
      </div>
    </div>
  );
}
