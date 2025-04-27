import { LeadStatsCard } from "@/components/dashboard/lead-stats-card";
import { LeadTrendsCard } from "@/components/dashboard/lead-trends-card";
import { getLeadStats, getLeadTrends } from "@/lib/data/dashboard";
import { Suspense } from "react";

export const revalidate = 300; // Revalidate page every 5 minutes

export default async function DashboardPage() {
  // Prefetch data with Promise.all for parallel execution
  const [stats, trends] = await Promise.all([getLeadStats(), getLeadTrends()]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense
          fallback={<div className="animate-pulse p-4">Loading stats...</div>}
        >
          <LeadStatsCard promise={Promise.resolve(stats)} />
        </Suspense>

        <Suspense
          fallback={<div className="animate-pulse p-4">Loading trends...</div>}
        >
          <LeadTrendsCard promise={Promise.resolve(trends)} />
        </Suspense>
      </div>
    </div>
  );
}
