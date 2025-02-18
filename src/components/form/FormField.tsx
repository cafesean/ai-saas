'use client';

import React from 'react';
import { useController, Control, FieldValues, Path } from 'react-hook-form';

type FormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  render: (props: { field: ReturnType<typeof useController>['field'] }) => React.ReactElement;
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