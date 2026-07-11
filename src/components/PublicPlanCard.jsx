import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconCheckCircle } from "@/components/icons/AppIcons";
import PlanDetailsDialog from "@/components/PlanDetailsDialog";
import { getRegisterLink } from "@/lib/plans";

/**
 * Plan card for public marketing pages (For Startups / For Institutions).
 * Unauthenticated users go to register with role + plan pre-selected.
 */
export default function PublicPlanCard({ plan, role, darkPopular = false }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const registerTo = getRegisterLink(role, plan.id);
  const isPopular = plan.popular;
  const ctaLabel = plan.enterprise ? "Request proposal" : plan.id === "free" ? "Get started free" : "Get started";

  const cardClass = isPopular && darkPopular
    ? "border-[#D92D20] bg-[#141d2e] text-white shadow-xl ring-2 ring-[#D92D20]/20"
    : isPopular
      ? "border-[#D92D20] bg-slate-50 dark:bg-white/5 ring-2 ring-[#D92D20]/20"
      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5";

  const titleClass = isPopular && darkPopular ? "text-white" : "text-slate-900 dark:text-white";
  const textClass = isPopular && darkPopular ? "text-slate-300" : "text-slate-600 dark:text-slate-400";
  const listClass = isPopular && darkPopular ? "text-slate-200" : "text-slate-600 dark:text-slate-400";

  return (
    <>
      <div className={`rounded-none border p-8 backdrop-blur-sm ${cardClass}`} data-testid={`public-plan-${plan.id}`}>
        {isPopular ? (
          <div className="mb-3 inline-block rounded-none bg-[#D92D20] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {darkPopular ? "Recommended" : "Most popular"}
          </div>
        ) : null}
        <div className={`font-display text-2xl font-extrabold ${titleClass}`}>{plan.name}</div>
        <div className={`mt-2 flex items-baseline gap-1 ${titleClass}`}>
          <span className="font-display text-4xl font-extrabold">{plan.price}</span>
          {plan.suffix ? <span className={`text-sm ${textClass}`}>{plan.suffix}</span> : null}
        </div>
        <div className={`mt-2 text-sm ${textClass}`}>{plan.period}</div>
        <ul className={`mt-6 space-y-3 text-sm ${listClass}`}>
          {plan.features.slice(0, 6).map((f) => (
            <li key={f} className="flex items-start gap-2">
              <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {f}
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2">
          <Button
            type="button"
            variant="outline"
            className={`w-full ${isPopular && darkPopular ? "border-white/20 text-white hover:bg-white/10" : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:text-slate-200"}`}
            onClick={() => setDetailsOpen(true)}
            data-testid={`public-plan-${plan.id}-details`}
          >
            View all details
          </Button>
          <Link to={registerTo} className="block">
            <Button
              className={`w-full ${
                isPopular && darkPopular
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : isPopular
                    ? "bg-[#D92D20] text-white hover:bg-[#B91C1C]"
                    : "border border-slate-300 dark:border-white/20 bg-transparent text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
              data-testid={`public-plan-${plan.id}-register`}
            >
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </div>
      <PlanDetailsDialog plan={plan} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  );
}
