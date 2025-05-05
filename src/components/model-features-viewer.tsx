"use client";

import { useState } from "react";
import { Search, SortAsc, SortDesc, Filter, Download } from "lucide-react";
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

interface Feature {
  name: string;
  type: string;
  description?: string;
  importance?: number;
  required?: boolean;
  format?: string;
  range?: string;
  defaultValue?: string;
  tags?: string[];
}

interface ModelFeaturesViewerProps {
  features: Feature[];
  modelName: string;
}

export function ModelFeaturesViewer({
  features,
  modelName,
}: ModelFeaturesViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get unique feature types and tags
  const featureTypes = Array.from(
    new Set(features.map((feature) => feature.type)),
  );
  const allTags = Array.from(
    new Set(features.flatMap((feature) => feature.tags || [])),
  );
  // Filter features based on search query, selected types, and tags
  const filteredFeatures = features.filter((feature) => {
    const matchesSearch =
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(feature.type);
    const matchesTags =
      selectedTags.length === 0 ||
      feature.tags?.some((tag) => selectedTags.includes(tag));
    return matchesSearch && matchesType && matchesTags;
  });

  // Sort features
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (!sortField) return 0;

    const fieldA = a[sortField as keyof Feature];
    const fieldB = b[sortField as keyof Feature];

    if (fieldA === undefined || fieldB === undefined) return 0;

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

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle>Model Features</CardTitle>
            <CardDescription>
              Features available for {modelName}
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
              placeholder="Search features..."
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
                  Filter Types
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
                  Filter Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedTags.length}
                    </Badge>
                  )}
                </SampleButton>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  {allTags.map((tag, tn) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <SampleCheckbox
                        id={`tag-${tn}`}
                        checked={!!(tag && selectedTags.includes(tag))}
                        onCheckedChange={() => toggleTagFilter(tag || "")}
                      />
                      <Label htmlFor={`tag-${tag}`}>{tag}</Label>
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
                  className="w-[200px] cursor-pointer"
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
                    Type
                    {sortField === "type" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("importance")}
                >
                  <div className="flex items-center">
                    Importance
                    {sortField === "importance" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-2 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-2 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Tags</TableHead>
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
                    <TableCell
                      className="max-w-[300px] truncate"
                      title={feature.description}
                    >
                      {feature.description}
                    </TableCell>
                    <TableCell>
                      {feature.importance !== undefined ? (
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-full h-2.5 mr-2">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{
                                width: `${toPercent(
                                  Math.abs(feature.importance) > 1
                                    ? 1
                                    : Math.abs(feature.importance),
                                  2,
                                )}`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {toPercent(feature.importance, 2)}
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{feature.required ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {feature.tags &&
                          feature.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
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
