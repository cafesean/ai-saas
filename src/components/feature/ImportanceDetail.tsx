"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Download, Eye } from "lucide-react";

interface FeatureImportance {
  feature: string;
  coefficient: number;
  abs_coefficient: number;
  rank: number;
  percentage?: number;
}

interface ImportanceDetailProps {
  importance?: FeatureImportance[];
  modelName?: string;
  className?: string;
  onFeatureClick?: (feature: string) => void;
}

export default function ImportanceDetail({ 
  importance = [], 
  modelName = "Model",
  className,
  onFeatureClick 
}: ImportanceDetailProps) {
  const [sortField, setSortField] = useState<keyof FeatureImportance>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showTop, setShowTop] = useState<number>(10);

  const sortedImportance = [...importance].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc" 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    const numA = Number(valueA);
    const numB = Number(valueB);
    
    return sortDirection === "asc" ? numA - numB : numB - numA;
  });

  const displayedImportance = sortedImportance.slice(0, showTop);

  const toggleSort = (field: keyof FeatureImportance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getCoefficientIcon = (coefficient: number) => {
    if (coefficient > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (coefficient < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getImpactLevel = (absCoeff: number) => {
    const maxCoeff = Math.max(...importance.map(f => f.abs_coefficient));
    const relative = absCoeff / maxCoeff;
    
    if (relative > 0.7) return { level: "High", color: "bg-red-100 text-red-800" };
    if (relative > 0.4) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Low", color: "bg-green-100 text-green-800" };
  };

  const formatCoefficient = (coeff: number) => {
    return coeff.toFixed(4);
  };

  const calculatePercentage = (absCoeff: number) => {
    const total = importance.reduce((sum, f) => sum + f.abs_coefficient, 0);
    return ((absCoeff / total) * 100).toFixed(1);
  };

  if (importance.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Feature Importance
          </CardTitle>
          <CardDescription>
            Feature importance analysis for {modelName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="mx-auto h-12 w-12 mb-4" />
            <p>No feature importance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Feature Importance
        </CardTitle>
        <CardDescription>
          Feature importance analysis for {modelName} ({importance.length} features)
        </CardDescription>
        
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Show top:</span>
            <div className="flex gap-1">
              {[5, 10, 20, 50].map((num) => (
                <SampleButton
                  key={num}
                  variant={showTop === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTop(num)}
                >
                  {num}
                </SampleButton>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <SampleButton variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </SampleButton>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("rank")}
                >
                  <div className="flex items-center gap-2">
                    Rank
                    {sortField === "rank" && (
                      sortDirection === "asc" ? 
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("feature")}
                >
                  <div className="flex items-center gap-2">
                    Feature
                    {sortField === "feature" && (
                      sortDirection === "asc" ? 
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("coefficient")}
                >
                  <div className="flex items-center gap-2">
                    Coefficient
                    {sortField === "coefficient" && (
                      sortDirection === "asc" ? 
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("abs_coefficient")}
                >
                  <div className="flex items-center gap-2">
                    Abs. Coefficient
                    {sortField === "abs_coefficient" && (
                      sortDirection === "asc" ? 
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Contribution %</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedImportance.map((feature, index) => {
                const impact = getImpactLevel(feature.abs_coefficient);
                const percentage = calculatePercentage(feature.abs_coefficient);
                
                return (
                  <TableRow 
                    key={feature.feature}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => onFeatureClick?.(feature.feature)}
                  >
                    <TableCell>
                      <Badge variant="outline">
                        #{feature.rank}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {feature.feature}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCoefficientIcon(feature.coefficient)}
                        <span className="font-mono text-sm">
                          {formatCoefficient(feature.coefficient)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {formatCoefficient(feature.abs_coefficient)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={impact.color}>
                        {impact.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <Progress 
                          value={parseFloat(percentage)} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <SampleButton 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFeatureClick?.(feature.feature);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </SampleButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {importance.length > showTop && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {showTop} of {importance.length} features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 