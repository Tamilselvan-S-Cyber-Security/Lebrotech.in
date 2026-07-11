/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect, react-hooks/purity */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconArrowRight, IconBriefcase, IconGraduationCap, IconTrendingUp, IconChevronRight, IconCheckCircle,
  IconShieldCheck, IconSearch, IconListChecks, IconFileText, IconBuilding2, IconSparkles,
} from "@/components/icons/AppIcons";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import {
  HOW_IT_WORKS_STEPS, CERTIFICATE_INTRO, STUDENT_BENEFITS, TESTIMONIALS,
  PLATFORM_FEATURES,
} from "@/lib/siteContent";
import { WORKSHOP_CERTIFICATE_PRICE_LABEL, CERTIFICATE_PRICE_LABEL } from "@/lib/certificatePrograms";
import { IconTile, IconApplied, IconVerified, IconCertified } from "@/components/icons/CertIcons";
import OpportunityImage from "@/components/OpportunityImage";
import { StoryCarousel } from "@/components/StoryCard";

const HOW_IT_WORKS_ICONS = [IconApplied, IconVerified, IconCertified];
const HOW_IT_WORKS_TONES = ["sky", "violet", "emerald"];

const FEATURE_ICONS = {
  verified: IconShieldCheck,
  match: IconSearch,
  pipeline: IconListChecks,
  certificate: IconFileText,
  campus: IconBuilding2,
  free: IconSparkles,
};

