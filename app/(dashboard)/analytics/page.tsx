'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  Users,
  TrendingUp,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useGetActiveWorkspaceQuery, useGetRevenueByWorkspaceQuery, useGetROCByWorkspaceQuery, useGetCountByWorkspaceQuery } from '@/lib/store/services/workspace';
import { useGetLeadsByWorkspaceQuery } from "@/lib/store/services/leadsApi";

// Enhanced TypeScript Interfaces
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

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdvancedAnalyticsDashboard() {
  const isCollapsed = useSelector((state: RootState) => state.sidebar.isCollapsed);
  const { data: activeWorkspace, isLoading: isLoadingWorkspace } = useGetActiveWorkspaceQuery();
  const { data: analyticsDetails, isLoading: isLoadingAnalytics } = useGetRevenueByWorkspaceQuery(
    activeWorkspace?.data?.id,
    { skip: !activeWorkspace?.data?.id }
  );
  const { data: totalLeads, isLoading: loadingTotalLeads }: any = useGetLeadsByWorkspaceQuery(
    { workspaceId: activeWorkspace?.data?.id },
    { skip: !activeWorkspace?.data?.id }
  );
  const { data: ROC, isLoading: isRocLoading } = useGetROCByWorkspaceQuery(
    activeWorkspace?.data?.id,
    {
      skip: !activeWorkspace?.data?.id,
    }
  );
  const { data: workspaceCount, isLoading: isCountLoading } = useGetCountByWorkspaceQuery(
    activeWorkspace?.data?.id,
    { skip: !activeWorkspace?.data?.id }
  );
  const { arrivedLeadsCount } = workspaceCount || 0;

  console.log(ROC);
  const analyticsData: any = useMemo(() => ({
    leads: {
      total: ROC?.total_leads ?? 0,
      monthlyGrowth: 12.5,
      byStatus: [
        { status: 'Converted', count: ROC?.converted_leads ?? 0 },
        { status: 'Arrived', count: arrivedLeadsCount },
        { status: 'Processed', count: ROC?.total_leads - arrivedLeadsCount },
        { status: 'Total Leads', count: ROC?.total_leads }
      ],
      bySource: [
        { source: 'Website', count: 500 },
        { source: 'Referral', count: 300 },
        { source: 'Social Media', count: 250 },
        { source: 'Direct', count: 195 }
      ]
    },
    revenue: {
      total: analyticsDetails?.totalRevenue || 0,
      monthlyGrowth: 8.3
    },
    chartData: ROC?.monthly_stats?.map((stat: { month: string; totalLeads: number; conversionRate: string }) => ({
      month: stat.month.split(" ")[0], // Extract month name from "January 2025"
      leads: stat.totalLeads,
      revenue: 0, // Assuming revenue data is unavailable in ROC
      processedLeads: stat.totalLeads, // Assuming all leads are processed
      conversionRate: parseFloat(stat.conversionRate.replace('%', '')) // Convert "41.18%" to 41.18
    })) || []
  }), [ROC, analyticsDetails, arrivedLeadsCount]);

  if (isLoadingAnalytics || isLoadingWorkspace) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div
      className={`transition-all duration-300 px-4 py-6 
      ${isCollapsed ? "lg:ml-[80px] md:ml-[80px]" : "lg:ml-[250px] md:ml-[250px]"} w-auto`}
    >

      <h1 className="text-3xl font-bold mb-6">Sales Analytics</h1>

      {/* Performance Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Total Leads */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{analyticsData.leads.total}</p>
              <Badge
                variant={analyticsData.leads.monthlyGrowth > 0 ? 'default' : 'destructive'}
                className="mt-2"
              >
                {analyticsData.leads.monthlyGrowth}% Growth
              </Badge>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                ₹{analyticsData.revenue.total.toLocaleString('en-US')}
              </p>
              <Badge
                variant={analyticsData.revenue.monthlyGrowth > 0 ? 'default' : 'destructive'}
                className="mt-2"
              >
                {analyticsData.revenue.monthlyGrowth}% Growth
              </Badge>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Growth Trend */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Growth Trend</p>
              <p className="text-2xl font-bold">Positive</p>
              <Badge variant="outline" className="mt-2">
                Consistent Performance
              </Badge>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Advanced Visualizations */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Leads by Status */}
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
                  {analyticsData.leads.byStatus.map((entry: { status: string; count: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
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

        {/* Leads by Source */}
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
                  {analyticsData.leads.bySource.map((entry: { source: string; count: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Graphs */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Leads and Revenue Comparison */}
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

        {/* Processed Leads */}
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
}