'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { Role } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFormValidation } from '@/hooks/useFormValidation';
import { roleSchema } from '@/schemas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../../components/ui/alert-dialog';
import { ArrowUpDown } from 'lucide-react';

type SortConfig = {
  key: keyof Role;
  direction: 'asc' | 'desc';
} | null;

export default function RolesPage() {
  const { roles, addRole, updateRole, deleteRole } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    roleCode: '',
  });
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);

  const { validate, getFieldError, clearErrors } = useFormValidation(roleSchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(newRole)) return;

    if (selectedRole) {
      updateRole(selectedRole.id, newRole);
    } else {
      addRole(newRole);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setNewRole({ name: '', description: '', roleCode: '' });
    clearErrors();
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      roleCode: role.roleCode,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteRole(selectedRole.id);
      setDeleteConfirmOpen(false);
      setSelectedRole(null);
    }
  };

  const handleSort = (key: keyof Role) => {
    setSortConfig((currentConfig: SortConfig) => {
      if (currentConfig?.key === key) {
        return {
          key,
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedRoles = React.useMemo(() => {
    if (!sortConfig) return roles;

    return [...roles].sort((a, b) => {
      const key = sortConfig.key;
      const aValue = String(a[key as keyof Role]);
      const bValue = String(b[key as keyof Role]);
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [roles, sortConfig]);

  const SortableHeader = ({ column, label }: { column: keyof Role; label: string }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Roles Management</h1>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          Add Role
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                error={getFieldError('name')}
                required
              />
              <Input
                label="Role Code"
                value={newRole.roleCode}
                onChange={(e) => setNewRole({ ...newRole, roleCode: e.target.value })}
                error={getFieldError('roleCode')}
                required
              />
              <Input
                label="Description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                error={getFieldError('description')}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {selectedRole ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader column="name" label="Name" />
              <SortableHeader column="roleCode" label="Role Code" />
              <SortableHeader column="description" label="Description" />
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRoles.map((role: { id: string; name: string; roleCode: string; description: string }) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{role.roleCode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{role.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleEdit(role)}
                    variant="secondary"
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(role)}
                    variant="danger"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 