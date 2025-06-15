"use client";

import { memo } from "react";
import { Clock, Calculator, Database, FileCode, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Route } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SampleButton } from "@/components/ui/sample-button";
import { type ViewMode } from "@/framework/hooks/useViewToggle";
import { getTimeAgo } from "@/utils/func";
import { VariableStatus, VariableLogicTypes } from "@/db/schema/variable";

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
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VariablesListProps {
  variables: Variable[];
  viewMode: ViewMode;
  onDelete: (variable: Variable) => void;
}

function VariablesListComponent({ variables, viewMode, onDelete }: VariablesListProps) {
  if (variables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Variables Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            No variables are available. Try creating one.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getLogicIcon = (logicType: string) => {
    switch (logicType) {
      case VariableLogicTypes.FORMULA:
        return <Calculator className="h-4 w-4 text-muted-foreground" />;
      case VariableLogicTypes.LOOKUP:
        return <Database className="h-4 w-4 text-muted-foreground" />;
      case VariableLogicTypes.DIRECT_MAP:
      default:
        return <FileCode className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case VariableStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case VariableStatus.PUBLISHED:
        return <Badge variant="default">Published</Badge>;
      case VariableStatus.DEPRECATED:
        return <Badge variant="destructive">Deprecated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLogicValue = (variable: Variable) => {
    switch (variable.logicType) {
      case VariableLogicTypes.DIRECT_MAP:
        return variable.defaultValue || "No default value";
      case VariableLogicTypes.FORMULA:
        return variable.formula || "No formula defined";
      case VariableLogicTypes.LOOKUP:
        return variable.lookupTableId ? "Lookup table configured" : "No lookup table";
      default:
        return "Unknown logic type";
    }
  };

  // List View (Table)
  if (viewMode === "list") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variables Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Logic Type</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((variable) => (
                <TableRow key={variable.uuid}>
                  <TableCell className="font-medium">
                    <Link
                      href={(`/decisioning/variables/${variable.uuid}` as any) as Route}
                      className="hover:underline"
                    >
                      {variable.name}
                    </Link>
                    {variable.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {variable.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getLogicIcon(variable.logicType)}
                      <span className="capitalize">
                        {variable.logicType.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {variable.dataType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(variable.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getTimeAgo(variable.updatedAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>v{variable.version}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SampleButton
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          <span className="sr-only">More Options</span>
                        </SampleButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" asChild>
                          <Link href={(`/decisioning/variables/${variable.uuid}` as any) as Route}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {variable.status === VariableStatus.DRAFT && (
                          <>
                            <DropdownMenuItem className="cursor-pointer" asChild>
                              <Link href={`/decisioning/variables/${variable.uuid}` as Route}>
                                Edit Variable
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => onDelete(variable)}
                            >
                              Delete Variable
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  const gridColsClass =
    viewMode === "large-grid"
      ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-4`}>
      {variables.map((variable) => (
        <Card
          key={variable.uuid}
          className="flex flex-col overflow-hidden transition-all hover:shadow-md"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">
                               <Link
                 href={(`/decisioning/variables/${variable.uuid}` as any) as Route}
                 className="hover:underline"
               >
                 {variable.name}
               </Link>
              </CardTitle>
              {getStatusBadge(variable.status)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {variable.logicType.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {variable.dataType}
              </Badge>
            </div>
            {variable.description && (
              <CardDescription className="text-xs line-clamp-2">
                {variable.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex-grow space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {getLogicIcon(variable.logicType)}
              <span className="font-medium">Logic:</span>
              <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded line-clamp-1">
                {getLogicValue(variable)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Version:</span>
              <span>v{variable.version}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/50 p-3 text-xs text-muted-foreground border-t">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {variable.status === VariableStatus.PUBLISHED && variable.publishedAt
                  ? getTimeAgo(variable.publishedAt)
                  : getTimeAgo(variable.updatedAt)}
              </span>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SampleButton variant="ghost" size="sm" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">More Options</span>
                  </SampleButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href={`/decisioning/variables/${variable.uuid}` as Route}>
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {variable.status === VariableStatus.DRAFT && (
                    <>
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link href={`/decisioning/variables/${variable.uuid}` as Route}>
                          Edit Variable
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => onDelete(variable)}
                      >
                        Delete Variable
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default memo(VariablesListComponent); 