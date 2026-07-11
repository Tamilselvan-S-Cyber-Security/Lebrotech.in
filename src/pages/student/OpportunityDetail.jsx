/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STUDENT_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconArrowLeft as ArrowLeft, IconMapPin as MapPin, IconCalendar as Calendar, IconIndianRupee as IndianRupee, IconClock as Clock, IconUsers as Users, IconBookmark as Bookmark, IconSend as Send } from "@/components/icons/AppIcons";
import { toast } from "sonner";
import OpportunityImage from "@/components/OpportunityImage";

export default function StudentOpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/opportunities/${id}`).then(({ data }) => setOpp(data));
    api.get("/applications/me").then(({ data }) => {
      setApplied(data.some((a) => a.opportunity_id === id));
    });
  }, [id]);

  const apply = async () => {
    setSaving(true);
    try {
      await api.post(`/opportunities/${id}/apply`, { cover_note: coverNote });
      toast.success("Application submitted!");
      setApplied(true);
      setOpen(false);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    try {
      await api.post(`/saved/opportunities/${id}`);
      toast.success("Saved");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  if (!opp) return <DashboardLayout nav={STUDENT_NAV} title="Loading">Loading…</DashboardLayout>;

  return (
    <DashboardLayout nav={STUDENT_NAV} title={opp.title}>
      <Link to="/student/opportunities" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to internships</Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <OpportunityImage src={opp.image_url} alt={opp.title} className="mb-6 h-48 w-full rounded-xl border border-slate-100 sm:h-64" />
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-slate-900 text-white hover:bg-slate-900">{opp.domain}</Badge>
              <Badge variant="outline">{opp.mode}</Badge>
              <Badge variant="outline">{opp.duration}</Badge>
              {opp.is_featured && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Featured</Badge>}
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900">{opp.title}</h1>
            <div className="mt-1 text-lg text-slate-600">at <strong>{opp.startup_name}</strong></div>

            <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-slate-700">{opp.description}</div>

            <h3 className="mt-8 font-display text-lg font-bold">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {opp.skills_required?.map((s) => <span key={s} className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{s}</span>)}
            </div>

            {opp.perks?.length > 0 && (<>
              <h3 className="mt-8 font-display text-lg font-bold">Perks</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">{opp.perks.map((p) => <li key={p}>· {p}</li>)}</ul>
            </>)}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><IndianRupee className="h-4 w-4" /> Stipend</span><strong>{opp.stipend_range}</strong></li>
              <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><Clock className="h-4 w-4" /> Duration</span><strong>{opp.duration}</strong></li>
              <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><MapPin className="h-4 w-4" /> Location</span><strong>{opp.city || opp.mode}</strong></li>
              <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><Users className="h-4 w-4" /> Openings</span><strong>{opp.openings}</strong></li>
              <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /> Deadline</span><strong>{opp.deadline?.split("T")[0]}</strong></li>
            </ul>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button data-testid="student-apply-button" disabled={applied} className="mt-6 w-full bg-[#D92D20] hover:bg-[#B91C1C]">{applied ? "Applied ✓" : (<><Send className="mr-2 h-4 w-4" /> Apply now</>)}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for {opp.title}</DialogTitle>
                  <DialogDescription>Add a short cover note about why you're a great intern fit (optional, max 300 characters).</DialogDescription>
                </DialogHeader>
                <div>
                  <Label>Cover note</Label>
                  <Textarea rows={5} maxLength={300} value={coverNote} onChange={(e) => setCoverNote(e.target.value)} data-testid="apply-cover-note" placeholder="Tell the startup why you're a great fit for this internship…" />
                  <div className="mt-1 text-right text-xs text-slate-500">{coverNote.length}/300</div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={apply} disabled={saving} data-testid="apply-confirm-button" className="bg-[#D92D20] hover:bg-[#B91C1C]">{saving ? "Sending…" : "Submit application"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={save} className="mt-3 w-full" data-testid="student-save-button"><Bookmark className="mr-2 h-4 w-4" /> Save for later</Button>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
