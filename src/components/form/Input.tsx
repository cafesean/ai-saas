'use client';

import React, { useState, forwardRef } from 'react';
import { cn } from "@/framework/lib/utils";
import FormError from './FormError';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
  id?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref) => {
    const { label, error, className, placeholder, ...rest } = props;
    const [isEditing, setIsEditing] = useState(false);

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={rest.id} className="block text-xs font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className,
            isEditing ? "border-2" : "border-0"
          )}
          {...rest}
          placeholder={placeholder || "Please enter"}
          onClickCapture={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
        />
        {error && <FormError message={error} />}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };