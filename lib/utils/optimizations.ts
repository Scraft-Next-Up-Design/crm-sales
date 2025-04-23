import { useEffect, useState } from "react";

export function useNetworkSpeed() {
  const [networkSpeed, setNetworkSpeed] = useState<"slow" | "medium" | "fast">(
    "fast"
  );
  const [samples, setSamples] = useState<number[]>([]);
  const SAMPLE_SIZE = 3;
  const CHECK_INTERVAL = 30000; // 30 seconds

  useEffect(() => {
    const checkNetworkSpeed = async () => {
      try {
        const startTime = performance.now();
        const response = await fetch("/favicon.ico", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        const endTime = performance.now();
        const duration = endTime - startTime;

        setSamples((prev) => {
          const newSamples = [...prev, duration].slice(-SAMPLE_SIZE);
          const avgDuration =
            newSamples.reduce((a, b) => a + b, 0) / newSamples.length;

          // Optimized thresholds for modern networks
          if (avgDuration <= 500) setNetworkSpeed("fast");
          else if (avgDuration <= 1500) setNetworkSpeed("medium");
          else setNetworkSpeed("slow");

          return newSamples;
        });
      } catch (error) {
        console.error("Error checking network speed:", error);
        setNetworkSpeed("slow");
      }
    };

    checkNetworkSpeed();
    const interval = setInterval(checkNetworkSpeed, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return networkSpeed;
}

export function getImageConfig(networkSpeed: "slow" | "medium" | "fast") {
  const quality = {
    slow: 60,
    medium: 75,
    fast: 85,
  }[networkSpeed];

  return {
    quality,
    loading: "lazy" as const,
    sizes:
      "(max-width: 640px) 100vw, (max-width: 768px) 75vw, (max-width: 1024px) 50vw, 33vw",
    placeholder: "blur",
    formats: ["webp", "avif", "jpg"],
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 60,
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02LjY2OjY2Njo2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Njb/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  };
}

export function useLazyLoading(threshold = "100px") {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: threshold,
      }
    );

    const element = document.getElementById("lazy-load-trigger");
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return isVisible;
}

export async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout?: number } = {}
) {
  const { timeout = 8000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request... attempts left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay);
    } else {
      throw new Error(`Request failed after multiple retries: ${error}`);
    }
  }
}
