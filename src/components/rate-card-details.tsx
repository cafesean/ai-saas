import React from 'react';
import { RateCard, Level, LevelRate } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useFormValidation } from '@/hooks/useFormValidation';
import { rateCardSchema } from '@/schemas';

interface RateCardDetailsProps {
  rateCard: RateCard | null;
  levels: Level[];
  onOpenChange: (open: boolean) => void;
  onEdit: (rateCard: RateCard) => void;
  onDelete: (rateCard: RateCard) => void;
  onSave: (rateCard: Omit<RateCard, 'id'>) => void;
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
  const [formData, setFormData] = React.useState({
    name: rateCard.name,
    description: rateCard.description,
    effectiveDate: rateCard.effectiveDate.toISOString().split('T')[0],
    expireDate: rateCard.expireDate.toISOString().split('T')[0],
    levelRates: rateCard.levelRates,
  });

  const { validate, getFieldError, clearErrors } = useFormValidation(rateCardSchema);

  const getLevel = (levelId: string): Level | undefined => 
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

  const handleLevelRateChange = (levelId: string, monthlyRate: number) => {
    const existingRateIndex = formData.levelRates.findIndex(
      (rate: LevelRate) => rate.levelId === levelId
    );

    if (monthlyRate === 0 && existingRateIndex !== -1) {
      setFormData({
        ...formData,
        levelRates: formData.levelRates.filter((_: LevelRate, index: number) => index !== existingRateIndex),
      });
    } else if (existingRateIndex !== -1) {
      const updatedRates = [...formData.levelRates];
      updatedRates[existingRateIndex] = { levelId, monthlyRate };
      setFormData({
        ...formData,
        levelRates: updatedRates,
      });
    } else if (monthlyRate > 0) {
      setFormData({
        ...formData,
        levelRates: [...formData.levelRates, { levelId, monthlyRate }],
      });
    }
  };

  const getLevelRate = (levelId: string) => {
    return formData.levelRates.find((rate: LevelRate) => rate.levelId === levelId)?.monthlyRate || 0;
  };

  const handleSave = () => {
    if (!validate(formData)) return;

    onSave({
      ...formData,
      effectiveDate: new Date(formData.effectiveDate),
      expireDate: new Date(formData.expireDate),
    });
    setIsEditing(false);
    clearErrors();
  };

  const handleStartEdit = () => {
    setFormData({
      name: rateCard.name,
      description: rateCard.description,
      effectiveDate: rateCard.effectiveDate.toISOString().split('T')[0],
      expireDate: rateCard.expireDate.toISOString().split('T')[0],
      levelRates: rateCard.levelRates,
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <h3 className="modal-section-title">Description</h3>
            {isEditing ? (
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={getFieldError('description')}
                required
              />
            ) : (
              <p className="modal-value">{rateCard.description}</p>
            )}
          </div>

          <div>
            <h3 className="modal-section-title">Effective Date</h3>
            {isEditing ? (
              <Input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                error={getFieldError('effectiveDate')}
                required
              />
            ) : (
              <p className="modal-value">{formatDate(rateCard.effectiveDate)}</p>
            )}
          </div>

          <div>
            <h3 className="modal-section-title">Expire Date</h3>
            {isEditing ? (
              <Input
                type="date"
                value={formData.expireDate}
                onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                error={getFieldError('expireDate')}
                required
              />
            ) : (
              <p className="modal-value">{formatDate(rateCard.expireDate)}</p>
            )}
          </div>

          <div>
            <h3 className="modal-section-title">Level Rates</h3>
            <div className="modal-section-content">
              {levels.map((level) => (
                <div key={level.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">{level.name}</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={getLevelRate(level.id)}
                      onChange={(e) => handleLevelRateChange(level.id, parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-32 text-right"
                    />
                  ) : (
                    <span className="text-gray-600">
                      {formatCurrency(rateCard.levelRates.find(r => r.levelId === level.id)?.monthlyRate || 0)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {isEditing && getFieldError('levelRates') && (
              <p className="text-sm text-red-600">{getFieldError('levelRates')}</p>
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