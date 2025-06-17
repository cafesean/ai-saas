"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Database, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDistanceToNow } from "date-fns";
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

interface LookupTablesListProps {
  lookupTables: LookupTable[];
  viewMode: string;
  onDelete: (lookupTable: LookupTable) => void;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case LookupTableStatus.DRAFT:
      return "secondary";
    case LookupTableStatus.PUBLISHED:
      return "default";
    case LookupTableStatus.DEPRECATED:
      return "outline";
    default:
      return "secondary";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case LookupTableStatus.DRAFT:
      return "text-yellow-600";
    case LookupTableStatus.PUBLISHED:
      return "text-green-600";
    case LookupTableStatus.DEPRECATED:
      return "text-gray-500";
    default:
      return "text-gray-500";
  }
};

const LookupTablesList = ({ lookupTables, viewMode, onDelete }: LookupTablesListProps) => {
  const router = useRouter();

  const handleView = (uuid: string) => {
    router.push(`/decisioning/lookup-tables/${uuid}` as any);
  };

  const handleEdit = (uuid: string) => {
    router.push(`/decisioning/lookup-tables/${uuid}?mode=edit` as any);
  };

  if (viewMode === "table") {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Input Variable</TableHead>
              <TableHead>Output</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lookupTables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No lookup tables found
                </TableCell>
              </TableRow>
            ) : (
              lookupTables.map((table) => (
                <TableRow key={table.uuid} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{table.name}</div>
                        {table.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {table.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {table.inputVariableName || "Unknown Variable"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{table.outputName}</div>
                      <div className="text-muted-foreground capitalize">{table.outputDataType}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(table.status)} className="capitalize">
                      {table.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(table.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-sm">
                    v{table.version}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SampleButton variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </SampleButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(table.uuid)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {table.status === LookupTableStatus.DRAFT && (
                          <DropdownMenuItem onClick={() => handleEdit(table.uuid)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {table.status === LookupTableStatus.DRAFT && (
                          <DropdownMenuItem
                            onClick={() => onDelete(table)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Card view
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {lookupTables.length === 0 ? (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No lookup tables found
        </div>
      ) : (
        lookupTables.map((table) => (
          <Card key={table.uuid} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{table.name}</h3>
                    {table.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {table.description}
                      </p>
                    )}
                  </div>
                </div>
                                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <SampleButton variant="ghost" className="h-8 w-8 p-0">
                       <MoreHorizontal className="h-4 w-4" />
                     </SampleButton>
                   </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(table.uuid)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    {table.status === LookupTableStatus.DRAFT && (
                      <DropdownMenuItem onClick={() => handleEdit(table.uuid)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {table.status === LookupTableStatus.DRAFT && (
                      <DropdownMenuItem
                        onClick={() => onDelete(table)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(table.status)} className="capitalize">
                    {table.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">v{table.version}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Input Variable:</span>
                    <span className="font-medium truncate max-w-[120px]">
                      {table.inputVariableName || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output:</span>
                    <span className="font-medium truncate max-w-[120px]">
                      {table.outputName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Type:</span>
                    <span className="font-medium capitalize">{table.outputDataType}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Updated {formatDistanceToNow(new Date(table.updatedAt), { addSuffix: true })}</span>
                    {table.publishedAt && (
                      <span>Published {formatDistanceToNow(new Date(table.publishedAt), { addSuffix: true })}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default memo(LookupTablesList); 