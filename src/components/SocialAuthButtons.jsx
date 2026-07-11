import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

function GoogleIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function GithubIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

/**
 * Google + GitHub sign-in buttons backed by Firebase.
 * @param {string} [role] role to assign to brand-new social accounts (register page)
 * @param {(res:object)=>void} onSuccess called with the auth result on success
 * @param {string} [label] verb shown on the buttons ("Continue" | "Sign up")
 */
export default function SocialAuthButtons({ role, onSuccess, label = "Continue" }) {
  const { loginWithGoogle, loginWithGithub, socialEnabled } = useAuth();
  const [busy, setBusy] = useState(null);

  if (!socialEnabled) return null;

  const run = async (provider) => {
    setBusy(provider);
    const res = provider === "google" ? await loginWithGoogle(role) : await loginWithGithub(role);
    setBusy(null);
    onSuccess?.(res, provider);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => run("google")}
          disabled={busy !== null}
          data-testid="social-google-button"
          className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 transition-colors hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-60"
        >
          <GoogleIcon />
          {busy === "google" ? "Connecting…" : `${label} with Google`}
        </button>
        <button
          type="button"
          onClick={() => run("github")}
          disabled={busy !== null}
          data-testid="social-github-button"
          className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 dark:border-white/15 bg-[#24292f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b1f24] disabled:opacity-60"
        >
          <GithubIcon />
          {busy === "github" ? "Connecting…" : `${label} with GitHub`}
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        or
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}
