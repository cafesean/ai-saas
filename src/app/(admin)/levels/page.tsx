'use client';

import React from 'react';
import { NextPage } from "next";
import { useRouter } from 'next/navigation';
import type { LevelView, RoleView, LevelRateView } from '@/framework/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/form/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useFormValidation } from '@/framework/hooks/useFormValidation';
// import { levelSchema } from '@/schemas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowUpDown } from 'lucide-react';
import { LevelDetails } from '@/app/(admin)/levels/components/LevelDetail';
import { findLevelUsage, formatCurrency } from '@/framework/lib/utils';
import { RoleDetails } from '@/app/(admin)/roles/components/RoleDetail';
import { DataTable } from '@/components/ui/table/DataTable';
import { useTableColumns } from '@/framework/hooks/useTableColumn';
import { api, useUtils } from '@/utils/trpc';
import { useLevelForm } from '@/framework/hooks/useLevelForm';
import { dbToAppLevel, dbToAppRole, dbToAppRateCard } from '@/framework/types';
import { RateCardFormData } from '@/framework/hooks/useRateCardForm';
import { LevelRate } from '@/db/types';

type SortConfig = {
  key: keyof LevelView;
  direction: 'asc' | 'desc';
} | null;

interface LevelFormData {
  name: string;
  description: string;
  code: string;
  roles: string[];
}

const emptyLevel: LevelFormData = {
  name: '',
  description: '',
  code: '',
  roles: [],
};

