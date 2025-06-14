import { test, expect } from '@playwright/test';
import { playwrightAuthUtils, withAuthScenario } from '../utils/playwright-auth';

test.describe('Permission-based Access Control', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth data
    await playwrightAuthUtils.logout(page);
  });

  test.describe('Unauthenticated Access', () => {
    test('should redirect to login for protected pages', async ({ page }) => {
      await page.goto('/admin/roles');
      
      // Should be redirected to login or show access denied
      await expect(page).toHaveURL(/\/(login|auth)/);
    });

    test('should not show admin navigation items', async ({ page }) => {
      await page.goto('/');
      
      // Admin navigation should not be visible
      await expect(page.locator('[data-testid="admin-nav"]')).not.toBeVisible();
    });
  });

  test.describe('Admin User Access', () => {
    test('should access role management page', async ({ page }) => {
      await withAuthScenario(page, 'adminOnly', async () => {
        await page.goto('/admin/roles');
        
        // Should see role management interface
        await expect(page.locator('h1')).toContainText('Role Management');
        await expect(page.locator('[data-testid="create-role-button"]')).toBeVisible();
      });
    });

    test('should access permission catalogue', async ({ page }) => {
      await withAuthScenario(page, 'adminOnly', async () => {
        await page.goto('/admin/permissions');
        
        // Should see permission catalogue
        await expect(page.locator('h1')).toContainText('Permission Catalogue');
        await expect(page.locator('[data-testid="export-permissions"]')).toBeVisible();
      });
    });

    test('should see admin navigation items', async ({ page }) => {
      await withAuthScenario(page, 'adminOnly', async () => {
        await page.goto('/');
        
        // Admin navigation should be visible
        await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();
        await expect(page.locator('text=Role Management')).toBeVisible();
        await expect(page.locator('text=Permissions')).toBeVisible();
      });
    });
  });

  test.describe('Regular User Access', () => {
    test('should not access role management page', async ({ page }) => {
      await withAuthScenario(page, 'userOnly', async () => {
        await page.goto('/admin/roles');
        
        // Should show access denied or redirect
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
    });

    test('should not see admin navigation items', async ({ page }) => {
      await withAuthScenario(page, 'userOnly', async () => {
        await page.goto('/');
        
        // Admin navigation should not be visible
        await expect(page.locator('[data-testid="admin-nav"]')).not.toBeVisible();
      });
    });

    test('should access allowed workflow features', async ({ page }) => {
      await withAuthScenario(page, 'userOnly', async () => {
        await page.goto('/admin/workflows');
        
        // Should see read-only workflow interface
        await expect(page.locator('text=Workflows')).toBeVisible();
        await expect(page.locator('[data-testid="create-workflow"]')).not.toBeVisible();
      });
    });
  });

  test.describe('Editor User Access', () => {
    test('should access content creation features', async ({ page }) => {
      await withAuthScenario(page, 'editorOnly', async () => {
        await page.goto('/admin/workflows');
        
        // Should see workflow creation options
        await expect(page.locator('[data-testid="create-workflow"]')).toBeVisible();
        await expect(page.locator('[data-testid="edit-workflow"]')).toBeVisible();
      });
    });

    test('should not access admin-only features', async ({ page }) => {
      await withAuthScenario(page, 'editorOnly', async () => {
        await page.goto('/admin/roles');
        
        // Should not access role management
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
    });
  });

  test.describe('Role Management Workflow', () => {
    test('admin can create and manage roles', async ({ page }) => {
      await withAuthScenario(page, 'adminOnly', async () => {
        await page.goto('/admin/roles');
        
        // Click create role button
        await page.click('[data-testid="create-role-button"]');
        
        // Fill role form
        await page.fill('[data-testid="role-name"]', 'Test Role');
        await page.fill('[data-testid="role-description"]', 'Test role description');
        
        // Select permissions
        await page.check('[data-testid="permission-workflow:read"]');
        await page.check('[data-testid="permission-workflow:create"]');
        
        // Save role
        await page.click('[data-testid="save-role"]');
        
        // Should see success message
        await expect(page.locator('text=Role created successfully')).toBeVisible();
        
        // Should see new role in list
        await expect(page.locator('text=Test Role')).toBeVisible();
      });
    });

    test('admin can view permission details', async ({ page }) => {
      await withAuthScenario(page, 'adminOnly', async () => {
        await page.goto('/admin/permissions');
        
        // Search for specific permission
        await page.fill('[data-testid="permission-search"]', 'workflow:create');
        
        // Should see filtered results
        await expect(page.locator('text=workflow:create')).toBeVisible();
        
        // Click to view role details
        await page.click('[data-testid="view-roles-workflow:create"]');
        
        // Should see roles using this permission
        await expect(page.locator('[data-testid="role-usage"]')).toBeVisible();
      });
    });
  });

  test.describe('Permission Gating in UI', () => {
    test('buttons should be hidden based on permissions', async ({ page }) => {
      await withAuthScenario(page, 'userOnly', async () => {
        await page.goto('/admin/workflows');
        
        // Create button should not be visible
        await expect(page.locator('[data-testid="create-workflow"]')).not.toBeVisible();
        
        // Delete buttons should not be visible
        await expect(page.locator('[data-testid="delete-workflow"]')).not.toBeVisible();
        
        // View button should be visible
        await expect(page.locator('[data-testid="view-workflow"]')).toBeVisible();
      });
    });

    test('navigation items should be filtered by permissions', async ({ page }) => {
      await withAuthScenario(page, 'editorOnly', async () => {
        await page.goto('/');
        
        // Should see content-related navigation
        await expect(page.locator('text=Workflows')).toBeVisible();
        await expect(page.locator('text=Documents')).toBeVisible();
        
        // Should not see admin navigation
        await expect(page.locator('text=Role Management')).not.toBeVisible();
        await expect(page.locator('text=User Management')).not.toBeVisible();
      });
    });
  });

  test.describe('Custom Permission Scenarios', () => {
    test('role management permissions only', async ({ page }) => {
      await withAuthScenario(page, 'roleManagement', async () => {
        await page.goto('/admin/roles');
        
        // Should access role management
        await expect(page.locator('h1')).toContainText('Role Management');
        
        // Should not access other admin features
        await page.goto('/admin/models');
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
    });

    test('workflow manager permissions', async ({ page }) => {
      await withAuthScenario(page, 'workflowManager', async () => {
        await page.goto('/admin/workflows');
        
        // Should have full workflow access
        await expect(page.locator('[data-testid="create-workflow"]')).toBeVisible();
        await expect(page.locator('[data-testid="edit-workflow"]')).toBeVisible();
        await expect(page.locator('[data-testid="delete-workflow"]')).toBeVisible();
        
        // Should not access role management
        await page.goto('/admin/roles');
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
    });
  });

  test.describe('Session Management', () => {
    test('should maintain permissions across page reloads', async ({ page }) => {
      await withAuthScenario(page, 'adminOnly', async () => {
        await page.goto('/admin/roles');
        await expect(page.locator('h1')).toContainText('Role Management');
        
        // Reload page
        await page.reload();
        
        // Should still have access
        await expect(page.locator('h1')).toContainText('Role Management');
      });
    });

    test('should handle permission changes gracefully', async ({ page }) => {
      // Start with admin permissions
      await playwrightAuthUtils.loginAsAdmin(page);
      await page.goto('/admin/roles');
      await expect(page.locator('h1')).toContainText('Role Management');
      
      // Change to user permissions
      await playwrightAuthUtils.loginAsUser(page);
      await page.reload();
      
      // Should now be denied access
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });
}); 