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
import { useGetActiveWorkspaceQuery, useGetRevenueByWorkspaceQuery } from "@/lib/store/services/workspace";

const salesData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 5500 },
];

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
  console.log(activeWorkspace)

  const isLoading = isWorkspaceLoading || isRevenueLoading;
  console.log(workspaceRevenue)
  const dashboardStats = [
    {
      icon: <IndianRupee className="text-green-500" />,
      title: "Revenue",
      value: workspaceRevenue?.totalRevenue
        || "0",
      change: workspaceRevenue?.change || "+0%",
    },
    {
      icon: <Users className="text-blue-500" />,
      title: "New Leads",
      value: "42",
      change: "+8.3%",
    },
    {
      icon: <TrendingUp className="text-purple-500" />,
      title: "Conversion Rate",
      value: "24.7%",
      change: "+3.2%",
    },
    {
      icon: <Award className="text-yellow-500" />,
      title: "Top Performer",
      value: "Sarah J.",
      change: "5 Deals",
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
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
                <p className="text-lg sm:text-xl font-semibold truncate">
                  {stat.value}
                </p>
                <p
                  className={`text-xs ${stat.change.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {stat.change}
                </p>
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