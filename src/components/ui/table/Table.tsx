import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/framework/lib/utils';
import { TableProps } from '@/framework/types/table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import Image from 'next/image';
import React from 'react';

export function Table<T>({
  data,
  columns,
  loading,
  onRowClick,
  onRowDoubleClick,
  rowSelection,
  onRowSelectionChange,
  total,
  currentPage,
  pageSize,
  onPaginationChange,
  className,
  headerClassName,
  bodyClassName,
  paginationClassName,
  hideOnSinglePage,
}: TableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection: rowSelection || {},
    },
    enableRowSelection: !!onRowSelectionChange,
    onRowSelectionChange: onRowSelectionChange as OnChangeFn<RowSelectionState>,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleRowClick = React.useCallback(
    (row: T) => {
      onRowClick?.(row);
    },
    [onRowClick]
  );

  const handleRowDoubleClick = React.useCallback(
    (row: T) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  const renderCell = React.useCallback(
    (cell: any) => {
      if (loading) {
        return <Skeleton className="h-4 w-full" />;
      }
      return flexRender(cell.column.columnDef.cell, cell.getContext());
    },
    [loading]
  );

  const totalPages = Math.ceil((total || 0) / (pageSize || 10));
  const showPagination = !hideOnSinglePage || totalPages > 1;

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={cn('bg-gray-50', headerClassName)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-left text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: header.column.columnDef.size }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody
            className={cn(
              'bg-white divide-y divide-gray-200',
              {
                'cursor-pointer': onRowClick || onRowDoubleClick,
              },
              bodyClassName
            )}
          >
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleRowClick(row.original)}
                  onDoubleClick={() => handleRowDoubleClick(row.original)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 text-left"
                    >
                      {renderCell(cell)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-2 text-sm text-center text-gray-500"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {onPaginationChange && showPagination && (
        <div className={cn('px-4 py-3 flex items-center justify-between', paginationClassName)}>
          <div className="text-xs text-gray-500">
            {total ? `Total ${total} items` : ''}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500">Rows per page</p>
              <select
                className="h-6 rounded-md border border-gray-200 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                value={pageSize}
                onChange={(e) =>
                  onPaginationChange(currentPage || 1, Number(e.target.value))
                }
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-1">
              <button
                className="h-6 w-6 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                onClick={() =>
                  onPaginationChange((currentPage || 1) - 1, pageSize || 10)
                }
                disabled={!currentPage || currentPage === 1}
              >
                <span className="sr-only">Previous page</span>
                <Image
                  src="/icons/chevron-left.svg"
                  alt="Previous page"
                  width={24}
                  height={24}
                  className="h-4 w-4 mx-auto"
                />
              </button>
              <button
                className="h-6 w-6 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                onClick={() =>
                  onPaginationChange((currentPage || 1) + 1, pageSize || 10)
                }
                disabled={
                  !currentPage ||
                  !total ||
                  currentPage >= totalPages
                }
              >
                <span className="sr-only">Next page</span>
                <Image
                  src="/icons/chevron-right.svg"
                  alt="Next page"
                  width={24}
                  height={24}
                  className="h-4 w-4 mx-auto"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 