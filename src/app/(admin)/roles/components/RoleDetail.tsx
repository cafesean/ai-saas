import React from 'react';
import { RoleView } from '@/framework/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/form/Button';
import { Input } from '@/components/ui/Input';
import { useFormValidation } from '@/framework/hooks/useFormValidation';
import { roleSchema } from '@/schemas';

interface RoleDetailsProps {
  role: RoleView | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (role: RoleView) => void;
  onDelete: (role: RoleView) => void;
  onSave: (role: Omit<RoleView, 'id'>) => void;
}

export function RoleDetails({ 
  role, 
  onOpenChange, 
  onEdit, 
  onDelete,
  onSave 
}: RoleDetailsProps) {
  if (!role) return null;

  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: role.name,
    description: role.description,
    roleCode: role.roleCode,
  });

  const { validate, getFieldError, clearErrors } = useFormValidation(roleSchema);

  const handleSave = () => {
    if (!validate(formData)) return;

    onSave(formData);
    setIsEditing(false);
    clearErrors();
  };

  const handleStartEdit = () => {
    setFormData({
      name: role.name,
      description: role.description,
      roleCode: role.roleCode,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    clearErrors();
  };

  return (
    <Dialog open={!!role} onOpenChange={onOpenChange}>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle className="mb-8">
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                error={getFieldError('name')}
                required
              />
            ) : (
              role.name
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Role Code</h2>
            {isEditing ? (
              <Input
                value={formData.roleCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, roleCode: e.target.value })}
                error={getFieldError('roleCode')}
                required
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{role.roleCode}</p>
            )}
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-700">Description</h2>
            {isEditing ? (
              <Input
                value={formData.description as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                error={getFieldError('description')}
                required
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{role.description}</p>
            )}
          </div>
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
                onClick={() => onDelete(role)}
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