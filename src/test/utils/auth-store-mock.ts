import { vi } from 'vitest';
import type { AuthState, UserProfile, UserRole } from '@/framework/store/auth.store';

// Mock user profiles for testing
export const mockUsers = {
  admin: {
    id: '1',
    email: 'admin@test.com',
    name: 'Test Admin',
    image: undefined,
    tenantId: undefined,
  } as UserProfile,
  user: {
    id: '2',
    email: 'user@test.com',
    name: 'Test User',
    image: undefined,
    tenantId: undefined,
  } as UserProfile,
  editor: {
    id: '3',
    email: 'editor@test.com',
    name: 'Test Editor',
    image: undefined,
    tenantId: undefined,
  } as UserProfile,
  superAdmin: {
    id: '4',
    email: 'superadmin@test.com',
    name: 'Super Admin',
    image: undefined,
    tenantId: undefined,
  } as UserProfile,
  viewer: {
    id: '5',
    email: 'viewer@test.com',
    name: 'Test Viewer',
    image: undefined,
    tenantId: undefined,
  } as UserProfile,
} as const;

// Mock roles for testing
export const mockRoles = {
  admin: {
    id: 1,
    name: 'Admin',
    description: 'Administrator role with full access',
    isSystemRole: true,
  } as UserRole,
  user: {
    id: 2,
    name: 'User',
    description: 'Standard user role',
    isSystemRole: false,
  } as UserRole,
  editor: {
    id: 3,
    name: 'Editor',
    description: 'Editor role with content management access',
    isSystemRole: false,
  } as UserRole,
  superAdmin: {
    id: 4,
    name: 'Super Admin',
    description: 'Super administrator with system access',
    isSystemRole: true,
  } as UserRole,
  viewer: {
    id: 5,
    name: 'Viewer',
    description: 'Read-only access role',
    isSystemRole: false,
  } as UserRole,
} as const;

// Mock permissions for different roles
export const mockPermissions = {
  admin: [
    'admin:full_access',
    'admin:role_management',
    'admin:user_management',
    'workflow:read',
    'workflow:create',
    'workflow:update',
    'workflow:delete',
    'models:read',
    'models:manage',
  ],
  user: [
    'workflow:read',
    'models:read',
    'documents:read',
  ],
  editor: [
    'workflow:read',
    'workflow:create',
    'workflow:update',
    'models:read',
    'documents:read',
    'documents:create',
    'documents:update',
  ],
  superAdmin: [
    'admin:full_access',
    'admin:role_management',
    'admin:user_management',
    'system:manage',
    'workflow:read',
    'workflow:create',
    'workflow:update',
    'workflow:delete',
    'models:read',
    'models:manage',
  ],
  viewer: [
    'workflow:read',
    'models:read',
    'documents:read',
    'decisioning:read',
  ],
} as const;

// Create a mock auth state
export function createMockAuthState(
  user?: UserProfile | null, 
  role?: UserRole | null,
  permissions?: string[],
  overrides?: Partial<AuthState>
): AuthState {
  const defaultState: AuthState = {
    // RBAC state
    user: user || null,
    role: role || null,
    permissions: permissions || [],
    authenticated: !!user,
    loading: false,
    sessionData: null,
    
    // Legacy state
    id: user ? parseInt(user.id) : null,
    email: user?.email || '',
    walletAddress: '',
    socials: [],
    orgUser: [],
    roles: null,
    status: 0,
  };

  return { ...defaultState, ...overrides };
}

