/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { IconMenu } from "@/components/icons/AppIcons";
import OaxisLogo from "@/components/OaxisLogo";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import Ads from "@/components/Ads";
import InternshipChatbot from "@/components/InternshipChatbot";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { handleSameRouteClick } from "@/lib/navigation";
import { roleHome, profileEditPath } from "@/lib/roles";

const NAV_LINKS = [
  { to: "/students", label: "For Students" },
  { to: "/opportunities", label: "Internships" },
  { to: "/apply-certificate", label: "Get Certificate" },
];

function MobileNavLink({ to, label, onNavigate }) {
  const location = useLocation();

  return (
    <NavLink
      to={to}
      data-testid={`nav-link-${to.replace(/[^a-z0-9]/gi, "")}`}
      onClick={(e) => {
        handleSameRouteClick(e, location, to);
        onNavigate?.();
      }}
      className={({ isActive }) =>
        `flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors ${
          isActive
            ? "bg-[#D92D20]/10 text-[#B91C1C] dark:bg-[#D92D20]/20 dark:text-white"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function HeaderLink({ to, label, onNavigate }) {
  const location = useLocation();

  return (
    <NavLink
      to={to}
      data-testid={`nav-link-${to.replace(/[^a-z0-9]/gi, "")}`}
      onClick={(e) => {
        handleSameRouteClick(e, location, to);
        onNavigate?.();
      }}
      className={({ isActive }) =>
        `text-sm font-medium transition-colors ${
          isActive
            ? "text-slate-900 dark:text-white"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function PublicLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const dashboardPath = user?.role ? roleHome(user.role) : "/login";
  const profilePath = user?.role ? profileEditPath(user.role) : null;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#050810]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            to="/"
            data-testid="header-logo-link"
            className="flex items-center"
            onClick={(e) => handleSameRouteClick(e, location, "/")}
          >
            <OaxisLogo />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => <HeaderLink key={l.to} {...l} onNavigate={closeMobile} />)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                {profilePath ? (
                  <Link
                    to={profilePath}
                    data-testid="header-profile-link"
                    className="text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    onClick={(e) => handleSameRouteClick(e, location, profilePath)}
                  >
                    My Profile
                  </Link>
                ) : null}
                <Button data-testid="header-go-to-dashboard" onClick={() => navigate(dashboardPath)} className="bg-[#D92D20] text-white hover:bg-[#B91C1C]">
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="header-login-link"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  onClick={(e) => handleSameRouteClick(e, location, "/login")}
                >
                  Log in
                </Link>
                <Button
                  data-testid="header-apply-certificate-button"
                  onClick={() => {
                    closeMobile();
                    navigate("/apply-certificate");
                  }}
                  className="bg-[#D92D20] text-white hover:bg-[#B91C1C]"
                >
                  Get Certified
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              data-testid="header-mobile-toggle"
              className="rounded-lg p-2 text-slate-900 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="right"
            className="flex w-[min(100vw,320px)] flex-col border-l border-slate-200 bg-white p-0 dark:border-white/10 dark:bg-[#050810]"
          >
            <SheetHeader className="border-b border-slate-200 px-5 py-4 text-left dark:border-white/10">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <Link to="/" onClick={closeMobile} className="inline-flex">
                <OaxisLogo />
              </Link>
            </SheetHeader>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {NAV_LINKS.map((l) => (
                <MobileNavLink key={l.to} {...l} onNavigate={closeMobile} />
              ))}
            </nav>

            <div className="border-t border-slate-200 p-4 dark:border-white/10">
              {user ? (
                <div className="flex flex-col gap-3">
                  {profilePath ? (
                    <Link
                      to={profilePath}
                      onClick={closeMobile}
                      className="flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-white/20 dark:text-white"
                    >
                      My Profile
                    </Link>
                  ) : null}
                  <Button
                    data-testid="mobile-go-to-dashboard"
                    onClick={() => {
                      closeMobile();
                      navigate(dashboardPath);
                    }}
                    className="w-full bg-[#D92D20] hover:bg-[#B91C1C]"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={(e) => {
                      handleSameRouteClick(e, location, "/login");
                      closeMobile();
                    }}
                    className="flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-white/20 dark:text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/apply-certificate"
                    onClick={closeMobile}
                    className="flex items-center justify-center rounded-lg bg-[#D92D20] px-4 py-3 text-sm font-semibold text-white hover:bg-[#B91C1C]"
                  >
                    Get Certified
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main>{children}</main>

      <Footer variant="dark" />
      <Ads />
      <InternshipChatbot />
      <CookieConsent />
    </div>
  );
}
