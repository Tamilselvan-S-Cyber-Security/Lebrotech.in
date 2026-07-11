/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCheckCircle, IconArrowRight, IconBriefcase, IconGraduationCap, IconShieldCheck,
} from "@/components/icons/AppIcons";
import {
  STUDENT_BENEFITS,
  HOW_IT_WORKS_STEPS,
  STUDENT_PAGE_INTRO,
  STUDENT_DEGREE_TAGS,
  STUDENT_CERTIFICATE_PATHS,
} from "@/lib/siteContent";
import { PROGRAM_CATEGORIES, PROGRAMS, WORKSHOP_CERTIFICATE_PRICE_LABEL, CERTIFICATE_PRICE_LABEL } from "@/lib/certificatePrograms";

const DEPARTMENT_CHIPS = [
  "Computer Science", "Information Technology", "Electronics (ECE)", "Electrical (EEE)",
  "Mechanical", "Civil", "Chemical", "Biotechnology", "Management", "Marketing",
  "Finance", "Operations", "Human Resources", "Commerce", "Arts & Humanities",
  "Economics", "Design", "Law", "Data Science", "All other departments",
];

const PATH_ICONS = {
  internships: IconBriefcase,
  workshops: IconGraduationCap,
  certificates: IconShieldCheck,
};

export default function ForStudents() {
  return (
    <PublicLayout>
      <section className="theme-hero relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-5xl px-6 py-24">
          <Badge className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/5">
            For Students — all departments
          </Badge>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-6xl">
            Internships, workshops & certificates for every student.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {STUDENT_PAGE_INTRO}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {STUDENT_DEGREE_TAGS.map((d) => (
              <span
                key={d}
                className="rounded-none border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button className="bg-[#D92D20] hover:bg-[#B91C1C]">
                Create free account <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/apply-certificate">
              <Button variant="outline" className="border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">
                Apply for workshop certificate — {WORKSHOP_CERTIFICATE_PRICE_LABEL}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* All departments */}
      <section className="theme-section-alt py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Open to all departments & streams
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Certificate-eligible internships and workshops are not limited to one branch. Students from every department can apply, get verified, and earn their credential.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {DEPARTMENT_CHIPS.map((dept) => (
              <span
                key={dept}
                className="rounded-none border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              >
                {dept}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Three paths: internships, workshops, certificates */}
      <section className="theme-section py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Three ways to get certified
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Pick an internship, join a course workshop, or apply directly for your completion certificate.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {STUDENT_CERTIFICATE_PATHS.map((path) => {
              const Icon = PATH_ICONS[path.id] || IconShieldCheck;
              return (
                <div
                  key={path.id}
                  className="flex flex-col rounded-none border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5"
                  data-testid={`student-path-${path.id}`}
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-none bg-[#D92D20]/10 text-[#D92D20]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{path.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{path.desc}</p>
                  <Link to={path.cta} className="mt-5">
                    <Button variant="outline" className="w-full border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">
                      {path.ctaLabel} <IconArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workshop & course programs */}
      <section className="theme-section-alt py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Course workshops & internship tracks
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Workshop certificates from <strong>{WORKSHOP_CERTIFICATE_PRICE_LABEL}</strong> · full course & internship certificates {CERTIFICATE_PRICE_LABEL}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PROGRAM_CATEGORIES.map((c) => (
              <Badge key={c.value} variant="outline" className="rounded-none border-[#D92D20]/30 text-[#D92D20] dark:text-[#F87171]">
                {c.label}
              </Badge>
            ))}
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PROGRAMS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {p}
              </li>
            ))}
          </ul>
          <Link to="/apply-certificate" className="mt-8 inline-block">
            <Button className="bg-[#D92D20] hover:bg-[#B91C1C]">
              Apply for course or internship certificate <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="theme-section py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-8 font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            How certification works
          </h2>
          <div className="grid grid-cols-1 gap-px border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 sm:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((s) => (
              <div key={s.n} className="rounded-none bg-white p-5 dark:bg-[#0a0f1a]">
                <span className="font-display text-xl font-extrabold text-[#D92D20] dark:text-[#F87171]">{s.n}</span>
                <h3 className="mt-2 font-display text-sm font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="theme-section-alt py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Why students choose Lerbo Tech
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {STUDENT_BENEFITS.map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-none border border-slate-200 dark:border-white/10 bg-white p-5 dark:bg-white/5">
                <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row">
            <Link to="/register">
              <Button className="bg-[#D92D20] hover:bg-[#B91C1C]">
                Get started free <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/opportunities">
              <Button variant="outline" className="border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">
                Browse certificate-eligible internships
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
