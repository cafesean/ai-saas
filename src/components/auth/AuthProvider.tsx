"use client";

import { useAuthSession } from "@/framework/hooks/useAuthSession";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth session hydration
  const { isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <div className="flex w-screen h-screen justify-center items-center">
        Loading Authentication...
      </div>
    );
  }

  return <>{children}</>;
} 