"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Award, IndianRupee, TrendingUp, UserPlus } from "lucide-react";
import { memo, ReactNode } from "react";

interface DashboardData {
  revenue: number;
  arrivedLeadsCount: number;
  qualifiedLeadsCount: number;
  totalLeadsCount: number;
  [key: string]: any; 
}

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
}

const fetchDashboardData = async (
  workspaceId: string
): Promise<DashboardData> => {
  const response = await fetch(`/api/dashboard?workspaceId=${workspaceId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
};

const StatCard = memo(({ icon, title, value }: StatCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4 sm:p-6 flex items-center justify-between space-x-4 sm:space-x-6">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 md:flex-grow">
        <p className="text-xs sm:text-sm text-muted-foreground truncate mb-1">
          {title}
        </p>
        <p className="text-lg sm:text-xl font-semibold truncate cursor-pointer">
          {value}
        </p>
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = "StatCard";

const SkeletonCard = memo(() => (
  <Card className="animate-pulse">
    <CardContent className="p-4 sm:p-6 flex items-center justify-between space-x-4 sm:space-x-6">
      <div className="w-8 h-8 bg-gray-300 rounded-full shrink-0" />
      <div className="min-w-0 flex-grow space-y-2">
        <div className="h-4 w-20 bg-gray-300 rounded" />
        <div className="h-6 w-32 bg-gray-300 rounded" />
      </div>
    </CardContent>
  </Card>
));
SkeletonCard.displayName = "SkeletonCard";

interface DashboardStatsProps {
  workspaceId: string;
}

export function DashboardStatsOptimized({ workspaceId }: DashboardStatsProps) {
const { data, isLoading } = useQuery<DashboardData>({
  queryKey: ["dashboardStats", workspaceId],
  queryFn: () => fetchDashboardData(workspaceId),
  staleTime: 300000,
  gcTime: 600000, 
  refetchOnWindowFocus: false,
});

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const stats: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
  }[] = [
    {
      icon: <IndianRupee className="h-8 w-8 text-blue-500" />,
      title: "Total Revenue",
      value: `₹${(data as any)?.revenue?.toLocaleString() ?? 0}`,
    },
    {
      icon: <UserPlus className="h-8 w-8 text-green-500" />,
      title: "Arrived Leads",
      value: (data as any)?.arrivedLeadsCount ?? 0,
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      title: "Qualified Leads",
      value: (data as any)?.qualifiedLeadsCount ?? 0,
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      title: "Total Leads",
      value: (data as any)?.totalLeadsCount ?? 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
