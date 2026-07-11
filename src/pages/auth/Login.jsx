/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import OaxisLogo from "@/components/OaxisLogo";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IconEye, IconEyeOff } from "@/components/icons/AppIcons";
import {
  isValidRole,
  resolvePostAuthPath,
  loginCopyForRole,
  registerLabelForRole,
} from "@/lib/roles";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, user, profile, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const roleParam = searchParams.get("role");
  const loginRole = isValidRole(roleParam) ? roleParam : null;
  const registerHref = loginRole ? `/register?role=${loginRole}` : "/register";

  useEffect(() => {
    if (loading || !user) return;
    const next = resolvePostAuthPath(
      user,
      profile,
      searchParams.get("next") || location.state?.from?.pathname,
    );
    navigate(next, { replace: true });
  }, [loading, user, profile, navigate, searchParams, location.state]);

  const finishLogin = (res) => {
    if (!res.ok) {
      toast.error(res.error || "Login failed");
      return;
    }
    toast.success(`Welcome back, ${res.user?.email}`);
    const dest = resolvePostAuthPath(
      res.user,
      res.profile,
      searchParams.get("next") || location.state?.from?.pathname,
    );
    navigate(dest, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    finishLogin(res);
  };

  if (loading) {
    return (
      <div className="theme-section flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#D92D20]" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="theme-section flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#D92D20]" />
      </div>
    );
  }

  return (
    <div className="theme-section flex min-h-screen flex-col px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="inline-flex">
            <OaxisLogo />
          </Link>
        </div>

        <div className="mt-10">
          <h1 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Welcome back.
          </h1>
          <p className="mt-2 text-center text-slate-600 sm:text-base dark:text-slate-400">
            {loginCopyForRole(loginRole || "student")}
          </p>

          {loginRole ? (
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wider text-[#D92D20] dark:text-[#F87171]">
              {loginRole} account login
            </p>
          ) : null}

          <div className="mt-8">
            <SocialAuthButtons role={loginRole || undefined} onSuccess={finishLogin} />
          </div>

          <form onSubmit={submit} className="mt-4 space-y-4" data-testid="login-form">
            <div>
              <Label htmlFor="login-email" className="text-slate-700 dark:text-slate-300">Email</Label>
              <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" data-testid="login-email-input" required className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500" />
            </div>
            <div>
              <Label htmlFor="login-password" className="text-slate-700 dark:text-slate-300">Password</Label>
              <div className="relative">
                <Input id="login-password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" data-testid="login-password-input" required className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}</button>
              </div>
            </div>
            <Button type="submit" disabled={busy} data-testid="login-submit-button" className="w-full bg-[#D92D20] hover:bg-[#B91C1C]">{busy ? "Logging in…" : "Log in"}</Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            New here?{" "}
            <Link to={registerHref} className="font-semibold text-[#D92D20] dark:text-[#F87171] hover:underline">
              {registerLabelForRole(loginRole || "student")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
