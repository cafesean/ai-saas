import type { HTMLAttributes } from 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    className?: string;
  }
}

declare module '@/framework/lib/utils' {
  export function cn(...inputs: (string | boolean | undefined)[]): string;
} 