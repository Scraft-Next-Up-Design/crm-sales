"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Award, Users, TrendingUp, IndianRupee, Loader2 } from "lucide-react";
import { useGetActiveWorkspaceQuery, useGetCountByWorkspaceQuery, useGetQualifiedCountQuery, useGetRevenueByWorkspaceQuery, useGetROCByWorkspaceQuery } from "@/lib/store/services/workspace";
import { useGetWebhooksBySourceIdQuery } from "@/lib/store/services/webhooks";
import { UserPlus } from "lucide-react";
interface Workspace {
  id: string;
  name: string;
  role: string;
  industry?: string;
  status?: boolean;
  type?: string;
}

const SalesDashboard = () => {

  const { data: activeWorkspace, isLoading: isWorkspaceLoading } = useGetActiveWorkspaceQuery();
  const { data: workspaceRevenue, isLoading: isRevenueLoading } = useGetRevenueByWorkspaceQuery(
    activeWorkspace?.data?.id,
    {
      skip: !activeWorkspace?.data?.id
      ,
    }
  );
  const { data: ROC, isLoading: isRocLoading } = useGetROCByWorkspaceQuery(
    activeWorkspace?.data?.id,
    {
      skip: !activeWorkspace?.data?.id
      ,
    }
  );
  const { data: qualifiedCount, isLoading: isQualifiedCountLoading } = useGetQualifiedCountQuery(
    activeWorkspace?.data?.id,
    { skip: !activeWorkspace?.data?.id }
  );
  const { data: workspaceCount, isLoading: isCountLoading } = useGetCountByWorkspaceQuery(
    activeWorkspace?.data?.id,
    { skip: !activeWorkspace?.data?.id }
  );
  const { data: webhooks } = useGetWebhooksBySourceIdQuery(
    {
      workspaceId: activeWorkspace?.data?.id,
      id: ROC?.top_source_id // Using the top source ID from ROC data
    },
    {
      skip: !activeWorkspace?.data?.id || !ROC?.top_source_id,
    }
  );
  console.log(qualifiedCount)
  const { arrivedLeadsCount
  } = workspaceCount || 0;
  const isLoading = isWorkspaceLoading || isRevenueLoading;
  const updatedRevenue = workspaceRevenue?.totalRevenue.toFixed(2);
  const { monthly_stats
  } = ROC || 0;

  const dashboardStats = [
    {
      icon: <IndianRupee className="text-green-500" />,
      title: "Revenue",
      value: updatedRevenue
        || "0",
      change: workspaceRevenue?.change || "+0%",
    },
    {
      icon: <UserPlus className="text-orange-500" />,
      title: "Qualified Leads",
      value: qualifiedCount?.qualifiedLeadsCount
        || "0",
      // change: workspaceRevenue?.change || "+0%",
    },
    {
      icon: <Users className="text-blue-500" />,
      title: "New Leads",
      value: arrivedLeadsCount || 0,
      change: "+8.3%",
    },
    {
      icon: <TrendingUp className="text-purple-500" />,
      title: "Conversion Rate",
      value: `${ROC?.conversion_rate}%`
        || "0",
      change: "+3.2%",
    },
    {
      icon: <Award className="text-yellow-500" />,
      title: "Top Performing Sources",
      value: webhooks?.name,
      change: "5 Deals",
    },
  ];
  const salesData = monthly_stats?.map((stat: { month: string; convertedLeads: number }) => ({
    month: stat.month,
    sales: stat.convertedLeads,
  })) || [];

  if (isLoading || isCountLoading || isRevenueLoading || isRocLoading || isWorkspaceLoading || isQualifiedCountLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-6 flex items-center space-x-2 sm:space-x-4">
              <div className="shrink-0">
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {stat.title}
                </p>
                <p className="text-lg sm:text-xl font-semibold truncate cursor-pointer" onClick={() => console.log("clicked")}>
                  {stat.value}
                </p>
                {/* <p
                  className={`text-xs ${stat.change.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {stat.change}
                </p> */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Chart */}
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Monthly Sales Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
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
};

export default SalesDashboard;