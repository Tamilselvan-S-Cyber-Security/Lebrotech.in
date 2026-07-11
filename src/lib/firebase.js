// Firebase Authentication setup (Google, GitHub, Email/Password).
// Config values are read from REACT_APP_FIREBASE_* env vars (see .env).
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Firebase is only usable when an API key is configured. This flag lets the UI
// hide social buttons gracefully if the project isn't set up yet.
export const isFirebaseEnabled = Boolean(firebaseConfig.apiKey);

const app = isFirebaseEnabled ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;

// Returns the current Firebase user only for real sign-ins (Google, GitHub, email).
// Anonymous auth is not used. Firestore sync runs only when this returns a user.
export function ensureFirebaseAuth() {
  if (!auth) return Promise.resolve(null);
  const user = auth.currentUser;
  if (user && !user.isAnonymous) return Promise.resolve(user);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u && !u.isAnonymous ? u : null);
    });
  });
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");

function mapFirebaseUser(user) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

export async function firebaseGoogleSignIn() {
  const { user } = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUser(user);
}

export async function firebaseGithubSignIn() {
  const { user } = await signInWithPopup(auth, githubProvider);
  return mapFirebaseUser(user);
}

export async function firebaseEmailSignIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(user);
}

export async function firebaseEmailSignUp(email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(user);
}

export async function firebaseSignOut() {
  if (auth) {
    try { await signOut(auth); } catch { /* non-fatal */ }
  }
}

/** True when the user has a real Firebase session (not anonymous). */
export function hasFirebaseSession() {
  const u = auth?.currentUser;
  return Boolean(u && !u.isAnonymous);
}

// Human-readable messages for common Firebase auth error codes.
export function firebaseErrorMessage(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/popup-blocked":
      return "Popup was blocked by the browser. Please allow popups and retry.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/weak-password":
      return "Password is too weak (use at least 6 characters).";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase. Add it in Authentication settings.";
    default:
      return err?.message || "Authentication failed.";
  }
}
