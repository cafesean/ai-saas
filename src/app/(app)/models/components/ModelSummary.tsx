"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ModelsSummaryComponent({ models }: { models: any[] }) {
  const totalInferences = models.reduce((total, model) => 0, 0);
  const championModels = models.filter(
    (model) => model.status === "champion",
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{models.length}</div>
          <p className="text-muted-foreground text-sm">Across all projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Champion Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{championModels}</div>
          <p className="text-muted-foreground text-sm">Production ready</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Inferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalInferences.toLocaleString()}
          </div>
          <p className="text-muted-foreground text-sm">Predictions made</p>
        </CardContent>
      </Card>
    </div>
  );
}

export const ModelsSummary = memo(ModelsSummaryComponent);
