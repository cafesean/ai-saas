import React from 'react';
import { RateCardView, LevelView, LevelRateView } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { useFormValidation } from '@/hooks/useFormValidation';
import { rateCardSchema } from '@/schemas';

interface FormData {
  name: string;
  description: string;
  effectiveDate: string;
  expireDate: string;
  levelRates: LevelRateView[];
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
  const [formData, setFormData] = React.useState<FormData>({
    name: rateCard.name,
    description: rateCard.description ?? '',
    effectiveDate: rateCard.effectiveDate.toISOString().split('T')[0],
    expireDate: rateCard.expireDate ? rateCard.expireDate.toISOString().split('T')[0] : '',
    levelRates: rateCard.levelRates,
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
    const existingRateIndex = formData.levelRates.findIndex(
      (rate: LevelRateView) => rate.level.id === levelId
    );

    if (monthlyRate === 0 && existingRateIndex !== -1) {
      setFormData({
        ...formData,
        levelRates: formData.levelRates.filter((_: LevelRateView, index: number) => index !== existingRateIndex),
      });
    } else if (existingRateIndex !== -1) {
      const updatedRates = [...formData.levelRates];
      updatedRates[existingRateIndex] = {
        ...updatedRates[existingRateIndex],
        monthlyRate: monthlyRate.toString(),
      };
      setFormData({
        ...formData,
        levelRates: updatedRates,
      });
    } else if (monthlyRate > 0) {
      const newRate: LevelRateView = {
        id: levelId,
        monthlyRate: monthlyRate,
        level: getLevel(levelId)!,
        rateCard: rateCard,
      };
      setFormData({
        ...formData,
        levelRates: [...formData.levelRates, newRate],
      });
    }
  };

  const getLevelRate = (levelId: number) => {
    return formData.levelRates.find((rate: LevelRateView) => rate.level.id === levelId)?.monthlyRate || 0;
  };

  const handleSave = () => {
    const validationData = {
      name: formData.name,
      description: formData.description,
      effectiveDate: new Date(formData.effectiveDate + 'T00:00:00Z'),
      expireDate: formData.expireDate ? new Date(formData.expireDate + 'T00:00:00Z') : null,
      levelRates: formData.levelRates.map((rate: LevelRateView) => ({
        levelId: rate.level.id,
        monthlyRate: Number(rate.monthlyRate),
      })),
    };
    if (!validate(validationData)) return;

    onSave({
      name: formData.name,
      description: formData.description,
      effectiveDate: new Date(formData.effectiveDate + 'T00:00:00Z'),
      expireDate: formData.expireDate ? new Date(formData.expireDate + 'T00:00:00Z') : null,
      levelRates: formData.levelRates.map((rate: LevelRateView) => ({
        id: rate.id,
        level: rate.level,
        monthlyRate: Number(rate.monthlyRate),
        rateCard: rateCard,
      })),
    });
    setIsEditing(false);
    clearErrors();
  };

  const handleStartEdit = () => {
    setFormData({
      name: rateCard.name,
      description: rateCard.description ?? '',
      effectiveDate: rateCard.effectiveDate.toISOString().split('T')[0],
      expireDate: rateCard.expireDate?.toISOString().split('T')[0] ?? '',
      levelRates: rateCard.levelRates.map((rate: LevelRateView) => ({
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
          <DialogTitle className="modal-title">
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                error={getFieldError('name')}
                required
              />
            ) : (
              rateCard.name
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="modal-section">
          <div>
            <h2 className="modal-section-title">Description</h2>
            {isEditing ? (
              <Input
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                error={getFieldError('description')}
                required
              />
            ) : (
              <p className="modal-value">{rateCard.description}</p>
            )}
          </div>

          <div>
            <h2 className="modal-section-title">Effective Date</h2>
            {isEditing ? (
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, effective_date: e.target.value })}
                error={getFieldError('effective_date')}
                required
              />
            ) : (
              <p className="modal-value">{formatDate(rateCard.effectiveDate)}</p>
            )}
          </div>

          <div>
            <h2 className="modal-section-title">Expire Date</h2>
            {isEditing ? (
              <Input
                type="date"
                value={formData.expireDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, expireDate: e.target.value })}
                error={getFieldError('expire_date')}
                required
              />
            ) : (
              <p className="modal-value">{rateCard.expireDate ? formatDate(rateCard.expireDate) : 'No expiration date'}</p>
            )}
          </div>

          <div>
            <h2 className="modal-section-title">Level Rates</h2>
            <div className="modal-section-content">
              {levels.map((level) => (
                <div key={level.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">{level.name}</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={getLevelRate(level.id)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLevelRateChange(level.id, parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-32 text-right"
                    />
                  ) : (
                    <span className="text-gray-600">
                      {formatCurrency(Number(rateCard.levelRates.find(r => r.level.id === level.id)?.monthlyRate || 0))}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {isEditing && getFieldError('level_rates') && (
              <p className="text-sm text-red-600">{getFieldError('level_rates')}</p>
            )}
          </div>
        </div>

        <DialogFooter className="modal-footer">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="modal-button"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="modal-button"
                onClick={handleSave}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                className="modal-button"
                onClick={handleStartEdit}
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 