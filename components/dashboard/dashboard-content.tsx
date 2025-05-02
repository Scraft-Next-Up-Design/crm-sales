"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWebhooksBySourceIdQuery } from "@/lib/store/services/webhooks";
import {
  useGetActiveWorkspaceQuery,
  useGetCountByWorkspaceQuery,
  useGetQualifiedCountQuery,
  useGetRevenueByWorkspaceQuery,
  useGetROCByWorkspaceQuery,
} from "@/lib/store/services/workspace";
import { RootState } from "@/lib/store/store";
import { Award, IndianRupee, TrendingUp, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardStat {
  icon: JSX.Element;
  title: string;
  value: string | number;
  change?: string;
  isLoading: boolean;
}

interface MonthlyStat {
  month: string;
  convertedLeads: number;
}

interface SalesData {
  month: string;
  sales: number;
}

const POLLING_INTERVAL = 30000;

// Loading state component for individual cards
function StatCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6 flex items-center justify-between space-x-4 sm:space-x-6">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="min-w-0 md:flex-grow">
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardContent() {
  const router = useRouter();
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );

  const { data: activeWorkspace, error: workspaceError } =
    useGetActiveWorkspaceQuery(undefined, {
      pollingInterval: POLLING_INTERVAL,
    });

  const workspaceId = activeWorkspace?.data?.id;

  const {
    data: workspaceRevenue,
    error: revenueError,
    isLoading: isRevenueLoading,
  } = useGetRevenueByWorkspaceQuery(workspaceId, {
    skip: !workspaceId,
    pollingInterval: POLLING_INTERVAL,
  });

  const {
    data: ROC,
    error: rocError,
    isLoading: isROCLoading,
  } = useGetROCByWorkspaceQuery(workspaceId, {
    skip: !workspaceId,
    pollingInterval: POLLING_INTERVAL,
  });

  const {
    data: qualifiedCount,
    error: qualifiedError,
    isLoading: isQualifiedLoading,
  } = useGetQualifiedCountQuery(workspaceId, {
    skip: !workspaceId,
    pollingInterval: POLLING_INTERVAL,
  });

  const {
    data: workspaceCount,
    error: countError,
    isLoading: isCountLoading,
  } = useGetCountByWorkspaceQuery(workspaceId, {
    skip: !workspaceId,
    pollingInterval: POLLING_INTERVAL,
  });

  const {
    data: webhooks,
    error: webhooksError,
    isLoading: isWebhooksLoading,
  } = useGetWebhooksBySourceIdQuery(
    {
      workspaceId,
      id: ROC?.top_source_id,
    },
    {
      skip: !workspaceId || !ROC?.top_source_id,
      pollingInterval: POLLING_INTERVAL,
    }
  );

  // Handle workspace changes without full page reload
  useEffect(() => {
    if (workspaceId) {
      router.refresh();
    }
  }, [workspaceId, router]);

  // Memoize dashboard stats to prevent unnecessary recalculations
  const dashboardStats = useMemo(() => {
    const { arrivedLeadsCount = 0 } = workspaceCount || {};
    const updatedRevenue = workspaceRevenue?.totalRevenue?.toFixed(2) || "0";
    const { monthly_stats = [] } = ROC || {};

    return [
      {
        icon: <IndianRupee className="text-green-500" />,
        title: "Revenue",
        value: updatedRevenue,
        change: workspaceRevenue?.change || "+0%",
        isLoading: isRevenueLoading,
      },
      {
        icon: <UserPlus className="text-orange-500" />,
        title: "Qualified Leads",
        value: qualifiedCount?.qualifiedLeadsCount || "0",
        isLoading: isQualifiedLoading,
      },
      {
        icon: <Users className="text-blue-500" />,
        title: "New Leads",
        value: arrivedLeadsCount,
        change: "+8.3%",
        isLoading: isCountLoading,
      },
      {
        icon: <TrendingUp className="text-purple-500" />,
        title: "Conversion Rate",
        value: `${ROC?.conversion_rate || 0}%`,
        change: "+3.2%",
        isLoading: isROCLoading,
      },
      {
        icon: <Award className="text-yellow-500" />,
        title: "Top Performing Sources",
        value: webhooks?.name || "N/A",
        change: "5 Deals",
        isLoading: isWebhooksLoading,
      },
    ];
  }, [
    workspaceCount,
    workspaceRevenue,
    ROC,
    qualifiedCount,
    webhooks,
    isRevenueLoading,
    isQualifiedLoading,
    isCountLoading,
    isROCLoading,
    isWebhooksLoading,
  ]);

  // Memoize sales data for the chart
  const salesData = useMemo(() => {
    const { monthly_stats = [] } = ROC || {};
    return monthly_stats.map((stat: MonthlyStat) => ({
      month: stat.month,
      sales: stat.convertedLeads,
    }));
  }, [ROC]);

  // Check for any errors
  const hasError =
    workspaceError ||
    revenueError ||
    rocError ||
    qualifiedError ||
    countError ||
    webhooksError;
  const isLoading =
    isRevenueLoading ||
    isROCLoading ||
    isQualifiedLoading ||
    isCountLoading ||
    isWebhooksLoading;

  // Check if we have all required data
  const hasAllData = useMemo(() => {
    return Boolean(
      workspaceRevenue && ROC && qualifiedCount && workspaceCount && webhooks
    );
  }, [workspaceRevenue, ROC, qualifiedCount, workspaceCount, webhooks]);

  // Show loading state if we're loading or don't have all data yet
  const showLoading = isLoading || !hasAllData;

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-rows-2 md:grid-rows-[25%_75%] align-center gap-0 md:gap-2 transition-all duration-500 ease-in-out px-2 py-6 w-auto 
      ${isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"}
      overflow-hidden`}
    >
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
                {stat.isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <>
                    <p className="text-lg sm:text-xl font-semibold truncate">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p className="text-xs text-green-500">{stat.change}</p>
                    )}
                  </>
                )}
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
            {isROCLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
