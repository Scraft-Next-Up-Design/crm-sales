"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetLeadsByWorkspaceQuery } from "@/lib/store/services/leadsApi";
import {
  useGetActiveWorkspaceQuery,
  useGetCountByWorkspaceQuery,
  useGetRevenueByWorkspaceQuery,
  useGetROCByWorkspaceQuery,
  useGetWorkspaceDetailsAnalyticsQuery,
} from "@/lib/store/services/workspace";
import { RootState } from "@/lib/store/store";
import { IndianRupee, TrendingUp, Users } from "lucide-react";
import { memo, useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LeadMetrics {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  bySource: Array<{ source: string; count: number }>;
  monthlyGrowth: number;
}

interface AnalyticsData {
  leads: LeadMetrics;
  revenue: {
    total: number;
    monthlyGrowth: number;
  };
  chartData: Array<{
    month: string;
    leads: number;
    revenue: number;
    processedLeads: number;
    conversionRate: number;
  }>;
}

const CHART_COLORS = ["#0088FE", "#f1c232", "#38761d", "#FF8042"];

const SkeletonCard = memo(() => (
  <Card className="animate-pulse">
    <CardContent className="flex items-center justify-between p-5">
      <div>
        <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
        <div className="h-6 w-16 bg-gray-300 rounded" />
      </div>
      <div className="h-8 w-8 bg-gray-300 rounded-full" />
    </CardContent>
  </Card>
));
SkeletonCard.displayName = "SkeletonCard";

const SkeletonChartCard = memo(() => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="h-6 w-32 bg-gray-300 rounded" />
    </CardHeader>
    <CardContent>
      <div className="h-[300px] w-full bg-gray-300 rounded" />
    </CardContent>
  </Card>
));
SkeletonChartCard.displayName = "SkeletonChartCard";

const AdvancedAnalyticsDashboard = memo(() => {
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed,
    shallowEqual
  );

  const { data: activeWorkspace, isLoading: isLoadingWorkspace } =
    useGetActiveWorkspaceQuery();
  const workspaceId = activeWorkspace?.data?.id;
  const { data: analyticsDetails, isLoading: isLoadingAnalytics } =
    useGetRevenueByWorkspaceQuery(workspaceId, { skip: !workspaceId });
  const { data: totalLeads, isLoading: loadingTotalLeads } =
    useGetLeadsByWorkspaceQuery({ workspaceId }, { skip: !workspaceId });
  const { data: analyticsDatas, isLoading: isLoadingAnalyticsData } =
    useGetWorkspaceDetailsAnalyticsQuery(workspaceId, { skip: !workspaceId });
  const { data: ROC, isLoading: isRocLoading } = useGetROCByWorkspaceQuery(
    workspaceId,
    { skip: !workspaceId }
  );
  const { data: workspaceCount, isLoading: isCountLoading } =
    useGetCountByWorkspaceQuery(workspaceId, { skip: !workspaceId });

  const arrivedLeadsCount = useMemo(
    () => workspaceCount?.arrivedLeadsCount ?? 0,
    [workspaceCount]
  );
  const analyticsData = useMemo<AnalyticsData>(() => {
    const chartData = Array.isArray(ROC?.monthly_stats)
      ? ROC.monthly_stats.map(
          (stat: {
            month: string;
            totalLeads: number;
            conversionRate: string;
          }) => ({
            month: stat?.month?.split(" ")[0] ?? "Unknown",
            leads: stat?.totalLeads ?? 0,
            revenue: analyticsDetails?.totalRevenue ?? 0,
            processedLeads: (ROC?.total_leads ?? 0) - arrivedLeadsCount,
            conversionRate: parseFloat(
              stat?.conversionRate?.replace("%", "") ?? "0"
            ),
          })
        )
      : [];

    return {
      leads: {
        total: ROC?.total_leads ?? 0,
        monthlyGrowth: 12.5,
        byStatus: [
          { status: "Converted", count: ROC?.converted_leads ?? 0 },
          { status: "Arrived", count: arrivedLeadsCount },
          {
            status: "Processed",
            count: (ROC?.total_leads ?? 0) - arrivedLeadsCount,
          },
          { status: "Total Leads", count: ROC?.total_leads ?? 0 },
        ],
        bySource: Array.isArray(analyticsDatas)
          ? analyticsDatas.map((data) => ({
              source: data?.webhook_name ?? "Unknown",
              count: data?.lead_count ?? 0,
            }))
          : [],
      },
      revenue: {
        total: analyticsDetails?.totalRevenue ?? 0,
        monthlyGrowth: 8.3,
      },
      chartData,
    };
  }, [ROC, analyticsDetails, arrivedLeadsCount, analyticsDatas]);

  const isLoading = useMemo(
    () =>
      isLoadingWorkspace ||
      isLoadingAnalytics ||
      isRocLoading ||
      isLoadingAnalyticsData ||
      loadingTotalLeads ||
      isCountLoading,
    [
      isLoadingWorkspace,
      isLoadingAnalytics,
      isRocLoading,
      isLoadingAnalyticsData,
      loadingTotalLeads,
      isCountLoading,
    ]
  );

  const containerClassName = useMemo(
    () =>
      `transition-all duration-300 px-4 py-6 w-auto ${
        isCollapsed
          ? "lg:ml-[80px] md:ml-[80px]"
          : "lg:ml-[250px] md:ml-[250px]"
      }`,
    [isCollapsed]
  );

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <div className="h-8 w-48 bg-gray-300 rounded mb-6 animate-pulse" />
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <SkeletonCard key={i} />
            ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <SkeletonChartCard key={i} />
            ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <SkeletonChartCard key={i} />
            ))}
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className={containerClassName}>
        <p className="text-lg text-muted-foreground text-center">
          Please select a workspace to view analytics
        </p>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <h1 className="text-3xl font-bold mb-6">Sales Analytics</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{analyticsData.leads.total}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                ₹{analyticsData.revenue.total.toLocaleString("en-US")}
              </p>
            </div>
            <IndianRupee className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Growth Trend</p>
              <p className="text-2xl font-bold">Positive</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.leads.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {analyticsData.leads.byStatus.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.leads.bySource}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {analyticsData.leads.bySource.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads vs Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#8884d8" />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Processed Leads Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="processedLeads"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

AdvancedAnalyticsDashboard.displayName = "AdvancedAnalyticsDashboard";

export default AdvancedAnalyticsDashboard;
