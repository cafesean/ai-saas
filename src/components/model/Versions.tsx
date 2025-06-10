"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, GitBranch, ExternalLink, Eye, Download, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModelVersion {
  version: string;
  created_at: string;
  status: "active" | "archived" | "training" | "failed";
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
  };
  deployment_url?: string;
  notes?: string;
}

interface VersionsProps {
  versions?: ModelVersion[];
  className?: string;
  onViewVersion?: (version: string) => void;
  onDeployVersion?: (version: string) => void;
}

export default function Versions({ 
  versions = [], 
  className,
  onViewVersion,
  onDeployVersion 
}: VersionsProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "training":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatMetric = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return (value * 100).toFixed(1) + "%";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  if (versions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Model Versions
          </CardTitle>
          <CardDescription>
            Track model iterations and performance across versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <GitBranch className="mx-auto h-12 w-12 mb-4" />
            <p>No model versions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Model Versions
        </CardTitle>
        <CardDescription>
          Track model iterations and performance across versions ({versions.length} versions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>F1 Score</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow 
                  key={version.version}
                  className={selectedVersion === version.version ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>v{version.version}</span>
                      {version.deployment_url && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(version.status)}>
                      {version.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                      {formatDate(version.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {formatMetric(version.metrics?.accuracy)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {formatMetric(version.metrics?.f1_score)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {version.notes || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SampleButton variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </SampleButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewVersion?.(version.version)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeployVersion?.(version.version)}>
                          <Download className="h-4 w-4 mr-2" />
                          Deploy
                        </DropdownMenuItem>
                        {version.deployment_url && (
                          <DropdownMenuItem asChild>
                            <a href={version.deployment_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Deployment
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 