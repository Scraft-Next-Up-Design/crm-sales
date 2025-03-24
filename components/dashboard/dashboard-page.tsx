"use client";

import { LeadTrendsChart } from "./charts/lead-trends-chart";
import { DashboardStats } from "./stats/dashboard-stats";

export function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <DashboardStats />
      <LeadTrendsChart />
    </div>
  );
}
