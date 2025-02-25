import * as React from 'react';

export type SortConfig<T> = {
  key: keyof T;
  direction: 'asc' | 'desc';
} | null;

export function useTableSort<T extends Record<string, unknown>>(items: T[]) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig<T>>(null);

  const handleSort = (key: keyof T) => {
    setSortConfig((currentConfig: SortConfig<T>) => {
      if (currentConfig?.key === key) {
        return {
          key,
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedItems = React.useMemo(() => {
    if (!sortConfig) return items;

    return [...items].sort((a, b) => {
      const key = sortConfig.key;
      const aValue = a[key];
      const bValue = b[key];
      
      // Handle date objects
      if (
        aValue instanceof Date && 
        bValue instanceof Date
      ) {
        return sortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Handle arrays by joining elements
      if (
        Array.isArray(aValue) && 
        Array.isArray(bValue)
      ) {
        const aStr = aValue.map((item: unknown) => 
          typeof item === 'object' && item !== null && 'name' in item && typeof item.name === 'string' 
            ? item.name 
            : String(item)
        ).join(',');
        
        const bStr = bValue.map((item: unknown) => 
          typeof item === 'object' && item !== null && 'name' in item && typeof item.name === 'string' 
            ? item.name 
            : String(item)
        ).join(',');
        
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }

      const aString = String(aValue);
      const bString = String(bValue);
      
      if (aString < bString) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [items, sortConfig]);

  return {
    sortConfig,
    handleSort,
    sortedItems
  };
} 