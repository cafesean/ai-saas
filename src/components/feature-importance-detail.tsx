"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FeatureImportance {
  feature: string;
  coefficient: number;
  abs_coefficient: number;
}

interface FeatureImportanceDetailProps {
  features: FeatureImportance[];
  maxFeatures?: number;
}

export function FeatureImportanceDetail({
  features = [],
  maxFeatures = 10,
}: FeatureImportanceDetailProps) {
  // Sort by absolute coefficient and take top features
  const sortedFeatures = features
    .sort((a, b) => b.abs_coefficient - a.abs_coefficient)
    .slice(0, maxFeatures);

  // Find max abs_coefficient for normalization
  const maxAbsCoeff = Math.max(...sortedFeatures.map(f => f.abs_coefficient));

  const getImpactIcon = (coefficient: number) => {
    if (coefficient > 0.01) return <TrendingUp className="h-3 w-3" />;
    if (coefficient < -0.01) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getImpactColor = (coefficient: number) => {
    if (coefficient > 0.01) return "text-green-600 bg-green-50";
    if (coefficient < -0.01) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const getImpactLabel = (coefficient: number) => {
    if (coefficient > 0.01) return "Positive";
    if (coefficient < -0.01) return "Negative";
    return "Neutral";
  };

  if (sortedFeatures.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No feature importance data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedFeatures.map((feature, index) => {
        const normalizedImportance = maxAbsCoeff > 0 
          ? (feature.abs_coefficient / maxAbsCoeff) * 100 
          : 0;

        return (
          <Popover key={feature.feature}>
            <PopoverTrigger asChild>
              <div className="space-y-2 cursor-pointer group p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{feature.feature}</span>
                    <Info className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getImpactColor(feature.coefficient)}`}
                    >
                      {getImpactIcon(feature.coefficient)}
                      <span className="ml-1">{getImpactLabel(feature.coefficient)}</span>
                    </Badge>
                    <span className="font-medium text-xs">
                      {normalizedImportance.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={normalizedImportance} className="h-2" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{feature.feature}</h4>
                    <Badge variant="outline" className="text-xs">
                      Rank #{index + 1}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This feature has a {getImpactLabel(feature.coefficient).toLowerCase()} impact on model predictions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-1">Coefficient</h5>
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {feature.coefficient.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-1">Absolute Value</h5>
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {feature.abs_coefficient.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-1">Impact Direction</h5>
                  <div className={`text-sm px-2 py-1 rounded-md inline-flex items-center gap-1 ${getImpactColor(feature.coefficient)}`}>
                    {getImpactIcon(feature.coefficient)}
                    <span>
                      {feature.coefficient > 0.01
                        ? "Increases prediction likelihood"
                        : feature.coefficient < -0.01
                        ? "Decreases prediction likelihood"
                        : "Minimal impact on predictions"}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-1">Relative Importance</h5>
                  <div className="text-sm">
                    <Progress value={normalizedImportance} className="h-2 mb-1" />
                    <span className="text-muted-foreground">
                      {normalizedImportance.toFixed(1)}% of the most important feature
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Coefficients represent the linear relationship between this feature and the model output. 
                    Ranking is based on absolute coefficient values.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
      
      {features.length > maxFeatures && (
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Showing top {maxFeatures} of {features.length} features
          </p>
        </div>
      )}
    </div>
  );
}
