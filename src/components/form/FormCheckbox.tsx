'use client';

import React from 'react';
import { useController, Control, FieldValues, Path } from 'react-hook-form';
import { Checkbox } from '@/components/ui/Checkbox';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export interface FormCheckboxProps<T extends FieldValues> extends Omit<CheckboxProps, 'name' | 'onChange' | 'onBlur' | 'checked' | 'defaultChecked'> {
  name: Path<T>;
  control: Control<T>;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  control,
  ...props
}: FormCheckboxProps<T>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control
  });

  return (
    <Checkbox
      {...props}
      checked={field.value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.checked)}
      error={error?.message}
    />
  );
} 