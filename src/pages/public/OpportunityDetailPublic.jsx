/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconMapPin, IconCalendar, IconIndianRupee, IconUsers, IconClock, IconArrowLeft } from "@/components/icons/AppIcons";
import { useAuth } from "@/context/AuthContext";
import OpportunityImage from "@/components/OpportunityImage";

export default function OpportunityDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opp, setOpp] = useState(null);

  useEffect(() => {
    api.get(`/opportunities/${id}`).then(({ data }) => setOpp(data)).catch(() => setOpp(null));
  }, [id]);

  if (!opp) return <PublicLayout><div className="mx-auto max-w-4xl px-6 py-20 text-slate-600 dark:text-slate-400">Loading…</div></PublicLayout>;

  return (
    <PublicLayout>
      <section className="theme-section py-16">
        <div className="mx-auto max-w-5xl px-6">
          <Link to="/opportunities" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-white">
            <IconArrowLeft className="h-4 w-4" /> All internships
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <OpportunityImage src={opp.image_url} alt={opp.title} className="mb-6 h-56 w-full rounded-none border border-slate-200 dark:border-white/10 sm:h-72" />
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-slate-200 dark:border-white/10 bg-[#D92D20]/20 text-[#D92D20] dark:text-[#F87171] hover:bg-[#D92D20]/20">{opp.domain}</Badge>
                <Badge variant="outline" className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300">{opp.mode}</Badge>
                <Badge variant="outline" className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300">{opp.duration}</Badge>
                {opp.is_featured && <Badge className="border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10">Featured</Badge>}
              </div>
              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-5xl">{opp.title}</h1>
              <div className="mt-2 text-lg text-slate-600 dark:text-slate-400">at <strong className="text-slate-900 dark:text-white">{opp.startup_name}</strong></div>

              <div className="mt-8 max-w-none">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">About this internship</h3>
                <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-600 dark:text-slate-400">{opp.description}</p>
              </div>

              <div className="mt-8">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Skills required</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {opp.skills_required?.map((s) => (
                    <span key={s} className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{s}</span>
                  ))}
                </div>
              </div>

              {opp.perks?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Perks</h3>
                  <ul className="mt-3 space-y-2 text-base text-slate-600 dark:text-slate-400">
                    {opp.perks.map((p) => <li key={p}>· {p}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Aside */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 backdrop-blur-sm">
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><IconIndianRupee className="h-4 w-4" /> Stipend</span><strong className="text-slate-900 dark:text-white">{opp.stipend_range}</strong></li>
                  <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><IconClock className="h-4 w-4" /> Duration</span><strong className="text-slate-900 dark:text-white">{opp.duration}</strong></li>
                  <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><IconMapPin className="h-4 w-4" /> Location</span><strong className="text-slate-900 dark:text-white">{opp.city || opp.mode}</strong></li>
                  <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><IconUsers className="h-4 w-4" /> Openings</span><strong className="text-slate-900 dark:text-white">{opp.openings}</strong></li>
                  <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><IconCalendar className="h-4 w-4" /> Deadline</span><strong className="text-slate-900 dark:text-white">{opp.deadline?.split("T")[0]}</strong></li>
                </ul>
                <Button
                  data-testid="public-apply-cta"
                  onClick={() => navigate(user?.role === "student" ? `/student/opportunities/${opp.id}` : "/register")}
                  className="mt-6 w-full bg-[#D92D20] text-white hover:bg-[#B91C1C]"
                >
                  {user?.role === "student" ? "Apply now" : "Sign up to apply"}
                </Button>
                <div className="mt-3 text-center text-xs text-slate-500">{opp.view_count || 0} students viewed this</div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
