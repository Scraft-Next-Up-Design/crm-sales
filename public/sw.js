// @ts-nocheck
const CACHE_NAME = "crm-sales-cache-v1";
const STATIC_ASSETS = ["/", "/favicon.ico"];

const CACHE_STRATEGIES = {
  cacheFirst: async (request) => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      const networkResponse = await fetch(request);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      console.error("cacheFirst strategy failed:", error);
      throw new Error("Unable to fetch resource.");
    }
  },

  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      console.error("networkFirst strategy failed:", error);
      // Fallback to cache if network request fails
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw new Error("Both network and cache failed.");
    }
  },

  staleWhileRevalidate: async (request) => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      const networkResponsePromise = fetch(request).then((response) => {
        cache.put(request, response.clone());
        return response;
      });
      return cachedResponse || networkResponsePromise;
    } catch (error) {
      console.error("staleWhileRevalidate strategy failed:", error);
      throw new Error("Unable to fetch resource.");
    }
  },
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error("Cache installation failed:", error);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ).catch((error) => {
        console.error("Error during cache cleanup:", error);
      });
    })
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  let strategy;
  if (STATIC_ASSETS.includes(url.pathname)) {
    strategy = CACHE_STRATEGIES.cacheFirst;
  } else if (url.pathname.startsWith("/api/")) {
    strategy = CACHE_STRATEGIES.networkFirst;
  } else if (
    request.destination === "image" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    strategy = CACHE_STRATEGIES.staleWhileRevalidate;
  }

  if (strategy) {
    event.respondWith(
      strategy(request).catch((error) => {
        console.error(`Fetching failed for ${request.url}:`, error);
        return new Response("Resource not available.", { status: 503 });
      })
    );
  }
});
