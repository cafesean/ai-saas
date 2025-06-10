"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info, Target, BarChart3, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OutputSchemaData {
  score_type?: string;
  range?: number[] | [number, number];
  thresholds?: Record<string, string>;
}

interface OutputSchemaProps {
  outputSchema?: OutputSchemaData;
  modelName?: string;
}

export default function OutputSchema({
  outputSchema,
  modelName = "Model",
}: OutputSchemaProps) {
  const getScoreTypeColor = (scoreType: string) => {
    switch (scoreType?.toLowerCase()) {
      case 'probability':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'score':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'classification':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'regression':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getThresholdColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low_risk':
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      case 'medium_risk':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'high_risk':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const formatRange = (range: number[] | [number, number] | undefined) => {
    if (!range || !Array.isArray(range) || range.length !== 2) {
      return "Not specified";
    }
    return `${range[0]} to ${range[1]}`;
  };

  const getRangeProgress = (range: number[] | [number, number] | undefined) => {
    if (!range || !Array.isArray(range) || range.length !== 2) {
      return 0;
    }
    // For probability, show 100% as it's a complete range from 0 to 1
    if (range[0] === 0 && range[1] === 1) {
      return 100;
    }
    // For other ranges, calculate relative progress
    const total = Math.abs(range[1] - range[0]);
    return Math.min(100, (total / 10) * 100); // Normalize for display
  };

  if (!outputSchema) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Output Schema</CardTitle>
          <CardDescription>
            Output format and interpretation for {modelName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="mx-auto h-12 w-12 mb-4" />
            <p>No output schema information available for this model.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Output Schema</CardTitle>
        <CardDescription>
          Output format and interpretation for {modelName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Type Section */}
        {outputSchema.score_type && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <h4 className="text-sm font-medium">Score Type</h4>
            </div>
            <div className="pl-7">
              <Badge 
                variant="outline" 
                className={`${getScoreTypeColor(outputSchema.score_type)} text-sm px-3 py-1`}
              >
                {outputSchema.score_type}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {outputSchema.score_type.toLowerCase() === 'probability' 
                  ? 'Returns probability values between 0 and 1'
                  : `Returns ${outputSchema.score_type} values`
                }
              </p>
            </div>
          </div>
        )}

        {/* Range Section */}
        {outputSchema.range && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h4 className="text-sm font-medium">Value Range</h4>
            </div>
            <div className="pl-7 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium min-w-[120px]">
                  {formatRange(outputSchema.range)}
                </span>
                <div className="flex-1 max-w-xs">
                  <Progress 
                    value={getRangeProgress(outputSchema.range)} 
                    className="h-2"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Model outputs will fall within this numerical range
              </p>
            </div>
          </div>
        )}

        {/* Thresholds Section */}
        {outputSchema.thresholds && Object.keys(outputSchema.thresholds).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h4 className="text-sm font-medium">Decision Thresholds</h4>
            </div>
            <div className="pl-7 space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                These thresholds help interpret the model's output values
              </p>
              <div className="grid gap-3">
                {Object.entries(outputSchema.thresholds).map(([level, threshold]) => (
                  <div 
                    key={level}
                    className={`flex items-center justify-between p-3 rounded-lg border ${getThresholdColor(level)}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className="bg-white/50 text-current border-current/20"
                      >
                        {level.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">
                        {threshold}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>
                The model returns structured output that can be interpreted using the above schema. 
                Use the thresholds to categorize predictions and make business decisions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 