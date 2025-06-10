"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ROCChart, CalibrationChart } from './LineCharts';
import { FeatureImportanceChart } from './BarCharts';
import { LineChart } from './LineCharts';
import { BarChart } from './BarCharts';

// Updated interface to match real model metadata structure
export interface ChartMetadata {
  name: string;
  type: 'line_chart' | 'bar_chart' | 'matrix' | 'scalar';
  x_axis?: string;
  y_axis?: string;
  data?: any[];
  labels?: string[];  // For matrix type
  matrix?: number[][]; // For matrix type  
  value?: number;     // For scalar type
}

// Data transformation utilities for different chart types
const transformDataForChart = (metadata: ChartMetadata): any => {
  // Guard against undefined metadata
  if (!metadata) {
    console.warn('transformDataForChart called with undefined metadata');
    return { data: [] };
  }
  
  const { name, type, data, x_axis, y_axis } = metadata;
  
  if (type === 'scalar') {
    return { value: metadata.value };
  }
  
  if (type === 'matrix') {
    return {
      labels: metadata.labels,
      matrix: metadata.matrix
    };
  }
  
  if (!data || !Array.isArray(data)) {
    return { data: [] };
  }

  // Handle specialized chart data mappings based on chart name
  switch (name.toLowerCase()) {
    case 'roc curve':
      return {
        data: data.map((point: any) => ({
          x: point.fpr || 0,
          y: point.tpr || 0
        }))
      };
      
    case 'calibration curve':
      return {
        data: data.map((point: any) => ({
          x: point.mean_pred || 0,
          y: point.obs_rate || 0
        }))
      };
      
    case 'lift chart':
      return {
        data: data.map((point: any) => ({
          category: point.decile?.toString() || '',
          value: point.lift || 0
        }))
      };
      
    case 'k-s curve':
      return {
        data: data.map((point: any) => ({
          x: point.threshold || 0,
          y: point.ks || 0
        }))
      };
      
    case 'precision vs threshold':
      return {
        data: data.map((point: any) => ({
          x: point.threshold || 0,
          y: point.precision || 0
        }))
      };
      
    case 'recall vs threshold':
      return {
        data: data.map((point: any) => ({
          x: point.threshold || 0,
          y: point.recall || 0
        }))
      };
      
    default:
      // Generic fallback: try to infer keys from data structure or use first two numeric properties
      const samplePoint = data[0];
      if (!samplePoint) return { data: [] };
      
      const keys = Object.keys(samplePoint);
      const numericKeys = keys.filter(key => typeof samplePoint[key] === 'number');
      
      if (numericKeys.length >= 2) {
        const [xKey, yKey] = numericKeys;
        if (xKey && yKey) {
          return {
            data: data.map((point: any) => ({
              x: point[xKey] || 0,
              y: point[yKey] || 0
            }))
          };
        }
      }
      
      // For bar charts, try to find category/value pattern
      if (type === 'bar_chart') {
        const categoryKey = keys.find(key => typeof samplePoint[key] === 'string') || keys[0];
        const valueKey = numericKeys[0] || keys[1];
        
        if (categoryKey && valueKey) {
          return {
            data: data.map((point: any) => ({
              category: point[categoryKey]?.toString() || '',
              value: point[valueKey] || 0
            }))
          };
        }
      }
      
      return { data: [] };
  }
};

// Scalar metric display component
const ScalarMetric: React.FC<{ metadata: ChartMetadata }> = ({ metadata }) => {
  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-muted-foreground">Invalid metric data</span>
      </div>
    );
  }
  
  const { value } = transformDataForChart(metadata);
  
  return (
    <div className="flex flex-col items-center justify-center h-32">
      <div className="text-3xl font-bold text-primary mb-2">
        {typeof value === 'number' ? value.toFixed(4) : 'N/A'}
      </div>
      <div className="text-sm text-muted-foreground text-center">
        {metadata.name}
      </div>
    </div>
  );
};