// Mock the auth store module
export function mockAuthStore(
  user?: UserProfile | null, 
  role?: UserRole | null,
  permissions?: string[],
  overrides?: Partial<AuthState>
) {
  const mockState = createMockAuthState(user, role, permissions, overrides);
  
  // Create mock actions
  const mockActions = {
    login: vi.fn(),
    logout: vi.fn(),
    updatePermissions: vi.fn(),
    hasPermission: vi.fn((slug: string) => mockState.permissions.includes(slug)),
    setUser: vi.fn(),
    setRole: vi.fn(),
    setLoading: vi.fn(),
    loginWithEmail: vi.fn(),
    loginWithProvider: vi.fn(),
    setSessionData: vi.fn(),
    setWalletAddress: vi.fn(),
    setIsConnected: vi.fn(),
    bind: vi.fn(),
  };

  const fullMockState = { ...mockState, ...mockActions };
  
  vi.doMock('@/framework/store/auth.store', () => ({
    useAuthStore: vi.fn(() => fullMockState),
    authStore: {
      getState: vi.fn(() => fullMockState),
      setState: vi.fn(),
      subscribe: vi.fn(),
    },
    getAuthState: vi.fn(() => fullMockState),
    isAuthenticated: vi.fn(() => fullMockState.authenticated),
    hasPermission: vi.fn((slug: string) => fullMockState.permissions.includes(slug)),
    getUserPermissions: vi.fn(() => fullMockState.permissions),
    getCurrentUser: vi.fn(() => fullMockState.user),
    getCurrentRole: vi.fn(() => fullMockState.role),
  }));

  return fullMockState;
}

// Helper to create localStorage auth data
export function createAuthStorageData(user: UserProfile, role: UserRole, permissions: string[]) {
  return JSON.stringify({
    state: {
      user,
      role,
      permissions,
      authenticated: true,
      loading: false,
      sessionData: null,
      id: parseInt(user.id),
      email: user.email,
      walletAddress: '',
      socials: [],
      orgUser: [],
      roles: null,
      status: 1,
    },
    version: 0,
  });
}

// Test utilities for different user types
export const authTestUtils = {
  // Mock authenticated admin user
  mockAdmin: () => mockAuthStore(
    mockUsers.admin, 
    mockRoles.admin, 
    [...mockPermissions.admin]
  ),
  
  // Mock authenticated regular user
  mockUser: () => mockAuthStore(
    mockUsers.user, 
    mockRoles.user, 
    [...mockPermissions.user]
  ),
  
  // Mock authenticated editor user
  mockEditor: () => mockAuthStore(
    mockUsers.editor, 
    mockRoles.editor, 
    [...mockPermissions.editor]
  ),
  
  // Mock authenticated super admin user
  mockSuperAdmin: () => mockAuthStore(
    mockUsers.superAdmin, 
    mockRoles.superAdmin, 
    [...mockPermissions.superAdmin]
  ),
  
  // Mock authenticated viewer user (read-only)
  mockViewer: () => mockAuthStore(
    mockUsers.viewer, 
    mockRoles.viewer, 
    [...mockPermissions.viewer]
  ),
  
  // Mock unauthenticated user
  mockUnauthenticated: () => mockAuthStore(null, null, []),
  
  // Mock loading state
  mockLoading: () => mockAuthStore(null, null, [], { loading: true }),
  
  // Mock custom user with specific permissions
  mockUserWithPermissions: (permissions: string[]) => {
    const customUser: UserProfile = {
      id: '999',
      email: 'custom@test.com',
      name: 'Custom User',
      image: undefined,
      tenantId: undefined,
    };
    const customRole: UserRole = {
      id: 999,
      name: 'Custom Role',
      description: 'Custom role for testing',
      isSystemRole: false,
    };
    return mockAuthStore(customUser, customRole, permissions);
  },
  
  // Mock custom user with specific role
  mockUserWithRole: (roleName: string, permissions: string[] = []) => {
    const customUser: UserProfile = {
      id: '998',
      email: 'custom-role@test.com',
      name: 'Custom Role User',
      image: undefined,
      tenantId: undefined,
    };
    const customRole: UserRole = {
      id: 998,
      name: roleName,
      description: `${roleName} role for testing`,
      isSystemRole: false,
    };
    return mockAuthStore(customUser, customRole, permissions);
  },
  
  // Reset all mocks
  resetMocks: () => {
    vi.clearAllMocks();
    vi.resetModules();
  },
  
  // Create localStorage data for E2E tests
  createStorageData: createAuthStorageData,
};

// Export types for testing
export type MockUser = typeof mockUsers[keyof typeof mockUsers];
export type MockRole = typeof mockRoles[keyof typeof mockRoles]; 