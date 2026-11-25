// Server-side stale-while-revalidate cache for slow, read-only Apps Script data.
// Fresh entries are returned as-is; stale entries (up to maxStale) are returned
// immediately while a single background refresh runs. Only cold or expired
// entries make the caller wait for Google.
type Entry<T> = {value?: T; storedAt: number; inflight?: Promise<T>};

const store = new Map<string, Entry<unknown>>();

export function staleWhileRevalidate<T>(key: string, load: () => Promise<T>, options: {fresh: number; maxStale: number}): Promise<T> {
  const entry = (store.get(key) as Entry<T> | undefined) || {storedAt: 0};
  store.set(key, entry);
  const age = Date.now() - entry.storedAt;

  const refresh = () => {
    if (entry.inflight) return entry.inflight;
    const running = load().then(value => {
      entry.value = value;
      entry.storedAt = Date.now();
      return value;
    }).finally(() => {
      if (entry.inflight === running) entry.inflight = undefined;
    });
    entry.inflight = running;
    return running;
  };

  if (entry.value !== undefined && age < options.fresh) return Promise.resolve(entry.value);
  if (entry.value !== undefined && age < options.maxStale) {
    refresh().catch(error => console.error(`Background refresh failed (${key}):`, error instanceof Error ? error.message : 'Unknown error'));
    return Promise.resolve(entry.value);
  }
  return refresh();
}
