import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import OaxisLogo from "@/components/OaxisLogo";
import { Button } from "@/components/ui/button";
import { IconCheckCircle } from "@/components/icons/AppIcons";
import {
  profileEditPath,
  profileDisplayName,
  resolvePostAuthPath,
} from "@/lib/roles";

/**
 * Shown on /register (or /login) when the user already has an active session.
 */
export default function AlreadySignedIn({ page = "register" }) {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  if (!user) return null;

  const profilePath = profileEditPath(user.role);
  const name = profileDisplayName(profile, user);

  return (
    <div className="theme-section flex min-h-screen flex-col px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-md text-center">
        <Link to="/" className="inline-flex">
          <OaxisLogo />
        </Link>

        <div className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <IconCheckCircle className="h-8 w-8" />
        </div>

        <h1 className="mt-6 font-display text-3xl font-extrabold text-slate-900 dark:text-white">
          You're already signed in
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          {page === "register"
            ? "You can't create a new account while logged in."
            : "You're already logged in to Lerbo Tech."}
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left dark:border-white/10 dark:bg-white/5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{name}</div>
          <div className="text-xs text-slate-500">{user.email}</div>
          <div className="mt-1 text-xs capitalize text-[#D92D20]">{user.role} account</div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            className="w-full bg-[#D92D20] hover:bg-[#B91C1C]"
            onClick={() => navigate(resolvePostAuthPath(user, profile), { replace: true })}
            data-testid="already-signed-in-dashboard"
          >
            Go to dashboard
          </Button>
          {profilePath ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(profilePath)}
              data-testid="already-signed-in-profile"
            >
              Edit my profile
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="w-full border-slate-300 dark:border-white/20"
            onClick={async () => {
              await logout();
              navigate(page === "register" ? "/register" : "/login", { replace: true });
            }}
            data-testid="already-signed-in-logout"
          >
            Log out to use another account
          </Button>
        </div>
      </div>
    </div>
  );
}
