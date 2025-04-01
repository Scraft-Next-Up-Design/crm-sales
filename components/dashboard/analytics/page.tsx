"use client";

import { Card } from "@/components/ui/card";
import { LeadTrendsChart } from "../charts/lead-trends-chart";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Trends</h3>
          <LeadTrendsChart />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conversion Rate</h3>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">
              Conversion metrics coming soon
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Revenue data coming soon</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
