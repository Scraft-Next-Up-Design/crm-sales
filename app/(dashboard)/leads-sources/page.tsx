import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { Suspense } from "react";
import { LeadSourceManagerClient } from "./leads-sources-client";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Lead Sources | CRM Sales Dashboard",
    description: "Manage your lead sources and webhooks",
  };
}

export default function LeadSourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[calc(100vh-200px)] w-full rounded-md" />
        </div>
      }
    >
      <LeadSourceManagerClient />
    </Suspense>
  );
}
