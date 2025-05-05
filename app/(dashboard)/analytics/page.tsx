import { Suspense } from "react";
import { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsClient } from "./analytics-client";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Analytics Dashboard | CRM Sales Dashboard",
    description:
      "View detailed analytics and performance metrics for your sales activities",
  };
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-80 w-full rounded-md" />
            <Skeleton className="h-80 w-full rounded-md" />
          </div>
          <Skeleton className="h-80 w-full rounded-md" />
        </div>
      }
    >
      <AnalyticsClient />
    </Suspense>
  );
}
