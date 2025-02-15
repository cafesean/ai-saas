'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FormError } from './form-error';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      <FormError message={error} />
    </div>
  );
} 