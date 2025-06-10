"use client";

import { SampleButton } from "@/components/ui/sample-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SampleCheckbox } from "@/components/ui/sample-checkbox";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, Calendar, CheckCircle2, GitBranch } from "lucide-react";
import { getTimeAgo, toPercent } from "@/utils/func";

interface ModelVersionsProps {
  versions: {
    id?: string;
    version?: string;
    createdAt?: string | Date;
    status?: "active" | "inactive" | "deprecated";
    changes?: string[];
    selected?: boolean;
    accuracy?: string;
    latency?: string;
  }[];
  onSelectVersion?: (id: string, selected: boolean) => void;
  onCompareVersions?: () => void;
}

export function ModelVersions({
  versions,
  onSelectVersion = () => {},
  onCompareVersions = () => {},
}: ModelVersionsProps) {
  const selectedVersions = versions.filter((v) => v.selected).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Model Versions</CardTitle>
        <div className="flex items-center gap-2">
          <SampleButton
            variant="outline"
            size="sm"
            onClick={onCompareVersions}
            disabled={selectedVersions < 2}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Compare {selectedVersions > 0 ? `(${selectedVersions})` : ""}
          </SampleButton>
          <SampleButton size="sm">
            <GitBranch className="mr-2 h-4 w-4" />
            Create Challenger Group
          </SampleButton>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {versions.map((version, vn) => (
            <div
              key={`version-${vn}`}
              className="flex items-start border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center h-5 mr-3">
                <SampleCheckbox
                  id={`select-checkbox-${vn}`}
                  checked={version.selected}
                  onCheckedChange={(checked) =>
                    onSelectVersion(`${vn}` || "", !!checked)
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`select-label-${vn}`}
                      className="font-medium cursor-pointer"
                    >
                      {version.version}
                    </Label>
                    <Badge
                      variant={
                        version.status === "active"
                          ? "default"
                          : version.status === "inactive"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {version.status === "active" && (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {version.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {getTimeAgo(version.createdAt || new Date())}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      Accuracy:
                    </div>
                    <div className="text-sm font-medium">
                      {version.accuracy
                        ? toPercent(parseFloat(version.accuracy))
                        : "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      Latency:
                    </div>
                    <div className="text-sm font-medium">
                      {version.latency
                        ? toPercent(parseFloat(version.latency))
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {version.changes && version.changes.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground">
                      Changes:
                    </div>
                    <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
                      {version.changes.map((change, idx) => (
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
