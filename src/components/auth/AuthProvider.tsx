"use client";

import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/framework/store/auth.store";
import { useEffect } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthSessionSync({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const { setAuthState, logout } = useAuthStore();

  useEffect(() => {
    if (status === "loading") {
      setAuthState({ loading: true });
      return;
    }

    if (status === "unauthenticated" || !session) {
      // Clear auth state for unauthenticated users
      setAuthState({
        authenticated: false,
        loading: false,
        user: null,
        role: null,
        permissions: [],
      });
      return;
    }

    if (status === "authenticated" && session?.user) {
      // Extract user profile
      const userProfile = {
        id: session.user.id?.toString() || '',
        email: session.user.email || '',
        name: session.user.name || undefined,
        image: session.user.avatar || undefined,
      };

      // Extract primary role
      const primaryRole = session.user.roles?.[0];
      const role = primaryRole ? {
        id: primaryRole.id?.toString() || '',
        name: primaryRole.name || '',
        description: primaryRole.title || '',
        isSystemRole: true,
      } : null;

      // Extract permissions from roles (simplified)
      const permissions: any[] = [];
      
      // Add basic permissions for authenticated users
      if (session.user.roles && session.user.roles.length > 0) {
        session.user.roles.forEach(role => {
          if (role.policies) {
            role.policies.forEach(policy => {
              // Convert CRUD permissions to permission objects
              if (policy.can_create) {
                permissions.push({
                  id: `${policy.id}-create`,
                  slug: `${policy.name}:create`,
                  name: `Create ${policy.name}`,
                  category: policy.name,
                });
              }
              if (policy.can_read) {
                permissions.push({
                  id: `${policy.id}-read`,
                  slug: `${policy.name}:read`,
                  name: `Read ${policy.name}`,
                  category: policy.name,
                });
              }
              if (policy.can_update) {
                permissions.push({
                  id: `${policy.id}-update`,
                  slug: `${policy.name}:update`,
                  name: `Update ${policy.name}`,
                  category: policy.name,
                });
              }
              if (policy.can_delete) {
                permissions.push({
                  id: `${policy.id}-delete`,
                  slug: `${policy.name}:delete`,
                  name: `Delete ${policy.name}`,
                  category: policy.name,
                });
              }
            });
          }
        });
      }

      setAuthState({
        authenticated: true,
        loading: false,
        user: userProfile,
        role,
        permissions,
      });
    }
  }, [session, status, setAuthState]);

  // Show loading only while NextAuth is determining session status
  if (status === "loading") {
    return (
      <div className="flex w-screen h-screen justify-center items-center">
        Loading Authentication...
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      <AuthSessionSync>{children}</AuthSessionSync>
    </SessionProvider>
  );
} 