"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Database, Target, BarChart3, Split, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ModelInfo {
  name?: string;
  type?: string;
  version?: string;
  trained_on?: string;
  training_rows?: number;
  test_rows?: number;
  feature_count?: number;
  target?: {
    name?: string;
    positive_class?: number | string;
    negative_class?: number | string;
  };
  split?: {
    train_pct?: number;
    cv_strategy?: string;
    folds?: number;
    repeats?: number;
  };
}

interface ModelInfoCardProps {
  modelInfo?: ModelInfo | null;
  className?: string;
}

export function ModelInfoCard({ modelInfo, className }: ModelInfoCardProps) {
  if (!modelInfo) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>
            Detailed model configuration and training details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No detailed model information available
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num?: number) => {
    if (!num) return "N/A";
    return num.toLocaleString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const getModelTypeColor = (type?: string) => {
    if (!type) return "secondary";
    const lowerType = type.toLowerCase();
    if (lowerType.includes("logistic")) return "blue";
    if (lowerType.includes("random") || lowerType.includes("forest")) return "green";
    if (lowerType.includes("neural") || lowerType.includes("deep")) return "purple";
    if (lowerType.includes("svm")) return "orange";
    return "secondary";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {modelInfo.name || "Model Information"}
            </CardTitle>
            <CardDescription>
              Detailed model configuration and training details
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={getModelTypeColor(modelInfo.type) as any}>
              {modelInfo.type || "Unknown"}
            </Badge>
            {modelInfo.version && (
              <Badge variant="outline">v{modelInfo.version}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Training Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Training Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Trained:</span>{" "}
                  {formatDate(modelInfo.trained_on)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Training Rows:</span>{" "}
                  {formatNumber(modelInfo.training_rows)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Test Rows:</span>{" "}
                  {formatNumber(modelInfo.test_rows)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Features:</span>{" "}
                  {formatNumber(modelInfo.feature_count)}
                </span>
              </div>
            </div>
          </div>

          {/* Target Variable */}
          {modelInfo.target && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Target Variable
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Name:</span>{" "}
                    <code className="px-1 py-0.5 bg-muted rounded text-xs">
                      {modelInfo.target.name || "N/A"}
                    </code>
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positive Class:</span>
                    <Badge variant="default" className="text-xs">
                      {modelInfo.target.positive_class ?? "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Negative Class:</span>
                    <Badge variant="secondary" className="text-xs">
                      {modelInfo.target.negative_class ?? "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Split Strategy */}
          {modelInfo.split && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Split Strategy
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Split className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Strategy:</span>{" "}
                    {modelInfo.split.cv_strategy || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Train %:</span>{" "}
                    {modelInfo.split.train_pct 
                      ? `${(modelInfo.split.train_pct * 100).toFixed(0)}%`
                      : "N/A"}
                  </span>
                </div>
                {modelInfo.split.folds && (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CV Folds:</span>
                      <Badge variant="outline" className="text-xs">
                        {modelInfo.split.folds}
                      </Badge>
                    </div>
                    {modelInfo.split.repeats && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Repeats:</span>
                        <Badge variant="outline" className="text-xs">
                          {modelInfo.split.repeats}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 