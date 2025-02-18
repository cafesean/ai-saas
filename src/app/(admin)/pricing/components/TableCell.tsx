'use client';

import { Input } from '@/components/form/Input';
import Select from '@/components/form/Select';
import { cn } from '@/lib/utils';
import type { ColumnMeta } from './columns';

interface TableCellProps {
  getValue: () => any;
  row: any;
  column: any;
  table: any;
}

export const TableCell = ({
  getValue,
  row,
  column,
  table,
}: TableCellProps) => {
  const initialValue = getValue();
  const columnMeta = column.columnDef.meta as ColumnMeta;
  const tableMeta = table.options.meta;
  const isEditing = tableMeta?.editedRows[row.id];
  const pendingValue = tableMeta?.pendingChanges[row.id]?.[column.id];
  const value = pendingValue ?? initialValue;

  const onValueChange = (newValue: string) => {
    tableMeta?.updateData(row.id, column.id, newValue);
  };

  const validateValue = (value: any): boolean => {
    if (!columnMeta?.validation) return true;
    const { required, min, max, pattern } = columnMeta.validation;

    if (required && !value) return false;
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value);
      if (min !== undefined && numValue < min) return false;
      if (max !== undefined && numValue > max) return false;
    }
    if (pattern && typeof value === 'string' && !pattern.test(value)) return false;

    return true;
  };

  const formatValue = (value: any): string => {
    if (!value && value !== 0) return '';
    if (columnMeta?.format) return columnMeta.format(value);
    return String(value);
  };

  if (isEditing) {
    if (columnMeta?.type === 'select') {
      const options = column.id === 'roleId' 
        ? table.options.meta?.roles?.map((r: any) => ({ value: String(r.id), label: r.name }))
        : table.options.meta?.levels?.map((l: any) => ({ value: String(l.id), label: l.name }));

      return (
        <Select
          value={String(value)}
          onValueChange={onValueChange}
          options={options || []}
          className={cn(
            'h-8 min-w-[120px]',
            columnMeta?.className,
            !validateValue(value) && 'border-red-500'
          )}
        />
      );
    }

    return (
      <Input
        type={columnMeta?.type === 'number' || columnMeta?.type === 'currency' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          'h-8',
          columnMeta?.className,
          !validateValue(value) && 'border-red-500'
        )}
        min={columnMeta?.validation?.min}
        max={columnMeta?.validation?.max}
        step={columnMeta?.type === 'currency' ? '0.01' : '1'}
      />
    );
  }

  return (
    <span className={cn('block truncate px-4 py-2', columnMeta?.className)}>
      {formatValue(value)}
    </span>
  );
}; 