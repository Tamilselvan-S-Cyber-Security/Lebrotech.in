// Browser port of the former Node backend's tiny document store
// (server/lib/db.js). Data lives in localStorage so it survives reloads,
// and is seeded once from the bundled seed.json snapshot.

import seed from "./seed.json";
import { ADMIN_PASSWORD, DEMO_PASSWORD } from "./constants";
import {
  firestoreEnabled, hydrateFromFirestore, pushDoc, deleteDocById, seedFirestore,
} from "./firestoreSync";

const STORAGE_KEY = "lerbo_tech_mock_db_v6";

const COLLECTIONS = [
  "users", "students", "startups", "institutions", "opportunities",
  "applications", "notifications", "saved_opportunities", "files",
  "login_attempts", "contact_enquiries", "brand_settings", "messages",
  "subscription_attempts", "enterprise_enquiries", "certificate_applications",
];

/** Catalog collections that should never stay empty if seed has demo data. */
const CATALOG_COLLECTIONS = ["opportunities"];

function emptyDb() {
  const db = {};
  for (const c of COLLECTIONS) db[c] = [];
  return db;
}

// Passwords in seed.json are bcrypt hashes we can't verify in-browser.
// The original seed used known demo passwords, so we store those in
// plaintext for the mock (admin uses the admin password, everyone else
// the shared demo password). New sign-ups store their real chosen password.
function seedFromSnapshot() {
  const db = { ...emptyDb() };
  for (const c of COLLECTIONS) {
    db[c] = Array.isArray(seed[c]) ? JSON.parse(JSON.stringify(seed[c])) : [];
  }
  db.users = db.users.map((u) => {
    const { password_hash, ...rest } = u;
    return { ...rest, password: u.role === "admin" ? ADMIN_PASSWORD : DEMO_PASSWORD };
  });
  return db;
}

/** Restore demo catalog rows when local/remote wiped them (common after bad hydrate). */
function ensureCatalog(db) {
  if (!db) return db;
  const snap = seedFromSnapshot();
  for (const name of CATALOG_COLLECTIONS) {
    if (!Array.isArray(db[name]) || db[name].length === 0) {
      db[name] = snap[name] || [];
    }
  }
  return db;
}

/**
 * Merge Firestore into local cache without wiping collections that are empty remotely.
 * Empty remote arrays used to replace seeded internships and blank /opportunities.
 */
function mergeRemoteIntoLocal(local, remote) {
  const merged = emptyDb();
  for (const name of COLLECTIONS) {
    const remoteRows = Array.isArray(remote?.[name]) ? remote[name] : [];
    const localRows = Array.isArray(local?.[name]) ? local[name] : [];
    if (remoteRows.length === 0) {
      merged[name] = localRows;
      continue;
    }
    const byId = new Map();
    remoteRows.forEach((d) => {
      if (d?.id != null) byId.set(String(d.id), d);
    });
    localRows.forEach((d) => {
      if (d?.id != null && !byId.has(String(d.id))) byId.set(String(d.id), d);
    });
    merged[name] = [...byId.values()];
  }
  return ensureCatalog(merged);
}

let data = null;
let firestoreHydrationStarted = false;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full / unavailable — keep working in-memory */
  }
}

// Mirror a single document write to Firestore (fire-and-forget).
function syncPush(name, doc) {
  if (firestoreEnabled && doc) pushDoc(name, doc);
}
function syncDelete(name, id) {
  if (firestoreEnabled && id != null) deleteDocById(name, id);
}

// One-time background hydration from Firestore. The synchronous cache keeps the
// app responsive; when Firestore data arrives we merge it in and notify the UI.
function startFirestoreHydration() {
  if (!firestoreEnabled || firestoreHydrationStarted) return;
  firestoreHydrationStarted = true;
  hydrateFromFirestore()
    .then((remote) => {
      if (remote && Array.isArray(remote.users) && remote.users.length > 0) {
        data = mergeRemoteIntoLocal(data || emptyDb(), remote);
        persist();
        try { window.dispatchEvent(new Event("lerbo-db-hydrated")); } catch { /* noop */ }
      } else {
        // Firestore empty (first run) → seed it from the current local data.
        ensureCatalog(data);
        persist();
        seedFirestore(data);
      }
    })
    .catch(() => { /* stay on localStorage cache */ });
}