function CountUp({ end, suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const dur = 1500;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setV(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return <span>{v.toLocaleString("en-IN")}{suffix}</span>;
}

const CERT_IMAGE = `${process.env.PUBLIC_URL}/image/14287.jpg`;
const HERO_IMAGE = `${process.env.PUBLIC_URL}/image/4.webp`;
const PLACEMENT_MEMBERS_IMAGE = `${process.env.PUBLIC_URL}/placement/Interplcemnet-menbers.png`;
const AI_GIF = `${process.env.PUBLIC_URL}/ai/ai.gif`;

const PREMIUM_CERT_TRACKS = [
  {
    id: "internship",
    title: "Internship certificate",
    price: CERTIFICATE_PRICE_LABEL,
    desc: "Complete a verified internship and unlock your official premium completion certificate.",
    points: ["Verified startup internship", "Completion validation", "Resume & LinkedIn ready"],
  },
  {
    id: "course",
    title: "Advance course certificate",
    price: CERTIFICATE_PRICE_LABEL,
    desc: "Earn an advanced course certificate in Cyber Security, Cloud, Full Stack, and more.",
    points: ["Industry-aligned modules", "Skill validation", "Premium digital certificate"],
  },
  {
    id: "workshop",
    title: "Workshop certificate",
    price: WORKSHOP_CERTIFICATE_PRICE_LABEL,
    desc: "Short hands-on workshops with a verified certificate — ideal for quick upskilling.",
    points: ["Live / guided workshops", "Quick completion", "Official workshop credential"],
  },
];

const INTERNSHIP_OFFER_LOGOS = [
  { name: "Google", file: "google.png" },
  { name: "NVIDIA", file: "nvidia.png" },
  { name: "TCS", file: "tcs.png" },
  { name: "Microsoft", file: "Microsoft.png" },
  { name: "Cognizant", file: "Cognizant.png" },
  { name: "Asian Paints", file: "Asian Paints.png" },
  { name: "Nestlé", file: "Nestle.png" },
  { name: "Amazon", file: "Amazon.png" },
  { name: "EY", file: "EY.png" },
  { name: "ITC", file: "ITC.png" },
  { name: "Reliance", file: "Reliance.png" },
  { name: "Wipro", file: "Wipro.png" },
].map((c) => ({
  ...c,
  src: `${process.env.PUBLIC_URL}/intern-company/${encodeURIComponent(c.file)}`,
}));

/** Keep only internships whose stipend upper bound is ₹10,000 or below.
 * Stipend ranges look like "₹0-5K", "₹5-10K", "₹10-20K" (values in thousands). */
function maxStipendUnder10k(o) {
  const nums = String(o?.stipend_range || "").match(/\d+/g);
  if (!nums || !nums.length) return false;
  const upper = Math.max(...nums.map(Number));
  return upper <= 10;
}

function CertificatePreview() {
  return (
    <img
      src={CERT_IMAGE}
      alt="Internship certificate preview"
      className="h-auto w-full object-contain object-center"
    />
  );
}

function HeroImage() {
  return (
    <img
      src={HERO_IMAGE}
      alt="Students earning their internship certificate"
      className="h-auto w-full object-contain object-center"
    />
  );
}

export default function Landing() {
  const [opps, setOpps] = useState([]);
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const load = () => {
      api.get("/opportunities?limit=20").then(({ data }) => setOpps(Array.isArray(data) ? data : [])).catch(() => {});
      api.get("/stats/public").then(({ data }) => setStats(data)).catch(() => {});
    };
    load();
    window.addEventListener("lerbo-db-hydrated", load);
    return () => window.removeEventListener("lerbo-db-hydrated", load);
  }, []);

  const eligibleOpps = opps.filter(maxStipendUnder10k);
  const featuredOpps = (eligibleOpps.length >= 4 ? eligibleOpps : [...eligibleOpps, ...opps.filter((o) => !eligibleOpps.includes(o))]).slice(0, 4);

  const statItems = [
    { v: stats?.students ?? 520, suf: "+", label: "Students", sub: "Getting certified", icon: IconGraduationCap },
    { v: stats?.active_opportunities ?? 240, suf: "+", label: "Internships", sub: "Certificate eligible", icon: IconBriefcase },
    { v: stats?.certificates_distributed ?? 1000, suf: "+", label: "Certificates", sub: "Distributed nationwide", icon: IconCheckCircle },
    { v: stats?.students ?? 520, suf: "+", label: "Placements", sub: "Students placed", icon: IconTrendingUp },
  ];

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="theme-hero relative overflow-hidden" data-testid="hero-section">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:gap-10 lg:px-6 lg:py-16">
          <div className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D92D20]">Professional internship platform</p>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              Get your internship<br />
              <span className="relative inline-block">
                <span className="relative z-10 text-[#D92D20] dark:text-[#F87171]">certificate.</span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[#D92D20]/30" />
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {CERTIFICATE_INTRO}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/apply-certificate" data-testid="hero-apply-certificate" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-[#D92D20] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#B91C1C] sm:w-auto">
                  Get Certified Now <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/opportunities" data-testid="hero-browse-internships" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-slate-300 dark:border-white/20 bg-transparent font-semibold text-slate-900 dark:text-white transition hover:-translate-y-0.5 hover:bg-slate-100 dark:hover:bg-white/10 sm:w-auto">
                  Browse Internships
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-slate-500">
              <span>
                <strong className="text-slate-900 dark:text-white">{stats?.students ?? 520}+</strong> students certified ·{" "}
                <strong className="text-slate-900 dark:text-white">{stats?.certificates_distributed ?? 1000}+</strong> certificates distributed ·{" "}
                <strong className="text-slate-900 dark:text-white">{stats?.active_opportunities ?? 240}+</strong> live internships
              </span>
            </div>
          </div>

          <HeroImage />
        </div>
      </section>

      {/* STATS BAR — infinite marquee */}
      <section className="relative overflow-hidden py-8">
        <div className="marquee relative">
          <div className="marquee__track marquee__track--stats">
            {[...statItems, ...statItems].map((s, i) => (
              <div
                key={`${s.label}-${i}`}
                data-testid={i < statItems.length ? `stat-${s.label.toLowerCase()}` : undefined}
                className="group relative flex w-[300px] shrink-0 flex-col gap-2 border border-slate-200 p-6 transition-colors hover:border-[#D92D20]/40 dark:border-white/10 sm:w-[320px] sm:p-8"
              >
                <span className="absolute left-0 top-0 h-0.5 w-0 bg-[#D92D20] transition-all duration-500 group-hover:w-full" />
                <div className="flex items-center gap-2 text-[#D92D20]">
                  <s.icon className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{s.label}</span>
                </div>
                <div className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-5xl">
                  <CountUp end={s.v} suffix={s.suf} />
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERNSHIP OFFERS — company logos */}
      <section className="theme-section border-y border-slate-200/80 py-12 sm:py-14" data-testid="internship-offers-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#D92D20]">Internship offers</span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Opportunities announced from leading companies
            </h2>
          </div>
        </div>
        <div className="marquee relative">
          <div className="marquee__track marquee__track--logos">
            {[...INTERNSHIP_OFFER_LOGOS, ...INTERNSHIP_OFFER_LOGOS].map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="flex h-20 w-[160px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 sm:h-24 sm:w-[180px]"
                title={c.name}
              >
                <img
                  src={c.src}
                  alt={`${c.name} logo`}
                  loading="lazy"
                  className="max-h-12 w-auto max-w-[120px] object-contain sm:max-h-14 sm:max-w-[140px]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="theme-section py-20 sm:py-24" data-testid="platform-features-section">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#D92D20]">Platform</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Built as a professional internship platform.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              From verified openings to official certificates — everything students, startups, and campuses need in one place.
            </p>
          </div>

          <div className="platform-feature-table" data-testid="platform-features-grid">
            {PLATFORM_FEATURES.map((f) => {
              const Icon = FEATURE_ICONS[f.id] || IconSparkles;
              return (
                <div
                  key={f.id}
                  data-testid={`platform-feature-${f.id}`}
                  className="group bg-white p-6 transition hover:bg-slate-50"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center border border-black bg-[#D92D20]/10 text-[#D92D20] transition group-hover:bg-[#D92D20] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="theme-section-alt py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#D92D20]">How it works</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Three steps to a certified internship.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              A clear, verified path from application to official certificate — built for students.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div
              aria-hidden
              className="pointer-events-none absolute left-[10%] right-[10%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block"
            />

            {HOW_IT_WORKS_STEPS.map((s, i) => {
              const StepIcon = HOW_IT_WORKS_ICONS[i];
              return (
                <div
                  key={s.n}
                  data-testid={`how-it-works-step-${s.n}`}
                  className="group relative flex flex-col"
                >
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
                      <IconTile icon={StepIcon} tone={HOW_IT_WORKS_TONES[i]} active size="lg" />
                      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Step {s.n}</p>
                      <h3 className="mt-1 font-display text-xl font-bold leading-snug text-slate-900">{s.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                    </div>
                    <span className="mt-6 block h-0.5 w-0 bg-[#D92D20] transition-all duration-500 group-hover:w-full" />
                  </article>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <Link to="/apply-certificate" data-testid="cta-start-certification-journey">
              <Button className="bg-[#D92D20] font-semibold hover:bg-[#B91C1C]">
                Start your certification journey <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STUDENT BENEFITS */}
      <section className="theme-section py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Badge className="border border-[#D92D20]/30 bg-[#D92D20]/10 text-[#D92D20] dark:text-[#F87171] hover:bg-[#D92D20]/10">For Students</Badge>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-5xl">Your path to an internship certificate.</h2>
            <ul className="space-y-3 text-base text-slate-600 dark:text-slate-400">
              {STUDENT_BENEFITS.map((t) => (
                <li key={t} className="flex items-start gap-3"><IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> <span>{t}</span></li>
              ))}
            </ul>
            <Link to="/students">
              <Button variant="outline" className="border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">Explore Student Portal <IconChevronRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
          <CertificatePreview />
        </div>
      </section>

      {/* OPPORTUNITY SHOWCASE */}
      <section className="theme-section-alt py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
            <div className="order-2 lg:order-1">
              <img
                src={PLACEMENT_MEMBERS_IMAGE}
                alt="Lerbo Tech placement members"
                className="h-auto w-full object-contain object-center"
                loading="lazy"
              />
            </div>
            <div className="order-1 flex flex-col gap-4 lg:order-2">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">Featured</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Certificate-eligible internships, live now.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  Stipends up to ₹10,000. Limited seats — only for top-performing students.
                </p>
              </div>
              <Link
                to="/opportunities"
                className="inline-flex w-fit items-center text-sm font-semibold text-[#D92D20] transition hover:underline"
              >
                Browse all internships <IconArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredOpps.map((o) => (
              <Link
                key={o.id}
                to={`/opportunities/${o.id}`}
                className="opp-card group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <OpportunityImage src={o.image_url} alt={o.title} className="h-36 w-full" />
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#D92D20]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D92D20]">
                      {o.domain}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{o.mode}</span>
                  </div>

                  <h3 className="opp-card-title mt-4 line-clamp-2 min-h-[3.25rem] font-display text-lg font-bold leading-snug text-slate-900 transition-colors">
                    {o.title}
                  </h3>
                  <p className="mt-1 truncate text-sm text-slate-500">{o.startup_name}</p>

                  <div className="mt-4 inline-flex w-fit items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                    <IconCheckCircle className="h-3 w-3" /> Certificate eligible
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6">
                  <span className="text-xs font-medium text-slate-500">{o.duration}</span>
                  <span className="text-sm font-bold text-slate-900">{o.stipend_range}</span>
                </div>
              </Link>
            ))}
          </div>

          {featuredOpps.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              No internships available right now. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="theme-section py-20 sm:py-24" data-testid="success-stories-section">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#D92D20]">Success stories</span>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Students who got their internship certificate.
              </h2>
            </div>
            <Link to="/stories" className="inline-flex shrink-0 items-center text-sm font-semibold text-[#D92D20] transition hover:underline">
              View all stories <IconArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <StoryCarousel items={TESTIMONIALS} href="/stories" />
        </div>
      </section>

      {/* PREMIUM CERTIFICATES + JOBS UPDATE */}
      <section className="theme-section-alt py-20 sm:py-24" data-testid="premium-certificates-section">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#D92D20]">Premium certificates</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Advance course certificates & job-ready credentials.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Get premium certificates for Internship, Course, and Workshop tracks — plus ongoing jobs updates for placement-ready students.
              </p>

              <div className="mt-8">
                {PREMIUM_CERT_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    data-testid={`premium-cert-${track.id}`}
                    className="cert-bubble"
                  >
                    <h3 className="cert-bubble__title relative z-[2]">{track.title}</h3>
                    <p className="cert-bubble__desc relative z-[2]">{track.desc}</p>
                    <div className="cert-bubble__price relative z-[2]">{track.price}</div>
                    <ul className="cert-bubble__points relative z-[2]">
                      {track.points.map((p) => (
                        <li key={p} className="cert-bubble__point">
                          <IconCheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-600">
                <strong className="text-slate-900">Jobs update:</strong> New internship and placement openings are refreshed regularly — browse live roles anytime.
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/apply-certificate" data-testid="premium-get-certificate">
                  <Button className="w-full bg-[#D92D20] font-semibold hover:bg-[#B91C1C] sm:w-auto">
                    Get premium certificate <IconArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/opportunities" data-testid="premium-browse-jobs">
                  <Button variant="outline" className="w-full border-slate-300 font-semibold text-slate-900 hover:bg-slate-100 sm:w-auto">
                    Browse jobs & internships
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <img
                src={AI_GIF}
                alt="AI-powered premium certificates and career guidance"
                className="mx-auto h-auto w-full max-h-[420px] object-contain object-center sm:max-h-[480px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: "#FED600" }}>
        <div
          className="pointer-events-none absolute inset-0 bg-center bg-no-repeat bg-contain opacity-20 mix-blend-lighten"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/image/tample.png)` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 lg:text-6xl">Get your best Lerbo Tech certificate</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-800">
            Workshop from <strong>{WORKSHOP_CERTIFICATE_PRICE_LABEL}</strong> · Internship & course certificate <strong>{CERTIFICATE_PRICE_LABEL}</strong> — all departments welcome.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/apply-certificate" data-testid="cta-apply-certificate">
              <Button size="lg" className="bg-slate-900 font-bold text-white hover:bg-slate-800">Apply for certificate</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
