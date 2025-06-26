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
  orgId?: string;
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
// Types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  orgId?: string;
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
              // Handle the correct session structure where policies have 'name' field directly
              if (policy.name) {
                permissions.push({
                  id: `${policy.name}-${role.id}`,
                  slug: policy.name,
                  name: policy.description || policy.name,
                  category: policy.name.split(':')[0] || 'general',
                });
              }
            });
          }
        });
      }

      // Add fallback admin permissions only for proper admin roles (NOT username-based!)
      const adminRoles = ['admin', 'owner', 'super'];
      const isAdminRole = role && adminRoles.some(adminRole => 
        role.name.toLowerCase().includes(adminRole)
      );

      if (isAdminRole && permissions.length === 0) {
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
          { id: 'workflow-3', slug: 'workflow:update', name: 'Update Workflows', category: 'workflow' },
          { id: 'workflow-4', slug: 'workflow:delete', name: 'Delete Workflows', category: 'workflow' },
          { id: 'knowledge-1', slug: 'knowledge_base:read', name: 'Read Knowledge Bases', category: 'knowledge_base' },
          { id: 'knowledge-2', slug: 'knowledge_base:create', name: 'Create Knowledge Bases', category: 'knowledge_base' },
          { id: 'knowledge-3', slug: 'knowledge_base:update', name: 'Update Knowledge Bases', category: 'knowledge_base' },
          { id: 'knowledge-4', slug: 'knowledge_base:delete', name: 'Delete Knowledge Bases', category: 'knowledge_base' },
          { id: 'knowledge-5', slug: 'knowledge_base:chat', name: 'Chat with Knowledge Bases', category: 'knowledge_base' },
          { id: 'knowledge-6', slug: 'knowledge_base:embed', name: 'Embed Documents', category: 'knowledge_base' },
          { id: 'file-1', slug: 'file:upload', name: 'Upload Files', category: 'file' },
          { id: 'file-2', slug: 'file:read', name: 'Read Files', category: 'file' },
          { id: 'file-3', slug: 'file:delete', name: 'Delete Files', category: 'file' },
          { id: 'file-4', slug: 'file:manage_s3', name: 'Manage S3 Storage', category: 'file' },
        );
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth Store Sync:', {
          userEmail: userProfile.email,
          roleId: role?.id,
          roleName: role?.name,
          permissionsCount: permissions.length,
          firstFewPermissions: permissions.slice(0, 5).map(p => p.slug),
          sessionRolesCount: session.user.roles?.length,
          sessionPoliciesCount: session.user.roles?.flatMap(r => r.policies).length
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
}

// Utility functions
export const isAuthenticated = () => useAuthStore.getState().authenticated;
export const hasPermission = (slug: string) => useAuthStore.getState().hasPermission(slug);
export const getUserPermissions = () => useAuthStore.getState().permissions.map(p => p.slug);
export const getCurrentUser = () => useAuthStore.getState().user;
export const getCurrentRole = () => useAuthStore.getState().role;
 