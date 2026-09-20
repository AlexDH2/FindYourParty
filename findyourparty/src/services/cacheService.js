import { PUBLIC_EVENTS_CACHE_VERSION, PUBLIC_EVENTS_TTL_MS } from "../constants/cache";

const CACHE_KEY = "fyp_public_events";

function isValid(entry) {
  if (!entry || typeof entry !== "object") return false;
  if (entry.version !== PUBLIC_EVENTS_CACHE_VERSION) return false;
  if (!Array.isArray(entry.data)) return false;
  const age = Date.now() - (entry.timestamp || 0);
  return age < PUBLIC_EVENTS_TTL_MS;
}

export const cacheService = {
  get() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!isValid(entry)) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return entry.data;
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  },

  set(data) {
    try {
      const entry = {
        version: PUBLIC_EVENTS_CACHE_VERSION,
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch (e) {
      console.warn("cacheService.set failed:", e);
    }
  },

  clear() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // silent
    }
  },
};
