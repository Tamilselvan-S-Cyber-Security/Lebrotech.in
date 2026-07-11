/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import OaxisLogo from "@/components/OaxisLogo";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import {
  fetchAdminHealth,
  sendAdminOtp,
  verifyAdminOtp,
  setAdminSessionToken,
  isAuthorizedAdminEmail,
} from "@/lib/adminApi";
import { IconShieldCheck } from "@/components/icons/AppIcons";

const RESEND_COOLDOWN_SEC = 60;

function maskEmail(email) {
  if (!email?.includes("@")) return "your admin email";
  const [local, domain] = email.split("@");
  if (local.length <= 1) return `•••@${domain}`;
  return `${local[0]}${"•".repeat(Math.min(local.length - 1, 4))}@${domain}`;
}

export default function AdminSecurity() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpChallenge, setOtpChallenge] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [setupError, setSetupError] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);
  const mountedRef = useRef(true);

  const dest = location.state?.from?.pathname || "/admin/dashboard";

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAuthorizedAdminEmail(user.email)) {
      toast.error("This account is not authorized for admin access.");
      navigate("/", { replace: true });
      return;
    }
    fetchAdminHealth()
      .then((data) => {
        setApiOnline(true);
        if (!data.smtpConfigured && !data.totpConfigured) {
          setSetupError("Admin server email (SMTP) is not configured. OTP cannot be sent.");
        } else {
          setSetupError(null);
        }
      })
      .catch((err) => {
        const msg = err?.message || "Could not reach the admin API.";
        setSetupError(msg);
        const offline = /fetch|network|failed to fetch|load failed/i.test(msg);
        setApiOnline(!offline);
      });
  }, [user, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = window.setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const sendOtp = async () => {
    if (!user?.email || cooldown > 0 || sending || busy) return;
    setSending(true);
    try {
      const res = await sendAdminOtp(user.email);
      if (!mountedRef.current) return;
      setOtpSent(true);
      setOtpChallenge(res.challenge || "");
      setCooldown(RESEND_COOLDOWN_SEC);
      if (res.dryRun) {
        toast.success("OTP generated (SMTP dry-run — check admin server logs for the code)");
      } else {
        toast.success(res.message || "OTP sent to your admin email — check inbox and spam");
      }
    } catch (err) {
      if (!mountedRef.current) return;
      toast.error(err.message || "Could not send OTP");
    } finally {
      if (mountedRef.current) setSending(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy || sending) return;
    if (code.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    if (!otpChallenge) {
      toast.error("Send OTP to your email first");
      return;
    }
    setBusy(true);
    try {
      const res = await verifyAdminOtp(user.email, code, otpChallenge);
      if (!mountedRef.current) return;
      setAdminSessionToken(res.token);
      toast.success("Admin access verified");
      navigate(dest, { replace: true });
    } catch (err) {
      if (!mountedRef.current) return;
      toast.error(err.message || "Invalid OTP");
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 dark:bg-slate-950">
      <Link to="/" className="mb-10"><OaxisLogo /></Link>

      <div className="w-full max-w-md rounded-none border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-[#D92D20]/10 text-[#D92D20]">
            <IconShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Admin security</h1>
            <p className="text-sm text-slate-500">Email OTP verification</p>
          </div>
        </div>

        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Signed in as <strong className="text-slate-900 dark:text-white">{maskEmail(user?.email)}</strong>.
          {" "}We&apos;ll send a 6-digit code to your admin email. Enter it below to access the panel.
        </p>

        {setupError ? (
          <div className="mb-6 rounded-none border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-semibold">Cannot send OTP</p>
            <p className="mt-1">{setupError}</p>
            {!apiOnline ? (
              <p className="mt-2 text-xs">
                Start the admin API: <code className="rounded bg-white/80 px-1 dark:bg-black/30">cd admin && npm run dev</code>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-300 dark:border-white/20"
            disabled={sending || busy || cooldown > 0 || Boolean(setupError)}
            onClick={sendOtp}
            data-testid="admin-send-otp"
          >
            {sending
              ? "Sending OTP…"
              : cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : otpSent
                  ? "Resend OTP to email"
                  : "Send OTP to email"}
          </Button>
          {otpSent ? (
            <p className="mt-2 text-center text-xs text-slate-500">
              Check your inbox. Code expires in 10 minutes.
            </p>
          ) : null}
        </div>

        <form onSubmit={submit} className="space-y-6" data-testid="admin-totp-form">
          <div className="flex flex-col items-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enter OTP</label>
            <InputOTP maxLength={6} value={code} onChange={setCode} data-testid="admin-totp-input">
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg dark:border-white/20 dark:bg-white/5" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            type="submit"
            disabled={busy || sending || code.length !== 6 || !otpChallenge}
            className="w-full bg-[#D92D20] hover:bg-[#B91C1C]"
            data-testid="admin-totp-submit"
          >
            {busy ? "Verifying…" : "Verify OTP & open admin panel"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-xs text-slate-500">
          <button type="button" onClick={() => logout()} className="text-[#D92D20] hover:underline">Sign out</button>
        </div>
      </div>
    </div>
  );
}
