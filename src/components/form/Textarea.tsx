"use client";

import React, { useState, forwardRef } from "react";
import { cn } from "@/framework/lib/utils";
import FormError from "./FormError";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  value?: string | number | readonly string[] | undefined;
}

const Textarea = ({
  className = "",
  value,
  disabled,
  label,
  ...props
}: TextareaProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        value={value}
        className={`flex min-h-[80px] w-full rounded-md border border-input 
          bg-background px-3 py-2 text-sm ring-offset-background 
          placeholder:text-muted-foreground focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}`}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};

Textarea.displayName = "Textarea";

export { Textarea };
