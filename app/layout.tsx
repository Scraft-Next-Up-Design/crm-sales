import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM SaaS Platform',
  description: 'Modern CRM solution for sales teams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Toaster />
          
          {children}
        </Providers>
      </body>
    </html>
  );
}
