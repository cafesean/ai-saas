// File: /components/modals/ConfirmSave.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/form/Button';

interface ConfirmSaveProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function ConfirmSave({
  open,
  onClose,
  onConfirm,
  isLoading,
  isEdit = false
}: ConfirmSaveProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Update' : 'Create'} Rate Card</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Are you sure you want to {isEdit ? 'update' : 'create'} this rate card?
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}