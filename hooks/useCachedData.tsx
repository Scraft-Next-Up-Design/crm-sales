import {
  createCacheKey,
  getCacheItem,
  setCacheItem,
} from "@/lib/utils/cacheUtils";
import { useEffect, useState } from "react";

/**
 * A React hook for data fetching with automatic caching and revalidation
 *
 * @param fetcher Function that returns a promise with the data
 * @param options Caching and revalidation options
 */
import { networkSpeed } from "@/lib/services/networkSpeedService";

export function useCachedData<T>(
  fetcher: () => Promise<T>,
  options: {
    cacheKey: string;
    cacheTime?: number;
    cacheStorage?: "local" | "session" | "memory";
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    params?: Record<string, any>;
  }
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const {
    cacheKey: baseKey,
    cacheTime,
    cacheStorage: userCacheStorage,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    params,
  } = options;

  // Determine optimal cache settings based on network conditions
  const effectiveCacheTime = cacheTime ?? networkSpeed.getOptimalCacheTime();
  const effectiveCacheStorage =
    userCacheStorage ??
    (networkSpeed.shouldUsePersistentCache() ? "local" : "memory");

  const fullCacheKey = createCacheKey(baseKey, params);

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const freshData = await fetcher();
      setData(freshData);

      // Update cache with network-aware settings
      setCacheItem(fullCacheKey, freshData, {
        expiresIn: effectiveCacheTime,
        storage: effectiveCacheStorage,
      });

      return freshData;
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      setError(fetchError);
      throw fetchError;
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  useEffect(() => {
    getCacheItem<T>(fullCacheKey, { storage: effectiveCacheStorage })
      .then((cachedData) => {
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
        } else {
          fetchData().catch(console.error);
        }
      })
      .catch(() => fetchData().catch(console.error));

    // Set up revalidation listeners
    if (revalidateOnFocus) {
      const onFocus = () => {
        fetchData().catch(console.error);
      };

      window.addEventListener("focus", onFocus);
      return () => window.removeEventListener("focus", onFocus);
    }
  }, [fullCacheKey]);

  useEffect(() => {
    if (revalidateOnReconnect) {
      const onReconnect = () => {
        fetchData().catch(console.error);
      };

      window.addEventListener("online", onReconnect);
      return () => window.removeEventListener("online", onReconnect);
    }
  }, [revalidateOnReconnect]);

  return { data, isLoading, error, refetch };
}

/**
 * Hook for fetching data with automatic caching based on workspace ID
 */
export function useWorkspaceCachedData<T>(
  fetcher: (workspaceId: string) => Promise<T>,
  options: {
    workspaceId: string;
    cacheKey: string;
    cacheTime?: number;
    cacheStorage?: "local" | "session" | "memory";
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
  }
) {
  const { workspaceId, cacheKey, ...restOptions } = options;

  return useCachedData<T>(() => fetcher(workspaceId), {
    ...restOptions,
    cacheKey,
    params: { workspaceId },
  });
}
