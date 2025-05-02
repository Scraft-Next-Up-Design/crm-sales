'use client';

import { memo } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Type definitions for better code safety
interface SalesDataPoint {
  month: string;
  sales: number;
}

interface ChartConfig {
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface ChartComponentsProps {
  data: SalesDataPoint[];
  config: ChartConfig;
}

// Custom tooltip for better UX
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="text-sm font-medium">{`${label}`}</p>
        <p className="text-sm text-blue-600">{`Sales: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = 'CustomTooltip';

// Memoized chart component to prevent unnecessary re-renders
const ChartComponents = memo(({ data, config }: ChartComponentsProps) => {
  // If data is empty, show a placeholder
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={config.margin}
      >
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#f0f0f0' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#f0f0f0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="sales" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
          // Add animation properties for performance improvement
          animationDuration={500}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

ChartComponents.displayName = 'ChartComponents';

export default ChartComponents;
