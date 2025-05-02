/**
 * Enhanced service worker registration and management for CRM Sales application
 * Implements progressive web app features including:
 * - Offline functionality
 * - Background sync
 * - Push notifications
 * - Cache management
 */

// Register the service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope:', registration.scope);
          
          // Set up refresh functionality when a new service worker is waiting
          if (registration.waiting) {
            // A new service worker is waiting to activate
            notifyUserOfUpdate(registration);
          }
          
          // Listen for new service workers to install
          registration.addEventListener('updatefound', () => {
            // Track the installing service worker
            const newWorker = registration.installing;
            if (!newWorker) return;
            
            // Listen for state changes
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed and ready to take over
                notifyUserOfUpdate(registration);
              }
            });
          });
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
      
      // Listen for controller changes to refresh the page if needed
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Only reload if we're purposely updating the service worker
        if (window.swUpdateReady) {
          window.location.reload();
        }
      });
    });
  }
}

// Notify user of available update
function notifyUserOfUpdate(registration) {
  // Create a toast notification or UI indicator for update
  const updateEvent = new CustomEvent('serviceWorkerUpdateAvailable', {
    detail: registration
  });
  
  window.dispatchEvent(updateEvent);
}

// Update service worker and refresh the page
export function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      // Set a flag that we're purposely updating
      window.swUpdateReady = true;
      
      // Send message to SW to skip waiting and activate new version
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  }
}

// Check if the user is currently offline
export function isOffline() {
  return !navigator.onLine;
}

// Show offline notification or UI elements
export function showOfflineNotification() {
  if (isOffline()) {
    // Create a notification event that UI components can listen for
    const offlineEvent = new CustomEvent('connectionOffline');
    window.dispatchEvent(offlineEvent);
    
    console.log('You are currently offline. Some features may be limited.');
    
    // Add an offline class to the body for CSS styling
    document.body.classList.add('offline-mode');
    
    // If we have toast notifications available, show one
    if (typeof window.toast === 'function') {
      window.toast({
        title: 'You are offline',
        description: 'Some features may be limited when working offline.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }
}

// Show online notification when connection is restored
export function showOnlineNotification() {
  // Create a notification event that UI components can listen for
  const onlineEvent = new CustomEvent('connectionRestored');
  window.dispatchEvent(onlineEvent);
  
  console.log('You are back online.');
  
  // Remove offline class from the body
  document.body.classList.remove('offline-mode');
  
  // If we have toast notifications available, show one
  if (typeof window.toast === 'function') {
    window.toast({
      title: 'You are back online',
      description: 'All features are now available.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }
}

// Setup online/offline event listeners
export function setupOfflineListeners() {
  // Listen for online events
  window.addEventListener('online', () => {
    showOnlineNotification();
    
    // Trigger sync for any stored offline data
    syncOfflineData();
  });

  // Listen for offline events
  window.addEventListener('offline', () => {
    showOfflineNotification();
  });
  
  // Initial check
  if (isOffline()) {
    showOfflineNotification();
  }
}

// Sync any data that was stored while offline
export function syncOfflineData() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register('sync-forms').catch((err) => {
        console.error('Background sync registration failed:', err);
      });
    });
  } else {
    // If background sync isn't supported, try manual sync
    console.log('Background Sync not supported. Attempting manual sync...');
    
    // Custom implementation for manual sync can go here
    // Example: fetch any stored offline data from IndexedDB and send it
  }
}

// Request permission for push notifications
export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return Promise.resolve(false);
  }
  
  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }
  
  // Request permission
  return Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  });
}

// Subscribe to push notifications
export function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return Promise.resolve(null);
  }
  
  return navigator.serviceWorker.ready
    .then((registration) => {
      // Check if we already have a subscription
      return registration.pushManager.getSubscription()
        .then((subscription) => {
          if (subscription) {
            return subscription;
          }
          
          // Create a new subscription
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
          });
        });
    })
    .then((subscription) => {
      if (subscription) {
        // Send the subscription to the server
        return sendSubscriptionToServer(subscription);
      }
      return null;
    })
    .catch((error) => {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    });
}

// Convert base64 to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Send subscription to server
function sendSubscriptionToServer(subscription) {
  // Implement the API call to your backend
  return fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to store subscription on server');
      }
      return subscription;
    });
}

// Enable periodic background sync for dashboard data
export function enablePeriodicSync() {
  if ('serviceWorker' in navigator && 'periodicSync' in registration) {
    navigator.serviceWorker.ready
      .then((registration) => {
        // Try to get permission for periodic background sync
        return navigator.permissions
          .query({
            name: 'periodic-background-sync',
          })
          .then((status) => {
            if (status.state === 'granted') {
              // Register for periodic sync
              return registration.periodicSync.register('update-dashboard', {
                // Update dashboard data every hour
                minInterval: 60 * 60 * 1000, // 1 hour in milliseconds
              });
            }
            throw new Error('Periodic background sync permission not granted');
          });
      })
      .then(() => {
        console.log('Periodic background sync registered');
      })
      .catch((error) => {
        console.error('Periodic background sync registration failed:', error);
      });
  }
}

// Store form data while offline
export function storeFormDataForSync(url, method, formData, headers = {}) {
  return new Promise((resolve, reject) => {
    // Open IndexedDB
    const request = indexedDB.open('offlineFormsDB', 1);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Failed to open database');
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains('offlineForms')) {
        db.createObjectStore('offlineForms', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineForms'], 'readwrite');
      const store = transaction.objectStore('offlineForms');
      
      // Store the form data
      const formToStore = {
        url,
        method,
        headers,
        body: formData instanceof FormData ? formDataToObject(formData) : formData,
        timestamp: new Date().getTime(),
      };
      
      const addRequest = store.add(formToStore);
      
      addRequest.onsuccess = () => {
        console.log('Form data stored for later sync');
        resolve(true);
      };
      
      addRequest.onerror = (event) => {
        console.error('Error storing form data:', event);
        reject('Failed to store form data');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Helper function to convert FormData to plain object
function formDataToObject(formData) {
  const object = {};
  formData.forEach((value, key) => {
    // Handle file inputs specially
    if (value instanceof File) {
      object[key] = {
        _isFile: true,
        name: value.name,
        type: value.type,
        size: value.size,
        // Note: we can't actually store the file content in IndexedDB simply
        // We would need to read it as base64 or use a more complex solution
      };
    } else {
      object[key] = value;
    }
  });
  return object;
}

// Export all functions as a module
export default {
  registerServiceWorker,
  updateServiceWorker,
  isOffline,
  showOfflineNotification,
  showOnlineNotification,
  setupOfflineListeners,
  syncOfflineData,
  requestNotificationPermission,
  subscribeToPushNotifications,
  enablePeriodicSync,
  storeFormDataForSync
};

// Declare global interface for window object
declare global {
  interface Window {
    swUpdateReady?: boolean;
    toast?: (options: {
      title: string;
      description?: string;
      status?: 'info' | 'warning' | 'success' | 'error';
      duration?: number;
      isClosable?: boolean;
    }) => void;
  }

  // For Service Worker TypeScript support
  interface ServiceWorkerRegistration {
    periodicSync?: {
      register(tag: string, options?: { minInterval: number }): Promise<void>;
    };
  }

  interface PermissionDescriptor {
    name: 'periodic-background-sync';
  }
}
