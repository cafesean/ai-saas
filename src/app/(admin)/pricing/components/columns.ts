'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { TableCell } from './TableCell';
import { EditCell } from './EditCell';
import { formatCurrency } from '@/framework/lib/utils';


export type TableRow = {
  id: number
  role_id: number | null
  level_id: number | null
  quantity: number
  base_price: string
  override_price: string | null
  discount_rate: string | null
  final_price: string
  role: {
    id: number
    name: string
    description: string | null
    role_code: string
  } | null
  level: {
    id: number
    name: string
    code: string
    description: string | null
  } | null
}

export interface ColumnMeta {
  type: 'number' | 'text' | 'select' | 'currency';
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  className?: string;
  format?: (value: any) => string;
}

const columnHelper = createColumnHelper<TableRow>();

export const columns = [
  columnHelper.accessor('role_id', {
    header: 'Role',
    cell: TableCell,
    meta: {
      type: 'select',
      validation: {
        required: true,
      },
    },
  }),
  columnHelper.accessor('level_id', {
    header: 'Level',
    cell: TableCell,
    meta: {
      type: 'select',
      validation: {
        required: true,
      },
    },
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    cell: TableCell,
    meta: {
      type: 'number',
      validation: {
        required: true,
        min: 1,
        message: 'Quantity must be greater than 0',
      },
    },
  }),
  columnHelper.accessor('base_price', {
    header: 'Base Price',
    cell: TableCell,
    meta: {
      type: 'currency',
      className: 'text-right',
      format: (value: string) => formatCurrency(Number(value)),
    },
  }),
  columnHelper.accessor('override_price', {
    header: 'Override Price',
    cell: TableCell,
    meta: {
      type: 'currency',
      className: 'text-right',
      validation: {
        min: 0,
        message: 'Override price must be greater than or equal to 0',
      },
      format: (value: string | null) => value ? formatCurrency(Number(value)) : '',
    },
  }),
  columnHelper.accessor('discount_rate', {
    header: 'Discount Rate',
    cell: TableCell,
    meta: {
      type: 'number',
      className: 'text-right',
      validation: {
        min: 0,
        max: 100,
        message: 'Discount rate must be between 0 and 100',
      },
    },
  }),
  columnHelper.accessor('final_price', {
    header: 'Final Price',
    cell: TableCell,
    meta: {
      type: 'currency',
      className: 'text-right',
      format: (value: string) => formatCurrency(Number(value)),
    },
  }),
  columnHelper.accessor('id', {
    header: 'Actions',
    cell: EditCell,
  }),
]; 