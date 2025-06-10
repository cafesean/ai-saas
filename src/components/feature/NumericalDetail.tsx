"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Minus, BarChart3, Target, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SampleButton } from "@/components/ui/sample-button";

interface NumericalFeatureData {
  name: string;
  stats: {
    count: number;
    mean: number;
    std: number;
    min: number;
    max: number;
    q25: number;
    q50: number;
    q75: number;
  };
  importance?: {
    coefficient: number;
    abs_coefficient: number;
    rank: number;
  };
  distribution?: {
    bins: number[];
    counts: number[];
  };
}

interface NumericalDetailProps {
  feature: NumericalFeatureData;
  onClose?: () => void;
}

export default function NumericalDetail({ feature, onClose }: NumericalDetailProps) {
  const [showDistribution, setShowDistribution] = useState(false);

  const getCoefficientIcon = (coefficient: number) => {
    if (coefficient > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (coefficient < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getImpactLevel = (absCoeff: number) => {
    if (absCoeff > 0.1) return { level: "High", color: "bg-red-100 text-red-800" };
    if (absCoeff > 0.05) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Low", color: "bg-green-100 text-green-800" };
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(num);
  };

  const calculateRange = () => {
    return feature.stats.max - feature.stats.min;
  };

  const calculateCV = () => {
    return feature.stats.std / feature.stats.mean;
  };

  const impact = feature.importance ? getImpactLevel(feature.importance.abs_coefficient) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{feature.name}</h2>
          <p className="text-muted-foreground">Numerical Feature Analysis</p>
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
                {getCoefficientIcon(feature.importance.coefficient)}
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
            Descriptive statistics for {feature.name} ({feature.stats.count} observations)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Mean</p>
              <p className="text-lg font-semibold">{formatNumber(feature.stats.mean)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Std Deviation</p>
              <p className="text-lg font-semibold">{formatNumber(feature.stats.std)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Minimum</p>
              <p className="text-lg font-semibold">{formatNumber(feature.stats.min)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Maximum</p>
              <p className="text-lg font-semibold">{formatNumber(feature.stats.max)}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h4 className="font-medium">Quartiles</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Q1 (25%)</span>
                <span className="font-medium">{formatNumber(feature.stats.q25)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Q2 (50% - Median)</span>
                <span className="font-medium">{formatNumber(feature.stats.q50)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Q3 (75%)</span>
                <span className="font-medium">{formatNumber(feature.stats.q75)}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h4 className="font-medium">Derived Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Range</p>
                <p className="font-semibold">{formatNumber(calculateRange())}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Coefficient of Variation</p>
                <p className="font-semibold">{formatNumber(calculateCV())}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Analysis */}
      {feature.distribution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribution Analysis
            </CardTitle>
            <CardDescription>
              Value distribution and shape characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show Distribution Chart</span>
              <SampleButton
                variant="outline"
                size="sm"
                onClick={() => setShowDistribution(!showDistribution)}
              >
                {showDistribution ? 'Hide' : 'Show'}
              </SampleButton>
            </div>
            
            {showDistribution && (
              <div className="space-y-4">
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Distribution chart would be rendered here</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">Bins</p>
                    <p className="font-semibold">{feature.distribution.bins.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Total Count</p>
                    <p className="font-semibold">{feature.distribution.counts.reduce((a, b) => a + b, 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Max Frequency</p>
                    <p className="font-semibold">{Math.max(...feature.distribution.counts)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 