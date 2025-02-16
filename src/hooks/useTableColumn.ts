import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@/components/ui/table/column.helper';

interface UseTableColumnsProps<T> {
  columns: Array<{
    key: keyof T;
    header: string;
    cell?: (info: { getValue: () => any }) => React.ReactNode;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    width?: number;
  }>;
}

export function useTableColumns<T>({ columns }: UseTableColumnsProps<T>) {
  const columnHelper = createColumnHelper<T>();

  const tableColumns = React.useMemo(
    () =>
      columns.map((col) =>
        columnHelper.accessor(col.key, {
          header: col.header,
          cell: col.cell,
          enableSorting: col.enableSorting,
          enableFiltering: col.enableFiltering,
          width: col.width,
        })
      ),
    [columns]
  );

  return tableColumns;
} 