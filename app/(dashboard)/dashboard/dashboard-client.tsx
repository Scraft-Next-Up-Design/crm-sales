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
import { setActiveWorkspaceId } from "@/lib/store/slices/sideBar";
import { RootState } from "@/lib/store/store";
import { Award, IndianRupee, TrendingUp, UserPlus, Users } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Dynamically import heavy components for code splitting
const DashboardChart = lazy(
  () => import("@/components/dashboard/dashboard-chart")
);

// Prefetch critical data
export function prefetchDashboardData(workspaceId: string) {
  if (!workspaceId) return;

  // Prefetch API calls that will be needed
  fetch(
    `/api/workspace/workspace?action=getRevenueByWorkspace&workspaceId=${workspaceId}`
  );
  fetch(
    `/api/workspace/workspace?action=getTotalLeadsCount&workspaceId=${workspaceId}`
  );
  fetch(
    `/api/workspace/workspace?action=getQualifiedLeadsCount&workspaceId=${workspaceId}`
  );
  fetch(
    `/api/workspace/workspace?action=getArrivedLeadsCount&workspaceId=${workspaceId}`
  );
}

export default function DashboardClient() {
  const dispatch = useDispatch();
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );

  // Get the active workspace ID from Redux
  const reduxActiveWorkspaceId = useSelector(
    (state: RootState) => state.sidebar.activeWorkspaceId
  );

  // Track workspace changes
  const workspaceChangeCounter = useSelector(
    (state: RootState) => state.sidebar.workspaceChangeCounter
  );

  // Keep track of previous workspace change counter
  const prevWorkspaceChangeCounterRef = useRef(workspaceChangeCounter);

  // Use SWR-like pattern with stale-while-revalidate
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Step 1: Get active workspace with higher polling interval
  const {
    data: activeWorkspace,
    isLoading: isWorkspaceLoading,
    refetch: refetchActiveWorkspace,
  } = useGetActiveWorkspaceQuery(undefined, {
    pollingInterval: 300000, // Poll every 5 minutes
  });

  const workspaceId = activeWorkspace?.data?.id;

  // Update the active workspace ID in the sidebar state
  useEffect(() => {
    if (workspaceId && workspaceId !== reduxActiveWorkspaceId) {
      dispatch(setActiveWorkspaceId(workspaceId));
    }
  }, [workspaceId, reduxActiveWorkspaceId, dispatch]);

  // Listen for workspace changes in Redux and refetch data
  useEffect(() => {
    // Only run this effect if the workspace change counter has increased
    if (workspaceChangeCounter > prevWorkspaceChangeCounterRef.current) {
      prevWorkspaceChangeCounterRef.current = workspaceChangeCounter;

      console.log("Workspace changed in Redux, refetching data...");

      // Force refetch all data
      refetchActiveWorkspace();
    }
  }, [workspaceChangeCounter, refetchActiveWorkspace]);

  // Prefetch data when workspace ID is available
  useEffect(() => {
    if (workspaceId) {
      prefetchDashboardData(workspaceId);
    }
  }, [workspaceId]);

  // Step 2: Fetch all other data in parallel once workspaceId is available
  const {
    data: workspaceRevenue,
    isLoading: isRevenueLoading,
    refetch: refetchRevenue,
  } = useGetRevenueByWorkspaceQuery(workspaceId, {
    skip: !workspaceId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: ROC,
    isLoading: isRocLoading,
    refetch: refetchROC,
  } = useGetROCByWorkspaceQuery(workspaceId, {
    skip: !workspaceId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: qualifiedCount,
    isLoading: isQualifiedCountLoading,
    refetch: refetchQualifiedCount,
  } = useGetQualifiedCountQuery(workspaceId, {
    skip: !workspaceId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: workspaceCount,
    isLoading: isCountLoading,
    refetch: refetchCount,
  } = useGetCountByWorkspaceQuery(workspaceId, {
    skip: !workspaceId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: webhooks,
    isLoading: isWebhooksLoading,
    refetch: refetchWebhooks,
  } = useGetWebhooksBySourceIdQuery(
    {
      workspaceId: workspaceId,
      id: ROC?.top_source_id,
    },
    {
      skip: !workspaceId || !ROC?.top_source_id,
      refetchOnMountOrArgChange: true,
    }
  );

  // Refetch all data when workspace ID changes
  useEffect(() => {
    if (workspaceId) {
      refetchRevenue();
      refetchROC();
      refetchQualifiedCount();
      refetchCount();
      if (ROC?.top_source_id) {
        refetchWebhooks();
      }
    }
  }, [
    workspaceId,
    refetchRevenue,
    refetchROC,
    refetchQualifiedCount,
    refetchCount,
    refetchWebhooks,
    ROC?.top_source_id,
  ]);

  // Track when initial data is loaded
  useEffect(() => {
    if (!isWorkspaceLoading && workspaceId) {
      setIsInitialLoad(false);
    }
  }, [isWorkspaceLoading, workspaceId]);

  const { arrivedLeadsCount } = workspaceCount || { arrivedLeadsCount: 0 };
  const updatedRevenue = workspaceRevenue?.totalRevenue?.toFixed(2) || "0";
  const { monthly_stats } = ROC || { monthly_stats: [] };

  // For debugging
  useEffect(() => {
    console.log("Dashboard Data:", {
      workspaceId,
      reduxActiveWorkspaceId,
      workspaceChangeCounter,
      revenue: workspaceRevenue,
      ROC,
      qualifiedCount,
      workspaceCount,
      webhooks,
    });
  }, [
    workspaceId,
    reduxActiveWorkspaceId,
    workspaceChangeCounter,
    workspaceRevenue,
    ROC,
    qualifiedCount,
    workspaceCount,
    webhooks,
  ]);

  const dashboardStats = [
    {
      icon: <IndianRupee className="text-green-500" />,
      title: "Revenue",
      value: updatedRevenue,
      change: workspaceRevenue?.change || "+0%",
      isLoading: isRevenueLoading && !isInitialLoad,
    },
    {
      icon: <UserPlus className="text-orange-500" />,
      title: "Qualified Leads",
      value: qualifiedCount?.qualifiedLeadsCount || "0",
      isLoading: isQualifiedCountLoading && !isInitialLoad,
    },
    {
      icon: <Users className="text-blue-500" />,
      title: "New Leads",
      value: arrivedLeadsCount || 0,
      change: "+8.3%",
      isLoading: isCountLoading && !isInitialLoad,
    },
    {
      icon: <TrendingUp className="text-purple-500" />,
      title: "Conversion Rate",
      value: `${ROC?.conversion_rate || 0}%`,
      change: "+3.2%",
      isLoading: isRocLoading && !isInitialLoad,
    },
    {
      icon: <Award className="text-yellow-500" />,
      title: "Top Performing Sources",
      value: webhooks?.name || "None",
      change: "5 Deals",
      isLoading: isWebhooksLoading && !isInitialLoad,
    },
  ];

  const salesData =
    monthly_stats?.map((stat: { month: string; convertedLeads: number }) => ({
      month: stat.month,
      sales: stat.convertedLeads,
    })) || [];

  return (
    <div
      className={`grid grid-rows-2 md:grid-rows-[25%_75%] align-center gap-0 md:gap-2 transition-all duration-500 ease-in-out px-2 py-6 w-auto 
      ${isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"}
      overflow-hidden `}
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
                  <p
                    className="text-lg sm:text-xl font-semibold truncate cursor-pointer"
                    onClick={() => console.log("clicked")}
                  >
                    {stat.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Chart - Lazy loaded */}
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Monthly Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Suspense
            fallback={
              <div className="w-full h-[250px] sm:h-[300px] flex items-center justify-center">
                <Skeleton className="h-[200px] w-full rounded" />
              </div>
            }
          >
            <DashboardChart
              data={salesData}
              isLoading={isRocLoading && !isInitialLoad}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
