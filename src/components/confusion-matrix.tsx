"use client";

import React from "react";

import { useState } from "react";
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

interface ConfusionMatrixProps {
  matrix: {
    raw: number[][];
    normalized?: number[][];
    labels: string[];
  };
}

export function ConfusionMatrix({ matrix }: ConfusionMatrixProps) {
  const [view, setView] = useState<"raw" | "normalized">("raw");

  // If no matrix is provided, use a default one for demonstration
  const defaultMatrix = {
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
  const currentMatrix = view === "raw" ? data.raw : data.normalized || data.raw;

  // Calculate totals
  const rowTotals = currentMatrix.map((row) =>
    row.reduce((sum, cell) => sum + cell, 0),
  );
  const colTotals = currentMatrix[0]!.map((_, colIndex) =>
    currentMatrix.reduce((sum, row) => sum + row[colIndex]!, 0),
  );
  const total = rowTotals.reduce((sum, val) => sum + val, 0);

  // Calculate metrics
  const truePositives = currentMatrix[1]![1];
  const falsePositives = currentMatrix[0]![1];
  const trueNegatives = currentMatrix[0]![0];
  const falseNegatives = currentMatrix[1]![0];

  const accuracy = (truePositives! + trueNegatives!) / total;
  const precision = truePositives! / (truePositives! + falsePositives!) || 0;
  const recall = truePositives! / (truePositives! + falseNegatives!) || 0;
  const f1Score = (2 * (precision * recall)) / (precision + recall) || 0;

  // Color scale for cells
  const getColor = (value: number, isNormalized: boolean) => {
    if (isNormalized) {
      // For normalized values (0-1)
      const intensity = Math.min(0.9, Math.max(0.1, value)) * 100;
      return `rgba(59, 130, 246, ${intensity / 100})`;
    } else {
      // For raw counts
      const maxValue = Math.max(...data.raw.flat());
      const intensity = Math.min(0.9, Math.max(0.1, value / maxValue)) * 100;
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
          <div className="grid grid-cols-[auto,repeat(2,1fr),auto] gap-1">
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
              <React.Fragment key={rowIndex}>
                <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
                  {label}
                </div>
                {currentMatrix[rowIndex]!.map((value, colIndex) => (
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
                      : value}
                  </div>
                ))}
                <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
                  {view === "normalized" ? "100%" : rowTotals[rowIndex]}
                </div>
              </React.Fragment>
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
                {view === "normalized" ? "100%" : colTotal}
              </div>
            ))}
            <div className="flex items-center justify-center p-2 font-medium bg-muted/30">
              {view === "normalized" ? "100%" : total}
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
