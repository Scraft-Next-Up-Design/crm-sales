"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetActiveWorkspaceQuery,
  useGetCountByWorkspaceQuery,
  useGetQualifiedCountQuery,
  useGetRevenueByWorkspaceQuery,
  useGetROCByWorkspaceQuery,
} from "@/lib/store/services/workspace";
import { RootState } from "@/lib/store/store";
import { Award, IndianRupee, TrendingUp, UserPlus, Users } from "lucide-react";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { useGetWebhooksBySourceIdQuery } from "@/lib/store/services/webhooks";

const StatCard = memo(({ stat, isLast }: any) => (
  <Card
    className={cn(
      "hover:shadow-md transition-shadow",
      isLast && "col-span-full sm:col-auto"
    )}
  >
    <CardContent className="p-4 sm:p-6 flex items-center justify-between space-x-4 sm:space-x-6">
      <div className="shrink-0">{stat.icon}</div>
      <div className="min-w-0 md:flex-grow">
        <p className="text-xs sm:text-sm text-muted-foreground truncate mb-1">
          {stat.title}
        </p>
        <p className="text-lg sm:text-xl font-semibold truncate cursor-pointer">
          {stat.value}
        </p>
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = "StatCard";


const SalesChart = memo(({ salesData }: any) => (
  <Card className="w-full">
    <CardHeader className="p-4 sm:p-6">
      <CardTitle className="text-base sm:text-lg">
        Monthly Sales Performance
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 sm:p-6">
      <div className="w-full h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salesData}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));
SalesChart.displayName = "SalesChart";

// Skeleton Loading Component
const DashboardSkeleton = () => (
  <div className="grid grid-rows-2 md:grid-rows-[25%_75%] gap-0 md:gap-2 px-2 py-6 w-auto">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 h-[322px] md:h-auto">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4 sm:p-6 flex items-center justify-between space-x-4 sm:space-x-6">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <Skeleton className="w-48 h-6" />
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Skeleton className="w-full h-[250px] sm:h-[300px]" />
      </CardContent>
    </Card>
  </div>
);

const SalesDashboard = () => {
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );

  const { data: activeWorkspace, isLoading: isWorkspaceLoading } =
    useGetActiveWorkspaceQuery();
  const workspaceId = activeWorkspace?.data?.id;

  const { data: workspaceRevenue, isLoading: isRevenueLoading } =
    useGetRevenueByWorkspaceQuery(workspaceId, { skip: !workspaceId });
  const { data: ROC, isLoading: isRocLoading } = useGetROCByWorkspaceQuery(
    workspaceId,
    { skip: !workspaceId }
  );
  const { data: qualifiedCount, isLoading: isQualifiedCountLoading } =
    useGetQualifiedCountQuery(workspaceId, { skip: !workspaceId });
  const { data: workspaceCount, isLoading: isCountLoading } =
    useGetCountByWorkspaceQuery(workspaceId, { skip: !workspaceId });
  const { data: webhooks, isLoading: isWebhooksLoading } =
    useGetWebhooksBySourceIdQuery(
      { workspaceId, id: ROC?.top_source_id },
      { skip: !workspaceId || !ROC?.top_source_id }
    );

  const dashboardStats = useMemo(
    () => [
      {
        icon: <IndianRupee className="text-green-500" />,
        title: "Revenue",
        value: workspaceRevenue?.totalRevenue.toFixed(2) || "0",
        change: workspaceRevenue?.change || "+0%",

      },
      {
        icon: <UserPlus className="text-orange-500" />,
        title: "Qualified Leads",
        value: qualifiedCount?.qualifiedLeadsCount || "0",
      },
      {
        icon: <Users className="text-blue-500" />,
        title: "New Leads",
        value: workspaceCount?.arrivedLeadsCount || 0,
        change: "+8.3%",
      },
      {
        icon: <TrendingUp className="text-purple-500" />,
        title: "Conversion Rate",
        value: `${ROC?.conversion_rate || 0}%`,
        change: "+3.2%",
      },
      {
        icon: <Award className="text-yellow-500" />,
        title: "Top Performing Sources",
        value: webhooks?.name || "N/A",
        change: "5 Deals",
      },
    ],
    [workspaceRevenue, qualifiedCount, workspaceCount, ROC, webhooks]
  );

  const salesData = useMemo(
    () =>
      ROC?.monthly_stats?.map((stat: any) => ({
        month: stat.month,
        sales: stat.convertedLeads,
      })) || [],
    [ROC?.monthly_stats]
  );

  const isLoading = [
    isWorkspaceLoading,
    isRevenueLoading,
    isRocLoading,
    isCountLoading,
    isQualifiedCountLoading,
    isWebhooksLoading,
  ].some(Boolean);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={cn(
        "grid grid-rows-2 md:grid-rows-[25%_75%] gap-0 md:gap-2 transition-all duration-500 ease-in-out px-2 py-6 w-auto",
        isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"
      )}
    >

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 h-[322px] md:h-auto">
        {dashboardStats.map((stat, index) => (
          <StatCard
            key={stat.title}
            stat={stat}
            isLast={index === dashboardStats.length - 1}
          />
        ))}
      </div>
      <SalesChart salesData={salesData} />
    </div>
  );
};

export default memo(SalesDashboard);
