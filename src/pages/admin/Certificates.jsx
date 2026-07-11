/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WORKSHOP_CERTIFICATE_PRICE_LABEL, CERTIFICATE_PRICE_LABEL } from "@/lib/certificatePrograms";

const STATUS_OPTIONS = ["new", "contacted", "paid", "enrolled", "rejected"];
const STATUS_COLORS = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-800",
  paid: "bg-amber-100 text-amber-800",
  enrolled: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminCertificates() {
  const [apps, setApps] = useState([]);
  const [open, setOpen] = useState(null);

  const load = () => api.get("/admin/certificate-applications?limit=300").then(({ data }) => setApps(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.patch(`/admin/certificate-applications/${id}`, { status });
    toast.success(`Marked as ${status}`);
    load();
  };

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Certificate applications">
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Workshop certificates ({WORKSHOP_CERTIFICATE_PRICE_LABEL}) · course & internship ({CERTIFICATE_PRICE_LABEL}). Applicants receive a confirmation email automatically.
      </p>

      {apps.length === 0 ? (
        <div className="rounded-none border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/20">
          No certificate applications yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-none border border-slate-200 dark:border-white/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Type / Mode</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {apps.map((a) => (
                <React.Fragment key={a.id}>
                  <tr className="bg-white dark:bg-transparent" data-testid={`cert-app-${a.id}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{a.full_name}</div>
                      <div className="text-xs text-slate-500">{a.email}</div>
                      <div className="text-xs text-slate-400">WA: {a.whatsapp || "—"}{a.phone ? ` · ${a.phone}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{a.program}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{a.interest_type} · {a.mode}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{a.duration || "—"}</td>
                    <td className="px-4 py-3"><Badge className={STATUS_COLORS[a.status] || STATUS_COLORS.new}>{a.status}</Badge></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setOpen(open === a.id ? null : a.id)} className="text-xs font-semibold text-[#D92D20] hover:underline">
                        {open === a.id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {open === a.id ? (
                    <tr className="bg-slate-50 dark:bg-white/5">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Info label="Age" value={a.age} />
                          <Info label="School / Institution" value={a.school} />
                          <Info label="College" value={a.college} />
                          <Info label="Degree" value={a.degree} />
                          <Info label="Heard about us" value={a.heard_about} />
                          <Info label="Certificate fee" value={a.price} />
                          <Info label="Previous experience" value={a.experience} full />
                          <Info label="Motivation" value={a.motivation} full />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map((s) => (
                            <Button key={s} size="sm" variant={a.status === s ? "default" : "outline"}
                              className={a.status === s ? "bg-[#D92D20] hover:bg-[#B91C1C]" : ""}
                              onClick={() => setStatus(a.id, s)}>
                              {s}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

function Info({ label, value, full }) {
  if (!value) return null;
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm text-slate-700 dark:text-slate-300">{value}</div>
    </div>
  );
}
