// Last-known data snapshots so slow screens can paint instantly while fresh data loads.
// Public catalog data lives in localStorage; admin data stays in sessionStorage (this tab only)
// and is cleared on logout or when the session is rejected.
type Kind = 'local' | 'session';
type Snapshot<T> = {savedAt: number; value: T};

const ADMIN_PREFIX = 'vartana-admin-snapshot:';

function storage(kind: Kind): Storage | null {
  try { return kind === 'local' ? window.localStorage : window.sessionStorage; } catch { return null; }
}

export function readSnapshot<T>(key: string, kind: Kind, maxAgeMs: number): T | null {
  try {
    const raw = storage(kind)?.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Snapshot<T>;
    if (!parsed || typeof parsed.savedAt !== 'number' || Date.now() - parsed.savedAt > maxAgeMs) return null;
    return parsed.value ?? null;
  } catch { return null; }
}

export function writeSnapshot<T>(key: string, kind: Kind, value: T) {
  try { storage(kind)?.setItem(key, JSON.stringify({savedAt: Date.now(), value} satisfies Snapshot<T>)); } catch { /* quota or privacy mode: snapshot is optional */ }
}

export const adminSnapshotKey = (name: string) => ADMIN_PREFIX + name;
const ADMIN_MAX_AGE = 12 * 60 * 60 * 1000;
export const readAdminSnapshot = <T,>(name: string) => readSnapshot<T>(adminSnapshotKey(name), 'session', ADMIN_MAX_AGE);
export const writeAdminSnapshot = <T,>(name: string, value: T) => writeSnapshot(adminSnapshotKey(name), 'session', value);

export function clearAdminSnapshots() {
  const s = storage('session');
  if (!s) return;
  try { for (const key of Object.keys(s)) if (key.startsWith(ADMIN_PREFIX)) s.removeItem(key); } catch { /* ignore */ }
}
