'use client';

import { useState, useMemo, useRef } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Button } from '@/components/form/Button';
import { usePricingStore } from '../store/usePricingStore';
import { useRateCardPrices } from '../hooks/useRateCardPrices';
import type { RouterOutputs } from '@/utils/trpc';
import { columns, type TableRow } from './columns';

type PricingRole = RouterOutputs['pricing']['getByCode']['pricing_roles'][number];
type Pricing = RouterOutputs['pricing']['getByCode'];
type Role = RouterOutputs['role']['getAll'][number];
type Level = RouterOutputs['level']['getAll'][number];

interface RoleLevelPricingProps {
  pricing: Pricing;
  roles: Role[];
  levels: Level[];
}

interface EditedRows {
  [key: number]: boolean;
}

interface ValidRows {
  [key: number]: {
    [key: string]: boolean;
  };
}

const useRoleLevelPricingTable = (initialData: TableRow[]) => {
  const { updatePricingRole, removePricingRole } = usePricingStore();
  const [data, setData] = useState(initialData);
  const [editedRows, setEditedRows] = useState<EditedRows>({});
  const [validRows, setValidRows] = useState<ValidRows>({});
  const [pendingChanges, setPendingChanges] = useState<{ [key: number]: Partial<TableRow>; }>({});

  const setEditMode = (rowId: number, enabled: boolean) => {
    setEditedRows((prev) => ({ ...prev, [rowId]: enabled }));
  };

  const updateData = (rowId: number, columnId: string, value: any) => {
    setData((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            [columnId]: value,
          };
        }
        return row;
      })
    );

    // Store in pending changes
    setPendingChanges((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        [columnId]: value,
      },
    }));
  };

  const revertData = (rowId: number) => {
    const originalRow = initialData.find(row => row.id === rowId);
    if (originalRow) {
      setData((prev) =>
        prev.map((row) =>
          row.id === rowId ? originalRow : row
        )
      );
    }

    setEditedRows((prev) => {
      const { [rowId]: _, ...rest } = prev;
      return rest;
    });

    setPendingChanges((prev) => {
      const { [rowId]: _, ...rest } = prev;
      return rest;
    });
  };

  const saveChanges = (rowId: number) => {
    const changes = pendingChanges[rowId];
    if (!changes) return;
    // Transform changes to match the expected type
    const transformedChanges: Partial<PricingRole> = {
      role_id: changes.role_id,
      level_id: changes.level_id,
      quantity: changes.quantity,
      base_price: changes.base_price,
      override_price: changes.override_price,
      discount_rate: changes.discount_rate,
      final_price: changes.final_price,
    };

    // Update store
    updatePricingRole(rowId, transformedChanges);

    // Clear pending changes
    setPendingChanges((prev) => {
      const { [rowId]: _, ...rest } = prev;
      return rest;
    });

    // Exit edit mode
    setEditMode(rowId, false);
  };

  const removeRow = (rowId: number) => {
    setData((prev) => prev.filter((row) => row.id !== rowId));
    removePricingRole(rowId);
    setEditedRows((prev) => {
      const { [rowId]: _, ...rest } = prev;
      return rest;
    });
  };

  const addRow = (newRow: TableRow) => {
    setData((prev) => [...prev, newRow]);
  };

  const isRowValid = (rowId: number) => {
    const rowValidation = validRows[rowId];
    if (!rowValidation) return true;
    return !Object.values(rowValidation).includes(false);
  };

  return {
    data,
    editedRows,
    validRows,
    pendingChanges,
    setEditMode,
    updateData,
    revertData,
    saveChanges,
    removeRow,
    addRow,
    isRowValid,
  };
};

export const RoleLevelPricing = ({ pricing, roles, levels }: RoleLevelPricingProps) => {
  const { currentPricing, addPricingRole, updatePricingRole, removePricingRole } = usePricingStore();
  const { getRateCardPrice } = useRateCardPrices();
  const tempIdCounter = useRef(-1); // Track temporary IDs

  if (!currentPricing || !roles.length || !levels.length) return null;

  const data: TableRow[] = currentPricing.pricing_roles.map((role) => ({
    id: role.id,
    role_id: role.role_id,
    level_id: role.level_id,
    quantity: role.quantity,
    base_price: role.base_price,
    override_price: role.override_price,
    discount_rate: role.discount_rate,
    final_price: role.final_price,
    role: role.role ? {
      id: role.role.id,
      name: role.role.name,
      description: role.role.description,
      role_code: role.role.role_code,
    } : null,
    level: role.level ? {
      id: role.level.id,
      name: role.level.name,
      description: role.level.description,
      code: role.level.code,
    } : null,
  }));

  const {
    data: tableData,
    editedRows,
    validRows,
    pendingChanges,
    setEditMode,
    updateData,
    revertData,
    saveChanges,
    removeRow,
    addRow,
    isRowValid,
  } = useRoleLevelPricingTable(data);

  const handleAddRole = () => {
    const defaultRole = roles[0];
    const defaultLevel = levels[0];
    const basePrice = getRateCardPrice(defaultRole?.id ?? 0);

    // Use ref for stable ID generation
    const tempId = tempIdCounter.current;
    tempIdCounter.current -= 1; // Decrement for next use

    const newRow: TableRow = {
      id: tempId,
      role_id: defaultRole?.id ?? null,
      level_id: defaultLevel?.id ?? null,
      quantity: 1,
      base_price: basePrice?.toString() || "0",
      override_price: null,
      discount_rate: null,
      final_price: basePrice?.toString() || "0",
      role: defaultRole ? {
        id: defaultRole.id,
        name: defaultRole.name,
        role_code: defaultRole.role_code, // Note: using roleCode to match type
        description: null, // Add description to match type
      } : null,
      level: defaultLevel ? {
        id: defaultLevel.id,
        name: defaultLevel.name,
        code: defaultLevel.code,
        description: null, // Add description to match type
      } : null,
    };

    // Add to table state
    addRow(newRow);

    // Add to Zustand store
    addPricingRole({
      pricing_id: null,
      role_id: defaultRole?.id ?? null,
      level_id: defaultLevel?.id ?? null,
      quantity: 1,
      base_price: basePrice?.toString() || "0",
      multiplier: '1',
      override_price: null,
      discount_rate: null,
      final_price: basePrice?.toString() || "0",
      role: defaultRole ?? null,
      level: defaultLevel ?? null,
    });
  };

  const table = useReactTable({
    data: tableData as import("/Users/seanliao/Dropbox/_engineering/code/palantir/platform-n8n/src/app/(admin)/pricing/components/columns").TableRow[], // Type assertion to fix type error
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      editedRows,
      validRows,
      pendingChanges,
      setEditMode,
      updateData,
      revertData,
      removeRow,
      saveChanges,
      isRowValid,
      roles,
      levels,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <Button onClick={handleAddRole} variant="outline">
          Add Role
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b px-4 py-2 text-left font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b last:border-none">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 