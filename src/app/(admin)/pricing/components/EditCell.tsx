'use client';

import { Button } from '@/components/form/Button';
import { Trash, Pencil, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditCellProps {
  row: any;
  table: any;
}

export const EditCell = ({ row, table }: EditCellProps) => {
  const meta = table.options.meta;
  const isEditing = meta?.editedRows[row.id];
  const isValid = meta?.isRowValid(row.id);

  const setEditMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    const action = e.currentTarget.name;
    if (action === 'edit') {
      meta?.setEditMode(row.id, true);
    } else if (action === 'cancel') {
      meta?.revertData(row.id);
      meta?.setEditMode(row.id, false);
    } else if (action === 'save') {
      meta?.setEditMode(row.id, false);
    }
  };

  const removeRow = () => {
    meta?.removeRow(row.id);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="lg"
          name="cancel"
          onClick={setEditMode}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          name="save"
          onClick={setEditMode}
          disabled={!isValid}
          className={cn(
            'h-8 w-8',
            isValid ? 'text-green-600 hover:text-green-700' : 'text-gray-400'
          )}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="lg"
        name="edit"
        onClick={setEditMode}
        className="h-8 w-8 text-blue-600 hover:text-blue-700"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="lg"
        onClick={removeRow}
        className="h-8 w-8 text-red-600 hover:text-red-700"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}; 