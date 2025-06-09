"use client";

import { useState } from "react";
import { Search, SortAsc, SortDesc, Filter, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SampleButton } from "@/components/ui/sample-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SampleCheckbox } from "@/components/ui/sample-checkbox";
import { Label } from "@/components/ui/label";
import { toPercent } from "@/utils/func";
import { mapFeatureType } from "@/lib/model-service";

// Enhanced interface for new metadata structure
interface EnhancedFeature {
  name: string;
  type: string; // original_type from metadata (e.g., 'int64', 'object', 'datetime64[ns]')
  description?: string;
  encoding: string; // encoding method (e.g., 'woe', 'onehot', 'scaling')
  coefficient?: number; // from global_importance
  abs_coefficient?: number; // from global_importance
  importance_rank?: number; // calculated rank based on abs_coefficient
}

interface GlobalImportance {
  feature: string;
  coefficient: number;
  abs_coefficient: number;
}

interface ModelFeaturesViewerProps {
  features: Array<{
    name: string;
    type: string;
    description?: string;
    encoding: string;
  }>;
  globalImportance?: GlobalImportance[];
  modelName?: string;
}

export function ModelFeaturesViewer({
  features = [],
  globalImportance = [],
  modelName = "Model",
}: ModelFeaturesViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>("importance_rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedEncodings, setSelectedEncodings] = useState<string[]>([]);

  // Create a map of feature importance data for quick lookup
  const importanceMap = globalImportance.reduce((map, item) => {
    map[item.feature] = {
      coefficient: item.coefficient,
      abs_coefficient: item.abs_coefficient,
    };
    return map;
  }, {} as Record<string, { coefficient: number; abs_coefficient: number }>);

  // Sort global importance by abs_coefficient to get rankings
  const sortedImportance = [...globalImportance].sort((a, b) => b.abs_coefficient - a.abs_coefficient);
  const rankMap = sortedImportance.reduce((map, item, index) => {
    map[item.feature] = index + 1;
    return map;
  }, {} as Record<string, number>);

  // Debug logging to understand the data structure
  console.log('ModelFeaturesViewer - features prop:', features);
  console.log('ModelFeaturesViewer - features type:', typeof features);
  console.log('ModelFeaturesViewer - features isArray:', Array.isArray(features));
  
  // Ensure features is an array before processing
  const featuresArray = Array.isArray(features) ? features : [];
  
  // Enhance features with coefficient data
  const enhancedFeatures: EnhancedFeature[] = featuresArray.map(feature => {
    const importance = importanceMap[feature.name];
    return {
      ...feature,
      coefficient: importance?.coefficient,
      abs_coefficient: importance?.abs_coefficient,
      importance_rank: rankMap[feature.name],
    };
  });

  // Get unique feature types and encodings for filtering
  const featureTypes = Array.from(
    new Set(enhancedFeatures.map((feature) => feature.type)),
  );
  const encodingTypes = Array.from(
    new Set(enhancedFeatures.map((feature) => feature.encoding)),
  );

  // Filter features based on search query, selected types, and encodings
  const filteredFeatures = enhancedFeatures.filter((feature) => {
    const matchesSearch =
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.encoding.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(feature.type);
    const matchesEncoding =
      selectedEncodings.length === 0 || selectedEncodings.includes(feature.encoding);
    return matchesSearch && matchesType && matchesEncoding;
  });

  // Sort features
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (!sortField) return 0;

    const fieldA = a[sortField as keyof EnhancedFeature];
    const fieldB = b[sortField as keyof EnhancedFeature];

    if (fieldA === undefined || fieldB === undefined) {
      // Put undefined values at the end
      if (fieldA === undefined && fieldB === undefined) return 0;
      if (fieldA === undefined) return sortDirection === "asc" ? 1 : -1;
      if (fieldB === undefined) return sortDirection === "asc" ? -1 : 1;
    }

    const comparison =
      typeof fieldA === "string"
        ? (fieldA as string).localeCompare(fieldB as string)
        : (fieldA as number) - (fieldB as number);

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleEncodingFilter = (encoding: string) => {
    setSelectedEncodings((prev) =>
      prev.includes(encoding) ? prev.filter((e) => e !== encoding) : [...prev, encoding],
    );
  };

  // Get coefficient direction icon
  const getCoefficientIcon = (coefficient?: number) => {
    if (coefficient === undefined) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (coefficient > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (coefficient < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  // Format coefficient display
  const formatCoefficient = (coefficient?: number) => {
    if (coefficient === undefined) return "N/A";
    return coefficient >= 0 ? `+${coefficient.toFixed(4)}` : coefficient.toFixed(4);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle>Model Features</CardTitle>
            <CardDescription>
              Features available for {modelName} ({enhancedFeatures.length} total)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <SampleButton variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Features
            </SampleButton>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-start">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search features by name, description, or encoding..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <SampleButton variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Data Types
                  {selectedTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedTypes.length}
                    </Badge>
                  )}
                </SampleButton>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  {featureTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <SampleCheckbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleTypeFilter(type)}
                      />
                      <Label htmlFor={`type-${type}`}>{type}</Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <SampleButton variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Encodings
                  {selectedEncodings.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedEncodings.length}
                    </Badge>
                  )}
                </SampleButton>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  {encodingTypes.map((encoding) => (
                    <div key={encoding} className="flex items-center space-x-2">
                      <SampleCheckbox
                        id={`encoding-${encoding}`}
                        checked={selectedEncodings.includes(encoding)}
                        onCheckedChange={() => toggleEncodingFilter(encoding)}
                      />
                      <Label htmlFor={`encoding-${encoding}`}>{encoding}</Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-[180px] cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Feature Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("type")}
                >
                  <div className="flex items-center">
                    Original Type
                    {sortField === "type" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("encoding")}
                >
                  <div className="flex items-center">
                    Encoding
                    {sortField === "encoding" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("importance_rank")}
                >
                  <div className="flex items-center">
                    Importance Rank
                    {sortField === "importance_rank" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("coefficient")}
                >
                  <div className="flex items-center">
                    Coefficient
                    {sortField === "coefficient" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFeatures.length > 0 ? (
                sortedFeatures.map((feature, fn) => (
                  <TableRow key={`${feature.name}-${fn}`}>
                    <TableCell className="font-medium">
                      {feature.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {mapFeatureType(feature.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {feature.encoding}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {feature.importance_rank ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-8 h-6 justify-center">
                            #{feature.importance_rank}
                          </Badge>
                          {feature.abs_coefficient && (
                            <div className="text-xs text-muted-foreground">
                              {toPercent(feature.abs_coefficient, 2)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCoefficientIcon(feature.coefficient)}
                        <span className="text-sm font-mono">
                          {formatCoefficient(feature.coefficient)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={feature.description}
                    >
                      {feature.description || <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No features found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
