"use client";

import { Providers } from "@/app/providers";
import {
  registerServiceWorker,
  setupOfflineListeners,
} from "@/app/serviceWorker";
import { Toaster } from "@/components/ui/sonner";
import { preloadCriticalImages } from "@/utils/image-preloader";
import { useEffect } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker();
    setupOfflineListeners();
    
    // Preload critical images
    preloadCriticalImages();
    
    // Clean up resources on unmount if needed
    return () => {
      // Any cleanup code here
    };
  }, []);

  return (
    <Providers>
      <Toaster />
      {children}
    </Providers>
  );
}
