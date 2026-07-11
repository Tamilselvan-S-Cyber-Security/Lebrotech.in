/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { IconCheckCircle, IconExternalLink, IconRefreshCw } from "@/components/icons/AppIcons";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import PlanDetailsDialog from "@/components/PlanDetailsDialog";

/**
 * Universal plan card.
 * - If `plan.razorpayLink` exists: shows Subscribe / Pay button → opens Razorpay link
 *   in new tab + posts /billing/initiate, then shows a "I've completed payment" modal.
 * - If `plan.enterprise`: opens onEnterpriseClick callback.
 * - If neither: shows "Current plan" / "Get started free" CTA.
 */
export default function PlanCard({ plan, currentTier, onEnterpriseClick, onSubscribed }) {
  const { user } = useAuth();
  const isCurrent = currentTier === plan.id;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);

  const startCheckout = async () => {
    if (!user) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?role=${plan.audience}&next=${next}`;
      return;
    }
    if (user.role !== plan.audience) {
      toast.error(`This plan is for ${plan.audience}s. Please use a ${plan.audience} account.`);
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/billing/initiate", { plan_id: plan.id });
      setAttempt(data);
      // Open Razorpay link in a new tab
      window.open(plan.razorpayLink, "_blank", "noopener,noreferrer");
      setConfirmOpen(true);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmPaid = async () => {
    if (!attempt) return;
    setBusy(true);
    try {
      await api.post("/billing/confirm", { attempt_id: attempt.id, payment_reference: reference || undefined });
      toast.success("Thanks! Our team will verify your payment shortly.");
      setConfirmOpen(false);
      setReference("");
      setAttempt(null);
      onSubscribed?.();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  let cta;
  if (plan.enterprise) {
    cta = <Button onClick={onEnterpriseClick} className="w-full border border-slate-300 dark:border-white/20 bg-transparent text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10" data-testid={`plan-${plan.id}-btn`}>{plan.buttonText}</Button>;
  } else if (plan.razorpayLink) {
    cta = (
      <Button
        onClick={startCheckout}
        disabled={busy || isCurrent}
        data-testid={`plan-${plan.id}-btn`}
        className={`w-full ${plan.popular ? "bg-[#D92D20] hover:bg-[#B91C1C]" : "border border-slate-300 dark:border-white/20 bg-transparent text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"}`}
      >
        {busy ? <><IconRefreshCw className="mr-2 h-4 w-4 animate-spin" /> Redirecting…</> : isCurrent ? "Current plan" : (<>{plan.buttonText} <IconExternalLink className="ml-2 h-4 w-4" /></>)}
      </Button>
    );
  } else {
    cta = <Button disabled className="w-full" data-testid={`plan-${plan.id}-btn`}>{isCurrent ? "Current plan" : "Default plan"}</Button>;
  }

  return (
    <>
      <div
        data-testid={`plan-card-${plan.id}`}
        className={`flex flex-col rounded-none border p-7 backdrop-blur-sm ${
          plan.popular ? "border-[#D92D20] ring-2 ring-[#D92D20]/20" : "border-slate-200 dark:border-white/10"
        } bg-slate-50 dark:bg-white/5`}
      >
        {plan.popular ? (
          <span className="mb-3 inline-block w-fit rounded-none bg-[#D92D20] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Most popular
          </span>
        ) : null}
        <div className="font-display text-xl font-bold text-slate-900 dark:text-white">{plan.name}</div>
        <div className="text-xs text-slate-500">{plan.period}</div>
        <div className="mt-3 flex items-end gap-1">
          <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
          {plan.suffix ? <span className="text-sm text-slate-500">{plan.suffix}</span> : null}
        </div>
        <ul className="mt-5 flex-1 space-y-2 text-sm">
          {plan.features.slice(0, 5).map((f) => (
            <li key={f} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
              <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {f}
            </li>
          ))}
          {plan.features.length > 5 ? (
            <li className="text-xs text-slate-500">+ {plan.features.length - 5} more included</li>
          ) : null}
        </ul>
        <div className="mt-4 space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:text-slate-200"
            onClick={() => setDetailsOpen(true)}
            data-testid={`plan-${plan.id}-details-btn`}
          >
            View all details
          </Button>
          {cta}
        </div>
      </div>

      <PlanDetailsDialog plan={plan} open={detailsOpen} onOpenChange={setDetailsOpen} />

      {/* Confirm payment modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent data-testid={`confirm-payment-dialog-${plan.id}`}>
          <DialogHeader>
            <DialogTitle>Did you complete the payment?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-slate-600 dark:text-slate-400">If your payment was successful on the Razorpay page, click "I've completed payment". Our team will verify within 24 hours and activate your plan.</p>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Razorpay payment ID (optional, for faster verification)</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. pay_NXX..."
                className="mt-1 w-full rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500"
                data-testid={`payment-reference-input-${plan.id}`}
              />
            </div>
            <p className="rounded-none border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <strong>Important:</strong> You only need to click this once. We'll notify you by email when your plan is verified and activated.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>I'll do it later</Button>
            <Button onClick={confirmPaid} disabled={busy} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid={`confirm-paid-btn-${plan.id}`}>
              {busy ? "Saving…" : "I've completed payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
