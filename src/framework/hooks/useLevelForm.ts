import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { levelSchema } from '@/schemas';
import type { z } from 'zod';

export type LevelFormData = z.infer<typeof levelSchema>;

export function useLevelForm(defaultValues?: Partial<LevelFormData>) {
  const form = useForm<LevelFormData>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      roles: [],
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