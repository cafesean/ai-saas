"use client";

import type { EChartsOption, LineSeriesOption } from "echarts";
import { BaseChart, chartColors, withTheme } from "../charts/BaseChart";

export interface LineChartDataPoint {
  [key: string]: number | string;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  title?: string;
  description?: string;
  xKey: string;
  yKeys: string[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showReferenceLine?: boolean;
  referenceLineValue?: number;
  colors?: string[];
  loading?: boolean;
}

export function LineChart({
  data,
  title,
  description,
  xKey,
  yKeys,
  xLabel,
  yLabel,
  height = 300,
  className = "",
  showGrid = true,
  showLegend = true,
  showReferenceLine = false,
  referenceLineValue = 0,
  colors = chartColors.palette,
  loading = false,
}: LineChartProps) {
  // Prepare series data for ECharts
  const series: LineSeriesOption[] = yKeys.map((key, index) => ({
    name: key,
    type: "line",
    data: data.map(item => [item[xKey], item[key]]),
    smooth: true,
    symbol: "none",
    lineStyle: {
      width: 2,
      color: colors[index % colors.length],
    },
    emphasis: {
      focus: "series" as const,
    },
    ...(showReferenceLine && index === 0 ? {
      markLine: {
        data: [
          {
            yAxis: referenceLineValue,
            lineStyle: {
              color: chartColors.neutral,
              type: "dashed" as const,
            },
            label: {
              formatter: `Reference: ${referenceLineValue}`,
            },
          },
        ],
      }
    } : {})
  }));

  const option: EChartsOption = withTheme({
    xAxis: {
      type: "value",
      name: xLabel,
      nameLocation: "middle",
      nameGap: 30,
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: "hsl(var(--border))",
          type: "dashed",
        },
      },
    },
    yAxis: {
      type: "value", 
      name: yLabel,
      nameLocation: "middle",
      nameGap: 50,
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
        type: "cross",
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

// Specialized ROC Curve component
export function ROCChart({ 
  data, 
  title = "ROC Curve", 
  ...props 
}: Omit<LineChartProps, 'yKeys'> & { yKeys?: string[] }) {
  return (
    <LineChart
      {...props}
      data={data}
      title={title}
      xKey="fpr"
      yKeys={props.yKeys || ["tpr"]}
      xLabel="False Positive Rate"
      yLabel="True Positive Rate"
      showReferenceLine={true}
      referenceLineValue={0.5}
      colors={[chartColors.primary]}
    />
  );
}

// Specialized Calibration Curve component  
export function CalibrationChart({ 
  data, 
  title = "Calibration Curve", 
  ...props 
}: Omit<LineChartProps, 'yKeys'> & { yKeys?: string[] }) {
  return (
    <LineChart
      {...props}
      data={data}
      title={title}
      xKey="mean_predicted_value"
      yKeys={props.yKeys || ["fraction_of_positives"]}
      xLabel="Mean Predicted Value"
      yLabel="Fraction of Positives"
      showReferenceLine={true}
      referenceLineValue={0.5}
      colors={[chartColors.accent]}
    />
  );
} 