'use client';

import React from 'react';
import { useController, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

type FormInputProps<T extends FieldValues> = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'onChange' | 'onBlur' | 'value' | 'defaultValue'> & {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: string;
  className?: string;
};

export function FormInput<T extends FieldValues>({
  name,
  control,
  ...props
}: FormInputProps<T>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: props.required }
  });

  return (
    <Input
      {...props}
      {...field}
      error={error?.message}
    />
  );
} 