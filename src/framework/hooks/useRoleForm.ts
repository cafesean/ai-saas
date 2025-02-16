'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleSchema } from '@/schemas';
import type { RoleView } from '@/framework/types';
import type { z } from 'zod';

export type RoleFormData = z.infer<typeof roleSchema>;

export function useRoleForm(defaultValues?: Partial<RoleFormData>) {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      roleCode: '',
      description: '',
      ...defaultValues,
    },
  });

  return {
    form,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
} 