'use client';

import React from 'react';
import { useStore } from '@/store';
import { Role } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFormValidation } from '@/hooks/useFormValidation';
import { roleSchema } from '@/schemas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowUpDown } from 'lucide-react';
import { RoleDetails } from '@/components/role-details';
import { useTableSort } from '@/hooks/useTableSort';
import { useModalState } from '@/hooks/useModalState';
import { TableHeader } from '@/components/ui/table-header';

export default function RolesPage() {
  const { roles, addRole, updateRole, deleteRole } = useStore();
  const [isClient, setIsClient] = React.useState(false);
  const { 
    isModalOpen, 
    deleteConfirmOpen, 
    isConfirming, 
    selectedItem: selectedRole,
    viewingItem: viewingRole,
    openModal,
    closeModal,
    startConfirming,
    stopConfirming,
    openDeleteConfirm,
    closeDeleteConfirm,
    selectItem,
    viewItem
  } = useModalState<Role>();

  const [newRole, setNewRole] = React.useState({
    name: '',
    description: '',
    roleCode: '',
  });

  const {
    sortConfig,
    handleSort,
    sortedItems: sortedRoles
  } = useTableSort<Role>(roles);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { validate, getFieldError, clearErrors } = useFormValidation(roleSchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(newRole)) return;
    startConfirming();
  };

  const handleConfirm = () => {
    if (selectedRole) {
      updateRole(selectedRole.id, newRole);
    } else {
      addRole(newRole);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    closeModal();
    setNewRole({ name: '', description: '', roleCode: '' });
    clearErrors();
  };

  const handleEdit = (role: Role) => {
    selectItem(role);
    setNewRole({
      name: role.name,
      description: role.description,
      roleCode: role.roleCode,
    });
  };

  const handleDelete = (role: Role) => {
    openDeleteConfirm(role);
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteRole(selectedRole.id);
      closeDeleteConfirm();
    }
  };

  const handleSaveRole = (roleData: Omit<Role, 'id'>) => {
    if (viewingRole) {
      updateRole(viewingRole.id, roleData);
      viewItem(null);
    }
  };

  return (
    <div className="space-y-4 max-w-[100vw] px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Roles Management</h1>
        {isClient && (
          <Button onClick={openModal} variant="primary">
            Add Role
          </Button>
        )}
      </div>

      {isClient ? (
        <>
          <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">
                  {isConfirming 
                    ? 'Confirm Role Details'
                    : selectedRole 
                      ? `Edit ${selectedRole.name}`
                      : 'Add New Role'
                  }
                </DialogTitle>
              </DialogHeader>
              {isConfirming ? (
                <div className="modal-section">
                  <div>
                    <h3 className="modal-section-title">Name</h3>
                    <p className="modal-value">{newRole.name}</p>
                  </div>

                  <div>
                    <h3 className="modal-section-title">Role Code</h3>
                    <p className="modal-value">{newRole.roleCode}</p>
                  </div>

                  <div>
                    <h3 className="modal-section-title">Description</h3>
                    <p className="modal-value">{newRole.description}</p>
                  </div>

                  <DialogFooter className="modal-footer">
                    <Button
                      type="button"
                      variant="secondary"
                      className="modal-button"
                      onClick={() => stopConfirming()}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      className="modal-button"
                      onClick={handleConfirm}
                    >
                      {selectedRole ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
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

                  <DialogFooter className="modal-footer">
                    <Button type="button" variant="secondary" className="modal-button" onClick={handleCloseModal}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="modal-button">
                      {selectedRole ? 'Next' : 'Continue'}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">Delete Role</DialogTitle>
              </DialogHeader>
              <div className="modal-section">
                <p className="modal-text">
                  Are you sure you want to delete this role? This action cannot be undone.
                </p>
              </div>
              <DialogFooter className="modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  className="modal-button"
                  onClick={() => closeDeleteConfirm()}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="modal-button"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <RoleDetails
            role={viewingRole}
            onOpenChange={(open) => viewItem(open ? viewingRole : null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleSaveRole}
          />

          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeader<Role> column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} />
                    <TableHeader<Role> column="roleCode" label="Role Code" sortConfig={sortConfig} onSort={handleSort} />
                    <TableHeader<Role> column="description" label="Description" sortConfig={sortConfig} onSort={handleSort} />
                    <th scope="col" className="px-4 py-2 text-right text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRoles.map((role: Role) => (
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => viewItem(role)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {role.name}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-gray-600">{role.roleCode}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-gray-600 line-clamp-2">{role.description}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => handleEdit(role)}
                            variant="secondary"
                            className="modal-button"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(role)}
                            variant="danger"
                            className="modal-button"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 