'use client';

import { type RouterOutputs } from '@/utils/trpc';
import {
  type ColumnDef,
  type SortingState,
  type Row,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { api } from '@/utils/trpc';
import { DataTable } from '@/components/ui/table/DataTable';
import { Badge } from '@/components/Badge';
import { formatCurrency } from '@/framework/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/form/Button';import { ExternalLink } from 'lucide-react';

type PricingList = RouterOutputs['pricing']['getAll'];
type PricingItem = PricingList['items'][number];

interface PricingTableProps {
  initialData?: PricingList;
}

export function PricingTable({ initialData }: PricingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data } = api.pricing.getAll.useQuery(
    {
      limit: pagination.pageSize,
      cursor: pagination.pageIndex * pagination.pageSize,
    },
    {
      initialData,
      refetchOnMount: false,
    }
  );

  const columns = useMemo<ColumnDef<PricingItem, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Link
            href={`/pricing/${row.original.code}`}
            className="inline-flex items-center text-primary hover:underline"
          >
            {row.original.code}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      {
        accessorKey: 'customer_id',
        header: 'Customer',
      },
      {
        accessorKey: 'ratecard.name',
        header: 'Rate Card',
        cell: ({ row }) => row.original.ratecard?.name ?? '-',
      },
      {
        accessorKey: 'resource_count',
        header: 'Resources',
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.resource_count}
          </Badge>
        ),
      },
      {
        accessorKey: 'total_amount',
        header: 'Total Amount',
        cell: ({ row }) => 
          formatCurrency(Number(row.original.total_amount)),
      },
    ],
    []
  );

  if (!data?.items) {
    return null;
  }

  return (
    <DataTable
      data={data.items}
      columns={columns as any}
    />
  );
} 