const LevelsPage: NextPage = () => {
  const { data: levels, isLoading: isLoadingLevels } = api.level.getAll.useQuery();
  const { data: roles, isLoading: isLoadingRoles } = api.role.getAll.useQuery();
  const { data: rateCards, isLoading: isLoadingRateCards } = api.rateCard.getAll.useQuery();
  
  const utils = useUtils();
  const createLevel = api.level.create.useMutation({
    onSuccess: () => utils.level.getAll.invalidate(),
  });

  const updateLevel = api.level.update.useMutation({
    onSuccess: () => utils.level.getAll.invalidate(),
  });

  const deleteLevel = api.level.delete.useMutation({
    onSuccess: () => utils.level.getAll.invalidate(),
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedLevel, setSelectedLevel] = React.useState<LevelView | null>(null);
  const [viewingLevel, setViewingLevel] = React.useState<LevelView | null>(null);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);
  const [viewingRole, setViewingRole] = React.useState<RoleView | null>(null);
  const [isConfirming, setIsConfirming] = React.useState(false);

  const { form, isValid, isDirty, isSubmitting, errors } = useLevelForm();
  const { register, handleSubmit, reset, setValue, watch } = form;

  const isLoading = isLoadingLevels || isLoadingRoles || isLoadingRateCards;

  const onSubmit = handleSubmit((data) => {
    setIsConfirming(true);
  });

  const handleConfirm = async () => {
    if (!roles) return;

    try {
      const data = form.getValues();
      const levelData = {
        name: data.name,
        description: data.description || '',
        code: data.code,
        roles: data.roles || [],
      };

      if (selectedLevel) {
        await updateLevel.mutateAsync({
          id: selectedLevel.id,
          data: levelData,
        });
      } else {
        await createLevel.mutateAsync(levelData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLevel(null);
    reset();
    setIsConfirming(false);
  };

  const handleEdit = (level: LevelView) => {
    setSelectedLevel(level);
    reset({
      name: level.name,
      description: level.description || "",
      code: level.code,
      roles: level.roles.map((role) => role.id),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (level: LevelView) => {
    setSelectedLevel(level);
    setDeleteConfirmOpen(true);
  };

  const handleViewLevel = (level: LevelView) => {
    setViewingLevel(level);
  };

  const handleSaveLevel = async (levelData: Omit<LevelView, 'id'>) => {
    if (viewingLevel) {
      try {
        await updateLevel.mutateAsync({
          id: viewingLevel.id,
          data: {
            name: levelData.name,
            description: levelData.description || undefined,
            code: levelData.code,
            roles: levelData.roles.map(role => role.id),
          },
        });
        setViewingLevel(null);
      } catch (error) {
        console.error('Error updating level:', error);
      }
    }
  };

  const handleEditRole = (role: RoleView) => {
    // TODO: Add editRole mutation
  };

  const handleDeleteRole = (role: RoleView) => {
    // TODO: Add deleteRole mutation
  };

  const handleSaveRole = (roleData: Omit<RoleView, 'id'>) => {
    // TODO: Add updateRole mutation
  };

  const handleRoleClick = (roleId: number): void => {
    if (!roles) return;
    const dbRole = roles.find(r => r.id === roleId);
    if (dbRole) {
      setViewingRole(dbToAppRole(dbRole));
    }
  };

  const handleRoleToggle = (role: RoleView) => {
    const currentRoles = watch('roles');
    const isSelected = currentRoles.includes(role.id);
    setValue('roles', isSelected 
      ? currentRoles.filter((roleId: number) => roleId !== role.id)
      : [...currentRoles, role.id]
    );
  };

  const handleSort = (key: keyof LevelView) => {
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

  const sortedLevels = React.useMemo(() => {
    if (!sortConfig || !levels) return levels?.map(dbToAppLevel) ?? [];

    return [...levels].map(dbToAppLevel).sort((a, b) => {
      const key = sortConfig.key;
      const aValue = (a[key as keyof LevelView] as string | number | null | undefined)?.toString() ?? '';
      const bValue = (b[key as keyof LevelView] as string | number | null | undefined)?.toString() ?? '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [levels, sortConfig]);

  const columns = useTableColumns<LevelView>({
    columns: [
      {
        key: 'name',
        header: 'Name',
        cell: ({ getValue }) => {
          const name = getValue() as string;
          const dbLevel = levels?.find(l => l.name === name);
          const level = dbLevel ? dbToAppLevel(dbLevel) : null;
          if (!level) return null;
          return (
            <button 
              onClick={() => handleViewLevel(level)}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              {name}
            </button>
          );
        },
      },
      {
        key: 'code',
        header: 'Code',
        cell: ({ getValue }) => (
          <span className="text-xs text-gray-600">{getValue()}</span>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="text-xs text-gray-600">{getValue()}</span>
        ),
      },
      {
        key: 'roles',
        header: 'Roles',
        cell: ({ getValue }) => {
          const roles = getValue() as RoleView[];
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {role.name}
                </button>
              ))}
            </div>
          );
        },
      },
      {
        key: 'id',
        header: '',
        cell: ({ getValue }) => {
          const id = getValue() as number;
          const dbLevel = levels?.find(l => l.id === id);
          const level = dbLevel ? dbToAppLevel(dbLevel) : null;
          if (!level) return null;
          return (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => handleEdit(level)}
                variant="secondary"
                className="modal-button"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(level)}
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

  const confirmDelete = async () => {
    if (selectedLevel) {
      try {
        await deleteLevel.mutateAsync(selectedLevel.id);
        setDeleteConfirmOpen(false);
        setSelectedLevel(null);
      } catch (error) {
        console.error('Error deleting level:', error);
      }
    }
  };

  if (isLoading) {
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

  return (
    <div className="space-y-4 max-w-[100vw] px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Levels Management</h1>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          Add Level
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="modal-content">
          <DialogHeader className="modal-header">
            <DialogTitle className="modal-title">
              {isConfirming 
                ? 'Confirm Level Details'
                : selectedLevel 
                  ? `Edit ${selectedLevel.name}`
                  : 'Add New Level'
              }
            </DialogTitle>
          </DialogHeader>
          {isConfirming ? (
            <div className="modal-section">
              <div>
                <h2 className="modal-section-title">Name</h2>
                <p className="modal-value">{watch('name')}</p>
              </div>

              <div>
                <h2 className="modal-section-title">Level Code</h2>
                <p className="modal-value">{watch('code')}</p>
              </div>

              <div>
                <h2 className="modal-section-title">Description</h2>
                <p className="modal-value">{watch('description')}</p>
              </div>

              <div>
                <h2 className="modal-section-title">Assigned Roles</h2>
                <div className="modal-section-content">
                  {roles && roles.map(dbToAppRole)
                    .filter((role) => watch('roles').includes(role.id))
                    .map((role) => (
                      <div key={role.id} className="text-sm text-gray-900">
                        {role.name}
                      </div>
                    ))}
                </div>
              </div>

              <DialogFooter className="modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  className="modal-button"
                  onClick={() => setIsConfirming(false)}
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
                  {selectedLevel ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  {...{
                    id: "name",
                    type: "text",
                    label: "Name",
                    value: watch('name'),
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue('name', e.target.value),
                    error: errors['name']?.message,
                    required: true
                  }}
                />
                <Input
                  {...{
                    id: "code",
                    type: "text",
                    label: "Code",
                    value: watch('code'),
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue('code', e.target.value),
                    error: errors['code']?.message,
                    required: true
                  }}
                />
                <Input
                  {...{
                    id: "description",
                    type: "text",
                    label: "Description",
                    value: watch('description'),
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue('description', e.target.value),
                    error: errors['description']?.message,
                    required: true
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assigned Roles</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {roles && roles.map(dbToAppRole).map((role) => (
                    <Checkbox
                      key={role.id}
                      label={role.name}
                      checked={watch('roles').includes(role.id)}
                      onChange={() => handleRoleToggle(role)}
                    />
                  ))}
                </div>
                {errors['roles'] && (
                  <p className="text-sm text-red-600">{errors['roles'].message}</p>
                )}
              </div>

              <DialogFooter className="modal-footer">
                <Button type="button" variant="secondary" className="modal-button" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="modal-button">
                  {selectedLevel ? 'Next' : 'Continue'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="modal-content">
          <DialogHeader className="modal-header">
            <DialogTitle className="modal-title">Delete Level</DialogTitle>
          </DialogHeader>
          <div className="modal-section">
            {selectedLevel && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete the level "{selectedLevel.name}"? This action cannot be undone.
                </p>
                <div className="space-y-2">
                  <div>
                    <h2 className="text-sm font-medium text-gray-900">Level Details</h2>
                    <p className="text-sm text-gray-500">Code: {selectedLevel.code}</p>
                    <p className="text-sm text-gray-500">Description: {selectedLevel.description}</p>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-900">Associated Roles</h2>
                    <div className="flex flex-wrap gap-1">
                      {selectedLevel.roles.map((role: RoleView) => (
                        <span key={role.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  {rateCards && (
                    <div>
                      <h2 className="text-sm font-medium text-gray-900">Used in Rate Cards</h2>
                      <div className="mt-2 space-y-2">
                        {findLevelUsage(selectedLevel.id, rateCards.map(card => dbToAppRateCard({
                          ...card,
                          level_rates: card.level_rates?.map(rate => ({
                            ...rate,
                            rate_card: card,
                            level: {
                              ...rate.level,
                              roles: [],
                            },
                          })),
                        }))).map(rateCard => (
                          <div key={rateCard.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{rateCard.name}</span>
                            <span className="text-gray-600">
                              {formatCurrency(
                                Number(rateCard.levelRates.find((rate: LevelRateView) => rate.level.id === selectedLevel.id)?.monthlyRate) || 0
                              )}
                            </span>
                          </div>
                        ))}
                        {findLevelUsage(selectedLevel.id, rateCards.map(card => dbToAppRateCard({
                          ...card,
                          level_rates: card.level_rates?.map(rate => ({
                            ...rate,
                            rate_card: card,
                            level: {
                              ...rate.level,
                              roles: [],
                            },
                          })),
                        }))).length === 0 && (
                          <p className="text-sm text-gray-500">Not used in any rate cards</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter className="modal-footer">
            <Button
              type="button"
              variant="secondary"
              className="modal-button"
              onClick={() => setDeleteConfirmOpen(false)}
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
        onOpenChange={(open) => setViewingRole(open ? viewingRole : null)}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
        onSave={handleSaveRole}
      />

      <DataTable
        data={sortedLevels}
        columns={columns}
        searchPlaceholder="Search levels..."
        searchableColumns={['name', 'code', 'description']}
        enableSearch={true}
        enableFilters={true}
        hideOnSinglePage={true}
        className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
      />
    </div>
  );
}

export default LevelsPage;