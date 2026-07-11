/* eslint-disable react/no-unescaped-entities */
import React from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { STORIES } from "@/lib/siteContent";
import { StoryCard } from "@/components/StoryCard";

export default function Stories() {
  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <Badge className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/5">Certificate stories</Badge>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-6xl">Students who got their internship certificate.</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">Real stories from students, startups, and institutions using Lerbo Tech's apply → verify → certify flow.</p>
        </div>
      </section>

      <section className="theme-section-alt py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {STORIES.map((s, i) => (
              <StoryCard
                key={s.who}
                quote={s.q}
                name={s.who}
                role={s.role}
                photo={s.photo}
                photoIndex={i}
                href="/stories"
                truncate={false}
              />
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
