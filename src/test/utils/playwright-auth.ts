import { Page } from '@playwright/test';
import { mockUsers, mockRoles, mockPermissions, createAuthStorageData } from './auth-store-mock';

/**
 * Playwright Authentication Helpers
 * 
 * These utilities allow E2E tests to programmatically log in users
 * by setting localStorage data, bypassing the UI login flow.
 */

// Helper to set auth data in localStorage
export async function setAuthStorage(
  page: Page, 
  user: typeof mockUsers[keyof typeof mockUsers],
  role: typeof mockRoles[keyof typeof mockRoles],
  permissions: string[]
) {
  const authData = createAuthStorageData(user, role, permissions);
  
  await page.addInitScript((data) => {
    localStorage.setItem('app-auth-storage', data);
  }, authData);
}

// Helper to clear auth data
export async function clearAuthStorage(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('app-auth-storage');
    sessionStorage.clear();
  });
}

// Playwright auth utilities for different user types
export const playwrightAuthUtils = {
  // Login as admin user
  loginAsAdmin: async (page: Page) => {
    await setAuthStorage(
      page,
      mockUsers.admin,
      mockRoles.admin,
      [...mockPermissions.admin]
    );
  },

  // Login as regular user
  loginAsUser: async (page: Page) => {
    await setAuthStorage(
      page,
      mockUsers.user,
      mockRoles.user,
      [...mockPermissions.user]
    );
  },

  // Login as editor
  loginAsEditor: async (page: Page) => {
    await setAuthStorage(
      page,
      mockUsers.editor,
      mockRoles.editor,
      [...mockPermissions.editor]
    );
  },

  // Login as super admin
  loginAsSuperAdmin: async (page: Page) => {
    await setAuthStorage(
      page,
      mockUsers.superAdmin,
      mockRoles.superAdmin,
      [...mockPermissions.superAdmin]
    );
  },

  // Login as viewer (read-only)
  loginAsViewer: async (page: Page) => {
    await setAuthStorage(
      page,
      mockUsers.viewer,
      mockRoles.viewer,
      [...mockPermissions.viewer]
    );
  },

  // Login with custom permissions
  loginWithPermissions: async (page: Page, permissions: string[]) => {
    const customUser = {
      id: '999',
      email: 'test@example.com',
      name: 'Test User',
      image: undefined,
      tenantId: undefined,
    };
    const customRole = {
      id: 999,
      name: 'Test Role',
      description: 'Test role for E2E',
      isSystemRole: false,
    };
    
    await setAuthStorage(page, customUser, customRole, permissions);
  },

  // Login with custom role
  loginWithRole: async (page: Page, roleName: string, permissions: string[] = []) => {
    const customUser = {
      id: '998',
      email: 'test-role@example.com',
      name: 'Test Role User',
      image: undefined,
      tenantId: undefined,
    };
    const customRole = {
      id: 998,
      name: roleName,
      description: `${roleName} for E2E testing`,
      isSystemRole: false,
    };
    
    await setAuthStorage(page, customUser, customRole, permissions);
  },

  // Logout (clear auth data)
  logout: async (page: Page) => {
    await clearAuthStorage(page);
  },

  // Check if user is authenticated (by checking localStorage)
  isAuthenticated: async (page: Page): Promise<boolean> => {
    const authData = await page.evaluate(() => {
      return localStorage.getItem('app-auth-storage');
    });
    
    if (!authData) return false;
    
    try {
      const parsed = JSON.parse(authData);
      return parsed.state?.authenticated === true;
    } catch {
      return false;
    }
  },

  // Get current user from localStorage
  getCurrentUser: async (page: Page) => {
    const authData = await page.evaluate(() => {
      return localStorage.getItem('app-auth-storage');
    });
    
    if (!authData) return null;
    
    try {
      const parsed = JSON.parse(authData);
      return parsed.state?.user || null;
    } catch {
      return null;
    }
  },

  // Get current permissions from localStorage
  getCurrentPermissions: async (page: Page): Promise<string[]> => {
    const authData = await page.evaluate(() => {
      return localStorage.getItem('app-auth-storage');
    });
    
    if (!authData) return [];
    
    try {
      const parsed = JSON.parse(authData);
      return parsed.state?.permissions || [];
    } catch {
      return [];
    }
  },

  // Wait for auth store to be hydrated
  waitForAuthHydration: async (page: Page, timeout = 5000) => {
    await page.waitForFunction(
      () => {
        const authData = localStorage.getItem('app-auth-storage');
        if (!authData) return false;
        
        try {
          const parsed = JSON.parse(authData);
          return parsed.state?.authenticated !== undefined;
        } catch {
          return false;
        }
      },
      { timeout }
    );
  },
};

// Common test scenarios
export const authScenarios = {
  // Test admin-only features
  adminOnly: {
    setup: playwrightAuthUtils.loginAsAdmin,
    permissions: [...mockPermissions.admin],
    role: 'Admin',
  },

  // Test user-level features
  userOnly: {
    setup: playwrightAuthUtils.loginAsUser,
    permissions: [...mockPermissions.user],
    role: 'User',
  },

  // Test editor features
  editorOnly: {
    setup: playwrightAuthUtils.loginAsEditor,
    permissions: [...mockPermissions.editor],
    role: 'Editor',
  },

  // Test unauthenticated access
  unauthenticated: {
    setup: playwrightAuthUtils.logout,
    permissions: [],
    role: null,
  },

  // Test viewer (read-only) access
  viewerOnly: {
    setup: playwrightAuthUtils.loginAsViewer,
    permissions: [...mockPermissions.viewer],
    role: 'Viewer',
  },

  // Test role management permissions
  roleManagement: {
    setup: (page: Page) => playwrightAuthUtils.loginWithPermissions(page, [
      'admin:role_management',
      'admin:user_management',
    ]),
    permissions: ['admin:role_management', 'admin:user_management'],
    role: 'Role Manager',
  },

  // Test workflow permissions
  workflowManager: {
    setup: (page: Page) => playwrightAuthUtils.loginWithPermissions(page, [
      'workflow:read',
      'workflow:create',
      'workflow:update',
      'workflow:delete',
    ]),
    permissions: ['workflow:read', 'workflow:create', 'workflow:update', 'workflow:delete'],
    role: 'Workflow Manager',
  },
};

// Helper to run test with specific auth scenario
export async function withAuthScenario(
  page: Page,
  scenario: keyof typeof authScenarios,
  testFn: () => Promise<void>
) {
  const authScenario = authScenarios[scenario];
  
  // Setup authentication
  await authScenario.setup(page);
  
  // Wait for auth to be hydrated
  await playwrightAuthUtils.waitForAuthHydration(page);
  
  // Run the test
  await testFn();
  
  // Cleanup
  await playwrightAuthUtils.logout(page);
} 