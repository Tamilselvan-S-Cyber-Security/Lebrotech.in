/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setToken, formatApiError } from "@/lib/api";
import {
  isFirebaseEnabled,
  firebaseGoogleSignIn,
  firebaseGithubSignIn,
  firebaseEmailSignIn,
  firebaseEmailSignUp,
  firebaseSignOut,
  firebaseErrorMessage,
  hasFirebaseSession,
} from "@/lib/firebase";
import { setAdminSessionToken } from "@/lib/adminApi";
import { retryFirestoreHydration } from "@/mock/db";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

// Firebase codes that clearly mean "wrong Firebase credentials" (the account may
// still be a valid local/mock account, e.g. admin & demo users). We treat all
// Firebase failures as "fall through to the local backend" since the mock is the
// source of truth for stored accounts like the admin.

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap via the httpOnly cookie. If the cookie is present /auth/me succeeds.
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setProfile(data.profile);
    } catch (e) {
      // Expected when the user is not logged in — no need to alarm.
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // When Firestore finishes hydrating the local store, re-check the session
    // so any server-side account/profile changes are reflected.
    const onHydrated = () => { refresh(); };
    window.addEventListener("lerbo-db-hydrated", onHydrated);
    return () => window.removeEventListener("lerbo-db-hydrated", onHydrated);
  }, [refresh]);

  const applySession = (data) => {
    setToken(data.access_token);
    setUser(data.user);
    setProfile(data.profile);
    const res = { ok: true, user: data.user, profile: data.profile, isNew: data.is_new };
    if (hasFirebaseSession()) retryFirestoreHydration();
    return res;
  };

  // Bridge a verified Firebase user into the local mock session.
  const bridgeSocial = async (fbUser, provider, role) => {
    const { data } = await api.post("/auth/social", {
      email: fbUser.email,
      full_name: fbUser.displayName,
      photo_url: fbUser.photoURL,
      provider,
      role,
    });
    return applySession(data);
  };

  const loginWithMock = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // Bridge Firebase session so Firestore sync/hydration works (admin console + students).
    if (isFirebaseEnabled && email && password) {
      try {
        await firebaseEmailSignIn(email, password);
      } catch {
        /* mock-only account without Firebase credentials */
      }
    }
    return applySession(data);
  };

  const login = async (email, password) => {
    // The local backend (mock) is the source of truth for stored accounts such
    // as the admin and demo users. Try it first so those passwords always work,
    // then fall back to Firebase for accounts that only exist in Firebase.
    try {
      return await loginWithMock(email, password);
    } catch (mockErr) {
      if (isFirebaseEnabled) {
        try {
          const fbUser = await firebaseEmailSignIn(email, password);
          return await bridgeSocial(fbUser, "password");
        } catch (fbErr) {
          return { ok: false, error: firebaseErrorMessage(fbErr) };
        }
      }
      return { ok: false, error: formatApiError(mockErr) };
    }
  };

  const loginWithGoogle = async (role) => {
    if (!isFirebaseEnabled) return { ok: false, error: "Google sign-in is not configured." };
    try {
      const fbUser = await firebaseGoogleSignIn();
      return await bridgeSocial(fbUser, "google", role);
    } catch (e) {
      return { ok: false, error: firebaseErrorMessage(e) };
    }
  };

  const loginWithGithub = async (role) => {
    if (!isFirebaseEnabled) return { ok: false, error: "GitHub sign-in is not configured." };
    try {
      const fbUser = await firebaseGithubSignIn();
      return await bridgeSocial(fbUser, "github", role);
    } catch (e) {
      return { ok: false, error: firebaseErrorMessage(e) };
    }
  };

  const register = async (body) => {
    // Create the Firebase credential first so email/password logins are backed
    // by Firebase. If the email already exists in Firebase we still provision
    // the local profile so the account is usable.
    if (isFirebaseEnabled && body?.email && body?.password) {
      try {
        await firebaseEmailSignUp(body.email, body.password);
      } catch (e) {
        if (e?.code !== "auth/email-already-in-use") {
          return { ok: false, error: firebaseErrorMessage(e) };
        }
      }
    }
    try {
      const { data } = await api.post("/auth/register", body);
      return applySession(data);
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // Network or 401 during logout is non-fatal — we still clear local state.
      console.warn("Logout request failed (clearing client state anyway):", e?.message);
    }
    await firebaseSignOut();
    setAdminSessionToken(null);
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const value = {
    user, profile, loading,
    login, loginWithGoogle, loginWithGithub, register, logout, refresh, setProfile,
    socialEnabled: isFirebaseEnabled,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
