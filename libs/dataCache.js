const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

const memoryCache = new Map();
const inFlightRequests = new Map();

export const fetchDeduplicated = (cacheKey, fetchFn) => {
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const promise = (async () => {
    try {
      return await fetchFn();
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
};

export const getCachedRangeData = (cacheKey) => {
  try {
    const mem = memoryCache.get(cacheKey);
    if (mem && Date.now() - mem.timestamp < CACHE_TTL_MS) {
      return mem.data;
    }

    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem(`range_cache_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          memoryCache.set(cacheKey, parsed);
          return parsed.data;
        }
      }
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }
  return null;
};

export const setCachedRangeData = (cacheKey, data) => {
  try {
    const entry = { data, timestamp: Date.now() };
    memoryCache.set(cacheKey, entry);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        `range_cache_${cacheKey}`,
        JSON.stringify(entry),
      );
    }
  } catch (e) {
    console.error("Cache write error:", e);
  }
};

export const clearRangeDataCache = () => {
  try {
    memoryCache.clear();
    if (typeof window !== "undefined") {
      const keysToRemove = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith("range_cache_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
    }
  } catch (e) {
    console.error("Cache clear error:", e);
  }
};
