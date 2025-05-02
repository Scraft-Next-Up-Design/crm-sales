// Service Worker with advanced caching strategies for CRM Sales application

// Cache names with versions for better cache management
const CACHE_NAMES = {
  STATIC: 'static-cache-v1',
  IMAGES: 'images-cache-v1',
  API: 'api-cache-v1',
  DOCUMENTS: 'documents-cache-v1'
};

// Resources that should be pre-cached for offline use
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/logo.svg',
  '/assets/placeholder.svg',
  '/avatars/default.png',
  '/avatars/01.png'
];

// Maximum age for cached resources in milliseconds
const MAX_AGE = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  IMAGES: 7 * 24 * 60 * 60 * 1000,  // 7 days
  API: 5 * 60 * 1000,               // 5 minutes
  DOCUMENTS: 1 * 24 * 60 * 60 * 1000 // 1 day
};

// Install event - Cache critical static assets
self.addEventListener('install', (event) => {
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();

  // Pre-cache static assets for offline use
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Pre-caching failed:', error);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());

  // Remove outdated caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Check if this cache name isn't in our current cache list
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to determine cache name based on request URL
const getCacheNameForRequest = (request) => {
  const url = new URL(request.url);
  
  // Handle image caching
  if (
    request.destination === 'image' || 
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i)
  ) {
    return CACHE_NAMES.IMAGES;
  }
  
  // Handle API caching
  if (
    url.pathname.startsWith('/api/') || 
    request.headers.get('Accept')?.includes('application/json')
  ) {
    return CACHE_NAMES.API;
  }
  
  // Handle document caching
  if (
    url.pathname.match(/\.(pdf|doc|docx|xls|xlsx|csv)$/i)
  ) {
    return CACHE_NAMES.DOCUMENTS;
  }
  
  // Default to static cache
  return CACHE_NAMES.STATIC;
};

// Helper function to determine if a request should be cached
const shouldCache = (request) => {
  const url = new URL(request.url);
  
  // Don't cache authentication requests
  if (
    url.pathname.includes('/auth/') || 
    url.pathname.includes('/login') ||
    url.pathname.includes('/logout')
  ) {
    return false;
  }
  
  // Don't cache if request method isn't GET
  if (request.method !== 'GET') {
    return false;
  }
  
  return true;
};

// Helper to check if cache is still valid
const isCacheValid = (cachedResponse, cacheName) => {
  if (!cachedResponse) return false;
  
  // Get cached response timestamp
  const dateHeader = cachedResponse.headers.get('date');
  if (!dateHeader) return false;
  
  const cachedTime = new Date(dateHeader).getTime();
  const now = new Date().getTime();
  
  // Determine max age based on cache type
  let maxAge = MAX_AGE.STATIC; // Default
  
  if (cacheName === CACHE_NAMES.IMAGES) {
    maxAge = MAX_AGE.IMAGES;
  } else if (cacheName === CACHE_NAMES.API) {
    maxAge = MAX_AGE.API;
  } else if (cacheName === CACHE_NAMES.DOCUMENTS) {
    maxAge = MAX_AGE.DOCUMENTS;
  }
  
  // Check if cache is still fresh
  return (now - cachedTime) < maxAge;
};

// Stale-while-revalidate strategy implementation
const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  
  // Try to get the resource from the cache
  const cachedResponse = await cache.match(request);
  const fetchedResponsePromise = fetch(request)
    .then((response) => {
      // Don't cache non-successful responses
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      // Clone the response since it can only be consumed once
      const responseToCache = response.clone();
      
      // Store the new response in the cache
      cache.put(request, responseToCache);
      
      return response;
    })
    .catch((error) => {
      console.error('Fetch failed in stale-while-revalidate:', error);
      // If fetch fails, we'll fall back to the cached response
    });
  
  // Return the cached response immediately if it exists, otherwise wait for fetch
  return cachedResponse || fetchedResponsePromise;
};

