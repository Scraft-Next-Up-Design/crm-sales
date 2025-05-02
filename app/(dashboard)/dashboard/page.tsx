import DashboardContent from "@/components/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/dashboard/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 60; 

export const metadata = {
  title: "Dashboard | CRM Sales",
  description: "Real-time sales dashboard with analytics and insights",
};

export default function DashboardPage() {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong. Please try again.</div>}
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
}
