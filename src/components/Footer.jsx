import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IconLinkedin, IconInstagram } from "@/components/icons/AppIcons";
import { useBrand } from "@/lib/brand";
import { useAuth } from "@/context/AuthContext";
import { handleSameRouteClick } from "@/lib/navigation";
import { roleHome, profileEditPath } from "@/lib/roles";

function FooterLink({ to, children, className }) {
  const location = useLocation();
  return (
    <Link
      to={to}
      className={className}
      onClick={(e) => handleSameRouteClick(e, location, to)}
    >
      {children}
    </Link>
  );
}

function SocialLinks({ brand }) {
  return (
    <div className="flex items-center gap-3" data-testid="footer-social-links">
      <a
        href={brand.linkedin_url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="footer-linkedin"
        aria-label="Lerbo Tech on LinkedIn"
        className="flex h-8 w-8 items-center justify-center rounded-none border border-slate-300 text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:border-white/25 dark:hover:text-white"
      >
        <IconLinkedin className="h-4 w-4" />
      </a>
      <a
        href={brand.instagram_url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="footer-instagram"
        aria-label="Lerbo Tech on Instagram"
        className="flex h-8 w-8 items-center justify-center rounded-none border border-slate-300 text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:border-white/25 dark:hover:text-white"
      >
        <IconInstagram className="h-4 w-4" />
      </a>
    </div>
  );
}

export default function Footer({ variant = "dark" }) {
  const brand = useBrand();
  const location = useLocation();
  const { user } = useAuth();
  const dashboardPath = user?.role ? roleHome(user.role) : null;
  const profilePath = user?.role ? profileEditPath(user.role) : null;

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-[#050810] dark:text-slate-400" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-2 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-90"
              onClick={(e) => handleSameRouteClick(e, location, "/")}
            >
              <img src={`${process.env.PUBLIC_URL}/logo/logo.png`} alt="" className="h-11 w-11 object-contain" aria-hidden />
              <span className="font-display text-xl font-extrabold text-slate-900 dark:text-white">{brand.name}</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">{brand.description}</p>
            <SocialLinks brand={brand} />
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/about">About</FooterLink></li>
              <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/apply-certificate">Get Certificate</FooterLink></li>
              <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/opportunities">Browse Internships</FooterLink></li>
              <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/stories">Success Stories</FooterLink></li>
              <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/contact">Contact</FooterLink></li>
              <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/faq">FAQ</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">For You</h4>
            <ul className="space-y-2 text-sm">
              <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/students">For Students</FooterLink></li>
              {user ? (
                <>
                  {dashboardPath ? (
                    <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to={dashboardPath}>My Dashboard</FooterLink></li>
                  ) : null}
                  {profilePath ? (
                    <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to={profilePath}>My Profile</FooterLink></li>
                  ) : null}
                </>
              ) : (
                <>
                  <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/register">Create Account</FooterLink></li>
                  <li><FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/login">Log in</FooterLink></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-8 text-xs text-slate-500 dark:border-white/10 md:flex-row md:items-center">
          <span data-testid="footer-copyright">{brand.copyright}</span>
          <div className="flex items-center gap-5">
            <FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/privacy">Privacy Policy</FooterLink>
            <FooterLink className="transition-colors hover:text-slate-900 dark:hover:text-white" to="/terms">Terms &amp; Conditions</FooterLink>
            <span>v1.0 · MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