// Matrix/Confusion Matrix display component
const MatrixChart: React.FC<{ metadata: ChartMetadata }> = ({ metadata }) => {
  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-muted-foreground">Invalid matrix data</span>
      </div>
    );
  }
  
  const { labels, matrix } = transformDataForChart(metadata);
  
  if (!matrix || !Array.isArray(matrix)) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-muted-foreground">No matrix data available</span>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrix[0]?.length || 1}, 1fr)` }}>
        {matrix.map((row: number[], i: number) => 
          row.map((cell: number, j: number) => (
            <div 
              key={`${i}-${j}`}
              className="aspect-square flex items-center justify-center border rounded bg-muted/50 text-sm font-medium"
            >
              {cell.toLocaleString()}
            </div>
          ))
        )}
      </div>
      {labels && (
        <div className="flex justify-around mt-2 text-xs text-muted-foreground">
          {labels.map((label: string, i: number) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
};

// Chart routing based on name and type
const getChartComponent = (metadata: ChartMetadata) => {
  if (!metadata || !metadata.name) {
    return null;
  }
  
  const chartName = metadata.name.toLowerCase();
  
  // Route to specialized components based on chart name
  if (chartName.includes('roc')) {
    return ROCChart;
  }
  
  if (chartName.includes('calibration')) {
    return CalibrationChart;
  }
  
  if (chartName.includes('feature importance') || chartName.includes('importance')) {
    return FeatureImportanceChart;
  }
  
  // Route based on type
  switch (metadata.type) {
    case 'line_chart':
      return LineChart;
    case 'bar_chart':
      return BarChart;
    case 'scalar':
      return ScalarMetric;
    case 'matrix':
      return MatrixChart;
    default:
      return null;
  }
};

// Error boundary component for individual charts
const ChartErrorBoundary: React.FC<{ children: React.ReactNode; chartName: string }> = ({ 
  children, 
  chartName 
}) => {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    setHasError(false);
  }, [chartName]);
  
  if (hasError) {
    return (
      <Alert className="m-4">
        <AlertDescription>
          Failed to render chart: {chartName}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div onError={() => setHasError(true)}>
      {children}
    </div>
  );
};

// Unsupported chart type component
const UnsupportedChart: React.FC<{ metadata: ChartMetadata }> = ({ metadata }) => (
  <div className="flex flex-col items-center justify-center h-32 text-center">
    <Badge variant="outline" className="mb-2">{metadata.type}</Badge>
    <span className="text-sm text-muted-foreground">
      Chart type not yet supported
    </span>
  </div>
);

// Empty chart component
const EmptyChart: React.FC<{ metadata: ChartMetadata }> = ({ metadata }) => (
  <div className="flex items-center justify-center h-32">
    <span className="text-muted-foreground">No data available for {metadata.name}</span>
  </div>
);

// Main dynamic chart component
export const DynamicChart: React.FC<{
  metadata: ChartMetadata;
  className?: string;
}> = ({ metadata, className }) => {
  // Guard against undefined metadata
  if (!metadata) {
    console.warn('DynamicChart received undefined metadata');
    return (
      <Card className={className}>
        <CardContent className="h-32 flex items-center justify-center">
          <span className="text-muted-foreground">Invalid chart data</span>
        </CardContent>
      </Card>
    );
  }
  
  const ChartComponent = getChartComponent(metadata);
  const transformedData = transformDataForChart(metadata);
  
  // Handle missing or invalid data
  if (metadata.type === 'scalar' && metadata.value === undefined) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{metadata.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyChart metadata={metadata} />
        </CardContent>
      </Card>
    );
  }
  
  if ((metadata.type === 'line_chart' || metadata.type === 'bar_chart') && 
      (!metadata.data || metadata.data.length === 0)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{metadata.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyChart metadata={metadata} />
        </CardContent>
      </Card>
    );
  }
  
  if (metadata.type === 'matrix' && (!metadata.matrix || metadata.matrix.length === 0)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{metadata.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyChart metadata={metadata} />
        </CardContent>
      </Card>
    );
  }
  
  // Handle unsupported chart types
  if (!ChartComponent) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{metadata.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <UnsupportedChart metadata={metadata} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{metadata.name}</CardTitle>
        {metadata.x_axis && metadata.y_axis && (
          <div className="text-xs text-muted-foreground">
            {metadata.x_axis} vs {metadata.y_axis}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ChartErrorBoundary chartName={metadata.name}>
          <ChartComponent {...transformedData} />
        </ChartErrorBoundary>
      </CardContent>
    </Card>
  );
};

// Chart grid component for displaying multiple charts
export const ChartGrid: React.FC<{
  charts: ChartMetadata[];
  className?: string;
}> = ({ charts, className }) => {
  if (!charts || charts.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-muted-foreground">No charts available</span>
      </div>
    );
  }
  
  // Filter out any undefined or invalid charts
  const validCharts = charts.filter((chart): chart is ChartMetadata => {
    // Basic validity check
    if (!(chart != null && typeof chart === 'object' && 'name' in chart && 'type' in chart)) {
      return false;
    }
    
    // Exclude confusion matrix since it's already shown in Overview tab
    if (chart.name.toLowerCase().includes('confusion matrix')) {
      return false;
    }
    
    return true;
  });
  
  if (validCharts.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-muted-foreground">No valid charts found</span>
      </div>
    );
  }
  
  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${className || ''}`}>
      {validCharts.map((chart, index) => (
        <DynamicChart
          key={`${chart.name}-${index}`}
          metadata={chart}
          className="w-full"
        />
      ))}
    </div>
  );
};

export default DynamicChart; 