"use client";

import { DynamicSidebar } from "@/components/layout/dynamic-layout";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarSkeleton } from "@/components/layout/sidebar-skeleton";
import { Suspense, useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Leads Sources", href: "/leads-sources" },
  { name: "Leads", href: "/leads" },
  { name: "Contact", href: "/contact" },
  { name: "Analytics", href: "/analytics" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      <MobileHeader user={null} navigation={navigation} />
      <div className="flex relative">
        {/* Overlay for Blur Effect */}
        {isOpen && (
          <div className="fixed inset-0 bg-gray-900 opacity-70 z-50" />
        )}

        <aside className="border-r min-h-[calc(100vh-4rem)] z-[99]">
          <Suspense fallback={<SidebarSkeleton />}>
            <DynamicSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
          </Suspense>
        </aside>
        <main className="flex-1 relative z-0">
          <Suspense fallback={<SidebarSkeleton />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
