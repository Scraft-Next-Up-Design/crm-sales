import { useCallback, useState } from "react";
import useSWR, { SWRConfiguration } from "swr";

interface FetcherOptions {
  headers?: HeadersInit;
  method?: string;
  body?: any;
}

interface UseFetchResult<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T, shouldRevalidate?: boolean) => Promise<T | undefined>;
}

const defaultFetcher = async (url: string, options: FetcherOptions = {}) => {
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export function useDataFetch<T>(
  url: string | null,
  options: FetcherOptions = {},
  config: SWRConfiguration = {}
): UseFetchResult<T> {
  const [isLoading, setIsLoading] = useState(true);

  const fetcher = useCallback(
    async (fetchUrl: string) => {
      try {
        setIsLoading(true);
        const result = await defaultFetcher(fetchUrl, options);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const { data, error, isValidating, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
    ...config,
  });

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
