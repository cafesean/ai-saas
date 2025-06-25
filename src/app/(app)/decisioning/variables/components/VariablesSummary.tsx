"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VariableStatus } from "@/db/schema/variable";

interface Variable {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  dataType: string;
  logicType: string;
  formula: string | null;
  lookupTableId: string | null;
  defaultValue: string | null;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  orgId: number;
  createdAt: Date;
  updatedAt: Date;
}

function VariablesSummaryComponent({ variables }: { variables: Variable[] }) {
  const draftVariables = variables.filter(
    (variable) => variable.status === VariableStatus.DRAFT,
  ).length;
  const publishedVariables = variables.filter(
    (variable) => variable.status === VariableStatus.PUBLISHED,
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{variables.length}</div>
          <p className="text-muted-foreground text-sm">Across all logic types</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Published Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{publishedVariables}</div>
          <p className="text-muted-foreground text-sm">Ready for use</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Draft Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{draftVariables}</div>
          <p className="text-muted-foreground text-sm">In development</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(VariablesSummaryComponent); 