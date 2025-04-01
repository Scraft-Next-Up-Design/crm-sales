"use client";

import React from "react";
import { LeadTrendsChart } from "./lead-trends-chart";

export interface AnalyticsChartsProps {
  className?: string;
}

export function AnalyticsCharts({ className }: AnalyticsChartsProps) {
  return (
    <div className={className}>
      <LeadTrendsChart />
    </div>
  );
}
