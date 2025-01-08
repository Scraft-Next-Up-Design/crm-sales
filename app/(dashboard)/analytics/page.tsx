'use client';

import React from 'react';
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
  ResponsiveContainer 
} from 'recharts';
import { 
  CircleUser, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data interfaces
interface AnalyticsData {
  leads: {
    total: number;
    monthlyGrowth: number;
  };
  revenue: {
    total: number;
    monthlyGrowth: number;
  };
  conversions: {
    rate: number;
    trend: 'up' | 'down';
  };
  chartData: Array<{
    name: string;
    leads: number;
    revenue: number;
  }>;
}

export default function AnalyticsDashboard() {

  
  // Mock Analytics Data - Replace with actual data fetching
  const analyticsData: AnalyticsData = {
    leads: {
      total: 1245,
      monthlyGrowth: 12.5
    },
    revenue: {
      total: 156000,
      monthlyGrowth: 8.3
    },
    conversions: {
      rate: 24.5,
      trend: 'up'
    },
    chartData: [
      { name: 'Jan', leads: 400, revenue: 24000 },
      { name: 'Feb', leads: 300, revenue: 29000 },
      { name: 'Mar', leads: 500, revenue: 35000 },
      { name: 'Apr', leads: 450, revenue: 32000 },
      { name: 'May', leads: 600, revenue: 40000 },
      { name: 'Jun', leads: 550, revenue: 38000 }
    ]
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Total Leads */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{analyticsData.leads.total}</p>
              <Badge 
                variant={analyticsData.leads.monthlyGrowth > 0 ? 'default' : 'destructive'}
                className="mt-2"
              >
                {analyticsData.leads.monthlyGrowth}% this month
              </Badge>
            </div>
            <CircleUser className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${analyticsData.revenue.total.toLocaleString()}
              </p>
              <Badge 
                variant={analyticsData.revenue.monthlyGrowth > 0 ? 'default' : 'destructive'}
                className="mt-2"
              >
                {analyticsData.revenue.monthlyGrowth}% this month
              </Badge>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{analyticsData.conversions.rate}%</p>
              <Badge 
                variant={analyticsData.conversions.trend === 'up' ? 'default' : 'destructive'}
                className="mt-2"
              >
                {analyticsData.conversions.trend === 'up' ? 'Increasing' : 'Decreasing'}
              </Badge>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Leads Activity */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Active Leads</p>
              <p className="text-2xl font-bold">892</p>
              <Badge variant="outline" className="mt-2">
        				Last 30 days
              </Badge>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Leads Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#82ca9d" 
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