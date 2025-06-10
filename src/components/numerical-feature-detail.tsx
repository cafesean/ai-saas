"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TypeScript interfaces based on discovered data structure
interface FeatureClassStats {
  mean: number;
  min: number;
  max: number;
  median: number;
}

interface FeatureStats {
  good_class: FeatureClassStats;
  bad_class: FeatureClassStats;
}

interface NumericalStats {
  [featureName: string]: FeatureStats;
}

interface NumericalFeatureDetailProps {
  featureName: string;
  numericalStats: NumericalStats;
}

// Utility function to format numbers consistently
const formatNumber = (value: number): string => {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toFixed(2);
};

// Component to display individual statistic
const StatisticRow: React.FC<{
  label: string;
  goodValue: number;
  badValue: number;
}> = ({ label, goodValue, badValue }) => {
  const difference = goodValue - badValue;
  const percentageDiff = badValue !== 0 ? ((difference / badValue) * 100) : 0;
  
  return (
    <div className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50">
      <div className="font-medium text-sm">{label}</div>
      <div className="text-center">
        <span className="text-green-600 font-medium">{formatNumber(goodValue)}</span>
      </div>
      <div className="text-center">
        <span className="text-red-600 font-medium">{formatNumber(badValue)}</span>
      </div>
      <div className="text-center text-xs">
        <Badge variant={difference > 0 ? "default" : "destructive"} className="text-xs">
          {difference > 0 ? "+" : ""}{formatNumber(difference)}
        </Badge>
        <div className="text-muted-foreground mt-1">
          ({percentageDiff > 0 ? "+" : ""}{percentageDiff.toFixed(1)}%)
        </div>
      </div>
    </div>
  );
};

// Main component
export const NumericalFeatureDetail: React.FC<NumericalFeatureDetailProps> = ({ 
  featureName, 
  numericalStats 
}) => {
  // Get statistics for the specific feature
  const featureStats = numericalStats[featureName];
  
  // Handle missing feature data
  if (!featureStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature: {featureName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <span className="text-muted-foreground">
              No numerical statistics available for {featureName}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { good_class, bad_class } = featureStats;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Numerical Analysis: {featureName}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Statistical comparison between good and bad class outcomes
        </div>
      </CardHeader>
      <CardContent>
        {/* Header Row */}
        <div className="grid grid-cols-4 gap-4 items-center pb-3 mb-4 border-b-2 border-border">
          <div className="font-semibold">Statistic</div>
          <div className="text-center font-semibold text-green-600">Good Class</div>
          <div className="text-center font-semibold text-red-600">Bad Class</div>
          <div className="text-center font-semibold">Difference</div>
        </div>
        
        {/* Statistics Rows */}
        <div className="space-y-0">
          <StatisticRow 
            label="Mean" 
            goodValue={good_class.mean} 
            badValue={bad_class.mean} 
          />
          <StatisticRow 
            label="Median" 
            goodValue={good_class.median} 
            badValue={bad_class.median} 
          />
          <StatisticRow 
            label="Minimum" 
            goodValue={good_class.min} 
            badValue={bad_class.min} 
          />
          <StatisticRow 
            label="Maximum" 
            goodValue={good_class.max} 
            badValue={bad_class.max} 
          />
        </div>
        
        {/* Summary Insights */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Key Insights</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              • Good class average: <span className="font-medium text-green-600">{formatNumber(good_class.mean)}</span>
            </div>
            <div>
              • Bad class average: <span className="font-medium text-red-600">{formatNumber(bad_class.mean)}</span>
            </div>
            <div>
              • Range difference: Good class ({formatNumber(good_class.max - good_class.min)}) vs 
              Bad class ({formatNumber(bad_class.max - bad_class.min)})
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NumericalFeatureDetail; 