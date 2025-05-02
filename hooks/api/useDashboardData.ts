import { useCallback, useMemo } from 'react';
import {
  useGetActiveWorkspaceQuery,
  useGetCountByWorkspaceQuery,
  useGetQualifiedCountQuery,
  useGetRevenueByWorkspaceQuery,
  useGetROCByWorkspaceQuery,
} from "@/lib/store/services/workspace";
import { useGetWebhooksBySourceIdQuery } from "@/lib/store/services/webhooks";

/**
 * Custom hook to optimize dashboard data fetching
 * - Centralizes data fetching logic
 * - Handles loading states
 * - Implements proper skip conditions
 * - Returns processed data ready for display
 */
export const useDashboardData = () => {
  // Get active workspace first
  const { 
    data: activeWorkspace, 
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
    refetch: refetchWorkspace
  } = useGetActiveWorkspaceQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  const workspaceId = activeWorkspace?.data?.id;

  // Only fetch workspace data when workspace ID is available
  const { 
    data: workspaceRevenue, 
    isLoading: isRevenueLoading,
    isError: isRevenueError
  } = useGetRevenueByWorkspaceQuery(workspaceId ?? "", {
    skip: !workspaceId,
    refetchOnMountOrArgChange: false,
  });

  const { 
    data: ROC, 
    isLoading: isRocLoading,
    isError: isRocError
  } = useGetROCByWorkspaceQuery(workspaceId ?? "", { 
    skip: !workspaceId,
    refetchOnMountOrArgChange: false,
  });

  const { 
    data: qualifiedCount, 
    isLoading: isQualifiedCountLoading,
    isError: isQualifiedError
  } = useGetQualifiedCountQuery(workspaceId ?? "", {
    skip: !workspaceId,
    refetchOnMountOrArgChange: false,
  });

  const { 
    data: workspaceCount, 
    isLoading: isCountLoading,
    isError: isCountError
  } = useGetCountByWorkspaceQuery(workspaceId ?? "", {
    skip: !workspaceId,
    refetchOnMountOrArgChange: false,
  });

  // Only fetch webhooks when we have the source ID
  const { 
    data: webhooks, 
    isLoading: isWebhooksLoading,
    isError: isWebhooksError
  } = useGetWebhooksBySourceIdQuery(
    { 
      workspaceId: workspaceId ?? "", 
      id: ROC?.top_source_id ?? "" 
    },
    { 
      skip: !workspaceId || !ROC?.top_source_id,
      refetchOnMountOrArgChange: false, 
    }
  );

  // Calculate overall loading and error states
  const isLoading = useMemo(
    () =>
      isWorkspaceLoading ||
      (workspaceId &&
        (isRevenueLoading ||
          isRocLoading ||
          isCountLoading ||
          isQualifiedCountLoading ||
          isWebhooksLoading)),
    [
      isWorkspaceLoading,
      workspaceId,
      isRevenueLoading,
      isRocLoading,
      isCountLoading,
      isQualifiedCountLoading,
      isWebhooksLoading,
    ]
  );

  const isError = useMemo(
    () =>
      isWorkspaceError ||
      isRevenueError ||
      isRocError ||
      isQualifiedError ||
      isCountError ||
      isWebhooksError,
    [
      isWorkspaceError,
      isRevenueError,
      isRocError,
      isQualifiedError,
      isCountError,
      isWebhooksError,
    ]
  );

  // Refetch all data
  const refetchAll = useCallback(() => {
    if (workspaceId) {
      refetchWorkspace();
    }
  }, [workspaceId, refetchWorkspace]);

  // Process and format the data for display
  const dashboardStats = useMemo(
    () => {
      if (!workspaceId || isLoading || isError) {
        return [];
      }
      
      return [
        {
          id: 'revenue',
          title: "Revenue",
          value: workspaceRevenue?.totalRevenue?.toFixed(2) || "0",
          change: workspaceRevenue?.change || "+0%",
          icon: 'revenue',
        },
        {
          id: 'qualified-leads',
          title: "Qualified Leads",
          value: qualifiedCount?.qualifiedLeadsCount || "0",
          icon: 'qualified',
        },
        {
          id: 'new-leads',
          title: "New Leads",
          value: workspaceCount?.arrivedLeadsCount || 0,
          change: "+8.3%",
          icon: 'new-leads',
        },
        {
          id: 'conversion-rate',
          title: "Conversion Rate",
          value: `${ROC?.conversion_rate || 0}%`,
          change: "+3.2%",
          icon: 'conversion',
        },
        {
          id: 'top-sources',
          title: "Top Performing Sources",
          value: webhooks?.name || "N/A",
          change: "5 Deals",
          icon: 'award',
        },
      ];
    },
    [
      workspaceId,
      isLoading,
      isError,
      workspaceRevenue,
      qualifiedCount,
      workspaceCount,
      ROC,
      webhooks,
    ]
  );

  // Process chart data
  const salesData = useMemo(
    () => {
      if (!ROC?.monthly_stats || !Array.isArray(ROC.monthly_stats)) {
        return [];
      }
      
      return ROC.monthly_stats.map(({ month, convertedLeads }: any) => ({
        month,
        sales: convertedLeads,
      }));
    },
    [ROC]
  );

  return {
    // Data
    workspaceId,
    dashboardStats,
    salesData,
    
    // Status
    isLoading,
    isError,
    error: workspaceError,
    
    // Actions
    refetchAll,
  };
};

export default useDashboardData;
