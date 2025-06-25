"use client";

import React, { createContext, useContext, useState } from 'react';

interface FormSubmissionContextType {
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

const FormSubmissionContext = createContext<FormSubmissionContextType | null>(null);

export function FormSubmissionProvider({ children }: { children: React.ReactNode }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <FormSubmissionContext.Provider value={{ isSubmitting, setIsSubmitting }}>
      {children}
    </FormSubmissionContext.Provider>
  );
}

export function useFormSubmission() {
  const context = useContext(FormSubmissionContext);
  if (!context) {
    return { isSubmitting: false, setIsSubmitting: () => {} };
  }
  return context;
}
