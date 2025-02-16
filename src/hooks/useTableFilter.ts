import React from 'react';

interface UseTableFilterProps<T> {
  data: T[];
  columns: Array<keyof T>;
  initialFilters?: Record<keyof T, string>;
}

export function useTableFilter<T>({
  data,
  columns,
  initialFilters = {} as Record<keyof T, string>,
}: UseTableFilterProps<T>) {
  const [filters, setFilters] = React.useState<Record<keyof T, string>>(
    initialFilters
  );

  const handleFilterChange = React.useCallback(
    (column: keyof T, value: string) => {
      setFilters((prev: Record<keyof T, string>) => ({
        ...prev,
        [column]: value,
      }));
    },
    []
  );

  const clearFilters = React.useCallback(() => {
    setFilters({} as Record<keyof T, string>);
  }, []);

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      return columns.every((column) => {
        const filterValue = filters[column];
        if (!filterValue) return true;

        const value = item[column];
        if (value == null) return false;

        if (typeof value === 'string') {
          return value.toLowerCase().includes(filterValue.toLowerCase());
        }

        if (typeof value === 'number') {
          return value.toString().includes(filterValue);
        }

        if (typeof value === 'boolean') {
          return value.toString() === filterValue;
        }

        if (Array.isArray(value)) {
          return value.some((v) =>
            v.toString().toLowerCase().includes(filterValue.toLowerCase())
          );
        }

        if (typeof value === 'object') {
          return JSON.stringify(value)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }

        return false;
      });
    });
  }, [data, columns, filters]);

  return {
    filters,
    filteredData,
    onFilterChange: handleFilterChange,
    clearFilters,
  };
} 