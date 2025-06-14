import { test, expect } from '@playwright/test';
import { playwrightAuthUtils, withAuthScenario } from '../utils/playwright-auth';

test.describe('Negative Path Permission Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth data
    await playwrightAuthUtils.logout(page);
  });

  test.describe('Viewer Role Restrictions', () => {
    test('should not show create/delete buttons in workflow management', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        await page.goto('/admin/workflows');
        
        // Should see workflows but not creation/deletion options
        await expect(page.locator('h1')).toContainText('Workflows');
        
        // Create button should not be visible
        await expect(page.locator('[data-testid="create-workflow"]')).not.toBeVisible();
        await expect(page.locator('text=Create Workflow')).not.toBeVisible();
        await expect(page.locator('button:has-text("Create")')).not.toBeVisible();
        
        // Delete buttons should not be visible
        await expect(page.locator('[data-testid="delete-workflow"]')).not.toBeVisible();
        await expect(page.locator('button:has-text("Delete")')).not.toBeVisible();
        
        // Edit buttons should not be visible
        await expect(page.locator('[data-testid="edit-workflow"]')).not.toBeVisible();
        await expect(page.locator('button:has-text("Edit")')).not.toBeVisible();
        
        // View/Read buttons should be visible
        await expect(page.locator('[data-testid="view-workflow"]')).toBeVisible();
      });
    });

    test('should not show create/delete buttons in model management', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        await page.goto('/admin/models');
        
        // Should see models but not creation/deletion options
        await expect(page.locator('h1')).toContainText('Models');
        
        // Create button should not be visible
        await expect(page.locator('[data-testid="create-model"]')).not.toBeVisible();
        await expect(page.locator('text=Create Model')).not.toBeVisible();
        await expect(page.locator('button:has-text("Create")')).not.toBeVisible();
        
        // Delete buttons should not be visible
        await expect(page.locator('[data-testid="delete-model"]')).not.toBeVisible();
        await expect(page.locator('button:has-text("Delete")')).not.toBeVisible();
        
        // Import buttons should not be visible
        await expect(page.locator('[data-testid="import-model"]')).not.toBeVisible();
        await expect(page.locator('button:has-text("Import")')).not.toBeVisible();
      });
    });

    test('should not access admin-only pages', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Role management should be denied
        await page.goto('/admin/roles');
        await expect(page.locator('text=Access Denied')).toBeVisible();
        
        // Permission catalogue should be denied
        await page.goto('/admin/permissions');
        await expect(page.locator('text=Access Denied')).toBeVisible();
        
        // User management should be denied
        await page.goto('/admin/users');
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
    });

    test('should not see admin navigation items', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        await page.goto('/');
        
        // Admin navigation should not be visible
        await expect(page.locator('[data-testid="admin-nav"]')).not.toBeVisible();
        await expect(page.locator('text=Role Management')).not.toBeVisible();
        await expect(page.locator('text=User Management')).not.toBeVisible();
        await expect(page.locator('text=Permissions')).not.toBeVisible();
        
        // Should see read-only navigation items
        await expect(page.locator('text=Workflows')).toBeVisible();
        await expect(page.locator('text=Models')).toBeVisible();
        await expect(page.locator('text=Documents')).toBeVisible();
      });
    });
  });

  test.describe('API Endpoint Restrictions', () => {
    test('should return 403 for forbidden workflow creation', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Attempt to create workflow via API
        const response = await page.request.post('/api/trpc/workflow.create', {
          data: {
            name: 'Test Workflow',
            description: 'Unauthorized creation attempt',
          },
        });
        
        // Should return 403 Forbidden
        expect(response.status()).toBe(403);
      });
    });

    test('should return 403 for forbidden role management', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Attempt to create role via API
        const response = await page.request.post('/api/trpc/role.create', {
          data: {
            name: 'Test Role',
            description: 'Unauthorized creation attempt',
          },
        });
        
        // Should return 403 Forbidden
        expect(response.status()).toBe(403);
      });
    });

    test('should return 403 for forbidden decision table creation', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Attempt to create decision table via API
        const response = await page.request.post('/api/trpc/decisioning.create', {
          data: {
            name: 'Test Decision Table',
            rules: [],
          },
        });
        
        // Should return 403 Forbidden
        expect(response.status()).toBe(403);
      });
    });

    test('should return 403 for forbidden model deletion', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Attempt to delete model via API
        const response = await page.request.delete('/api/trpc/model.delete', {
          data: {
            id: 1,
          },
        });
        
        // Should return 403 Forbidden
        expect(response.status()).toBe(403);
      });
    });

    test('should return 403 for forbidden permission updates', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Attempt to update permissions via API
        const response = await page.request.put('/api/trpc/permission.update', {
          data: {
            id: 1,
            data: {
              name: 'Modified Permission',
            },
          },
        });
        
        // Should return 403 Forbidden
        expect(response.status()).toBe(403);
      });
    });
  });

  test.describe('Regular User Restrictions', () => {
    test('should not access admin features', async ({ page }) => {
      await withAuthScenario(page, 'userOnly', async () => {
        // Role management should be denied
        await page.goto('/admin/roles');
        await expect(page.locator('text=Access Denied')).toBeVisible();
        
        // Permission catalogue should be denied
        await page.goto('/admin/permissions');
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
    });

    test('should not show workflow creation options', async ({ page }) => {
      await withAuthScenario(page, 'userOnly', async () => {
        await page.goto('/admin/workflows');
        
        // Should see workflows but limited actions
        await expect(page.locator('h1')).toContainText('Workflows');
        await expect(page.locator('[data-testid="create-workflow"]')).not.toBeVisible();
        await expect(page.locator('[data-testid="delete-workflow"]')).not.toBeVisible();
      });
    });

    test('should return 403 for forbidden admin API calls', async ({ page }) => {
      await withAuthScenario(page, 'userOnly', async () => {
        // Attempt admin operations
        const roleResponse = await page.request.post('/api/trpc/role.create', {
          data: { name: 'Test Role' },
        });
        expect(roleResponse.status()).toBe(403);
        
        const permissionResponse = await page.request.post('/api/trpc/permission.create', {
          data: { slug: 'test:permission', name: 'Test Permission' },
        });
        expect(permissionResponse.status()).toBe(403);
      });
    });
  });

  test.describe('Editor Restrictions', () => {
    test('should not access admin-only features', async ({ page }) => {
      await withAuthScenario(page, 'editorOnly', async () => {
        // Role management should be denied
        await page.goto('/admin/roles');
        await expect(page.locator('text=Access Denied')).toBeVisible();
        
        // User management should be denied
        await page.goto('/admin/users');
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
    });

    test('should not show admin navigation items', async ({ page }) => {
      await withAuthScenario(page, 'editorOnly', async () => {
        await page.goto('/');
        
        // Admin navigation should not be visible
        await expect(page.locator('text=Role Management')).not.toBeVisible();
        await expect(page.locator('text=User Management')).not.toBeVisible();
        
        // Content navigation should be visible
        await expect(page.locator('text=Workflows')).toBeVisible();
        await expect(page.locator('text=Documents')).toBeVisible();
      });
    });

    test('should return 403 for admin API operations', async ({ page }) => {
      await withAuthScenario(page, 'editorOnly', async () => {
        // Attempt role management
        const response = await page.request.post('/api/trpc/role.create', {
          data: { name: 'Test Role' },
        });
        expect(response.status()).toBe(403);
      });
    });
  });

  test.describe('Cross-Role Permission Validation', () => {
    test('should enforce permission boundaries between roles', async ({ page }) => {
      // Test viewer cannot access editor features
      await withAuthScenario(page, 'viewerOnly', async () => {
        await page.goto('/admin/workflows');
        await expect(page.locator('[data-testid="create-workflow"]')).not.toBeVisible();
      });
      
      // Test user cannot access admin features
      await withAuthScenario(page, 'userOnly', async () => {
        await page.goto('/admin/roles');
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
      
      // Test editor cannot access admin features
      await withAuthScenario(page, 'editorOnly', async () => {
        await page.goto('/admin/roles');
        await expect(page.locator('text=Access Denied')).toBeVisible();
      });
    });

    test('should validate API permissions across roles', async ({ page }) => {
      const testCases = [
        { scenario: 'viewerOnly', expectedStatus: 403 },
        { scenario: 'userOnly', expectedStatus: 403 },
        { scenario: 'editorOnly', expectedStatus: 403 },
      ] as const;
      
      for (const { scenario, expectedStatus } of testCases) {
        await withAuthScenario(page, scenario, async () => {
          const response = await page.request.post('/api/trpc/role.create', {
            data: { name: 'Test Role' },
          });
          expect(response.status()).toBe(expectedStatus);
        });
      }
    });
  });

  test.describe('UI State Consistency', () => {
    test('should maintain consistent UI state after permission changes', async ({ page }) => {
      // Start with admin permissions
      await playwrightAuthUtils.loginAsAdmin(page);
      await page.goto('/admin/roles');
      await expect(page.locator('[data-testid="create-role-button"]')).toBeVisible();
      
      // Change to viewer permissions
      await playwrightAuthUtils.loginAsViewer(page);
      await page.reload();
      
      // Should now show access denied
      await expect(page.locator('text=Access Denied')).toBeVisible();
      await expect(page.locator('[data-testid="create-role-button"]')).not.toBeVisible();
    });

    test('should handle navigation restrictions consistently', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Try to navigate to restricted pages
        const restrictedPages = [
          '/admin/roles',
          '/admin/permissions',
          '/admin/users',
          '/admin/settings',
        ];
        
        for (const pagePath of restrictedPages) {
          await page.goto(pagePath);
          await expect(page.locator('text=Access Denied')).toBeVisible();
        }
      });
    });
  });

  test.describe('Security Edge Cases', () => {
    test('should prevent privilege escalation attempts', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Attempt to modify own permissions
        const response = await page.request.post('/api/trpc/user.updatePermissions', {
          data: {
            userId: 5, // viewer user ID
            permissions: ['admin:full_access'],
          },
        });
        
        expect(response.status()).toBe(403);
      });
    });

    test('should prevent role manipulation by unauthorized users', async ({ page }) => {
      await withAuthScenario(page, 'userOnly', async () => {
        // Attempt to assign admin role to self
        const response = await page.request.post('/api/trpc/user.assignRole', {
          data: {
            userId: 2, // user ID
            roleId: 1, // admin role ID
          },
        });
        
        expect(response.status()).toBe(403);
      });
    });

    test('should prevent unauthorized data access', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Attempt to access sensitive admin data
        const response = await page.request.get('/api/trpc/admin.getSystemStats');
        expect(response.status()).toBe(403);
        
        // Attempt to access user management data
        const userResponse = await page.request.get('/api/trpc/user.getAll');
        expect(userResponse.status()).toBe(403);
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should show appropriate error messages for unauthorized access', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        await page.goto('/admin/roles');
        
        // Should show user-friendly error message
        await expect(page.locator('text=Access Denied')).toBeVisible();
        await expect(page.locator('text=You do not have permission')).toBeVisible();
      });
    });

    test('should handle API errors gracefully', async ({ page }) => {
      await withAuthScenario(page, 'viewerOnly', async () => {
        // Mock API call that would trigger 403
        await page.route('/api/trpc/role.create', (route) => {
          route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify({
              error: {
                message: 'Insufficient permissions',
                code: 'FORBIDDEN',
              },
            }),
          });
        });
        
        // Attempt the action and verify error handling
        await page.goto('/admin/roles');
        // Error should be handled gracefully without breaking the UI
        await expect(page.locator('body')).toBeVisible();
      });
    });
  });
}); 