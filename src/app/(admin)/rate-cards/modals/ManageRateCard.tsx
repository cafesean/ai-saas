import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useRateCardForm } from "@/hooks/useRateCardForm";
import { formatCurrency } from "@/lib/utils";
import { LevelView, RateCardView } from "@/types";
import React from "react";

interface ManageRateCardProps {
  mode: 'create' | 'view' | 'edit'
  rateCard?: RateCardView
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (rateCard: RateCardView) => void
  onDelete?: (rateCard: RateCardView) => void
  onSave?: (data: Omit<RateCardView, "id">) => void
  levels: LevelView[]
}

export function ManageRateCard({
  mode,
  rateCard,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onSave,
  levels,
}: ManageRateCardProps) {
  const { form, isValid, isDirty } = useRateCardForm(
    mode === 'edit' || mode === 'view' 
      ? {
          name: rateCard?.name,
          description: rateCard?.description ?? '',
          effective_date: rateCard?.effectiveDate,
          expire_date: rateCard?.expireDate,
          level_rates: rateCard?.levelRates.map(rate => ({
            level_id: rate.level.id,
            monthly_rate: rate.monthlyRate,
          })) ?? [],
        }
      : {
          name: '',
          description: '',
          effective_date: new Date(),
          expire_date: null,
          level_rates: [],
        }
  )

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form

  React.useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      form.reset({
        name: rateCard?.name,
        description: rateCard?.description ?? '',
        effective_date: rateCard?.effectiveDate,
        expire_date: rateCard?.expireDate,
        level_rates: rateCard?.levelRates.map(rate => ({
          level_id: rate.level.id,
          monthly_rate: rate.monthlyRate,
        })) ?? [],
      });
    } else {
      form.reset({
        name: '',
        description: '',
        effective_date: new Date(),
        expire_date: null,
        level_rates: [],
      });
    }
  }, [mode, rateCard, form]);

  React.useEffect(() => {
    console.log('Form state:', {
      values: watch(),
      errors,
      isValid,
      isDirty,
      isSubmitting,
      mode,
    });
  }, [watch, errors, isValid, isDirty, isSubmitting, mode]);

  const handleFormSubmit = handleSubmit(async (data) => {
    console.log('Form data:', data);
    if (!data.level_rates || data.level_rates.length === 0) {
      console.error('No level rates provided');
      return;
    }
    try {
      if (onSave) {
        await onSave({
          name: data.name,
          description: data.description,
          effectiveDate: data.effective_date,
          expireDate: data.expire_date,
          levelRates: data.level_rates.map(rate => ({
            id: 0, // This will be ignored by the backend
            level: levels.find(l => l.id === rate.level_id)!,
            monthlyRate: rate.monthly_rate,
            rateCard: rateCard ?? { id: 0 } as RateCardView, // This will be ignored by the backend
          })),
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving rate card:', error);
    }
  });

  const isViewMode = mode === 'view'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-content">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">
            {mode === 'create' ? 'Create Rate Card' : 
             mode === 'edit' ? 'Edit Rate Card' : 
             'Rate Card Details'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="modal-form-grid">
            {isViewMode ? (
              <div className="modal-form-field">
                <label className="modal-form-label">Name</label>
                <p className="modal-form-value">{rateCard?.name}</p>
              </div>
            ) : (
              <Input
                label="Name"
                {...register('name')}
                error={errors.name?.message}
                required
              />
            )}

            {isViewMode ? (
              <div className="modal-form-field">
                <label className="modal-form-label">Description</label>
                <p className="modal-form-value">{rateCard?.description || 'No description'}</p>
              </div>
            ) : (
              <Input
                label="Description"
                {...register('description')}
                error={errors.description?.message}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              {isViewMode ? (
                <div className="modal-form-field">
                  <label className="modal-form-label">Effective Date</label>
                  <p className="modal-form-value">{rateCard?.effectiveDate.toLocaleDateString()}</p>
                </div>
              ) : (
                <Input
                  type="date"
                  label="Effective Date"
                  {...register('effective_date')}
                  error={errors.effective_date?.message}
                  required
                />
              )}

              {isViewMode ? (
                <div className="modal-form-field">
                  <label className="modal-form-label">Expire Date</label>
                  <p className="modal-form-value">
                    {rateCard?.expireDate?.toLocaleDateString() || 'No expiration date'}
                  </p>
                </div>
              ) : (
                <Input
                  type="date"
                  label="Expire Date"
                  {...register('expire_date')}
                  error={errors.expire_date?.message}
                />
              )}
            </div>

            <div className="modal-form-section">
              <div className="modal-section-title">Level Rates</div>
              <div className="modal-scroll-container">
                {levels.map((level) => (
                  <div key={level.id} className="modal-list-item">
                    <span className="flex-1 text-sm font-medium text-gray-700">{level.name}</span>
                    {isViewMode ? (
                      <span className="text-sm text-gray-600">
                        {formatCurrency(Number(rateCard?.levelRates.find(r => r.level.id === level.id)?.monthlyRate || 0))}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-32 text-right text-sm"
                        {...register(`level_rates.${level.id}.monthly_rate`)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = parseFloat(e.target.value)
                          if (!isNaN(value)) {
                            setValue(`level_rates.${level.id}`, {
                              level_id: level.id,
                              monthly_rate: value,
                            })
                          }
                        }}
                        error={errors.level_rates?.[level.id]?.monthly_rate?.message}
                      />
                    )}
                  </div>
                ))}
              </div>
              {errors.level_rates && !Array.isArray(errors.level_rates) && (
                <p className="modal-error">{errors.level_rates.message}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="modal-footer">
          {isViewMode ? (
            <>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="modal-button">
                Close
              </Button>
              {onEdit && (
                <Button type="button" variant="primary" onClick={() => onEdit(rateCard!)} className="modal-button">
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button type="button" variant="danger" onClick={() => onDelete(rateCard!)} className="modal-button">
                  Delete
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="modal-button">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isValid || !isDirty || isSubmitting}
                onClick={handleFormSubmit}
                className="modal-button"
              >
                {mode === 'create' ? 'Create' : 'Save'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}