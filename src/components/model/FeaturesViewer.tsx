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
  type: string;
  description?: string;
  encoding: string;
  coefficient?: number;
  abs_coefficient?: number;
  importance_rank?: number;
}

interface GlobalImportance {
  feature: string;
  coefficient: number;
  abs_coefficient: number;
}

interface FeaturesViewerProps {
  features: Array<{
    name: string;
    type: string;
    description?: string;
    encoding: string;
  }>;
  globalImportance?: GlobalImportance[];
  modelName?: string;
  numericalStats?: any;
  categoricalAnalysis?: any;
}

export default function FeaturesViewer({
  features = [],
  globalImportance = [],
  modelName = "Model",
  numericalStats = {},
  categoricalAnalysis = {},
}: FeaturesViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>("importance_rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedEncodings, setSelectedEncodings] = useState<string[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<{name: string; type: string} | null>(null);

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

  // Ensure features is an array before processing
  const featuresArray = Array.isArray(features) ? features : [];
  
  // Normalize features to match expected structure
  const normalizedFeatures = featuresArray.map(feature => {
    if (typeof feature === 'string') {
      return {
        name: feature,
        type: 'unknown',
        description: '',
        encoding: 'unknown'
      };
    } else if (feature && typeof feature === 'object') {
      const featureAny = feature as any;
      return {
        name: featureAny.name || 'Unknown',
        type: featureAny.type || featureAny.dataType || 'unknown',
        description: featureAny.description || '',
        encoding: featureAny.encoding || 'unknown'
      };
    }
    return {
      name: 'Unknown',
      type: 'unknown', 
      description: '',
      encoding: 'unknown'
    };
  });
  
  // Enhance features with coefficient data
  const enhancedFeatures: EnhancedFeature[] = normalizedFeatures.map(feature => {
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

  const getCoefficientIcon = (coefficient?: number) => {
    if (coefficient === undefined || coefficient === null) return <Minus className="h-3 w-3 text-gray-400" />;
    if (coefficient > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (coefficient < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const formatCoefficient = (coefficient?: number) => {
    if (coefficient === undefined || coefficient === null) return "—";
    return coefficient.toFixed(4);
  };

  const handleFeatureClick = (feature: EnhancedFeature) => {
    setSelectedFeature({ name: feature.name, type: feature.type });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Features</CardTitle>
        <CardDescription>
          Features used in {modelName} ({enhancedFeatures.length} total)
        </CardDescription>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter by Type */}
            <Popover>
              <PopoverTrigger asChild>
                <SampleButton variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Type {selectedTypes.length > 0 && `(${selectedTypes.length})`}
                </SampleButton>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Filter by Type</h4>
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
            
            {/* Filter by Encoding */}
            <Popover>
              <PopoverTrigger asChild>
                <SampleButton variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Encoding {selectedEncodings.length > 0 && `(${selectedEncodings.length})`}
                </SampleButton>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Filter by Encoding</h4>
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
            
            <SampleButton variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </SampleButton>
          </div>
          
          {/* Active Filters Display */}
          {(selectedTypes.length > 0 || selectedEncodings.length > 0) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleTypeFilter(type)}
                >
                  Type: {type} ×
                </Badge>
              ))}
              {selectedEncodings.map((encoding) => (
                <Badge
                  key={encoding}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleEncodingFilter(encoding)}
                >
                  Encoding: {encoding} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {sortedFeatures.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No features found matching your criteria.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-foreground" 
                      onClick={() => toggleSort("name")}
                    >
                      Feature Name
                      {sortField === "name" && (
                        sortDirection === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-foreground" 
                      onClick={() => toggleSort("type")}
                    >
                      Type
                      {sortField === "type" && (
                        sortDirection === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-foreground" 
                      onClick={() => toggleSort("encoding")}
                    >
                      Encoding
                      {sortField === "encoding" && (
                        sortDirection === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-foreground" 
                      onClick={() => toggleSort("importance_rank")}
                    >
                      Importance Rank
                      {sortField === "importance_rank" && (
                        sortDirection === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-foreground" 
                      onClick={() => toggleSort("coefficient")}
                    >
                      Coefficient
                      {sortField === "coefficient" && (
                        sortDirection === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFeatures.map((feature, index) => (
                  <TableRow 
                    key={`${feature.name}-${index}`} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleFeatureClick(feature)}
                  >
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
                        <Badge variant="outline">
                          #{feature.importance_rank}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCoefficientIcon(feature.coefficient)}
                        <span className="text-sm">
                          {formatCoefficient(feature.coefficient)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {feature.description ? (
                        <span className="text-sm">{feature.description}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 