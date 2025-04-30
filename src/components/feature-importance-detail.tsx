"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";

interface FeatureImportanceDetailProps {
  feature: {
    name: string;
    importance: number;
    description?: string;
    impact?: "positive" | "negative" | "neutral";
    examples?: { value: string; effect: string }[];
    correlations?: { feature: string; value: number }[];
  };
}

export function FeatureImportanceDetail({
  feature,
}: FeatureImportanceDetailProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="space-y-1 cursor-pointer group">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span>{feature.name}</span>
              <Info className="ml-1 h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="font-medium">{feature.importance}%</span>
          </div>
          <Progress value={feature.importance} className="h-2" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{feature.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {feature.description || "No description available."}
            </p>
          </div>

          <div>
            <h5 className="text-sm font-medium mb-1">Impact on Model</h5>
            <div
              className={`text-sm px-2 py-1 rounded-md inline-block ${
                feature.impact === "positive"
                  ? "bg-green-100 text-green-800"
                  : feature.impact === "negative"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {feature.impact === "positive"
                ? "Positive Impact"
                : feature.impact === "negative"
                ? "Negative Impact"
                : "Neutral Impact"}
            </div>
          </div>

          {feature.examples && feature.examples.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-1">Example Values</h5>
              <div className="space-y-1">
                {feature.examples.map((example, index) => (
                  <div key={index} className="text-sm grid grid-cols-2 gap-2">
                    <div className="font-mono bg-muted px-1 rounded">
                      {example.value}
                    </div>
                    <div>{example.effect}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {feature.correlations && feature.correlations.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-1">Correlations</h5>
              <div className="space-y-1">
                {feature.correlations.map((correlation: any, index) => (
                  <div key={index} className="text-sm flex justify-between">
                    <span>{correlation.feature}</span>
                    <span
                      className={
                        correlation.value > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {correlation.value > 0 ? "+" : ""}
                      {correlation.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Feature importance is calculated using SHAP values and represents
              the average impact on model output.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
