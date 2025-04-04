"use client";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { registerServiceWorker, setupOfflineListeners } from "./serviceWorker";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    registerServiceWorker();
    setupOfflineListeners();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
