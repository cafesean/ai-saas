"use client";

import { memo } from "react";
import { Database, CheckCircle, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LookupTableStatus } from "@/db/schema/lookup_table";

interface LookupTable {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  inputVariableId: string;
  inputVariableName: string | null;
  outputName: string;
  outputDataType: string;
  defaultValue: string | null;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface LookupTablesSummaryProps {
  lookupTables: LookupTable[];
}

const LookupTablesSummary = ({ lookupTables }: LookupTablesSummaryProps) => {
  const totalTables = lookupTables.length;
  const publishedTables = lookupTables.filter(t => t.status === LookupTableStatus.PUBLISHED).length;
  const draftTables = lookupTables.filter(t => t.status === LookupTableStatus.DRAFT).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Lookup Tables</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTables}</div>
          <p className="text-xs text-muted-foreground">
            All lookup tables in your system
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published Tables</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publishedTables}</div>
          <p className="text-xs text-muted-foreground">
            Ready for use in variables
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Draft Tables</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{draftTables}</div>
          <p className="text-xs text-muted-foreground">
            In development
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(LookupTablesSummary); 