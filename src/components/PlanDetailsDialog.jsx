/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { IconCheckCircle } from "@/components/icons/AppIcons";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PlanDetailsDialog({ plan, open, onOpenChange, showAdminFields = false }) {
  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto" data-testid={`plan-details-dialog-${plan.id}`}>
        <DialogHeader>
          <DialogTitle>{plan.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-semibold uppercase tracking-wider text-slate-500">Audience</div>
              <div className="mt-0.5 capitalize text-slate-900">{plan.audience}</div>
            </div>
            <div>
              <div className="font-semibold uppercase tracking-wider text-slate-500">Price</div>
              <div className="mt-0.5 font-display text-lg font-bold text-slate-900">
                {plan.price}{plan.suffix || ""}
              </div>
            </div>
            <div>
              <div className="font-semibold uppercase tracking-wider text-slate-500">Billing</div>
              <div className="mt-0.5 text-slate-700">{plan.period || "—"}</div>
            </div>
            {plan.duration ? (
              <div>
                <div className="font-semibold uppercase tracking-wider text-slate-500">Duration</div>
                <div className="mt-0.5 text-slate-700">{plan.duration}</div>
              </div>
            ) : null}
            {showAdminFields && plan.id ? (
              <div className="col-span-2">
                <div className="font-semibold uppercase tracking-wider text-slate-500">Plan ID</div>
                <div className="mt-0.5 font-mono text-slate-700">{plan.id}</div>
              </div>
            ) : null}
            {showAdminFields && plan.razorpayLink ? (
              <div className="col-span-2">
                <div className="font-semibold uppercase tracking-wider text-slate-500">Razorpay link</div>
                <a href={plan.razorpayLink} target="_blank" rel="noopener noreferrer" className="mt-0.5 break-all text-[#D92D20] hover:underline">
                  {plan.razorpayLink}
                </a>
              </div>
            ) : null}
            {showAdminFields && plan.stats ? (
              <>
                <div>
                  <div className="font-semibold uppercase tracking-wider text-slate-500">Total attempts</div>
                  <div className="mt-0.5 text-slate-700">{plan.stats.attempts_total ?? 0}</div>
                </div>
                <div>
                  <div className="font-semibold uppercase tracking-wider text-slate-500">Approved</div>
                  <div className="mt-0.5 text-slate-700">{plan.stats.attempts_approved ?? 0}</div>
                </div>
              </>
            ) : null}
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">What's included</div>
            <ul className="mt-2 space-y-2">
              {(plan.features || []).map((f) => (
                <li key={f} className="flex items-start gap-2 text-slate-700">
                  <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {plan.enterprise ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              Enterprise plans are custom-priced. Submit an enquiry and our team will share a proposal.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
