import { type ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"

interface UseTableColumnsProps<T> {
  columns: Array<{
    key: keyof T
    header: string
    cell?: (info: { getValue: () => any }) => React.ReactNode
    enableSorting?: boolean
    enableFiltering?: boolean
    width?: number
  }>
}

export const useTableColumns = <T extends object>({ columns }: UseTableColumnsProps<T>) => {
  const tableColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col.key,
        header: col.header,
        cell: col.cell,
        enableSorting: col.enableSorting ?? true,
        enableColumnFilter: col.enableFiltering ?? false,
        size: col.width,
      })),
    [columns]
  )

  return tableColumns
} 