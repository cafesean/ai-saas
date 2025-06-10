"use client";

import type { EChartsOption, BarSeriesOption } from "echarts";
import { BaseChart, chartColors, withTheme } from "../charts/BaseChart";

export interface BarChartDataPoint {
  [key: string]: number | string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  description?: string;
  xKey: string;
  yKey: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  orientation?: "horizontal" | "vertical";
  color?: string;
  loading?: boolean;
}

export function BarChart({
  data,
  title,
  description,
  xKey,
  yKey,
  xLabel,
  yLabel,
  height = 300,
  className = "",
  showGrid = true,
  showLegend = false,
  orientation = "vertical",
  color = chartColors.primary,
  loading = false,
}: BarChartProps) {
  const isHorizontal = orientation === "horizontal";
  
  // Prepare series data for ECharts
  const series: BarSeriesOption[] = [{
    name: yKey,
    type: "bar",
    data: data.map(item => isHorizontal ? [item[yKey], item[xKey]] : [item[xKey], item[yKey]]),
    itemStyle: {
      color: color,
    },
    emphasis: {
      focus: "series" as const,
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: "rgba(0, 0, 0, 0.5)",
      },
    },
  }];

  const option: EChartsOption = withTheme({
    xAxis: {
      type: isHorizontal ? "value" : "category",
      name: isHorizontal ? yLabel : xLabel,
      nameLocation: "middle",
      nameGap: 30,
      data: isHorizontal ? undefined : data.map(item => String(item[xKey])),
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: "hsl(var(--border))",
          type: "dashed",
        },
      },
      axisLabel: {
        interval: 0,
        rotate: isHorizontal ? 0 : 45,
      },
    },
    yAxis: {
      type: isHorizontal ? "category" : "value",
      name: isHorizontal ? xLabel : yLabel,
      nameLocation: "middle",
      nameGap: 50,
      data: isHorizontal ? data.map(item => String(item[xKey])) : undefined,
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: "hsl(var(--border))",
          type: "dashed",
        },
      },
    },
    series,
    legend: {
      show: showLegend,
      top: "top",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
  });

  return (
    <BaseChart
      title={title}
      description={description}
      option={option}
      height={height}
      className={className}
      loading={loading}
    />
  );
}

// Specialized Feature Importance component
export function FeatureImportanceChart({ 
  data, 
  title = "Feature Importance", 
  ...props 
}: Omit<BarChartProps, 'xKey' | 'yKey'> & { xKey?: string; yKey?: string }) {
  return (
    <BarChart
      {...props}
      data={data}
      title={title}
      xKey={props.xKey || "feature"}
      yKey={props.yKey || "importance"}
      xLabel="Features"
      yLabel="Importance"
      orientation="horizontal"
      color={chartColors.accent}
      height={Math.max(300, data.length * 25)} // Dynamic height based on number of features
    />
  );
} 