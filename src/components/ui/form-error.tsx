'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  message?: ReactNode;
}

export function FormError({ message, className, ...props }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      className={cn('text-sm font-medium text-red-500', className)}
      {...props}
    >
      {message}
    </p>
  );
} 