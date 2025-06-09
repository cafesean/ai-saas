"use client";

import { LineChart, BarChart, ROCChart, FeatureImportanceChart } from "./index";

// Sample data for testing
const rocData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.1, tpr: 0.2 },
  { fpr: 0.2, tpr: 0.4 },
  { fpr: 0.3, tpr: 0.6 },
  { fpr: 0.4, tpr: 0.7 },
  { fpr: 0.5, tpr: 0.8 },
  { fpr: 0.6, tpr: 0.85 },
  { fpr: 0.7, tpr: 0.9 },
  { fpr: 0.8, tpr: 0.93 },
  { fpr: 0.9, tpr: 0.96 },
  { fpr: 1, tpr: 1 },
];

const featureImportanceData = [
  { feature: "Credit Score", importance: 0.35 },
  { feature: "Income", importance: 0.28 },
  { feature: "Age", importance: 0.15 },
  { feature: "Employment Length", importance: 0.12 },
  { feature: "Debt to Income", importance: 0.10 },
];

const performanceData = [
  { month: "Jan", accuracy: 0.85, precision: 0.82 },
  { month: "Feb", accuracy: 0.87, precision: 0.84 },
  { month: "Mar", accuracy: 0.89, precision: 0.86 },
  { month: "Apr", accuracy: 0.91, precision: 0.88 },
  { month: "May", accuracy: 0.88, precision: 0.85 },
  { month: "Jun", accuracy: 0.90, precision: 0.87 },
];

export function ChartSamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">Chart Library Samples</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve */}
        <ROCChart
          data={rocData}
          title="ROC Curve"
          description="Model performance visualization"
          xKey="fpr"
        />

        {/* Feature Importance */}
        <FeatureImportanceChart
          data={featureImportanceData}
          title="Feature Importance"
          description="Top contributing features"
        />

        {/* Performance Over Time */}
        <LineChart
          data={performanceData}
          title="Model Performance Over Time"
          description="Accuracy and precision trends"
          xKey="month"
          yKeys={["accuracy", "precision"]}
          xLabel="Month"
          yLabel="Score"
          showLegend={true}
        />

        {/* Simple Bar Chart */}
        <BarChart
          data={featureImportanceData}
          title="Feature Importance (Vertical)"
          description="Alternative view of feature importance"
          xKey="feature"
          yKey="importance"
          xLabel="Features"
          yLabel="Importance Score"
          orientation="vertical"
        />
      </div>
    </div>
  );
} 