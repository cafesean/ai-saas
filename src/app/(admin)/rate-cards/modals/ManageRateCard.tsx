import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/form/Button';
import { Input } from '@/components/ui/Input';
import type { RateCardView, LevelView } from '@/framework/types';
import { useFormValidation } from '@/framework/hooks/useFormValidation';
import { rateCardSchema } from '@/schemas';
import React from 'react';

interface LevelRate {
  id: string;
  level_id: number;
  monthly_rate: number;
  level: LevelView;
}

interface NewRateCard {
  name: string;
  description: string;
  effective_date: string;
  expire_date: string;
  level_rates: LevelRate[];
}

interface ManageRateCardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  rateCard: NewRateCard;
  onRateCardChange: (field: keyof NewRateCard, value: string) => void;
  onLevelRateChange: (levelId: number, monthlyRate: number) => void;
  levels?: LevelView[];
  isEdit?: boolean;
  getLevelRate: (levelId: number) => number;
}

export function ManageRateCard({
  open,
  onClose,
  onSubmit,
  rateCard,
  onRateCardChange,
  onLevelRateChange,
  levels = [],
  isEdit = false,
  getLevelRate
}: ManageRateCardProps) {
  const { validate, getFieldError, clearErrors } = useFormValidation(rateCardSchema._def.schema);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Create'} Rate Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={rateCard.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRateCardChange('name', e.target.value)}
                error={getFieldError('name')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={rateCard.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRateCardChange('description', e.target.value)}
                error={getFieldError('description')}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Effective Date</label>
              <Input
                type="date"
                value={rateCard.effective_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRateCardChange('effective_date', e.target.value)}
                error={getFieldError('effective_date')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expire Date</label>
              <Input
                type="date"
                value={rateCard.expire_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRateCardChange('expire_date', e.target.value)}
                error={getFieldError('expire_date')}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Level Rates</label>
            <div className="space-y-2">
              {levels.map((level) => (
                <div key={level.id} className="flex items-center gap-4">
                  <span className="w-32">{level.name}</span>
                  <Input
                    type="number"
                    value={getLevelRate(level.id)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLevelRateChange(level.id, parseFloat(e.target.value) || 0)}
                    className="w-32"
                    error={getFieldError('level_rates')}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}