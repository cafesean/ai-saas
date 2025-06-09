"use client";

import { ReactElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface BaseChartProps {
  title?: string;
  description?: string;
  option: EChartsOption;
  height?: number;
  className?: string;
  loading?: boolean;
}

export function BaseChart({
  title,
  description,
  option,
  height = 300,
  className = "",
  loading = false,
}: BaseChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ReactECharts
          option={option}
          style={{ height: `${height}px`, width: "100%" }}
          opts={{ renderer: "svg" }}
          showLoading={loading}
          theme="auto"
        />
      </CardContent>
    </Card>
  );
}

// Chart theme colors that match our UI design system
export const chartColors = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  muted: "hsl(var(--muted))",
  accent: "hsl(var(--accent))",
  destructive: "hsl(var(--destructive))",
  
  // Extended color palette for multiple data series
  palette: [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f97316", // orange-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
  ],
  
  // Semantic colors for specific use cases
  positive: "#10b981", // emerald-500
  negative: "#ef4444", // red-500
  neutral: "#6b7280", // gray-500
  warning: "#f59e0b", // amber-500
};

// Default ECharts theme configuration
export const getDefaultChartTheme = (): Partial<EChartsOption> => ({
  backgroundColor: "transparent",
  textStyle: {
    fontFamily: "inherit",
    color: "hsl(var(--foreground))",
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  tooltip: {
    backgroundColor: "hsl(var(--popover))",
    borderColor: "hsl(var(--border))",
    borderWidth: 1,
    textStyle: {
      color: "hsl(var(--popover-foreground))",
    },
  },
  legend: {
    textStyle: {
      color: "hsl(var(--foreground))",
    },
  },
});

// Utility function to merge theme with chart options
export const withTheme = (option: EChartsOption): EChartsOption => {
  const theme = getDefaultChartTheme();
  return {
    ...theme,
    ...option,
    textStyle: {
      ...theme.textStyle,
      ...option.textStyle,
    },
    tooltip: {
      ...theme.tooltip,
      ...option.tooltip,
    },
    legend: {
      ...theme.legend,
      ...option.legend,
    },
    grid: {
      ...theme.grid,
      ...option.grid,
    },
  };
}; 