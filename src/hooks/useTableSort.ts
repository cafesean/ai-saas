import React from 'react';

export type SortConfig<T> = {
  key: keyof T;
  direction: 'asc' | 'desc';
} | null;

export function useTableSort<T extends Record<string, any>>(items: T[]) {
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
      
      // Handle date objects
      if (a[key] instanceof Date && b[key] instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? a[key].getTime() - b[key].getTime()
          : b[key].getTime() - a[key].getTime();
      }

      // Handle arrays by joining elements
      if (Array.isArray(a[key]) && Array.isArray(b[key])) {
        const aStr = a[key].map(item => item.name || item).join(',');
        const bStr = b[key].map(item => item.name || item).join(',');
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }

      const aValue = String(a[key]);
      const bValue = String(b[key]);
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
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