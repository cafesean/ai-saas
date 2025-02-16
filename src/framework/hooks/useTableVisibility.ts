import React from 'react';

interface UseTableVisibilityProps<T> {
  columns: Array<keyof T>;
  initialVisibility?: Record<keyof T, boolean>;
}

export function useTableVisibility<T>({
  columns,
  initialVisibility = {} as Record<keyof T, boolean>,
}: UseTableVisibilityProps<T>) {
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<keyof T, boolean>
  >(() => {
    const visibility: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
    columns.forEach((column) => {
      visibility[column] = initialVisibility[column] ?? true;
    });
    return visibility;
  });

  const handleVisibilityChange = React.useCallback(
    (column: keyof T, isVisible: boolean) => {
      setColumnVisibility((prev: Record<keyof T, boolean>) => ({
        ...prev,
        [column]: isVisible,
      }));
    },
    []
  );

  const toggleVisibility = React.useCallback(
    (column: keyof T) => {
      setColumnVisibility((prev: Record<keyof T, boolean>) => ({
        ...prev,
        [column]: !prev[column],
      }));
    },
    []
  );

  const resetVisibility = React.useCallback(() => {
    const visibility: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
    columns.forEach((column) => {
      visibility[column] = true;
    });
    setColumnVisibility(visibility);
  }, [columns]);

  const visibleColumns = React.useMemo(
    () => columns.filter((column) => columnVisibility[column]),
    [columns, columnVisibility]
  );

  return {
    columnVisibility,
    visibleColumns,
    onVisibilityChange: handleVisibilityChange,
    toggleVisibility,
    resetVisibility,
  };
} 