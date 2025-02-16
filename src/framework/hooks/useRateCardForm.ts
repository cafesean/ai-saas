import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rateCardSchema } from '@/schemas';
import type { z } from 'zod';

export type RateCardFormData = z.infer<typeof rateCardSchema>;

export function useRateCardForm(defaultValues?: Partial<RateCardFormData>) {
  const form = useForm<RateCardFormData>({
    resolver: zodResolver(rateCardSchema),
    defaultValues: {
      name: '',
      description: '',
      effective_date: new Date(),
      expire_date: null,
      level_rates: [],
      ...defaultValues,
    },
    mode: 'onChange',
  });

  return {
    form,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
} 