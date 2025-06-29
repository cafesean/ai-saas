"use client";

import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SampleButton } from "@/components/ui/sample-button";
import { Download, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfusionMatrixData {
  raw: number[][];
  normalized?: number[][];
  labels: string[];
}

interface ConfusionMatrixProps {
  matrix: ConfusionMatrixData;
}

export function ConfusionMatrix({ matrix }: ConfusionMatrixProps) {
  const [view, setView] = useState<"raw" | "normalized">("raw");

  // Enhanced fallback with better error handling
  const defaultMatrix: ConfusionMatrixData = {
    raw: [
      [85, 15],
      [10, 90],
    ],
    normalized: [
      [0.85, 0.15],
      [0.1, 0.9],
    ],
    labels: ["Negative", "Positive"],
  };

  const data = matrix || defaultMatrix;
  
  // Validate matrix data
  if (!data.raw || !Array.isArray(data.raw) || data.raw.length === 0) {
    console.warn("Invalid confusion matrix data provided, using fallback");
    Object.assign(data, defaultMatrix);
  }
  
  const currentMatrix = view === "raw" ? data.raw : data.normalized || data.raw;

  // Calculate totals with error handling
  const rowTotals = currentMatrix.map((row) =>
    Array.isArray(row) ? row.reduce((sum, cell) => sum + (cell || 0), 0) : 0,
  );
  const colTotals = currentMatrix[0]?.length ? currentMatrix[0].map((_, colIndex) =>
    currentMatrix.reduce((sum, row) => sum + (row[colIndex] || 0), 0),
  ) : [];
  const total = rowTotals.reduce((sum, val) => sum + val, 0);

  // Calculate metrics with safe array access
  const truePositives = currentMatrix[1]?.[1] || 0;
  const falsePositives = currentMatrix[0]?.[1] || 0;
  const trueNegatives = currentMatrix[0]?.[0] || 0;
  const falseNegatives = currentMatrix[1]?.[0] || 0;

  const accuracy = total > 0 ? (truePositives + trueNegatives) / total : 0;
  const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
  const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
  const f1Score = (precision + recall) > 0 ? (2 * (precision * recall)) / (precision + recall) : 0;

  // Enhanced color scale for cells
  const getColor = (value: number, isNormalized: boolean) => {
    const safeValue = value || 0;
    
    if (isNormalized) {
      // For normalized values (0-1)
      const intensity = Math.min(0.9, Math.max(0.1, safeValue)) * 100;
      return `rgba(59, 130, 246, ${intensity / 100})`;
    } else {
      // For raw counts
      const maxValue = Math.max(...data.raw.flat().filter(v => typeof v === 'number'));
      const intensity = maxValue > 0 ? Math.min(0.9, Math.max(0.1, safeValue / maxValue)) * 100 : 10;
      return `rgba(59, 130, 246, ${intensity / 100})`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "raw" | "normalized")}
        >
          <TabsList>
            <TabsTrigger value="raw">Raw Counts</TabsTrigger>
            <TabsTrigger value="normalized" disabled={!data.normalized}>
              Normalized
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <SampleButton variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </SampleButton>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <div className={`grid gap-1`} style={{
            gridTemplateColumns: `auto repeat(${data.labels.length}, 1fr) auto`
          }}>
            {/* Header row */}
            <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
              Actual ↓ / Predicted →
            </div>
            {data.labels.map((label, i) => (
              <div
                key={i}
                className="flex items-center justify-center p-2 font-medium bg-muted/30"
              >
                {label}
              </div>
            ))}
            <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
              Total
            </div>

            {/* Data rows */}
            {data.labels.map((label, rowIndex) => (
              <Fragment key={rowIndex}>
                <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
                  {label}
                </div>
                {currentMatrix[rowIndex]?.map((value, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="flex items-center justify-center p-4 font-medium border"
                    style={{
                      backgroundColor: getColor(value, view === "normalized"),
                      color:
                        view === "normalized" && value > 0.5
                          ? "white"
                          : "inherit",
                    }}
                  >
                    {view === "normalized"
                      ? (value * 100).toFixed(1) + "%"
                      : value?.toLocaleString() || 0}
                  </div>
                )) || []}
                <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
                  {view === "normalized" ? "100%" : rowTotals[rowIndex]?.toLocaleString() || 0}
                </div>
              </Fragment>
            ))}

            {/* Totals row */}
            <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
              Total
            </div>
            {colTotals.map((colTotal, i) => (
              <div
                key={`total-${i}`}
                className="flex items-center justify-center p-2 font-medium bg-muted/30"
              >
                {view === "normalized" ? "100%" : colTotal?.toLocaleString() || 0}
              </div>
            ))}
            <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
              {view === "normalized" ? "100%" : total?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <MetricCard title="Accuracy" value={accuracy} />
        <MetricCard title="Precision" value={precision} />
        <MetricCard title="Recall" value={recall} />
        <MetricCard title="F1 Score" value={f1Score} />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{title}</div>
            <Tooltip>
              <TooltipTrigger asChild>
                <SampleButton variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Info</span>
                </SampleButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getMetricDescription(title)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold mt-1">
            {(value * 100).toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function getMetricDescription(metric: string): string {
  switch (metric) {
    case "Accuracy":
      return "The proportion of correct predictions among the total number of predictions.";
    case "Precision":
      return "The proportion of true positive predictions among all positive predictions.";
    case "Recall":
      return "The proportion of true positive predictions among all actual positives.";
    case "F1 Score":
      return "The harmonic mean of precision and recall, providing a balance between the two metrics.";
    default:
      return "";
  }
}
