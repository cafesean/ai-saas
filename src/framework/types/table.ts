import { ColumnDef } from '@tanstack/react-table';

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  paginationClassName?: string;
  hideOnSinglePage?: boolean;
}

export interface TableHeaderProps<T> {
  header: string;
  column: keyof T;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  filterOptions?: FilterOption[];
  width?: string | number;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface PaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  className?: string;
  hideOnSinglePage?: boolean;
}

export type ColumnConfig<T> = {
  header: string;
  accessorKey: keyof T;
  cell?: (info: { getValue: () => any }) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  filterOptions?: FilterOption[];
  width?: string | number;
};

export function createColumnHelper<T>() {
  return {
    accessor: <K extends keyof T>(
      key: K,
      config: Omit<ColumnConfig<T>, 'accessorKey'>
    ): ColumnDef<T> => ({
      accessorKey: key,
      ...config,
    }),
  };
} 