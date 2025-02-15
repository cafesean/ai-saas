'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { Level, Role } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormValidation } from '@/hooks/useFormValidation';
import { levelSchema } from '@/schemas';

interface LevelFormData {
  name: string;
  description: string;
  code: string;
  roles: string[];
}

export default function LevelsPage() {
  const { levels, roles, addLevel, updateLevel, deleteLevel } = useStore();
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [newLevel, setNewLevel] = useState<LevelFormData>({
    name: '',
    description: '',
    code: '',
    roles: [],
  });

  const { validate, getFieldError, clearErrors } = useFormValidation(levelSchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(newLevel)) return;

    const levelData: Omit<Level, 'id'> = {
      ...newLevel,
      roles: roles.filter(role => newLevel.roles.includes(role.id)),
    };

    if (editingLevel) {
      updateLevel(editingLevel.id, levelData);
      setEditingLevel(null);
    } else {
      addLevel(levelData);
    }
    setNewLevel({ name: '', description: '', code: '', roles: [] });
    clearErrors();
  };

  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    setNewLevel({
      name: level.name,
      description: level.description,
      code: level.code,
      roles: level.roles.map(role => role.id),
    });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Levels Management</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Roles</label>
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
            <p className="mt-1 text-sm text-red-600">{getFieldError('roles')}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            {editingLevel ? 'Update Level' : 'Add Level'}
          </Button>
        </div>
      </form>

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {levels.map((level) => (
              <tr key={level.id}>
                <td className="px-6 py-4 whitespace-nowrap">{level.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{level.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{level.description}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {level.roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleEdit(level)}
                    variant="secondary"
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => deleteLevel(level.id)}
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