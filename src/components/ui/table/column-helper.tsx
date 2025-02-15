import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ColumnConfig<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (info: { getValue: () => any }) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  width?: number;
}

export function createColumnHelper<T>() {
  return {
    accessor: <K extends keyof T>(
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
            <span className="text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider">{header}</span>
            {enableSorting && (
              <ArrowUpDown
                className={cn(
                  'h-3 w-3',
                  column.getIsSorted()
                    ? 'text-primary'
                    : 'text-gray-400'
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
    },
  };
} 