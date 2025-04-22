import { getCacheDuration, getCacheStorage } from "../config/cacheConfig";
import { cacheCleanup } from "../services/cacheCleanup";
import { cacheErrorRecovery } from "../services/cacheErrorRecovery";
import { cacheMonitoring } from "../services/cacheMonitoring";
import { networkSpeed } from "../services/networkSpeedService";
import { CachedItem, CacheOptions, CacheStorageType } from "../types/cache";

const memoryCache = new Map<string, CachedItem<unknown>>();

const cacheStats = {
  hits: 0,
  misses: 0,
  evictions: 0,
};

/**
 * Check if a key matches any invalidation patterns
 */
function shouldInvalidateCache(key: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(key));
}

/**
 * Set an item in the cache with expiration
 */
export async function setCacheItem<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const { duration = "medium", storage = "memory", expiresIn } = options;
  const effectiveExpiry = expiresIn || getCacheDuration(duration);
  const storageConfig = getCacheStorage(storage as CacheStorageType);
  const now = Date.now();
  const item: CachedItem<T> = {
    value,
    expiry: now + effectiveExpiry * 1000,
    timestamp: now,
  };

  // Check if the key belongs to volatile data
  const isVolatileData = storageConfig.volatileKeys?.some((prefix) =>
    key.startsWith(prefix)
  );

  // Use memory storage for volatile data regardless of specified storage
  const effectiveStorage = isVolatileData ? "memory" : storage;

  const startTime = performance.now();

  try {
    await cacheErrorRecovery.executeWithRecovery(
      effectiveStorage,
      async () => {
        if (effectiveStorage === "memory") {
          cacheCleanup.addToMemoryCache(key, item);
          return;
        }

        const storageObj =
          effectiveStorage === "local" ? localStorage : sessionStorage;
        storageObj.setItem(key, JSON.stringify(item));
      },
      async () => {
        // Fallback to memory cache if storage fails
        cacheCleanup.addToMemoryCache(key, item);
      }
    );

    const endTime = performance.now();
    cacheMonitoring.recordHit(effectiveStorage, endTime - startTime);
  } catch (error) {
    console.error("Error setting cache item:", error);
    cacheMonitoring.recordMiss(effectiveStorage);
  }
}

/**
 * Get an item from the cache, returns null if expired or not found
 */
export async function getCacheItem<T>(
  key: string,
  options: CacheOptions = {}
): Promise<T | null> {
  const { storage = "memory" } = options;
  const now = Date.now();
  const startTime = performance.now();

  try {
    const result = await cacheErrorRecovery.executeWithRecovery(
      storage,
      async () => {
        let item: CachedItem<T> | undefined;

        if (storage === "memory") {
          item = cacheCleanup.getFromMemoryCache(key);
        } else {
          const storageObj =
            storage === "local" ? localStorage : sessionStorage;
          const storedItem = storageObj.getItem(key);
          item = storedItem ? JSON.parse(storedItem) : undefined;
        }

        if (!item) {
          cacheMonitoring.recordMiss(storage);
          return null;
        }

        if (now > item.expiry) {
          // Remove expired item
          removeCacheItem(key, { storage });
          cacheMonitoring.recordMiss(storage);
          return null;
        }

        const endTime = performance.now();
        cacheMonitoring.recordHit(storage, endTime - startTime);
        return item.value;
      },
      async () => {
        cacheMonitoring.recordMiss(storage);
        return null;
      }
    );

    return result;
  } catch (error) {
    console.error("Error getting cache item:", error);
    cacheMonitoring.recordMiss(storage);
    return null;
  }
}

/**
 * Remove an item from the cache
 */
export async function removeCacheItem(
  key: string,
  options: CacheOptions = {}
): Promise<void> {
  const { storage = "memory" } = options;

  try {
    await cacheErrorRecovery.executeWithRecovery(
      storage,
      async () => {
        if (storage === "memory") {
          cacheCleanup.clearMemoryCache();
          return;
        }

        const storageObj = storage === "local" ? localStorage : sessionStorage;
        storageObj.removeItem(key);
      },
      async () => {
        // No fallback needed for removal
      }
    );
  } catch (error) {
    console.error("Error removing cache item:", error);
  }
}

/**
 * Clear all items from a specific cache storage
 */
export async function clearCache(
  storage: "local" | "session" | "memory" | "all" = "all"
): Promise<void> {
  try {
    if (storage === "memory" || storage === "all") {
      cacheCleanup.clearMemoryCache();
    }

    if (storage === "local" || storage === "all") {
      localStorage.clear();
    }

    if (storage === "session" || storage === "all") {
      sessionStorage.clear();
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

/**
 * Cached fetch function with timeout and retry capabilities
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit & {
    cacheKey?: string;
    cacheTime?: number;
    cacheStorage?: CacheStorageType;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const {
    cacheKey = url,
    cacheTime,
    cacheStorage: userCacheStorage,
    timeout,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  // Determine optimal cache settings based on network conditions
  const effectiveCacheTime = cacheTime ?? networkSpeed.getOptimalCacheTime();
  const effectiveCacheStorage =
    userCacheStorage ??
    (networkSpeed.shouldUsePersistentCache() ? "local" : "memory");
  const effectiveTimeout = timeout ?? networkSpeed.getOptimalTimeout();

  // Try to get from cache first
  const cachedData = await getCacheItem<T>(cacheKey, {
    storage: effectiveCacheStorage,
  });
  if (cachedData) {
    return cachedData;
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);

    try {
      const response = await cacheErrorRecovery.executeWithRecovery<Response>(
        effectiveCacheStorage,
        async () => {
          if (attempt > 0) {
            // Exponential backoff for retries
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
            );
          }

          const res = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
          });

          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }

          return res;
        },
        async () => {
          throw new Error("Failed to fetch data");
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      // Cache the successful response
      await setCacheItem(cacheKey, data, {
        expiresIn: effectiveCacheTime,
        storage: effectiveCacheStorage,
      });

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, throw the error
      if (attempt === retries - 1) {
        throw lastError;
      }
    }
  }

  // This should never be reached due to the throw in the catch block
  throw lastError || new Error("Failed to fetch data");
}

/**
 * Create a cache key based on the endpoint and parameters
 */
export function createCacheKey(
  baseKey: string,
  params?: Record<string, any>
): string {
  if (!params) return baseKey;

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  return `${baseKey}:${JSON.stringify(sortedParams)}`;
}

/**
 * Hook to use cached data with automatic revalidation
 */
export function useCachedData<T>(
  fetcher: () => Promise<T>,
  options: {
    cacheKey: string;
    cacheTime?: number;
    cacheStorage?: "local" | "session" | "memory";
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
  }
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const {
    cacheKey,
    cacheTime = 60,
    cacheStorage = "memory",
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  // This would be implemented with React hooks in a real component
  // For this utility file, we're just defining the interface

  // Implementation would include:
  // - useState for data, loading, error states
  // - useEffect for initial fetch and event listeners
  // - Event listeners for focus and online events if options enabled
  // - A refetch function that clears cache and fetches fresh data

  // For now, return a placeholder implementation
  return {
    data: null,
    isLoading: false,
    error: null,
    refetch: async () => {},
  };
}

// Export monitoring instance for external use
export { cacheCleanup, cacheErrorRecovery, cacheMonitoring };
