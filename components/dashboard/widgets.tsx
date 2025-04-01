"use client";

import { Card } from "@/components/ui/card";
import { DashboardStats } from "./stats/dashboard-stats";

interface DashboardWidgetsProps {
  className?: string;
}

export function DashboardWidgets({ className }: DashboardWidgetsProps) {
  return (
    <div className={`grid gap-4 ${className || ""}`}>
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Dashboard Overview</h2>
        <DashboardStats />
      </Card>
    </div>
  );
}
