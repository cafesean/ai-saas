import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/framework/lib/utils';
import React from 'react';

interface ColumnConfig<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (info: { getValue: () => any }) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  width?: number;
}

export function createColumnHelper<T>() {
  const accessor = <K extends keyof T>(
    key: K,
    config: Omit<ColumnConfig<T>, 'accessorKey'>
  ): ColumnDef<T> & { accessorKey: K } => {
    const { header, cell, enableSorting = true, enableFiltering = true, width } = config;

    return {
      accessorKey: key,
      header: ({ column }) => (
        <div
          className={cn(
            'flex items-center space-x-1',
            enableSorting && 'cursor-pointer select-none'
          )}
          onClick={enableSorting ? () => column.toggleSorting() : undefined}
        >
          <span>{header}</span>
          {enableSorting && (
            <ArrowUpDown
              className={cn(
                'h-3 w-3',
                column.getIsSorted()
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            />
          )}
        </div>
      ),
      cell: cell
        ? (info) => cell(info)
        : (info) => <div className="truncate">{String(info.getValue())}</div>,
      enableSorting,
      enableColumnFilter: enableFiltering,
      size: width,
    };
  };

  return { accessor };
} 