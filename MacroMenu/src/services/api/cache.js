import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@macromenu_cache_';
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null if expired/not found
 */
export async function getCache(key) {
  try {
    const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const { data, expiry } = JSON.parse(cached);

    if (Date.now() > expiry) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Set cache data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 1 hour)
 */
export async function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const cacheData = {
      data,
      expiry: Date.now() + ttl,
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

/**
 * Remove specific cache entry
 * @param {string} key - Cache key
 */
export async function removeCache(key) {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.error('Error removing cache:', error);
  }
}

/**
 * Clear all cache entries
 */
export async function clearAllCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Create a cache key from parameters
 */
export function createCacheKey(prefix, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return `${prefix}_${sortedParams}`;
}

/**
 * Wrapper for cached API calls
 * @param {string} cacheKey - Unique key for this request
 * @param {Function} fetchFn - Function that returns a Promise with the data
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Promise<any>} Cached or fresh data
 */
export async function cachedFetch(cacheKey, fetchFn, ttl = DEFAULT_TTL) {
  // Try to get from cache first
  const cached = await getCache(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache the result
  await setCache(cacheKey, data, ttl);

  return data;
}
