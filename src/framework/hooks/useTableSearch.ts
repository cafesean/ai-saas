import React from 'react';

interface UseTableSearchProps<T> {
  data: T[];
  searchableColumns: Array<keyof T>;
  initialSearchTerm?: string;
}

export function useTableSearch<T>({
  data,
  searchableColumns,
  initialSearchTerm = '',
}: UseTableSearchProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState(initialSearchTerm);

  const handleSearchChange = React.useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = React.useCallback(() => {
    setSearchTerm('');
  }, []);

  const searchedData = React.useMemo(() => {
    if (!searchTerm) return data;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return data.filter((item) =>
      searchableColumns.some((column) => {
        const value = item[column];
        if (value == null) return false;

        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearchTerm);
        }

        if (typeof value === 'number') {
          return value.toString().includes(lowerSearchTerm);
        }

        if (typeof value === 'boolean') {
          return value.toString() === lowerSearchTerm;
        }

        if (Array.isArray(value)) {
          return value.some((v) =>
            v.toString().toLowerCase().includes(lowerSearchTerm)
          );
        }

        if (typeof value === 'object') {
          return JSON.stringify(value)
            .toLowerCase()
            .includes(lowerSearchTerm);
        }

        return false;
      })
    );
  }, [data, searchableColumns, searchTerm]);

  return {
    searchTerm,
    searchedData,
    onSearchChange: handleSearchChange,
    clearSearch,
  };
} 