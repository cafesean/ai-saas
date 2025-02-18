'use client';

import React from 'react';
import { cn } from '@/framework/lib/utils';
import { FormError } from './FormError';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function Checkbox({ label, error, className, ...props }: CheckboxProps) {
  return (
    <div className="space-y-2">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className={cn(
            'rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
      </label>
      <FormError message={error} />
    </div>
  );
} 