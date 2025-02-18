// File: /components/modals/ConfirmDelete.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/form/Button';
import type { RateCardView } from '@/framework/types';

interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rateCard: RateCardView | null;
  isLoading?: boolean;
}

export function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  rateCard,
  isLoading
}: ConfirmDeleteProps) {
  if (!rateCard) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Rate Card</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Are you sure you want to delete the rate card &quot;{rateCard.name}&quot;?
          This action cannot be undone.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}