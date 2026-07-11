/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STUDENT_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { IconBookmark as Bookmark } from "@/components/icons/AppIcons";

export default function StudentSaved() {
  const [opps, setOpps] = useState([]);
  useEffect(() => { api.get("/saved/opportunities").then(({ data }) => setOpps(data)); }, []);

  return (
    <DashboardLayout nav={STUDENT_NAV} title="Saved Internships">
      {opps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Bookmark className="mx-auto mb-3 h-10 w-10 text-slate-700 dark:text-slate-300" />
          <div className="font-display text-xl font-bold text-slate-700">No saved internships yet</div>
          <Link to="/student/opportunities" className="mt-3 inline-block text-sm font-semibold text-[#D92D20] hover:underline">Browse internships →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opps.map((o) => (
            <Link to={`/student/opportunities/${o.id}`} key={o.id} className="card-lift block rounded-2xl border border-slate-200 bg-white p-5">
              <div className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white inline-block">{o.domain}</div>
              <h3 className="mt-3 font-display text-base font-bold text-slate-900">{o.title}</h3>
              <div className="text-xs text-slate-500">{o.startup_name}</div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span>{o.duration} · {o.mode}</span>
                <span className="font-bold text-slate-900">{o.stipend_range}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
