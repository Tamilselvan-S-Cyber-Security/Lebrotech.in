/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/nav";
import api, { formatApiError } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { IconPower as Power, IconPowerOff as PowerOff, IconPlus as Plus, IconExternalLink as ExternalLink } from "@/components/icons/AppIcons";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminUsers() {
  const [role, setRole] = useState("student");
  const [users, setUsers] = useState([]);
  const { user: me } = useAuth();
  const [busyId, setBusyId] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: "", password: "", full_name: "" });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const load = useCallback(() => {
    api.get(`/admin/users?role=${role}`).then(({ data }) => setUsers(data));
  }, [role]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (e, u) => {
    e.preventDefault();
    e.stopPropagation();
    setBusyId(u.id);
    try {
      await api.patch(`/admin/users/${u.id}/active`, { is_active: !u.is_active });
      toast.success(`${u.is_active ? "Disabled" : "Enabled"} ${u.email}`);
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const createAdmin = async () => {
    if (!adminForm.email || !adminForm.password) return toast.error("Email and password required");
    if (adminForm.password.length < 8) return toast.error("Password must be ≥ 8 characters");
    setCreatingAdmin(true);
    try {
      await api.post("/admin/admins", adminForm);
      toast.success(`Admin ${adminForm.email} created`);
      setAdminForm({ email: "", password: "", full_name: "" });
      setShowAdminModal(false);
      if (role === "admin") load();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setCreatingAdmin(false);
    }
  };

  const detailUrlFor = (u) => {
    if (u.role === "student") return u.profile_id ? `/admin/students/${u.profile_id}` : null;
    if (u.role === "startup") return u.profile_id ? `/admin/startups/${u.profile_id}` : null;
    if (u.role === "institution") return u.profile_id ? `/admin/institutions/${u.profile_id}` : null;
    return null;
  };

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Users">
      <div className="mb-4 flex items-center justify-between">
        <Tabs value={role} onValueChange={setRole}>
          <TabsList>
            <TabsTrigger value="student" data-testid="admin-tab-students">Students</TabsTrigger>
            <TabsTrigger value="startup" data-testid="admin-tab-startups">Startups</TabsTrigger>
            <TabsTrigger value="institution" data-testid="admin-tab-institutions">Institutions</TabsTrigger>
            <TabsTrigger value="admin" data-testid="admin-tab-admins">Admins</TabsTrigger>
          </TabsList>
        </Tabs>
        {role === "admin" ? (
          <Button onClick={() => setShowAdminModal(true)} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="add-admin-btn">
            <Plus className="mr-1 h-4 w-4" /> Add admin
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const detailUrl = detailUrlFor(u);
              return (
                <tr key={u.id} data-testid={`admin-user-row-${u.id}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {detailUrl ? (
                      <Link to={detailUrl} className="inline-flex items-center gap-1 hover:text-rose-700" data-testid={`open-user-${u.id}`}>
                        {u.email} <ExternalLink className="h-3 w-3 opacity-50" />
                      </Link>
                    ) : u.email}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{u.role}</td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Active</span>
                    ) : (
                      <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.created_at?.split("T")[0]}</td>
                  <td className="px-4 py-3 text-right">
                    {u.id === me?.id ? (
                      <span className="text-xs text-slate-600 dark:text-slate-400">(you)</span>
                    ) : (
                      <Button
                        variant={u.is_active ? "outline" : "default"}
                        size="sm"
                        disabled={busyId === u.id}
                        onClick={(e) => toggleActive(e, u)}
                        data-testid={`toggle-active-${u.id}`}
                        className={u.is_active ? "" : "bg-emerald-600 hover:bg-emerald-700"}
                      >
                        {u.is_active ? (
                          <><PowerOff className="mr-1 h-3 w-3" /> Disable</>
                        ) : (
                          <><Power className="mr-1 h-3 w-3" /> Enable</>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No users found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent data-testid="add-admin-dialog">
          <DialogHeader>
            <DialogTitle>Add a new admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} data-testid="new-admin-email" />
            </div>
            <div>
              <Label>Password (min 8 chars)</Label>
              <Input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} data-testid="new-admin-password" />
            </div>
            <div>
              <Label>Full name (optional)</Label>
              <Input value={adminForm.full_name} onChange={(e) => setAdminForm({ ...adminForm, full_name: e.target.value })} data-testid="new-admin-name" />
            </div>
            <p className="text-xs text-slate-500">Admins have full access — including disabling other users and editing brand settings. Choose wisely.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminModal(false)}>Cancel</Button>
            <Button onClick={createAdmin} disabled={creatingAdmin} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="new-admin-save">
              {creatingAdmin ? "Creating..." : "Create admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
