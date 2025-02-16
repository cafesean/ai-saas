import React from 'react';
import { SortingState } from '@tanstack/react-table';

interface UseTableSortingProps {
  initialSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}

export function useTableSorting({
  initialSorting = [],
  onSortingChange,
}: UseTableSortingProps) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const handleSortingChange = React.useCallback(
    (updatedSorting: SortingState) => {
      setSorting(updatedSorting);
      onSortingChange?.(updatedSorting);
    },
    [onSortingChange]
  );

  return {
    sorting,
    setSorting: handleSortingChange,
  };
} 