'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { Level, Role } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormValidation } from '@/hooks/useFormValidation';
import { levelSchema } from '@/schemas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowUpDown } from 'lucide-react';
import { LevelDetails } from '@/components/level-details';
import { findLevelUsage, removeLevelFromRateCards } from '@/lib/utils';
import { RoleDetails } from '@/components/role-details';

type SortConfig = {
  key: keyof Level;
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

export default function LevelsPage() {
  const router = useRouter();
  const { levels, roles, rateCards, addLevel, updateLevel, deleteLevel, updateRateCards } = useStore();
  const [isClient, setIsClient] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedLevel, setSelectedLevel] = React.useState<Level | null>(null);
  const [viewingLevel, setViewingLevel] = React.useState<Level | null>(null);
  const [newLevel, setNewLevel] = React.useState<LevelFormData>(emptyLevel);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);
  const [viewingRole, setViewingRole] = React.useState<Role | null>(null);
  const [isConfirming, setIsConfirming] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { validate, getFieldError, clearErrors } = useFormValidation(levelSchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(newLevel)) return;
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    const levelData: Omit<Level, 'id'> = {
      ...newLevel,
      roles: roles.filter(role => newLevel.roles.includes(role.id)),
    };

    if (selectedLevel) {
      updateLevel(selectedLevel.id, levelData);
    } else {
      addLevel(levelData);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLevel(null);
    setNewLevel(emptyLevel);
    setIsConfirming(false);
    clearErrors();
  };

  const handleEdit = (level: Level) => {
    setSelectedLevel(level);
    setNewLevel({
      name: level.name,
      description: level.description,
      code: level.code,
      roles: level.roles.map(role => role.id),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (level: Level) => {
    const usedInRateCards = findLevelUsage(level.id, rateCards);
    if (usedInRateCards.length > 0) {
      setSelectedLevel(level);
      setDeleteConfirmOpen(true);
    } else {
      deleteLevel(level.id);
    }
  };

  const handleViewLevel = (level: Level) => {
    setViewingLevel(level);
  };

  const handleSaveLevel = (levelData: Omit<Level, 'id'>) => {
    if (viewingLevel) {
      updateLevel(viewingLevel.id, levelData);
      setViewingLevel(null);
    }
  };

  const handleEditRole = (role: Role) => {
    // Handle role editing
  };

  const handleDeleteRole = (role: Role) => {
    // Handle role deletion
  };

  const handleSaveRole = (roleData: Omit<Role, 'id'>) => {
    // Handle role saving
  };

  const handleRoleClick = (roleId: string): void => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      setViewingRole(role);
    }
  };

  const handleRoleToggle = (role: Role) => {
    const isSelected = newLevel.roles.includes(role.id);
    if (isSelected) {
      setNewLevel({
        ...newLevel,
        roles: newLevel.roles.filter((roleId: string) => roleId !== role.id),
      });
    } else {
      setNewLevel({
        ...newLevel,
        roles: [...newLevel.roles, role.id],
      });
    }
  };

  const handleSort = (key: keyof Level) => {
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
    if (!sortConfig) return levels;

    return [...levels].sort((a, b) => {
      const key = sortConfig.key;
      const aValue = String(a[key as keyof Level]);
      const bValue = String(b[key as keyof Level]);
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [levels, sortConfig]);

  const SortableHeader = ({ column, label }: { column: keyof Level; label: string }) => (
    <th 
      scope="col"
      className="px-4 py-2 text-left text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown 
          className={`h-3 w-3 ${
            sortConfig?.key === column 
              ? 'text-primary' 
              : 'text-gray-400'
          } ${
            sortConfig?.key === column && sortConfig.direction === 'desc'
              ? 'rotate-180'
              : ''
          }`}
        />
      </div>
    </th>
  );

  return (
    <div className="space-y-4 max-w-[100vw] px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Levels Management</h1>
        {isClient && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Add Level
          </Button>
        )}
      </div>

      {isClient ? (
        <>
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
                    <h3 className="modal-section-title">Name</h3>
                    <p className="modal-value">{newLevel.name}</p>
                  </div>

                  <div>
                    <h3 className="modal-section-title">Level Code</h3>
                    <p className="modal-value">{newLevel.code}</p>
                  </div>

                  <div>
                    <h3 className="modal-section-title">Description</h3>
                    <p className="modal-value">{newLevel.description}</p>
                  </div>

                  <div>
                    <h3 className="modal-section-title">Assigned Roles</h3>
                    <div className="modal-section-content">
                      {roles
                        .filter(role => newLevel.roles.includes(role.id))
                        .map(role => (
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
                    >
                      {selectedLevel ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Name"
                      value={newLevel.name}
                      onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                      error={getFieldError('name')}
                      required
                    />
                    <Input
                      label="Code"
                      value={newLevel.code}
                      onChange={(e) => setNewLevel({ ...newLevel, code: e.target.value })}
                      error={getFieldError('code')}
                      required
                    />
                    <Input
                      label="Description"
                      value={newLevel.description}
                      onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                      error={getFieldError('description')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Assigned Roles</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {roles.map((role) => (
                        <Checkbox
                          key={role.id}
                          label={role.name}
                          checked={newLevel.roles.includes(role.id)}
                          onChange={() => handleRoleToggle(role)}
                        />
                      ))}
                    </div>
                    {getFieldError('roles') && (
                      <p className="text-sm text-red-600">{getFieldError('roles')}</p>
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
                {selectedLevel && findLevelUsage(selectedLevel.id, rateCards).length > 0 ? (
                  <>
                    <p className="modal-text">
                      This level is used in the following rate cards:
                    </p>
                    <div className="modal-section-content">
                      {findLevelUsage(selectedLevel.id, rateCards).map(rc => (
                        <div key={rc.id} className="text-sm text-gray-900">{rc.name}</div>
                      ))}
                    </div>
                    <p className="mt-4 modal-text">
                      Deleting this level will remove it from these rate cards.
                    </p>
                  </>
                ) : (
                  <p className="modal-text">
                    Are you sure you want to delete this level? This action cannot be undone.
                  </p>
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
                  onClick={() => {
                    if (selectedLevel) {
                      const usedInRateCards = findLevelUsage(selectedLevel.id, rateCards);
                      if (usedInRateCards.length > 0) {
                        const updatedRateCards = removeLevelFromRateCards(selectedLevel.id, rateCards);
                        updateRateCards(updatedRateCards);
                      }
                      deleteLevel(selectedLevel.id);
                      setDeleteConfirmOpen(false);
                      setSelectedLevel(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <LevelDetails
            level={viewingLevel}
            roles={roles}
            rateCards={rateCards}
            onOpenChange={(open) => setViewingLevel(open ? viewingLevel : null)}
            onRoleClick={handleRoleClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleSaveLevel}
          />

          <RoleDetails
            role={viewingRole}
            onOpenChange={(open) => setViewingRole(open ? viewingRole : null)}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onSave={handleSaveRole}
          />

          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader column="name" label="Name" />
                    <SortableHeader column="code" label="Code" />
                    <SortableHeader column="description" label="Description" />
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedLevels.map((level: Level) => (
                    <tr key={level.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewLevel(level)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {level.name}
                        </button>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600">{level.code}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600">{level.description}</span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {level.roles.map((role: Role) => (
                            <button
                              key={role.id}
                              onClick={() => handleRoleClick(role.id)}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              {role.name}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => handleEdit(level)}
                            variant="secondary"
                            className="h-7 px-2 text-xs font-bold"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(level)}
                            variant="danger"
                            className="h-7 px-2 text-xs font-bold"
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