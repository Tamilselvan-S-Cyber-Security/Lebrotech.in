/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STUDENT_NAV } from "@/lib/nav";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import { IconArrowRight, IconShieldCheck } from "@/components/icons/AppIcons";
import { getInterestTypeMeta } from "@/lib/certificatePrograms";

const CERT_STATUS_COLORS = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-800",
  paid: "bg-amber-100 text-amber-800",
  enrolled: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const TYPE_LABELS = {
  workshop: "Workshop",
  course: "Course",
  internship: "Internship",
};

function DetailRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm text-slate-700 dark:text-slate-300">{value}</div>
    </div>
  );
}

export default function StudentCertification() {
  const { profile, user } = useAuth();
  const [certApps, setCertApps] = useState([]);
  const [internApps, setInternApps] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/certificate-applications/me").then(({ data }) => setCertApps(data)).catch(() => setCertApps([])),
      api.get("/applications/me").then(({ data }) => {
        setInternApps(data.filter((a) => ["offer", "hired", "completed"].includes(a.status)));
      }).catch(() => setInternApps([])),
    ]).finally(() => setLoading(false));
  }, []);

  const enrolled = certApps.filter((a) => a.status === "enrolled").length;
  const inProgress = certApps.filter((a) => ["new", "contacted", "paid"].includes(a.status)).length;

  return (
    <DashboardLayout nav={STUDENT_NAV} title="My Certification">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track workshop, course, and internship certificate applications — plus internship completion certificates.
          </p>
          {profile?.full_name ? (
            <p className="mt-1 text-xs text-slate-500">
              Profile: {profile.full_name} · {user?.email}
            </p>
          ) : null}
        </div>
        <Link to="/apply-certificate">
          <Button className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="student-apply-certificate">
            Apply for certificate <IconArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Certificate applies", value: certApps.length },
          { label: "In progress", value: inProgress },
          { label: "Enrolled", value: enrolled },
          { label: "Internship certs", value: internApps.length },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0a0f1a]"
            data-testid={`cert-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="applications">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="applications" data-testid="cert-tab-applications">
            Certificate applications ({certApps.length})
          </TabsTrigger>
          <TabsTrigger value="internships" data-testid="cert-tab-internships">
            Internship certificates ({internApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-4">
          {loading ? (
            <div className="mt-6 flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#D92D20]" />
            </div>
          ) : certApps.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-10 text-center dark:border-white/10">
              <IconShieldCheck className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                No certificate applications yet. Apply for a workshop, course, or internship certificate.
              </p>
              <Link to="/apply-certificate" className="mt-4 inline-block">
                <Button variant="outline" className="border-slate-300 dark:border-white/20">
                  Start application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {certApps.map((a) => {
                const typeMeta = getInterestTypeMeta(a.interest_type || a.certificate_type);
                const isOpen = openId === a.id;
                return (
                  <article
                    key={a.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a0f1a]"
                    data-testid={`student-cert-app-${a.id}`}
                  >
                    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{a.program}</h3>
                          <Badge variant="outline" className="rounded-md text-[10px] uppercase">
                            {TYPE_LABELS[a.interest_type || a.certificate_type] || typeMeta?.label || "Certificate"}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>{a.duration || "—"} · {a.mode || "—"}</span>
                          <span>Fee: {a.price || "—"}</span>
                          <span>Applied: {a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "—"}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Badge className={CERT_STATUS_COLORS[a.status] || CERT_STATUS_COLORS.new}>{a.status}</Badge>
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : a.id)}
                          className="text-xs font-semibold text-[#D92D20] hover:underline"
                          data-testid={`cert-details-toggle-${a.id}`}
                        >
                          {isOpen ? "Hide details" : "View details"}
                        </button>
                      </div>
                    </div>
                    {isOpen ? (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 dark:border-white/5 dark:bg-white/5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <DetailRow label="Full name" value={a.full_name} />
                          <DetailRow label="Email" value={a.email} />
                          <DetailRow label="WhatsApp" value={a.whatsapp} />
                          <DetailRow label="Phone" value={a.phone} />
                          <DetailRow label="Age" value={a.age} />
                          <DetailRow label="School / Institution" value={a.school} />
                          <DetailRow label="College" value={a.college} />
                          <DetailRow label="Degree / Department" value={a.degree} />
                          <DetailRow label="Certificate type" value={typeMeta?.label} />
                          <DetailRow label="Program" value={a.program} />
                          <DetailRow label="Duration" value={a.duration} />
                          <DetailRow label="Mode" value={a.mode} />
                          <DetailRow label="Fee" value={a.price} />
                          <DetailRow label="Heard about us" value={a.heard_about} />
                        </div>
                        {a.experience ? (
                          <div className="mt-4">
                            <DetailRow label="Previous experience" value={a.experience} />
                          </div>
                        ) : null}
                        {a.motivation ? (
                          <div className="mt-4">
                            <DetailRow label="Why interested" value={a.motivation} />
                          </div>
                        ) : null}
                        <p className="mt-4 text-xs text-slate-500">
                          Our team will contact you on WhatsApp with payment and next steps. Status updates appear here.
                        </p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="internships" className="mt-4">
          {loading ? (
            <div className="mt-6 flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#D92D20]" />
            </div>
          ) : internApps.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-10 text-center dark:border-white/10">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Internship completion certificates appear here after you receive an offer or complete an internship on Lerbo Tech.
              </p>
              <Link to="/student/opportunities" className="mt-4 inline-block">
                <Button variant="outline" className="border-slate-300 dark:border-white/20">
                  Browse internships
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a0f1a]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3">Internship</th>
                    <th className="px-4 py-3">Startup</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {internApps.map((a) => (
                    <tr key={a.id} data-testid={`intern-cert-row-${a.id}`} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4">
                        <Link
                          to={`/student/opportunities/${a.opportunity_id}`}
                          className="font-semibold text-slate-900 hover:underline dark:text-white"
                        >
                          {a.opportunity_title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{a.startup_name}</td>
                      <td className="px-4 py-4 text-slate-500">{a.applied_at?.split("T")[0]}</td>
                      <td className="px-4 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-4">
                        {a.status === "hired" || a.status === "completed" ? (
                          <Badge className="bg-emerald-100 text-emerald-800">Ready soon</Badge>
                        ) : (
                          <span className="text-xs text-slate-500">After completion</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
