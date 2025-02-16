import React from 'react';
import { SortingState } from '@tanstack/react-table';
import { useTable } from './useTable';
import { useTableSelection } from './useTableSelection';
import { useTableFilter } from './useTableFilter';
import { useTableSearch } from './useTableSearch';
import { useTableVisibility } from './useTableVisibility';
import { useTableExport } from './useTableExport';

interface UseTableStateProps<T> {
  data: T[];
  columns: Array<keyof T>;
  defaultPageSize?: number;
  defaultCurrentPage?: number;
  defaultSorting?: SortingState;
  defaultFilters?: Record<keyof T, string>;
  defaultSearchTerm?: string;
  defaultVisibility?: Record<keyof T, boolean>;
  getRowId?: (row: T) => string;
  getColumnHeader?: (column: keyof T) => string;
  getColumnValue?: (item: T, column: keyof T) => string;
  searchableColumns?: Array<keyof T>;
  filterableColumns?: Array<keyof T>;
  total?: number;
  filename?: string;
}

export function useTableState<T>({
  data,
  columns,
  defaultPageSize = 10,
  defaultCurrentPage = 1,
  defaultSorting = [],
  defaultFilters = {} as Record<keyof T, string>,
  defaultSearchTerm = '',
  defaultVisibility = {} as Record<keyof T, boolean>,
  getRowId = (row: any) => row.id,
  getColumnHeader = (column) => String(column),
  getColumnValue = (item, column) => String(item[column]),
  searchableColumns = columns,
  filterableColumns = columns,
  total = data.length,
  filename = 'export',
}: UseTableStateProps<T>) {
  const table = useTable({
    defaultPageSize,
    defaultCurrentPage,
    defaultSorting,
    total,
  });

  const selection = useTableSelection({
    data,
    getRowId,
  });

  const filter = useTableFilter({
    data,
    columns: filterableColumns,
    initialFilters: defaultFilters,
  });

  const search = useTableSearch({
    data: filter.filteredData,
    searchableColumns,
    initialSearchTerm: defaultSearchTerm,
  });

  const visibility = useTableVisibility({
    columns,
    initialVisibility: defaultVisibility,
  });

  const exporter = useTableExport({
    data: search.searchedData,
    columns: visibility.visibleColumns,
    filename,
    getColumnHeader,
    getColumnValue,
  });

  const processedData = React.useMemo(() => {
    const start = (table.currentPage - 1) * table.pageSize;
    const end = start + table.pageSize;
    return search.searchedData.slice(start, end);
  }, [search.searchedData, table.currentPage, table.pageSize]);

  return {
    // Data
    data: processedData,
    totalItems: search.searchedData.length,
    
    // Pagination
    pageSize: table.pageSize,
    currentPage: table.currentPage,
    totalPages: table.totalPages,
    onPaginationChange: table.onPaginationChange,
    
    // Sorting
    sorting: table.sorting,
    onSortingChange: table.onSortingChange,
    
    // Selection
    selectedRows: selection.selectedRows,
    selectedItems: selection.selectedItems,
    isAllSelected: selection.isAllSelected,
    onSelectionChange: selection.onSelectionChange,
    toggleAll: selection.toggleAll,
    toggleRow: selection.toggleRow,
    
    // Filtering
    filters: filter.filters,
    onFilterChange: filter.onFilterChange,
    clearFilters: filter.clearFilters,
    
    // Search
    searchTerm: search.searchTerm,
    onSearchChange: search.onSearchChange,
    clearSearch: search.clearSearch,
    
    // Column Visibility
    columnVisibility: visibility.columnVisibility,
    visibleColumns: visibility.visibleColumns,
    onVisibilityChange: visibility.onVisibilityChange,
    toggleVisibility: visibility.toggleVisibility,
    resetVisibility: visibility.resetVisibility,
    
    // Export
    exportToCSV: exporter.exportToCSV,
    exportToJSON: exporter.exportToJSON,
  };
} 