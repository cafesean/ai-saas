import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { SortConfig } from '@/framework/hooks/useTableSort';

interface TableHeaderProps<T> {
  column: keyof T;
  label: string;
  sortConfig: SortConfig<T>;
  onSort: (column: keyof T) => void;
}

export function TableHeader<T>({ 
  column, 
  label, 
  sortConfig, 
  onSort 
}: TableHeaderProps<T>) {
  return (
    <th 
      scope="col"
      className="px-4 py-2 text-left text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown 
          className={`h-3 w-3 ${
            sortConfig?.key === column 
              ? 'text-primary' 
              : 'text-gray-400'
          } ${
            sortConfig?.key === column && sortConfig.direction === 'desc'
              ? 'rotate-180'
              : ''
          }`}
        />
      </div>
    </th>
  );
} 