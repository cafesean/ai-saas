import React from 'react';
import { Table } from './Table';
import { useTableState } from '@/framework/hooks/useTableState';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '../Input';
import { cn } from '@/framework/lib/utils';
import { Search } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: Array<ColumnDef<T> & { accessorKey: keyof T }>;
  searchPlaceholder?: string;
  searchableColumns?: Array<keyof T>;
  filterableColumns?: Array<keyof T>;
  defaultVisibility?: Record<keyof T, boolean>;
  getRowId?: (row: T) => string;
  getColumnHeader?: (column: keyof T) => string;
  getColumnValue?: (item: T, column: keyof T) => string;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  paginationClassName?: string;
  hideOnSinglePage?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSelection?: boolean;
  filename?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchableColumns,
  filterableColumns,
  defaultVisibility,
  getRowId,
  getColumnHeader,
  getColumnValue,
  onRowClick,
  onRowDoubleClick,
  className,
  headerClassName,
  bodyClassName,
  paginationClassName,
  hideOnSinglePage = true,
  enableSearch = true,
  enableFilters = true,
  enableSelection = false,
  filename,
}: DataTableProps<T>) {
  const columnKeys = React.useMemo(
    () => columns.map((col) => col.accessorKey),
    [columns]
  );

  const tableState = useTableState({
    data,
    columns: columnKeys,
    searchableColumns,
    filterableColumns,
    defaultVisibility,
    getRowId,
    getColumnHeader,
    getColumnValue,
    filename,
  });

  const visibleColumns = React.useMemo(
    () =>
      columns.filter((col) =>
        tableState.columnVisibility[col.accessorKey]
      ),
    [columns, tableState.columnVisibility]
  );

  return (
    <div className="space-y-4">
      {enableSearch && (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={tableState.searchTerm}
            onChange={(e) => tableState.onSearchChange(e.target.value)}
            className={cn(
              "h-8 w-[250px] rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-400"
            )}
          />
        </div>
      )}

      <Table
        data={tableState.data}
        columns={visibleColumns}
        loading={false}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        rowSelection={enableSelection ? tableState.selectedRows : undefined}
        onRowSelectionChange={
          enableSelection ? tableState.onSelectionChange : undefined
        }
        total={tableState.totalItems}
        currentPage={tableState.currentPage}
        pageSize={tableState.pageSize}
        onPaginationChange={tableState.onPaginationChange}
        className={className}
        headerClassName={headerClassName}
        bodyClassName={bodyClassName}
        paginationClassName={paginationClassName}
        hideOnSinglePage={hideOnSinglePage}
      />
    </div>
  );
} 