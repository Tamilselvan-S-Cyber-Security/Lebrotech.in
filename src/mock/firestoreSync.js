// Firestore persistence layer for the app's document store.
// The in-memory/localStorage store (mock/db.js) stays the synchronous cache the
// app reads from; every write is mirrored to Firestore (write-through), and on
// startup we hydrate the cache from Firestore. If Firestore is unavailable
// (offline, rules not deployed, or user not signed in with Firebase) everything silently
// falls back to localStorage so the app never breaks.

import {
  collection, getDocs, doc, setDoc, deleteDoc, writeBatch,
} from "firebase/firestore";
import { firestore, ensureFirebaseAuth, isFirebaseEnabled } from "@/lib/firebase";

export const firestoreEnabled = isFirebaseEnabled && Boolean(firestore);

const COLLECTIONS = [
  "users", "students", "startups", "institutions", "opportunities",
  "applications", "notifications", "saved_opportunities", "files",
  "login_attempts", "contact_enquiries", "brand_settings", "messages",
  "subscription_attempts", "enterprise_enquiries", "certificate_applications",
];

/** Guest/public forms — rules allow create without Firebase Auth. */
const PUBLIC_WRITE_COLLECTIONS = new Set(["certificate_applications", "contact_enquiries"]);

/** Admin-only reads in rules — skip for non-admin hydration (avoids total failure). */
const ADMIN_READ_COLLECTIONS = new Set([
  "contact_enquiries", "enterprise_enquiries", "login_attempts",
]);

const ADMIN_EMAIL = "tamilselvan@cyberwolf360.in";

function docId(d, fallbackIndex) {
  const id = d?.id ?? d?._id;
  if (id == null) return `auto_${fallbackIndex}_${Date.now()}`;
  return String(id).replace(/\//g, "_");
}

function clean(obj) {
  return JSON.parse(JSON.stringify(obj ?? {}));
}

async function ready() {
  if (!firestoreEnabled) return false;
  const user = await ensureFirebaseAuth();
  return Boolean(user);
}

function isAdminSession(user) {
  return (user?.email || "").toLowerCase() === ADMIN_EMAIL;
}

async function readyForRead(collectionName) {
  if (!(await ready())) return false;
  if (!ADMIN_READ_COLLECTIONS.has(collectionName)) return true;
  const user = await ensureFirebaseAuth();
  return isAdminSession(user);
}

/** Pull collections from Firestore. Admin-only collections load only for admin. */
export async function hydrateFromFirestore() {
  if (!(await ready())) return null;
  try {
    const result = {};
    await Promise.all(
      COLLECTIONS.map(async (name) => {
        if (!(await readyForRead(name))) {
          result[name] = [];
          return;
        }
        try {
          const snap = await getDocs(collection(firestore, name));
          result[name] = snap.docs.map((d) => d.data());
        } catch (err) {
          console.warn(`[firestore] hydrate ${name} skipped:`, err?.code || err?.message);
          result[name] = [];
        }
      }),
    );
    return result;
  } catch (err) {
    console.warn("[firestore] hydrate failed:", err?.code || err?.message);
    return null;
  }
}

async function writeDoc(name, docData, { requireAuth = true } = {}) {
  if (!firestoreEnabled) return;
  if (requireAuth && !(await ready())) return;
  try {
    await setDoc(doc(firestore, name, docId(docData, 0)), clean(docData), { merge: true });
  } catch (err) {
    console.warn(`[firestore] write ${name} failed:`, err?.code || err?.message);
  }
}

/** Write/overwrite a single document (authenticated). */
export async function pushDoc(name, docData) {
  if (PUBLIC_WRITE_COLLECTIONS.has(name)) {
    await writeDoc(name, docData, { requireAuth: false });
    return;
  }
  await writeDoc(name, docData, { requireAuth: true });
}

/** Delete a single document by id. */
export async function deleteDocById(name, id) {
  if (!(await ready())) return;
  try {
    await deleteDoc(doc(firestore, name, String(id).replace(/\//g, "_")));
  } catch (err) {
    console.warn(`[firestore] delete ${name} failed:`, err?.code || err?.message);
  }
}

/** Seed Firestore from the local snapshot (first run, when Firestore is empty). */
export async function seedFirestore(data) {
  if (!(await ready())) return;
  const user = await ensureFirebaseAuth();
  const admin = isAdminSession(user);
  try {
    for (const name of COLLECTIONS) {
      if (ADMIN_READ_COLLECTIONS.has(name) && !admin) continue;
      const rows = data[name] || [];
      for (let i = 0; i < rows.length; i += 400) {
        const batch = writeBatch(firestore);
        rows.slice(i, i + 400).forEach((row, idx) => {
          batch.set(doc(firestore, name, docId(row, i + idx)), clean(row), { merge: true });
        });
        await batch.commit();
      }
    }
    console.info("[firestore] seeded initial data");
  } catch (err) {
    console.warn("[firestore] seed failed:", err?.code || err?.message);
  }
}
