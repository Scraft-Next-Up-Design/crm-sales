import { getLeadStats } from "@/lib/data/dashboard";
import { DashboardStat } from "./dashboard-stat";

export async function DashboardStats() {
  const { total, active, closed } = await getLeadStats();

  const stats = [
    {
      title: "Total Leads",
      value: total,
    },
    {
      title: "Active Leads",
      value: active,
    },
    {
      title: "Closed Leads",
      value: closed,
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
