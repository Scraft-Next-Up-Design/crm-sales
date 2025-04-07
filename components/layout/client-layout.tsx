"use client";

import { Providers } from "@/app/providers";
import {
  registerServiceWorker,
  setupOfflineListeners,
} from "@/app/serviceWorker";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
    setupOfflineListeners();
  }, []);

  return (
    <Providers>
      <Toaster />
      {children}
    </Providers>
  );
}
