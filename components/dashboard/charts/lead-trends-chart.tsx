"use client";

import { Card } from "@/components/ui/card";
import { useLeadTrendsData } from "@/hooks/use-lead-trends-data-optimized";
import dynamic from "next/dynamic";

const DynamicChart = dynamic(
  () => import("./dynamic-chart").then((mod) => mod.DynamicChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        Loading chart...
      </div>
    ),
  }
);

export function LeadTrendsChart() {
  const { data, isLoading, isError } = useLeadTrendsData();

  if (isError) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Lead Trends</h2>
        <div className="h-[400px] flex items-center justify-center text-red-500">
          Failed to load lead trends data
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lead Trends</h2>
      <div className="h-[400px]">
        <DynamicChart data={data} />
      </div>
    </Card>
  );
}
