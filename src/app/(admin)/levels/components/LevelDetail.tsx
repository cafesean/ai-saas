import React from 'react';
import Link from 'next/link';
import { LevelView, RateCardView, RoleView } from '@/framework/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency } from '@/framework/lib/utils';
import { Button } from '@/components/form/Button';
import { Input } from '@/components/ui/Input';
import { useFormValidation } from '@/framework/hooks/useFormValidation';
import { levelSchema } from '@/schemas';

interface LevelDetailsProps {
  level: LevelView | null;
  rateCards: RateCardView[];
  roles: RoleView[];
  onOpenChange: (open: boolean) => void;
  onRoleClick: (roleId: number) => void;
  onEdit: (level: LevelView) => void;
  onDelete: (level: LevelView) => void;
  onSave: (level: Omit<LevelView, 'id'>) => void;
}

export function LevelDetails({ 
  level, 
  rateCards,
  roles,
  onOpenChange, 
  onRoleClick,
  onEdit,
  onDelete,
  onSave 
}: LevelDetailsProps) {
  if (!level) return null;

  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: level.name,
    description: level.description,
    code: level.code,
    roles: level.roles.map(role => role.id),
  });

  const { validate, getFieldError, clearErrors } = useFormValidation(levelSchema);

  const handleSave = () => {
    if (!validate(formData)) return;

    const selectedRoles = roles.filter(role => formData.roles.includes(role.id));
    onSave({
      name: formData.name,
      description: formData.description,
      code: formData.code,
      roles: selectedRoles,
    });
    setIsEditing(false);
    clearErrors();
  };

  const handleStartEdit = () => {
    setFormData({
      name: level.name,
      description: level.description,
      code: level.code,
      roles: level.roles.map(role => role.id),
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    clearErrors();
  };

  const usedInRateCards = rateCards.filter(rateCard =>
    rateCard.levelRates.some(rate => rate.level.id === level.id)
  );

  return (
    <Dialog open={!!level} onOpenChange={onOpenChange}>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle className="mb-8">
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                error={getFieldError('name')}
                required
              />
            ) : (
              level.name
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Level Code</h2>
            {isEditing ? (
              <Input
                value={formData.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value })}
                error={getFieldError('code')}
                required={true}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{level.code}</p>
            )}
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-700">Description</h2>
            {isEditing ? (
              <Input
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                error={getFieldError('description')}
                required
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{level.description}</p>
            )}
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-700">Assigned Roles</h2>
            <div className="mt-2 space-y-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    checked={formData.roles.includes(role.id)}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...formData.roles, role.id]
                        : formData.roles.filter((id: number) => id !== role.id);
                      setFormData({ ...formData, roles: newRoles });
                    }}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label
                    htmlFor={`role-${role.id}`}
                    className={`ml-2 text-sm ${isEditing ? 'text-gray-900' : 'text-blue-600 hover:text-blue-800 cursor-pointer'}`}
                    onClick={!isEditing ? () => onRoleClick(role.id) : undefined}
                  >
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
            {isEditing && getFieldError('roles') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('roles')}</p>
            )}
          </div>

          {!isEditing && (
            <div>
              <h2 className="text-sm font-medium text-gray-700">Used in Rate Cards</h2>
              <div className="mt-2 space-y-2">
                {usedInRateCards.map(rateCard => (
                  <div key={rateCard.id} className="flex justify-between items-center text-sm">
                    <Link
                      href={`/rate-cards?id=${rateCard.id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {rateCard.name}
                    </Link>
                    <span className="text-gray-600">
                      {formatCurrency(
                        Number(rateCard.levelRates.find(rate => rate.level.id === level.id)?.monthlyRate) || 0
                      )}
                    </span>
                  </div>
                ))}
                {usedInRateCards.length === 0 && (
                  <p className="text-sm text-gray-500">Not used in any rate cards</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="h-7 px-2 text-xs font-bold"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-7 px-2 text-xs font-bold"
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
                className="h-7 px-2 text-xs font-bold"
                onClick={handleStartEdit}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="danger"
                className="h-7 px-2 text-xs font-bold"
                onClick={() => onDelete(level)}
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