import React from 'react';
import { z } from 'zod';

interface ValidationError {
  path: (string | number)[];
  message: string;
}

export function useFormValidation<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  const [errors, setErrors] = React.useState<ValidationError[]>([]);

  const validate = (data: unknown): data is z.infer<typeof schema> => {
    const result = schema.safeParse(data);
    if (!result.success) {
      setErrors(
        result.error.errors.map((error: z.ZodIssue) => ({
          path: error.path,
          message: error.message,
        }))
      );
      return false;
    }
    setErrors([]);
    return true;
  };

  const getFieldError = (field: keyof z.infer<typeof schema>) => {
    const error = errors.find((error: ValidationError) => {
      if (typeof field === 'string') {
        return error.path[0] === field;
      }
      return false;
    });
    return error?.message;
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    validate,
    getFieldError,
    clearErrors,
  };
} 