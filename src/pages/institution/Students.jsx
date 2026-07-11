/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INSTITUTION_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { IconSearch as Search } from "@/components/icons/AppIcons";

export default function InstitutionStudents() {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!profile?.id) return;
    api.get(`/students?college_id=${profile.id}&limit=500`).then(({ data }) => setStudents(data));
  }, [profile?.id]);

  const filtered = useMemo(() => {
    if (!q) return students;
    const s = q.toLowerCase();
    return students.filter((x) =>
      [x.full_name, x.department, x.degree, ...(x.skills || [])].join(" ").toLowerCase().includes(s)
    );
  }, [students, q]);

  return (
    <DashboardLayout nav={INSTITUTION_NAV} title={`Students (${students.length})`}>
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 dark:text-slate-400" />
          <Input className="pl-9" placeholder="Search by name, dept, skill..." value={q} onChange={(e) => setQ(e.target.value)} data-testid="inst-students-search" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Degree</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Skills</th><th className="px-4 py-3">Profile</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <tr key={s.id} data-testid={`inst-student-row-${s.id}`}>
                <td className="px-4 py-3 font-semibold text-slate-900">{s.full_name}</td>
                <td className="px-4 py-3 text-slate-700">{s.degree} · {s.department}</td>
                <td className="px-4 py-3 text-slate-500">Year {s.year_of_study}</td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="flex flex-wrap gap-1">
                    {(s.skills || []).slice(0, 3).map((sk) => <span key={sk} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">{sk}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{s.profile_completion}%</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-sm text-slate-500">No students yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
