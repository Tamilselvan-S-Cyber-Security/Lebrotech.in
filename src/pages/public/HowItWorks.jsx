/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconChevronRight } from "@/components/icons/AppIcons";
import { HOW_IT_WORKS_STEPS } from "@/lib/siteContent";
import { IconApplied, IconVerified, IconCertified, IconTile } from "@/components/icons/CertIcons";

const STEP_ICONS = [IconApplied, IconVerified, IconCertified];
const STEP_TONES = ["sky", "violet", "emerald"];

export default function HowItWorks() {
  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#D92D20]">How it works</span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Internship certificate in three simple steps.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Apply for a verified internship, pass our review process, and earn your official Lerbo Tech completion certificate.
          </p>
        </div>
      </section>

      <section className="theme-section-alt pb-20 pt-4 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div
              aria-hidden
              className="pointer-events-none absolute left-[10%] right-[10%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block"
            />

            {HOW_IT_WORKS_STEPS.map((s, i) => {
              const StepIcon = STEP_ICONS[i];
              return (
                <div key={s.n} className="group relative flex flex-col">
                  <div className="relative z-10 mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D92D20]/25 bg-white shadow-sm ring-4 ring-slate-50">
                      <span className="font-display text-sm font-extrabold text-[#D92D20]">{s.n}</span>
                    </div>
                    {i < HOW_IT_WORKS_STEPS.length - 1 && (
                      <IconChevronRight className="hidden h-5 w-5 shrink-0 text-slate-300 lg:absolute lg:left-[calc(100%+0.75rem)] lg:top-3.5 lg:block" aria-hidden />
                    )}
                  </div>

                  <article className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D92D20]/30 hover:shadow-md sm:p-7">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-7xl font-extrabold leading-none text-slate-100"
                    >
                      {s.n}
                    </span>
                    <div className="relative">
                      <IconTile icon={StepIcon} tone={STEP_TONES[i]} active size="lg" />
                      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Step {s.n}</p>
                      <h2 className="mt-1 font-display text-xl font-bold leading-snug text-slate-900">{s.title}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                    </div>
                    <span className="mt-6 block h-0.5 w-0 bg-[#D92D20] transition-all duration-500 group-hover:w-full" />
                  </article>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link to="/apply-certificate">
              <Button className="bg-[#D92D20] font-semibold hover:bg-[#B91C1C]">
                Get Certified <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
