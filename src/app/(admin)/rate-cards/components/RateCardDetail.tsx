import React from 'react';
import { RateCardView, LevelView, LevelRateView } from '@/framework/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/form/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/framework/lib/utils';
import { useFormValidation } from '@/framework/hooks/useFormValidation';
import { rateCardSchema } from '@/schemas';

interface FormData {
  name: string;
  description: string;
  effective_date: string;
  expire_date: string;
  level_rates: LevelRateView[];
}

interface RateCardDetailsProps {
  rateCard: RateCardView | null;
  levels: LevelView[];
  onOpenChange: (open: boolean) => void;
  onEdit: (rateCard: RateCardView) => void;
  onDelete: (rateCard: RateCardView) => void;
  onSave: (rateCard: Omit<RateCardView, 'id'>) => void;
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

  const [isEditing, setIsEditing] = React.useState(false);
  const [editedRateCard, setEditedRateCard] = React.useState<FormData>({
    name: rateCard.name,
    description: rateCard.description ?? '',
    effective_date: rateCard.effective_date instanceof Date 
      ? rateCard.effective_date.toISOString().split('T')[0]
      : new Date(rateCard.effective_date).toISOString().split('T')[0],
    expire_date: rateCard.expire_date 
      ? (rateCard.expire_date instanceof Date 
        ? rateCard.expire_date.toISOString().split('T')[0]
        : new Date(rateCard.expire_date).toISOString().split('T')[0])
      : '',
    level_rates: rateCard.levelRates,
  });

  const { validate, getFieldError, clearErrors } = useFormValidation(rateCardSchema._def.schema);

  const getLevel = (levelId: number): LevelView | undefined => 
    levels.find((l) => l.id === levelId);

  const formatDate = (date: Date) => {
    const utcDate = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
    
    return utcDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC'
    });
  };

  const handleLevelRateChange = (levelId: number, monthlyRate: number) => {
    const existingRateIndex = editedRateCard.level_rates.findIndex(
      (rate: LevelRateView) => rate.level.id === levelId
    );

    if (monthlyRate === 0 && existingRateIndex !== -1) {
      setEditedRateCard({
        ...editedRateCard,
        level_rates: editedRateCard.level_rates.filter((_: LevelRateView, index: number) => index !== existingRateIndex),
      });
    } else if (existingRateIndex !== -1) {
      const updatedRates = [...editedRateCard.level_rates];
      updatedRates[existingRateIndex] = {
        ...updatedRates[existingRateIndex],
        monthlyRate: monthlyRate.toString(),
      };
      setEditedRateCard({
        ...editedRateCard,
        level_rates: updatedRates,
      });
    } else if (monthlyRate > 0) {
      const newRate: LevelRateView = {
        id: levelId,
        monthlyRate: monthlyRate,
        level: getLevel(levelId)!,
        rateCard: rateCard,
      };
      setEditedRateCard({
        ...editedRateCard,
        level_rates: [...editedRateCard.level_rates, newRate],
      });
    }
  };

  const getLevelRate = (levelId: number) => {
    return editedRateCard.level_rates.find((rate: LevelRateView) => rate.level.id === levelId)?.monthlyRate || 0;
  };

  const handleSave = () => {
    const validationData = {
      name: editedRateCard.name,
      description: editedRateCard.description,
      effective_date: new Date(editedRateCard.effective_date + 'T00:00:00Z'),
      expire_date: editedRateCard.expire_date ? new Date(editedRateCard.expire_date + 'T00:00:00Z') : null,
      levelRates: editedRateCard.level_rates.map((rate: LevelRateView) => ({
        levelId: rate.level.id,
        monthlyRate: Number(rate.monthlyRate),
      })),
    };
    if (!validate(validationData)) return;

    onSave({
      name: editedRateCard.name,
      description: editedRateCard.description,
      effective_date: new Date(editedRateCard.effective_date + 'T00:00:00Z'),
      expire_date: editedRateCard.expire_date ? new Date(editedRateCard.expire_date + 'T00:00:00Z') : null,
      levelRates: editedRateCard.level_rates.map((rate: LevelRateView) => ({
        id: rate.id,
        level: rate.level,
        monthlyRate: Number(rate.monthlyRate),
      })),
    });
    setIsEditing(false);
    clearErrors();
  };

  const handleStartEdit = () => {
    setEditedRateCard({
      name: rateCard.name,
      description: rateCard.description ?? '',
      effective_date: rateCard.effective_date ? rateCard.effective_date.toISOString().split('T')[0] : '',
      expire_date: rateCard.expire_date ? rateCard.expire_date.toISOString().split('T')[0] : '',
      level_rates: rateCard.levelRates.map((rate: LevelRateView) => ({
        id: rate.id,
        level: rate.level,
        monthlyRate: rate.monthlyRate,
        rateCard: rateCard,
      })),
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    clearErrors();
  };

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
              {rateCard.effective_date ? formatDate(rateCard.effective_date) : 'No date set'}
            </p>
          </div>

          <div>
            <h2 className="modal-section-title">Expire Date</h2>
            <p className="modal-value">
              {rateCard.expire_date ? formatDate(rateCard.expire_date) : 'No expiration date'}
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