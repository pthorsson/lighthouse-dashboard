import LRU from 'lru-cache';

const CACHE_AGE_HOURS = 6;

export const cache = new LRU({
  max: 200,
  maxAge: 1000 * 60 * 60 * CACHE_AGE_HOURS,
});

// Activly prune cache once every 10 minutes
setInterval(() => {
  cache.prune();
}, 1000 * 60 * 10);

/**
 * Adds a report to cache
 */
export const save = (id: string, type: 'html' | 'json', content: any) => {
  cache.set(`${id}-${type}`, content);
};

/**
 * Gets a report from cache
 */
export const get = (id: string, type: string) => cache.get(`${id}-${type}`);

/**
 * Removes both html and json versions of report from cache, used to
 * invalidate reports that doesn't exist anymore.
 */
export const remove = (id: string) => {
  cache.del(`${id}-html`);
  cache.del(`${id}-json`);
};
