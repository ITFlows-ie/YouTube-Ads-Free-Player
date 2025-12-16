// Recommendations cache with TTL
// Stores recommendations per video ID in localStorage to reduce server load

const STORAGE_KEY = 'ytRecsCache';
const TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const MAX_ENTRIES = 200; // Limit cache size to avoid localStorage bloat

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore quota errors */ }
}

// Prune old entries if cache too large
function pruneCache(cache) {
  const keys = Object.keys(cache);
  if (keys.length <= MAX_ENTRIES) return cache;
  
  // Sort by timestamp, remove oldest
  const sorted = keys
    .map(k => ({ k, ts: cache[k].ts || 0 }))
    .sort((a, b) => b.ts - a.ts);
  
  const keep = sorted.slice(0, MAX_ENTRIES).map(x => x.k);
  const pruned = {};
  keep.forEach(k => { pruned[k] = cache[k]; });
  return pruned;
}

export function getCached(videoId) {
  if (!videoId) return null;
  const cache = readCache();
  const entry = cache[videoId];
  if (!entry) return null;
  
  // Check TTL
  const age = Date.now() - (entry.ts || 0);
  if (age > TTL_MS) {
    // Expired, remove entry
    delete cache[videoId];
    writeCache(cache);
    return null;
  }
  
  return entry.items || null;
}

export function setCached(videoId, items) {
  if (!videoId || !Array.isArray(items)) return;
  let cache = readCache();
  cache[videoId] = { items, ts: Date.now() };
  cache = pruneCache(cache);
  writeCache(cache);
}

export function clearCache() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
