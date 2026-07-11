/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STARTUP_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { resolveAssetUrl } from "@/lib/assets";
import { IconArrowLeft as ArrowLeft, IconMail as Mail, IconPhone as Phone, IconMapPin as MapPin, IconFileText as FileText, IconExternalLink as ExternalLink, IconGraduationCap as GraduationCap } from "@/components/icons/AppIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function StartupCandidateProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [s, setS] = useState(null);

  useEffect(() => { api.get(`/students/${studentId}`).then(({ data }) => setS(data)); }, [studentId]);

  if (!s) return <DashboardLayout nav={STARTUP_NAV} title="Candidate">Loading…</DashboardLayout>;

  const photoSrc = resolveAssetUrl(s.photo_url);
  const resumeUrl = resolveAssetUrl(s.resume_url);

  return (
    <DashboardLayout nav={STARTUP_NAV} title={s.full_name}>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back</button>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">{photoSrc && <AvatarImage src={photoSrc} />}<AvatarFallback className="bg-slate-900 text-xl text-white">{s.full_name?.[0]}</AvatarFallback></Avatar>
            <div>
              <div className="font-display text-2xl font-extrabold text-slate-900">{s.full_name}</div>
              <div className="text-sm text-slate-500">{s.degree} · {s.department}</div>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            {s.email && <div className="flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" /> {s.email}</div>}
            {s.phone && <div className="flex items-center gap-2 text-slate-700"><Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" /> {s.phone}</div>}
            {s.city && <div className="flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" /> {s.city}</div>}
            {s.college_name_raw && <div className="flex items-center gap-2 text-slate-700"><GraduationCap className="h-4 w-4 text-slate-600 dark:text-slate-400" /> {s.college_name_raw}</div>}
          </div>
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-link mt-5 w-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100" data-testid="candidate-resume-link">
              <FileText className="h-4 w-4" /> View resume
            </a>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-lg font-bold">About</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{s.bio || "No bio yet."}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-lg font-bold">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(s.skills || []).map((sk) => <span key={sk} className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{sk}</span>)}
              {(!s.skills || s.skills.length === 0) && <span className="text-sm text-slate-600 dark:text-slate-400">No skills listed</span>}
            </div>
            <h3 className="mt-6 font-display text-lg font-bold">Domains</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(s.domains || []).map((d) => <Badge key={d} className="bg-slate-900 text-white hover:bg-slate-900">{d}</Badge>)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-lg font-bold">Academic</h3>
            <dl className="mt-3 grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-slate-500">Degree</dt><dd>{s.degree}</dd>
              <dt className="text-slate-500">Department</dt><dd>{s.department}</dd>
              <dt className="text-slate-500">Year</dt><dd>{s.year_of_study}</dd>
              <dt className="text-slate-500">Graduation</dt><dd>{s.graduation_year}</dd>
              <dt className="text-slate-500">CGPA</dt><dd>{s.cgpa}</dd>
              <dt className="text-slate-500">Availability</dt><dd>{s.availability || "—"}</dd>
              <dt className="text-slate-500">Expected stipend</dt><dd>{s.expected_stipend || "—"}</dd>
              <dt className="text-slate-500">Work mode</dt><dd className="capitalize">{s.work_mode_pref || "—"}</dd>
            </dl>
          </div>
          {(s.linkedin_url || s.portfolio_url) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-display text-lg font-bold">Links</h3>
              <div className="mt-3 space-y-2 text-sm">
                {s.linkedin_url && <a className="inline-flex items-center gap-2 text-slate-700 hover:underline" href={s.linkedin_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /> LinkedIn</a>}
                <br/>
                {s.portfolio_url && <a className="inline-flex items-center gap-2 text-slate-700 hover:underline" href={s.portfolio_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /> Portfolio</a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
