"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Target, Activity, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SampleButton } from "@/components/ui/sample-button";

interface CategoricalFeatureData {
  name: string;
  stats: {
    count: number;
    unique: number;
    top: string;
    freq: number;
    missing?: number;
  };
  distribution: {
    categories: string[];
    counts: number[];
    percentages: number[];
  };
  importance?: {
    coefficient: number;
    abs_coefficient: number;
    rank: number;
  };
}

interface CategoricalDetailProps {
  feature: CategoricalFeatureData;
  onClose?: () => void;
}

export default function CategoricalDetail({ feature, onClose }: CategoricalDetailProps) {
  const [showDistribution, setShowDistribution] = useState(true);

  const getImpactLevel = (absCoeff: number) => {
    if (absCoeff > 0.1) return { level: "High", color: "bg-red-100 text-red-800" };
    if (absCoeff > 0.05) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Low", color: "bg-green-100 text-green-800" };
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num / 100);
  };

  const calculateMissingRate = () => {
    if (!feature.stats.missing) return 0;
    return (feature.stats.missing / feature.stats.count) * 100;
  };

  const impact = feature.importance ? getImpactLevel(feature.importance.abs_coefficient) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{feature.name}</h2>
          <p className="text-muted-foreground">Categorical Feature Analysis</p>
        </div>
        {onClose && (
          <SampleButton variant="outline" onClick={onClose}>
            Close
          </SampleButton>
        )}
      </div>

      {/* Feature Importance */}
      {feature.importance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Feature Importance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Coefficient: {formatNumber(feature.importance.coefficient)}</span>
              </div>
              <Badge className={impact?.color}>
                {impact?.level} Impact
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Absolute Coefficient</p>
                <p className="text-lg font-semibold">{formatNumber(feature.importance.abs_coefficient)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Importance Rank</p>
                <p className="text-lg font-semibold">#{feature.importance.rank}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistical Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistical Summary
          </CardTitle>
          <CardDescription>
            Basic statistics for {feature.name} ({feature.stats.count} observations)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Count</p>
              <p className="text-lg font-semibold">{formatNumber(feature.stats.count)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Unique Values</p>
              <p className="text-lg font-semibold">{formatNumber(feature.stats.unique)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Most Frequent</p>
              <p className="text-lg font-semibold">{feature.stats.top}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Frequency</p>
              <p className="text-lg font-semibold">{formatNumber(feature.stats.freq)}</p>
            </div>
          </div>
          
          {feature.stats.missing && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                <h4 className="font-medium">Data Quality</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Missing Values</p>
                    <p className="font-semibold">{formatNumber(feature.stats.missing)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Missing Rate</p>
                    <p className="font-semibold">{formatPercentage(calculateMissingRate())}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Distribution Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Category Distribution
          </CardTitle>
          <CardDescription>
            Distribution of values across categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
                         {feature.distribution.categories.map((category, index) => {
               const count = feature.distribution.counts[index] || 0;
               const percentage = feature.distribution.percentages[index] || 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(count)} ({formatPercentage(percentage)})
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h4 className="font-medium">Distribution Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cardinality</p>
                <p className="font-semibold">{feature.stats.unique} categories</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mode Frequency</p>
                <p className="font-semibold">{formatPercentage((feature.stats.freq / feature.stats.count) * 100)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 