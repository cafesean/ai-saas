import React from 'react';
import { PaginationState } from '@tanstack/react-table';

interface UseTablePaginationProps {
  initialPageIndex?: number;
  initialPageSize?: number;
  totalItems: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function useTablePagination({
  initialPageIndex = 0,
  initialPageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: UseTablePaginationProps) {
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      setPagination((prev: PaginationState) => ({ ...prev, pageIndex: newPage }));
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  const handlePageSizeChange = React.useCallback(
    (newPageSize: number) => {
      setPagination((prev: PaginationState) => ({
        ...prev,
        pageSize: newPageSize,
        pageIndex: 0,
      }));
      onPageSizeChange?.(newPageSize);
    },
    [onPageSizeChange]
  );

  const pageCount = React.useMemo(
    () => Math.ceil(totalItems / pageSize),
    [totalItems, pageSize]
  );

  return {
    pagination,
    pageCount,
    handlePageChange,
    handlePageSizeChange,
  };
} 