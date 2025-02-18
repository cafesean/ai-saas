import { useState, useCallback } from 'react';
import { type RouterOutputs } from '@/utils/trpc';
import { usePricingStore } from '../store/usePricingStore';

type Pricing = RouterOutputs['pricing']['getByCode'];
type PricingRole = Pricing['pricing_roles'][number];

interface EditedRows {
  [key: number]: boolean;
}

interface ValidRows {
  [key: number]: {
    [key: string]: boolean;
  };
}

interface PendingChanges {
  [key: number]: Partial<PricingRole>;
}

export const useRoleLevelPricingTable = (initialData: PricingRole[]) => {
  const { updatePricingRole, addPricingRole, removePricingRole } = usePricingStore();
  const [data, setData] = useState(initialData);
  const [editedRows, setEditedRows] = useState<EditedRows>({});
  const [validRows, setValidRows] = useState<ValidRows>({});
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

  const setEditMode = useCallback((rowId: number, isEditing: boolean) => {
    setEditedRows((prev) => ({
      ...prev,
      [rowId]: isEditing,
    }));

    // Clear pending changes for this row if we're exiting edit mode
    if (!isEditing) {
      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
    }
  }, []);

  const updateData = useCallback(
    (rowId: number, columnId: string, value: any) => {
      // Update local data immediately for UI feedback
      setData((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [columnId]: value } : row
        )
      );

      // Store in pending changes
      setPendingChanges((prev) => ({
        ...prev,
        [rowId]: {
          ...(prev[rowId] || {}),
          [columnId]: value,
        },
      }));
    },
    []
  );

  const revertData = useCallback(
    (rowId: number) => {
      const originalRole = initialData.find((role) => role.id === rowId);

      if (originalRole) {
        setData((prev) =>
          prev.map((row) =>
            row.id === rowId ? originalRole : row
          )
        );
      }

      // Clear pending changes for this row
      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });

      // Clear edit mode and validation state for this row
      setEditedRows((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });

      setValidRows((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
    },
    [initialData]
  );

  const saveChanges = useCallback(
    (rowId: number) => {
      const changes = pendingChanges[rowId];
      if (!changes) return;

      // Update the store
      updatePricingRole(rowId, changes);

      // Clear pending changes for this row
      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });

      // Exit edit mode
      setEditMode(rowId, false);
    },
    [pendingChanges, updatePricingRole, setEditMode]
  );

  const removeRow = useCallback(
    (rowId: number) => {
      setData((prev) => prev.filter((row) => row.id !== rowId));
      removePricingRole(rowId);

      // Clear any pending changes
      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
    },
    [removePricingRole]
  );

  const addRow = useCallback(
    (newRow: Omit<PricingRole, 'id'>) => {
      const tempId = Math.min(...data.map((row) => row.id), 0) - 1;
      const rowWithId = { ...newRow, id: tempId };
      setData((prev) => [...prev, rowWithId]);
      addPricingRole(newRow);
    },
    [data, addPricingRole]
  );

  const isRowValid = useCallback(
    (rowId: number) => {
      const rowValidation = validRows[rowId];
      if (!rowValidation) return true; // If no validation state, assume valid
      return !Object.values(rowValidation).includes(false);
    },
    [validRows]
  );

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