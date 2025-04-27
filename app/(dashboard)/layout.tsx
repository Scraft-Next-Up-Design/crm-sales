import ClientSidebarWrapper from "@/components/layout/client-sidebar-wrapper";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex relative">
          <aside className="border-r min-h-[calc(100vh-4rem)] z-[99]">
            <ClientSidebarWrapper />
          </aside>
          <main className="flex-1 relative z-0">{children}</main>
        </div>
      </Suspense>
    </div>
  );
}
