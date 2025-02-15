import React from 'react';
import { Role } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormValidation } from '@/hooks/useFormValidation';
import { roleSchema } from '@/schemas';

interface RoleDetailsProps {
  role: Role | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onSave: (role: Omit<Role, 'id'>) => void;
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <h3 className="text-sm font-medium text-gray-700">Role Code</h3>
            {isEditing ? (
              <Input
                value={formData.roleCode}
                onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                error={getFieldError('roleCode')}
                required
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{role.roleCode}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            {isEditing ? (
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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