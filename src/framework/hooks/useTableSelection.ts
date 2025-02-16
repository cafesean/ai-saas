import React from 'react';

interface UseTableSelectionProps<T> {
  data: T[];
  getRowId?: (row: T) => string;
}

export function useTableSelection<T>({
  data,
  getRowId = (row: any) => row.id,
}: UseTableSelectionProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>(
    {}
  );

  const handleSelectionChange = React.useCallback(
    (selection: Record<string, boolean>) => {
      setSelectedRows(selection);
    },
    []
  );

  const selectedItems = React.useMemo(
    () =>
      data.filter((item) => {
        const id = getRowId(item);
        return selectedRows[id];
      }),
    [data, getRowId, selectedRows]
  );

  const isAllSelected = React.useMemo(
    () =>
      data.length > 0 &&
      data.every((item) => {
        const id = getRowId(item);
        return selectedRows[id];
      }),
    [data, getRowId, selectedRows]
  );

  const toggleAll = React.useCallback(() => {
    if (isAllSelected) {
      setSelectedRows({});
    } else {
      const newSelection: Record<string, boolean> = {};
      data.forEach((item) => {
        const id = getRowId(item);
        newSelection[id] = true;
      });
      setSelectedRows(newSelection);
    }
  }, [data, getRowId, isAllSelected]);

  const toggleRow = React.useCallback(
    (row: T) => {
      const id = getRowId(row);
      setSelectedRows((prev: Record<string, boolean>) => ({
        ...prev,
        [id]: !prev[id],
      }));
    },
    [getRowId]
  );

  return {
    selectedRows,
    selectedItems,
    isAllSelected,
    onSelectionChange: handleSelectionChange,
    toggleAll,
    toggleRow,
  };
} 