'use client';

import React from 'react';
import { cn } from '@/framework/lib/utils';

interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: React.ReactNode;
  className?: string;
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