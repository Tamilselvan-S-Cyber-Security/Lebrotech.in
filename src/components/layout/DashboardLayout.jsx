/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { IconBell, IconLogOut, IconMenu, IconX } from "@/components/icons/AppIcons";
import OaxisLogo from "@/components/OaxisLogo";
import HelpCard from "@/components/HelpCard";
import GlobalSearch from "@/components/GlobalSearch";
import AdminHeaderBells from "@/components/AdminHeaderBells";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl } from "@/lib/assets";
import { profileDisplayName, profileEditPath, notificationsPath } from "@/lib/roles";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "O";
}

function SidebarPanel({ nav, user, onNavigate, showClose = false }) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 dark:border-white/10">
        <Link to="/" data-testid="sidebar-logo" onClick={onNavigate}>
          <OaxisLogo />
        </Link>
        {showClose ? (
          <button
            type="button"
            className="rounded-lg p-2 text-slate-900 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
            onClick={onNavigate}
            aria-label="Close menu"
          >
            <IconX className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            data-testid={`sidebar-nav-${item.to.split("/").pop()}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#D92D20]/15 text-[#B91C1C] ring-1 ring-[#D92D20]/20 dark:bg-[#D92D20]/20 dark:text-white dark:ring-[#D92D20]/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`
            }
          >
            {item.icon ? <item.icon className="h-4 w-4 shrink-0" /> : null}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="shrink-0 space-y-3 border-t border-slate-200 p-4 dark:border-white/10">
        <HelpCard helpPath={user?.role ? `/${user.role}/help` : "/contact"} />
        <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-500 dark:bg-white/5">
          <div className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {user?.role}
          </div>
          <div className="truncate">{user?.email}</div>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children, nav, accent = "#D92D20", title }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const displayName = profileDisplayName(profile, user);
  const photoUrl = profile?.photo_url || profile?.logo_url;
  const photoSrc = resolveAssetUrl(photoUrl);
  const editPath = profileEditPath(user?.role);
  const notifPath = notificationsPath(user?.role);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))] text-slate-900 dark:text-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a0f1a] lg:flex">
        <SidebarPanel nav={nav} user={user} onNavigate={closeMobile} />
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden"
          onClick={closeMobile}
          aria-label="Close menu overlay"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(100vw,300px)] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-[#0a0f1a] lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <SidebarPanel nav={nav} user={user} onNavigate={closeMobile} showClose />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#050810]/80 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate font-display text-lg font-bold text-slate-900 dark:text-white lg:text-xl">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {user?.role === "admin" ? <GlobalSearch /> : null}
            {user?.role === "admin" ? <AdminHeaderBells /> : null}
            {notifPath ? (
              <button
                data-testid="header-notifications-button"
                onClick={() => navigate(notifPath)}
                className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <IconBell className="h-4 w-4" />
              </button>
            ) : null}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                data-testid="header-user-menu"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#D92D20]/40 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <Avatar className="h-7 w-7">
                  {photoSrc ? <AvatarImage src={photoSrc} alt={displayName} /> : null}
                  <AvatarFallback className="bg-[#D92D20] text-xs font-bold text-white">{initials(displayName)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 dark:text-slate-300 md:inline">{displayName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                sideOffset={8}
                alignOffset={0}
                collisionPadding={12}
                className="z-[80] w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-[#0a0f1a]"
              >
                <DropdownMenuLabel className="px-2 py-2">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</div>
                  <div className="truncate text-xs font-normal text-slate-500">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-go-home" onClick={() => navigate("/")} className="cursor-pointer rounded-lg">
                  Public Site
                </DropdownMenuItem>
                {editPath ? (
                  <DropdownMenuItem data-testid="menu-edit-profile" onClick={() => navigate(editPath)} className="cursor-pointer rounded-lg">
                    {user?.role === "student" ? "Edit Profile" : user?.role === "startup" ? "Edit Company" : "Edit Institution"}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-logout" onClick={async () => { await logout(); navigate("/"); }} className="cursor-pointer rounded-lg text-rose-500 focus:text-rose-500">
                  <IconLogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-900 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
              data-testid="dashboard-mobile-menu"
              aria-label="Open menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