function load() {
  if (data) return data;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      data = ensureCatalog({ ...emptyDb(), ...JSON.parse(raw) });
      persist();
      startFirestoreHydration();
      return data;
    }
  } catch {
    /* corrupt storage — reseed */
  }
  // Migrate from previous key if present (keeps accounts, restores empty catalogs).
  try {
    const legacy = localStorage.getItem("lerbo_tech_mock_db_v5");
    if (legacy) {
      data = ensureCatalog({ ...emptyDb(), ...JSON.parse(legacy) });
      persist();
      startFirestoreHydration();
      return data;
    }
  } catch {
    /* ignore */
  }
  data = seedFromSnapshot();
  persist();
  startFirestoreHydration();
  return data;
}

export function resetDb() {
  data = seedFromSnapshot();
  persist();
  if (firestoreEnabled) seedFirestore(data);
  return data;
}

/** Re-run Firestore hydration after a real Firebase login. */
export function retryFirestoreHydration() {
  if (!firestoreEnabled || !data) return;
  firestoreHydrationStarted = false;
  startFirestoreHydration();
}

function matches(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, val] of Object.entries(query)) {
    if (key === "$or") {
      if (!val.some((q) => matches(doc, q))) return false;
      continue;
    }
    if (val && typeof val === "object" && !Array.isArray(val)) {
      if ("$in" in val) {
        if (!val.$in.includes(doc[key])) return false;
        continue;
      }
      if ("$nin" in val) {
        if (val.$nin.includes(doc[key])) return false;
        continue;
      }
      if ("$gte" in val) {
        if (!((doc[key] ?? 0) >= val.$gte)) return false;
        continue;
      }
      if ("$ne" in val) {
        if (doc[key] === val.$ne) return false;
        continue;
      }
      if ("$regex" in val) {
        const re = new RegExp(val.$regex, val.$options || "");
        if (!re.test(doc[key] || "")) return false;
        continue;
      }
      if ("$gt" in val) {
        if (!((doc[key] || "") > val.$gt)) return false;
        continue;
      }
    }
    if (doc[key] !== val) return false;
  }
  return true;
}

export function col(name) {
  const store = load();
  if (!store[name]) store[name] = [];

  return {
    find(query = {}, opts = {}) {
      let rows = store[name].filter((d) => matches(d, query));
      if (opts.sort) {
        const [field, dir] = Object.entries(opts.sort)[0];
        rows.sort((a, b) => {
          const av = a[field] ?? "";
          const bv = b[field] ?? "";
          if (av < bv) return dir === -1 ? 1 : -1;
          if (av > bv) return dir === -1 ? -1 : 1;
          return 0;
        });
      }
      if (opts.limit) rows = rows.slice(0, opts.limit);
      return JSON.parse(JSON.stringify(rows));
    },
    findOne(query) {
      return this.find(query)[0] || null;
    },
    count(query = {}) {
      return store[name].filter((d) => matches(d, query)).length;
    },
    distinct(field, query = {}) {
      return [...new Set(store[name].filter((d) => matches(d, query)).map((d) => d[field]).filter((v) => v != null))];
    },
    insertOne(doc) {
      store[name].push(doc);
      persist();
      syncPush(name, doc);
      return JSON.parse(JSON.stringify(doc));
    },
    updateOne(query, update) {
      const idx = store[name].findIndex((d) => matches(d, query));
      if (idx === -1) return { matchedCount: 0 };
      if (update.$set) store[name][idx] = { ...store[name][idx], ...update.$set };
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          store[name][idx][k] = (store[name][idx][k] || 0) + v;
        }
      }
      persist();
      syncPush(name, store[name][idx]);
      return { matchedCount: 1 };
    },
    updateMany(query, update) {
      let count = 0;
      const changed = [];
      for (let i = 0; i < store[name].length; i++) {
        if (matches(store[name][i], query)) {
          if (update.$set) store[name][i] = { ...store[name][i], ...update.$set };
          changed.push(store[name][i]);
          count++;
        }
      }
      if (count) {
        persist();
        changed.forEach((d) => syncPush(name, d));
      }
      return { matchedCount: count };
    },
    deleteOne(query) {
      const idx = store[name].findIndex((d) => matches(d, query));
      if (idx === -1) return { deletedCount: 0 };
      const [removed] = store[name].splice(idx, 1);
      persist();
      syncDelete(name, removed?.id);
      return { deletedCount: 1 };
    },
    upsert(query, setOnInsert = {}) {
      const existing = this.findOne(query);
      if (existing) {
        this.updateOne(query, { $set: setOnInsert });
        return this.findOne(query);
      }
      this.insertOne({ ...query, ...setOnInsert });
      return this.findOne(query);
    },
  };
}
