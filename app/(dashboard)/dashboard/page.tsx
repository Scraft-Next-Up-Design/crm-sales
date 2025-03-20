"use client";

import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Award, Users, TrendingUp, IndianRupee, UserPlus } from "lucide-react";
import {
  useGetActiveWorkspaceQuery,
  useGetCountByWorkspaceQuery,
  useGetQualifiedCountQuery,
  useGetRevenueByWorkspaceQuery,
  useGetROCByWorkspaceQuery,
} from "@/lib/store/services/workspace";
import { useGetWebhooksBySourceIdQuery } from "@/lib/store/services/webhooks";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

// Skeleton Component
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

const SkeletonChart = memo(() => (
  <Card className="w-full animate-pulse">
    <CardHeader className="p-4 sm:p-6">
      <div className="h-5 w-40 bg-gray-300 rounded" />
    </CardHeader>
    <CardContent className="p-4 sm:p-6">
      <div className="w-full h-[250px] sm:h-[300px] bg-gray-300 rounded" />
    </CardContent>
  </Card>
));

interface Workspace {
  id: string;
  name: string;
  role: string;
  industry?: string;
  status?: boolean;
  type?: string;
}

const SalesDashboard = memo(() => {
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );
  const { data: activeWorkspace, isLoading: isWorkspaceLoading } =
    useGetActiveWorkspaceQuery();
  const { data: workspaceRevenue, isLoading: isRevenueLoading } =
    useGetRevenueByWorkspaceQuery(activeWorkspace?.data?.id, {
      skip: !activeWorkspace?.data?.id,
    });
  const { data: ROC, isLoading: isRocLoading } = useGetROCByWorkspaceQuery(
    activeWorkspace?.data?.id,
    {
      skip: !activeWorkspace?.data?.id,
    }
  );
  const { data: qualifiedCount, isLoading: isQualifiedCountLoading } =
    useGetQualifiedCountQuery(activeWorkspace?.data?.id, {
      skip: !activeWorkspace?.data?.id,
    });
  const { data: workspaceCount, isLoading: isCountLoading } =
    useGetCountByWorkspaceQuery(activeWorkspace?.data?.id, {
      skip: !activeWorkspace?.data?.id,
    });
  const { data: webhooks, isLoading: isWebhooksLoading } =
    useGetWebhooksBySourceIdQuery(
      {
        workspaceId: activeWorkspace?.data?.id,
        id: ROC?.top_source_id,
      },
      {
        skip: !activeWorkspace?.data?.id || !ROC?.top_source_id,
      }
    );

  const isLoading = useMemo(
    () =>
      isWorkspaceLoading ||
      isRevenueLoading ||
      isRocLoading ||
      isCountLoading ||
      isQualifiedCountLoading ||
      isWebhooksLoading,
    [
      isWorkspaceLoading,
      isRevenueLoading,
      isRocLoading,
      isCountLoading,
      isQualifiedCountLoading,
      isWebhooksLoading,
    ]
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
      (ROC?.monthly_stats || []).map(
        (stat: { month: string; convertedLeads: number }) => ({
          month: stat.month,
          sales: stat.convertedLeads,
        })
      ),
    [ROC]
  );

  const containerClassName = useMemo(
    () =>
      `grid grid-rows-2 md:grid-rows-[25%_75%] gap-0 md:gap-2 transition-all duration-500 ease-in-out px-2 py-6 w-auto ${
        isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"
      } overflow-hidden`,
    [isCollapsed]
  );

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 h-[322px] md:h-auto">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <SkeletonCard key={index} />
            ))}
        </div>
        <SkeletonChart />
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 h-[322px] md:h-auto">
        {dashboardStats.map((stat, index) => (
          <Card
            key={index}
            className={`hover:shadow-md transition-shadow ${
              index === dashboardStats.length - 1
                ? "col-span-full sm:col-auto"
                : ""
            }`}
          >
            <CardContent className="p-4 sm:p-6 flex items-center justify-between space-x-4 sm:space-x-6">
              <div className="shrink-0">{stat.icon}</div>
              <div className="min-w-0 md:flex-grow">
                <p className="text-xs sm:text-sm text-muted-foreground truncate mb-1">
                  {stat.title}
                </p>
                <p
                  className="text-lg sm:text-xl font-semibold truncate cursor-pointer"
                  onClick={() => console.log("clicked")}
                >
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
});

export default SalesDashboard;
