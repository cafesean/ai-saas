"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Download,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  X,
  Building2
} from "lucide-react";
import { type OrganizationWithStats } from "@/types/organization";
import { toast } from "sonner";

interface OrganizationDataTableProps {
  data: OrganizationWithStats[];
  columns: ColumnDef<OrganizationWithStats>[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function OrganizationDataTable({ 
  data, 
  columns, 
  isLoading,
  onRefresh
}: OrganizationDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedOrganizations = selectedRows.map(row => row.original);
  const hasSelection = selectedRows.length > 0;

  // Export functions
  const exportToCSV = () => {
    const headers = table.getVisibleFlatColumns()
      .filter(col => col.id !== 'select' && col.id !== 'actions')
      .map(col => col.id);
    
    const csvData = table.getFilteredRowModel().rows.map(row => {
      const rowData: Record<string, string | number | boolean> = {};
      headers.forEach(header => {
        const cell = row.getValue(header);
        if (header === 'isActive') {
          rowData[header] = cell ? 'Active' : 'Inactive';
        } else if (header === 'createdAt' || header === 'updatedAt') {
          rowData[header] = cell ? new Date(cell as Date).toISOString() : '';
        } else {
          rowData[header] = typeof cell === 'object' ? JSON.stringify(cell) : String(cell || '');
        }
      });
      return rowData;
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `organizations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Organizations exported to CSV');
  };

  const exportToJSON = () => {
    const exportData = table.getFilteredRowModel().rows.map(row => row.original);
    const jsonContent = JSON.stringify(exportData, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `organizations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast.success('Organizations exported to JSON');
  };

  // Clear all filters
  const clearFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
    table.resetColumnFilters();
  };

  // Get density classes
  const getDensityClasses = () => {
    switch (density) {
      case "compact":
        return "text-xs";
      case "spacious":
        return "text-base py-4";
      default:
        return "text-sm py-2";
    }
  };

  if (isLoading) {
    return <OrganizationTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8 max-w-sm"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={(table.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("isActive")?.setFilterValue(value === "all" ? undefined : value === "true")
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(globalFilter || columnFilters.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 lg:px-3"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} of {data.length} organizations
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Settings className="h-4 w-4 mr-1" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Table Density</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setDensity("compact")}>
                {density === "compact" && "✓ "}Compact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDensity("comfortable")}>
                {density === "comfortable" && "✓ "}Comfortable
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDensity("spacious")}>
                {density === "spacious" && "✓ "}Spacious
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selection Info Bar */}
      {hasSelection && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {selectedRows.length} selected
            </Badge>
            <span className="text-sm text-muted-foreground">
              {selectedOrganizations.length} organization{selectedOrganizations.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={getDensityClasses()}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={getDensityClasses()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={getDensityClasses()}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No organizations found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function OrganizationTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-2">
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="flex space-x-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}