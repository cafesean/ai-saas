'use client';

import React from 'react';
import { useController, Control, FieldValues, Path, ControllerRenderProps } from 'react-hook-form';

type FormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  render: (props: { field: ControllerRenderProps<T, Path<T>> }) => React.ReactElement;
};

export function FormField<T extends FieldValues>({
  name,
  control,
  render
}: FormFieldProps<T>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control
  });

  return render({ field });
}

export default FormField; 
