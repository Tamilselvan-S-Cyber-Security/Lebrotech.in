/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { checkAdminSession, getAdminSessionToken, isAuthorizedAdminEmail } from "@/lib/adminApi";

/**
 * Second security layer for admin routes — requires TOTP verification
 * via the admin Node server after normal login.
 */
export default function AdminTotpGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      setChecking(false);
      return;
    }
    if (!isAuthorizedAdminEmail(user.email)) {
      setChecking(false);
      setVerified(false);
      return;
    }
    const token = getAdminSessionToken();
    if (!token) {
      setChecking(false);
      setVerified(false);
      return;
    }
    checkAdminSession(token).then((ok) => {
      setVerified(ok);
      setChecking(false);
    });
  }, [user, loading, location.pathname]);

  if (loading || checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#D92D20]" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorizedAdminEmail(user.email)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Access denied</h1>
        <p className="max-w-md text-slate-600 dark:text-slate-400">
          Admin access is restricted to the authorized administrator account.
        </p>
      </div>
    );
  }

  if (!verified) {
    return <Navigate to="/admin/security" state={{ from: location }} replace />;
  }

  return children;
}
