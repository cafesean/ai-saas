import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/form/Select2';
import { SelectProps } from '@radix-ui/react-select';
import { cn } from '@/lib/utils';

interface SelectFieldProps extends SelectProps {
  placeholder?: string;
  options?: { value: string; label: React.ReactNode }[];
  className?: string;
  contentClassName?: string;
  error?: boolean;
}

export function SelectField({
  options,
  placeholder,
  className,
  contentClassName,
  error,
  ...props
}: SelectFieldProps) {
  return (
    <Select {...props}>
      <SelectTrigger 
        className={cn(
          error && "border-destructive",
          className
        )}
      >
        <SelectValue placeholder={placeholder || "Select an option"} />
      </SelectTrigger>
      <SelectContent className={cn("bg-background", contentClassName)}>
        {options?.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 