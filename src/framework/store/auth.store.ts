import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import type { SessionRole } from '@/framework/types/role';

// Types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  tenantId?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
}

export interface Permission {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface AuthState {
  // Core state
  authenticated: boolean;
  loading: boolean;
  user: UserProfile | null;
  role: UserRole | null;
  permissions: Permission[];
  
  // Actions
  setAuthState: (state: Partial<AuthState>) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
}

// Zustand store
export const useAuthStore = create<AuthState>()(devtools(
  (set, get) => ({
    // Initial state
    authenticated: false,
    loading: true,
    user: null,
    role: null,
    permissions: [],

    // Actions
    setAuthState: (newState) => {
      set((state) => ({ ...state, ...newState }), false, 'setAuthState');
    },

    logout: () => {
      set({
        authenticated: false,
        loading: false,
        user: null,
        role: null,
        permissions: [],
      }, false, 'logout');
    },

    hasPermission: (permission: string) => {
      const { permissions } = get();
      return permissions.some(p => p.slug === permission);
    },

    hasAnyPermission: (permissions: string[]) => {
      const { hasPermission } = get();
      return permissions.some(permission => hasPermission(permission));
    },

    hasRole: (roleName: string) => {
      const { role } = get();
      return role?.name.toLowerCase() === roleName.toLowerCase();
    },
  }),
  {
    name: 'auth-store',
  }
));

// Hook to sync NextAuth session with Zustand store
export function useAuthSync() {
  const { data: session, status } = useSession();
  const { setAuthState } = useAuthStore();

  useEffect(() => {
    if (status === 'loading') {
      setAuthState({ loading: true });
      return;
    }

    if (status === 'unauthenticated' || !session) {
      setAuthState({
        authenticated: false,
        loading: false,
        user: null,
        role: null,
        permissions: [],
      });
      return;
    }

    if (status === 'authenticated' && session.user) {
      // Extract user profile
      const userProfile: UserProfile = {
        id: session.user.id?.toString() || '',
        email: session.user.email || '',
        name: session.user.name || undefined,
        image: session.user.avatar || undefined,
      };

      // Extract primary role
      const primaryRole = session.user.roles?.[0];
      const role: UserRole | null = primaryRole ? {
        id: primaryRole.id?.toString() || '',
        name: primaryRole.name || '',
        description: primaryRole.title || '',
        isSystemRole: true,
      } : null;

      // Extract permissions from roles
      const permissions: Permission[] = [];
      
      if (session.user.roles) {
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

      // Add fallback admin permissions for admin-like roles OR if user name suggests admin
      const adminRoles = ['admin', 'owner', 'super'];
      const isAdminRole = role && adminRoles.some(adminRole => 
        role.name.toLowerCase().includes(adminRole)
      );
      const isAdminUser = userProfile.name && userProfile.name.toLowerCase().includes('admin');

      if ((isAdminRole || isAdminUser) && permissions.length === 0) {
        // Add comprehensive admin permissions including role management
        permissions.push(
          { id: 'admin-1', slug: 'admin:full_access', name: 'Full Admin Access', category: 'admin' },
          { id: 'admin-2', slug: 'admin:role_management', name: 'Role Management', category: 'admin' },
          { id: 'admin-3', slug: 'admin:user_management', name: 'User Management', category: 'admin' },
          { id: 'admin-4', slug: 'admin:permission_management', name: 'Permission Management', category: 'admin' },
          { id: 'model-1', slug: 'model:read', name: 'Read Models', category: 'model' },
          { id: 'model-2', slug: 'model:create', name: 'Create Models', category: 'model' },
          { id: 'model-3', slug: 'model:update', name: 'Update Models', category: 'model' },
          { id: 'model-4', slug: 'model:delete', name: 'Delete Models', category: 'model' },
          { id: 'workflow-1', slug: 'workflow:read', name: 'Read Workflows', category: 'workflow' },
          { id: 'workflow-2', slug: 'workflow:create', name: 'Create Workflows', category: 'workflow' },
          { id: 'decision-1', slug: 'decision_table:read', name: 'Read Decision Tables', category: 'decision_table' },
          { id: 'decision-2', slug: 'decision_table:create', name: 'Create Decision Tables', category: 'decision_table' },
          { id: 'kb-1', slug: 'knowledge_base:read', name: 'Read Knowledge Bases', category: 'knowledge_base' },
          { id: 'kb-2', slug: 'knowledge_base:create', name: 'Create Knowledge Bases', category: 'knowledge_base' },
          { id: 'rule-1', slug: 'rule:read', name: 'Read Rules', category: 'rule' },
          { id: 'rule-2', slug: 'rule:create', name: 'Create Rules', category: 'rule' },
        );
      }

      // Create a default admin role if user appears to be admin but has no role
      if (!role && isAdminUser) {
        const defaultRole: UserRole = {
          id: 'temp-admin',
          name: 'Admin',
          description: 'Default admin role',
          isSystemRole: true,
        };
        
        setAuthState({
          authenticated: true,
          loading: false,
          user: userProfile,
          role: defaultRole,
          permissions,
        });
        return;
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

  return { session, status };
}

// Utility functions
export const isAuthenticated = () => useAuthStore.getState().authenticated;
export const hasPermission = (slug: string) => useAuthStore.getState().hasPermission(slug);
export const getUserPermissions = () => useAuthStore.getState().permissions.map(p => p.slug);
export const getCurrentUser = () => useAuthStore.getState().user;
export const getCurrentRole = () => useAuthStore.getState().role;
 