"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Award, DollarSign, Users, TrendingUp } from "lucide-react";

// Demo data
const salesData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 5500 },
];

const leadsData = [
  {
    id: 1,
    name: "Acme Corp",
    status: "Qualified",
    value: "$50,000",
    owner: "Sarah Johnson",
  },
  {
    id: 2,
    name: "Tech Innovations",
    status: "Negotiation",
    value: "$75,000",
    owner: "Mike Chen",
  },
  {
    id: 3,
    name: "Global Solutions",
    status: "Proposal",
    value: "$35,000",
    owner: "Emma Rodriguez",
  },
];

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const dashboardStats = [
    {
      icon: <DollarSign className="text-green-500" />,
      title: "Total Revenue",
      value: "$456,789",
      change: "+12.5%",
    },
    {
      icon: <Users className="text-blue-500" />,
      title: "New Clients",
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

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Sales CRM Dashboard
      </h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center space-x-4">
              {stat.icon}
              <div>
                <p className="text-sm text-muted-foreground truncate">
                  {stat.title}
                </p>
                <p className="text-xl font-semibold truncate">{stat.value}</p>
                <p
                  className={`text-xs ${
                    stat.change.startsWith("+")
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
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Company</TableHead>
                  <TableHead className="w-1/4">Status</TableHead>
                  <TableHead className="w-1/4">Value</TableHead>
                  <TableHead className="w-1/4">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsData.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="truncate">{lead.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs inline-block 
                          ${
                            lead.status === "Qualified"
                              ? "bg-green-100 text-green-800"
                              : lead.status === "Negotiation"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {lead.status}
                      </span>
                    </TableCell>
                    <TableCell>{lead.value}</TableCell>
                    <TableCell className="truncate">{lead.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDashboard;
