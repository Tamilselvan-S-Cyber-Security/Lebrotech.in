import React from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FAQS } from "@/lib/siteContent";

export default function FAQ() {
  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-4xl px-6 py-24">
          <Badge className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/5">FAQ</Badge>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Internship certificate questions, answered.</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">Everything you need to know about applying, verification, validation, and getting your Lerbo Tech certificate.</p>

          {Object.entries(FAQS).map(([group, items]) => (
            <div key={group} className="mt-12">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{group}</h2>
              <Accordion type="single" collapsible className="mt-4">
                {items.map((it, i) => (
                  <AccordionItem key={i} value={`${group}-${i}`} data-testid={`faq-item-${group}-${i}`} className="border-slate-200 dark:border-white/10">
                    <AccordionTrigger className="text-left text-base font-semibold text-slate-900 dark:text-white hover:text-[#F87171]">{it.q}</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed text-slate-600 dark:text-slate-400">{it.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