// Network-first with fallback to cache strategy
const networkFirstWithFallback = async (request, cacheName) => {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache the response if it's valid
    if (response && response.status === 200 && response.type === 'basic') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache for', request.url);
    
    // Network failed, try the cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a navigation request, return the offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    // No cache, no network - we can't do anything
    throw error;
  }
};

// Cache-first with network fallback strategy
const cacheFirstWithNetworkFallback = async (request, cacheName) => {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  // If we have a valid cached response, use it
  if (cachedResponse && isCacheValid(cachedResponse, cacheName)) {
    return cachedResponse;
  }
  
  // Try network as fallback and update cache
  try {
    const response = await fetch(request);
    
    // Cache the response if it's valid
    if (response && response.status === 200 && response.type === 'basic') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Network and cache both failed:', error);
    
    // If it's a navigation request, return the offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
};

// Main fetch event handler
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Get appropriate cache name for this request
  const cacheName = getCacheNameForRequest(request);
  
  // Apply different strategies based on request type
  if (request.url.includes('/api/')) {
    // For API requests: stale-while-revalidate strategy
    event.respondWith(staleWhileRevalidate(request, cacheName));
  } else if (request.destination === 'image') {
    // For images: cache-first strategy
    event.respondWith(cacheFirstWithNetworkFallback(request, cacheName));
  } else if (request.mode === 'navigate') {
    // For navigation: network-first strategy
    event.respondWith(networkFirstWithFallback(request, cacheName));
  } else {
    // Default strategy: cache-first for static resources
    event.respondWith(cacheFirstWithNetworkFallback(request, cacheName));
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Function to sync forms stored when offline
async function syncForms() {
  try {
    // Open IndexedDB
    const db = await openDB();
    const pendingForms = await db.getAll('offlineForms');
    
    // Process each form
    const syncPromises = pendingForms.map(async (formData) => {
      try {
        // Attempt to submit the form
        const response = await fetch(formData.url, {
          method: formData.method,
          headers: formData.headers,
          body: formData.body
        });
        
        if (response.ok) {
          // If successful, remove from IndexedDB
          await db.delete('offlineForms', formData.id);
          console.log('Synced form:', formData.id);
        }
      } catch (error) {
        console.error('Failed to sync form:', formData.id, error);
      }
    });
    
    await Promise.all(syncPromises);
  } catch (error) {
    console.error('Error syncing forms:', error);
  }
}

// Simple IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offlineFormsDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineForms')) {
        db.createObjectStore('offlineForms', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve({
        getAll: (storeName) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        },
        delete: (storeName, key) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }
      });
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Push notification event handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/assets/logo.svg',
      badge: data.badge || '/assets/badge.png',
      data: data.data || {},
      actions: data.actions || [],
      vibrate: [100, 50, 100]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'CRM Sales Notification', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle notification click actions
  if (event.action) {
    // Custom action handling
    console.log('Notification action clicked:', event.action);
  } else {
    // Default click action - open window
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If we have a client already open, focus it
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/dashboard';
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Periodic background sync for dashboard data
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-dashboard') {
    event.waitUntil(updateDashboardData());
  }
});

// Function to pre-fetch and cache dashboard data
async function updateDashboardData() {
  try {
    // Pre-fetch critical dashboard data
    const dashboardUrls = [
      '/api/workspace/workspace?action=getActiveWorkspace',
      '/api/leads/leads?action=getLeadsRevenueByWorkspace',
      '/api/leads/leads?action=getTotalLeadsCount'
    ];
    
    const cache = await caches.open(CACHE_NAMES.API);
    
    await Promise.all(
      dashboardUrls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
            console.log('Pre-cached dashboard data:', url);
          }
        } catch (error) {
          console.error('Failed to pre-cache dashboard data:', url, error);
        }
      })
    );
  } catch (error) {
    console.error('Error updating dashboard data:', error);
  }
}

// Log service worker lifecycle events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service worker loaded');
