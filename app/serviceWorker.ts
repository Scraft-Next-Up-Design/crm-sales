export function registerServiceWorker() {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("ServiceWorker registration successful");
        })
        .catch((error) => {
          console.error("ServiceWorker registration failed:", error);
        });
    });
  }
}

export function isOffline() {
  return !navigator.onLine;
}

export function showOfflineNotification() {
  if (isOffline()) {
    console.log("You are currently offline. Some features may be limited.");
  }
}

// Add offline event listeners
export function setupOfflineListeners() {
  window.addEventListener("online", () => {
    // Handle coming back online
    console.log("Back online");
  });

  window.addEventListener("offline", () => {
    // Handle going offline
    showOfflineNotification();
  });
}
