"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RootState } from "@/lib/store/store";
import { Award, IndianRupee, TrendingUp, UserPlus, Users } from "lucide-react";
import { memo, useMemo, Suspense, lazy } from "react";
import { useSelector } from "react-redux";
import useDashboardData from "@/hooks/api/useDashboardData";

// Dynamically import chart components for better code splitting
const ChartComponents = lazy(() => import("./components/ChartComponents"));

// Icon map for stat cards
const ICON_MAP = {
  revenue: <IndianRupee className="text-green-500" />,
  qualified: <UserPlus className="text-orange-500" />,
  'new-leads': <Users className="text-blue-500" />,
  conversion: <TrendingUp className="text-purple-500" />,
  award: <Award className="text-yellow-500" />,
};

// Memoized skeleton components with proper type definitions
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
SkeletonChart.displayName = "SkeletonChart";

// Properly typed interface for StatCard props
interface StatCardProps {
  stat: {
    id: string;
    icon: string;
    title: string;
    value: string | number;
    change?: string;
  };
  index: number;
  totalStats: number;
}

const StatCard = memo(({ stat, index, totalStats }: StatCardProps) => (
  <Card
    className={`hover:shadow-md transition-shadow ${
      index === totalStats - 1 ? "col-span-full sm:col-auto" : ""
    }`}
  >
    <CardContent className="p-4 sm:p-6 flex items-center justify-between space-x-4 sm:space-x-6">
      <div className="shrink-0">{ICON_MAP[stat.icon as keyof typeof ICON_MAP]}</div>
      <div className="min-w-0 md:flex-grow">
        <p className="text-xs sm:text-sm text-muted-foreground truncate mb-1">
          {stat.title}
        </p>
        <p className="text-lg sm:text-xl font-semibold truncate cursor-pointer">
          {stat.value}
        </p>
        {stat.change && (
          <p className="text-xs text-muted-foreground">{stat.change}</p>
        )}
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = "StatCard";

// Error component for better error handling
const ErrorDisplay = memo(() => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
    <h3 className="text-red-800 font-medium text-sm">Error loading dashboard data</h3>
    <p className="text-red-600 text-xs mt-1">
      Please check your connection and try again
    </p>
    <button 
      className="mt-2 bg-red-100 text-red-800 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
      onClick={() => window.location.reload()}
    >
      Refresh
    </button>
  </div>
));
ErrorDisplay.displayName = "ErrorDisplay";

// Dashboard component with optimized data fetching
const SalesDashboard = memo(() => {
  // Get sidebar collapsed state from Redux
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );

  // Use our optimized data hook
  const { 
    dashboardStats, 
    salesData, 
    isLoading, 
    isError,
    refetchAll 
  } = useDashboardData();

  // Memoized container class name
  const containerClassName = useMemo(
    () =>
      `grid grid-rows-2 md:grid-rows-[25%_75%] gap-0 md:gap-2 transition-all duration-500 ease-in-out px-2 py-6 w-auto ${
        isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"
      } overflow-hidden`,
    [isCollapsed]
  );

  // Memoized chart configuration for better performance
  const chartConfig = useMemo(() => ({
    margin: { top: 5, right: 5, bottom: 5, left: 0 }
  }), []);

  // Show error state if needed
  if (isError) {
    return (
      <div className={containerClassName}>
        <ErrorDisplay />
      </div>
    );
  }

  // Render optimized loading state
  if (isLoading) {
    return (
      <div className={containerClassName}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 h-[322px] md:h-auto">
          {Array.from({ length: 5 }, (_, index) => (
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
          <StatCard
            key={`stat-${stat.id}`} // More stable key with ID
            stat={stat}
            index={index}
            totalStats={dashboardStats.length}
          />
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
            <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse rounded" />}>
              <ChartComponents data={salesData} config={chartConfig} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SalesDashboard.displayName = "SalesDashboard";

export default SalesDashboard;
