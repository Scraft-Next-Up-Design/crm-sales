"use client";

import { Card } from "@/components/ui/card";
import { useGetLeadsQuery } from "@/lib/store/services/leadsApi";
import { DashboardStat } from "./dashboard-stat";

export function DashboardStats() {
  const { data: leads } = useGetLeadsQuery();

  const stats = [
    {
      title: "Total Leads",
      value: leads?.length || 0,
    },
    {
      title: "Active Leads",
      value: leads?.filter((lead) => lead.status === "in_progress").length || 0,
    },
    {
      title: "Closed Leads",
      value: leads?.filter((lead) => lead.status === "closed").length || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <DashboardStat key={stat.title} {...stat} />
      ))}
    </div>
  );
}