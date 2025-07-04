"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toPercent } from "@/utils/func";
import { ConfusionMatrix } from "@/components/model/ConfusionMatrix";
interface AllKPIsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: any;
}

export function AllKPIsDialog({
  open,
  onOpenChange,
  model,
}: AllKPIsDialogProps) {
  const [activeTab, setActiveTab] = useState("classification");

  if (!model) return null;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendText = (trend: number) => {
    if (trend === 0) return "No change";
    return `${trend > 0 ? "+" : ""}${trend.toFixed(2)}% from last version`;
  };

  const getTrendClass = (trend: number) => {
    if (trend > 0) return "text-green-500";
    if (trend < 0) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>All Performance Metrics</DialogTitle>
          <DialogDescription>
            Detailed view of all performance metrics for {model.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="classification"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classification">
              Classification Metrics
            </TabsTrigger>
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="business">Business Impact</TabsTrigger>
          </TabsList>

          <TabsContent
            value="classification"
            className="space-y-4 py-4 max-h-[500px] overflow-y-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                title="K-S Score"
                value={model.metrics[0]?.ks || "0.0"}
                trend={0.0}
                description="Measures separation between positive and negative distributions"
              />
              <MetricCard
                title="AUC-ROC"
                value={model.metrics[0]?.auroc || "0.0"}
                trend={0.0}
                description="Area under the ROC curve"
              />
              <MetricCard
                title="Accuracy"
                value={model?.metrics[0]?.accuracy || "0.0"}
                trend={0.0}
                description="Proportion of correct predictions"
              />
              <MetricCard
                title="Gini Coefficient"
                value={model.metrics[0]?.gini || "0.0"}
                trend={0.0}
                description="Measure of statistical dispersion"
              />
              <MetricCard
                title="Precision"
                value={model.metrics[0]?.precision || "0.0"}
                trend={0.0}
                description="Ratio of true positives to all positive predictions"
              />
              <MetricCard
                title="Recall"
                value={model.metrics[0]?.recall || "0.0"}
                trend={0.0}
                description="Ratio of true positives to all actual positives"
              />
              <MetricCard
                title="F1 Score"
                value={model.metrics[0]?.f1Score || model.metrics[0]?.f1 || "0.0"}
                trend={0.0}
                description="Harmonic mean of precision and recall"
              />
              <MetricCard
                title="Brier Score"
                value={model.metrics[0]?.brier_score || "0.0"}
                trend={0.0}
                description="Measure of accuracy of probabilistic predictions"
              />
              <MetricCard
                title="Log Loss"
                value={model.metrics[0]?.log_loss || "0.0"}
                trend={0.0}
                description="Cross-entropy loss for classification"
              />
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Confusion Matrix</h3>
              <ConfusionMatrix
                matrix={(() => {
                  const confusionChart = model?.metrics[0]?.charts_data?.find(
                    (chart: any) => chart.name === "Confusion Matrix"
                  );
                  
                  if (confusionChart) {
                    return {
                      raw: confusionChart.matrix,
                      labels: confusionChart.labels,
                    };
                  }
                  
                  // Fallback data
                  return {
                    raw: [
                      [85, 15],
                      [10, 90],
                    ],
                    labels: ["Negative", "Positive"],
                  };
                })()}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="performance"
            className="space-y-4 py-4 max-h-[500px] overflow-y-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                title="Latency (p50)"
                value="78 ms"
                trend={-12.5}
                description="Median response time"
                trendInverted
              />
              <MetricCard
                title="Latency (p95)"
                value="124 ms"
                trend={-8.2}
                description="95th percentile response time"
                trendInverted
              />
              <MetricCard
                title="Latency (p99)"
                value="187 ms"
                trend={2.1}
                description="99th percentile response time"
                trendInverted
              />
              <MetricCard
                title="Throughput"
                value="120 req/s"
                trend={15.3}
                description="Requests processed per second"
              />
              <MetricCard
                title="Model Size"
                value="1.2 GB"
                trend={-5.2}
                description="Size of model in memory"
                trendInverted
              />
              <MetricCard
                title="Compute Usage"
                value="0.45 GPU hrs/day"
                trend={-8.7}
                description="GPU hours consumed per day"
                trendInverted
              />
            </div>

            <div className="mt-6 border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Latency Distribution</h3>
              <div className="h-64 w-full bg-muted/50 rounded-md flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="mb-2">Latency Histogram</div>
                  <div className="text-xs">Distribution of response times</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="business"
            className="space-y-4 py-4 max-h-[500px] overflow-y-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                title="Cost per Inference"
                value="$0.0012"
                trend={-15.3}
                description="Average cost per model call"
                trendInverted
              />
              <MetricCard
                title="Daily Cost"
                value="$42.75"
                trend={8.2}
                description="Total daily operational cost"
                trendInverted
              />
              <MetricCard
                title="User Satisfaction"
                value="92%"
                trend={3.5}
                description="Based on user feedback"
              />
              <MetricCard
                title="Error Rate"
                value="0.82%"
                trend={-0.31}
                description="Percentage of failed requests"
                trendInverted
              />
              <MetricCard
                title="Time Saved"
                value="1,240 hrs/week"
                trend={12.5}
                description="Estimated time saved for users"
              />
              <MetricCard
                title="ROI"
                value="342%"
                trend={28.7}
                description="Return on investment"
              />
            </div>

            <div className="mt-6 border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">
                Business Impact Over Time
              </h3>
              <div className="h-64 w-full bg-muted/50 rounded-md flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="mb-2">Impact Visualization</div>
                  <div className="text-xs">
                    Showing cost savings and efficiency gains
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <SampleButton variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </SampleButton>
          <SampleButton>Export Metrics</SampleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  description: string;
  trendInverted?: boolean;
}

function MetricCard({
  title,
  value,
  trend,
  description,
  trendInverted = false,
}: MetricCardProps) {
  const isTrendPositive = trendInverted ? trend < 0 : trend > 0;

  // Format the value appropriately
  const formatValue = (val: string) => {
    // If it already contains % or other units, return as is
    if (val.includes('%') || val.includes('$') || val.includes('ms') || val.includes('req/s') || val.includes('GB') || val.includes('hrs')) {
      return val;
    }
    
    // Try to parse as number for percentage conversion
    const numValue = parseFloat(val);
    if (!isNaN(numValue)) {
      // If value is between 0 and 1, treat as percentage
      if (numValue <= 1.0) {
        return toPercent(numValue, 2);
      }
      // Otherwise format with appropriate decimal places
      return numValue.toFixed(3);
    }
    
    return val;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}
        </div>
        <div
          className={`text-xs flex items-center mt-1 ${
            trend === 0
              ? "text-gray-500"
              : isTrendPositive
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {trend > 0 ? (
            <ArrowUpRight className="h-3 w-3 mr-1" />
          ) : trend < 0 ? (
            <ArrowDownRight className="h-3 w-3 mr-1" />
          ) : (
            <Minus className="h-3 w-3 mr-1" />
          )}
          {trend === 0
            ? "No change"
            : `${trend > 0 ? "+" : ""}${trend}% from last version`}
        </div>
      </CardContent>
    </Card>
  );
}
