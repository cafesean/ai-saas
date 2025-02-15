import React from 'react';
import { SortingState } from '@tanstack/react-table';

interface UseTableProps {
  defaultPageSize?: number;
  defaultCurrentPage?: number;
  defaultSorting?: SortingState;
  total?: number;
}

export function useTable({
  defaultPageSize = 10,
  defaultCurrentPage = 1,
  defaultSorting = [],
  total = 0,
}: UseTableProps = {}) {
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [currentPage, setCurrentPage] = React.useState(defaultCurrentPage);
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting);

  const handlePaginationChange = React.useCallback(
    (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
    },
    []
  );

  const handleSortingChange = React.useCallback(
    (newSorting: SortingState) => {
      setSorting(newSorting);
    },
    []
  );

  const totalPages = React.useMemo(
    () => Math.ceil(total / pageSize),
    [total, pageSize]
  );

  return {
    pageSize,
    currentPage,
    sorting,
    totalPages,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
  };
} 