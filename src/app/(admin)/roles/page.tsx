'use client';

import { RoleDetails } from '@/app/(admin)/roles/components/RoleDetail';
import { FormInput } from '@/components/form';
import { Button } from '@/components/form/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/table/DataTable';
import { useModalState } from '@/framework/hooks/useModalState';
import { useRoleForm } from '@/framework/hooks/useRoleForm';
import { useTableColumns } from '@/framework/hooks/useTableColumn';
import type { RoleView } from '@/framework/types';
import { dbToAppRole } from '@/framework/types';
import { api, useUtils } from '@/utils/trpc';
import React from 'react';

export default function RolesPage() {
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
  } = useModalState<RoleView>();

  // tRPC hooks
  const utils = useUtils();
  const roles = api.role.getAll.useQuery();
  const createRole = api.role.create.useMutation({
    onSuccess: () => utils.role.getAll.invalidate(),
  });
  const updateRole = api.role.update.useMutation({
    onSuccess: () => utils.role.getAll.invalidate(),
  });
  const deleteRole = api.role.delete.useMutation({
    onSuccess: () => utils.role.getAll.invalidate(),
  });

  const {
    form,
    isValid,
    isDirty,
    isSubmitting,
  } = useRoleForm(selectedRole ? {
    name: selectedRole.name,
    description: selectedRole.description ?? '',
    roleCode: selectedRole.roleCode,
  } : undefined);

  const { control, handleSubmit, reset } = form;

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const onSubmit = handleSubmit((data) => {
    startConfirming();
  });

  const handleConfirm = async () => {
    try {
      const formData = form.getValues();
      if (selectedRole) {
        await updateRole.mutateAsync({
          id: selectedRole.id,
          data: {
            name: formData.name,
            description: formData.description,
            role_code: formData.roleCode,
          },
        });
      } else {
        await createRole.mutateAsync({
          name: formData.name,
          description: formData.description,
          role_code: formData.roleCode,
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleCloseModal = () => {
    closeModal();
    reset({
      name: '',
      description: '',
      roleCode: '',
    });
  };

  const handleEdit = (role: RoleView) => {
    selectItem(role);
    reset({
      name: role.name,
      description: role.description ?? '',
      roleCode: role.roleCode,
    });
  };

  const handleDelete = (role: RoleView) => {
    openDeleteConfirm(role);
  };

  const handleViewDetail = (role: RoleView) => {
    viewItem(role);
  };

  const confirmDelete = async () => {
    if (selectedRole) {
      try {
        await deleteRole.mutateAsync(selectedRole.id);
        closeDeleteConfirm();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleSaveRole = async (roleData: Omit<RoleView, 'id'>) => {
    if (viewingRole) {
      try {
        await updateRole.mutateAsync({
          id: viewingRole.id,
          data: roleData,
        });
        viewItem(null);
      } catch (error) {
        console.error('Error updating role:', error);
      }
    }
  };

  const columns = useTableColumns<RoleView>({
    columns: [
      {
        key: 'name',
        header: 'Name',
        cell: ({ getValue }) => {
          const name = getValue() as string;
          const dbRole = roles.data?.find(r => r.name === name);
          const role = dbRole ? dbToAppRole(dbRole) : null;
          return (
            <button
              onClick={() => role && handleViewDetail(role)}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {name}
            </button>
          );
        },
      },
      {
        key: 'roleCode',
        header: 'Role Code',
        cell: ({ getValue }) => (
          <span className="text-xs text-gray-600">{getValue()}</span>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="text-xs text-gray-600 line-clamp-2">{getValue()}</span>
        ),
      },
      {
        key: 'id',
        header: 'Actions',
        cell: ({ getValue }) => {
          const id = getValue() as number;
          const dbRole = roles.data?.find(r => r.id === id);
          const role = dbRole ? dbToAppRole(dbRole) : null;
          if (!role) return null;
          return (
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
          );
        },
        enableSorting: false,
      },
    ],
  });

  if (roles.isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (roles.error) {
    console.error('Roles query error:', roles.error);
    return (
      <div className="text-red-500">
        <h2 className="text-lg font-semibold mb-2">Error loading roles</h2>
        <p className="mb-2">{roles.error.message}</p>
        <div className="text-sm bg-red-50 p-4 rounded">
          {roles.error.data && JSON.stringify(roles.error.data.zodError, null, 2)}
        </div>
      </div>
    );
  }

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

      {isClient && (
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
                    <p className="modal-section-title">Name</p>
                    <p className="modal-value">{form.getValues('name')}</p>
                  </div>

                  <div>
                    <p className="modal-section-title">Role Code</p>
                    <p className="modal-value">{form.getValues('roleCode')}</p>
                  </div>

                  <div>
                    <p className="modal-section-title">Description</p>
                    <p className="modal-value">{form.getValues('description')}</p>
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
                      disabled={isSubmitting}
                    >
                      {selectedRole ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormInput
                      control={control}
                      name="name"
                      label="Name"
                      required
                    />
                    <FormInput
                      control={control}
                      name="roleCode"
                      label="Role Code"
                      required
                    />
                    <FormInput
                      control={control}
                      name="description"
                      label="Description"
                      required
                    />
                  </div>

                  <DialogFooter className="modal-footer">
                    <Button type="button" variant="secondary" className="modal-button" onClick={handleCloseModal}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="modal-button"
                      disabled={!isDirty || !isValid || isSubmitting}
                    >
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
                  disabled={deleteRole.isLoading}
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

          <DataTable
            data={(roles.data ?? []).map(dbToAppRole)}
            columns={columns}
            searchPlaceholder="Search roles..."
            searchableColumns={['name', 'roleCode', 'description']}
            enableSearch={true}
            enableFilters={true}
            filename="roles"
            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
          />
        </>
      )}
    </div>
  );
} 