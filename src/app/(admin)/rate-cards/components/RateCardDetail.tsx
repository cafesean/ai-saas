import React from 'react';
import { RateCardView, LevelView, LevelRateView } from '@/framework/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/form/Button';
import { formatCurrency } from '@/framework/lib/utils';
import formatDate from '@/lib/formatDate';

interface RateCardDetailsProps {
  rateCard: RateCardView | null;
  levels: LevelView[];
  onOpenChange: (open: boolean) => void;
  onEdit: (rateCard: RateCardView) => void;
  onDelete: (rateCard: RateCardView) => void;
  onSave?: (rateCardData: Omit<RateCardView, 'id'>) => Promise<void>;
}

export function RateCardDetails({ 
  rateCard, 
  levels, 
  onOpenChange, 
  onEdit, 
  onDelete,
  onSave
}: RateCardDetailsProps) {
  if (!rateCard) return null;

  return (
    <Dialog open={!!rateCard} onOpenChange={onOpenChange}>
      <DialogContent className="modal-content">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">{rateCard.name}</DialogTitle>
        </DialogHeader>
        
        <div className="modal-section">
          <div>
            <h2 className="modal-section-title">Description</h2>
            <p className="modal-value">{rateCard.description}</p>
          </div>

          <div>
            <h2 className="modal-section-title">Effective Date</h2>
            <p className="modal-value">
              {rateCard.effectiveDate ? formatDate(rateCard.effectiveDate) : 'No date set'}
            </p>
          </div>

          <div>
            <h2 className="modal-section-title">Expire Date</h2>
            <p className="modal-value">
              {rateCard.expireDate ? formatDate(rateCard.expireDate) : 'No expiration date'}
            </p>
          </div>

          <div>
            <h2 className="modal-section-title">Level Rates</h2>
            <div className="modal-section-content">
              {levels.map((level) => (
                <div key={level.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">{level.name}</span>
                  <span className="text-gray-600">
                    {formatCurrency(Number(rateCard.levelRates.find((r: LevelRateView) => r.level.id === level.id)?.monthlyRate || 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="modal-footer">
          <Button
            type="button"
            variant="secondary"
            className="modal-button"
            onClick={() => {
              onOpenChange(false);
              onEdit(rateCard);
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="danger"
            className="modal-button"
            onClick={() => onDelete(rateCard)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 