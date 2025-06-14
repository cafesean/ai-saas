import { test, expect } from '@playwright/test';
import { playwrightAuthUtils, withAuthScenario } from '../utils/playwright-auth';

/**
 * TS-QA-01: Implement Negative Path E2E Tests
 * 
 * This test file specifically addresses the acceptance criteria:
 * 1. Using the test harness from TS-TEST-01, a Playwright test logs in a user with a Viewer role
 * 2. The test asserts that "Create" and "Delete" buttons are disabled or not present in the UI
 * 3. The test attempts to programmatically send an API request for a forbidden action and asserts 403 Forbidden
 */
test.describe('Viewer Role Restrictions - Acceptance Criteria', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth data
    await playwrightAuthUtils.logout(page);
  });

  test('AC1: Login user with Viewer role using test harness', async ({ page }) => {
    // Use the test harness from TS-TEST-01 to login with Viewer role
    await withAuthScenario(page, 'viewerOnly', async () => {
      await page.goto('/');
      
      // Verify user is logged in with Viewer role
      const currentUser = await playwrightAuthUtils.getCurrentUser(page);
      expect(currentUser).toBeTruthy();
      expect(currentUser.email).toBe('viewer@test.com');
      expect(currentUser.name).toBe('Test Viewer');
      
      // Verify permissions are correctly set
      const permissions = await playwrightAuthUtils.getCurrentPermissions(page);
      expect(permissions).toContain('workflow:read');
      expect(permissions).toContain('models:read');
      expect(permissions).toContain('documents:read');
      expect(permissions).toContain('decisioning:read');
      
      // Verify user does NOT have create/delete permissions
      expect(permissions).not.toContain('workflow:create');
      expect(permissions).not.toContain('workflow:delete');
      expect(permissions).not.toContain('models:manage');
      expect(permissions).not.toContain('admin:role_management');
    });
  });

  test('AC2: Assert Create and Delete buttons are disabled/not present', async ({ page }) => {
    await withAuthScenario(page, 'viewerOnly', async () => {
      // Test Workflow Management Page
      await page.goto('/admin/workflows');
      
      // Create buttons should not be present
      await expect(page.locator('[data-testid="create-workflow"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Create")')).not.toBeVisible();
      await expect(page.locator('text=Create Workflow')).not.toBeVisible();
      await expect(page.locator('text=New Workflow')).not.toBeVisible();
      
      // Delete buttons should not be present
      await expect(page.locator('[data-testid="delete-workflow"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Delete")')).not.toBeVisible();
      await expect(page.locator('[title="Delete"]')).not.toBeVisible();
      
      // Edit buttons should not be present
      await expect(page.locator('[data-testid="edit-workflow"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Edit")')).not.toBeVisible();
      
      // View/Read buttons should be present (viewer can read)
      await expect(page.locator('[data-testid="view-workflow"]')).toBeVisible();
      
      // Test Model Management Page
      await page.goto('/admin/models');
      
      // Create buttons should not be present
      await expect(page.locator('[data-testid="create-model"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Create")')).not.toBeVisible();
      await expect(page.locator('text=Create Model')).not.toBeVisible();
      await expect(page.locator('text=Import Model')).not.toBeVisible();
      
      // Delete buttons should not be present
      await expect(page.locator('[data-testid="delete-model"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Delete")')).not.toBeVisible();
      
      // Test Decision Tables Page
      await page.goto('/admin/decisioning');
      
      // Create buttons should not be present
      await expect(page.locator('[data-testid="create-decision-table"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Create")')).not.toBeVisible();
      await expect(page.locator('text=Create Decision Table')).not.toBeVisible();
      
      // Delete buttons should not be present
      await expect(page.locator('[data-testid="delete-decision-table"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Delete")')).not.toBeVisible();
    });
  });

  test('AC3: API request for forbidden action returns 403 Forbidden', async ({ page }) => {
    await withAuthScenario(page, 'viewerOnly', async () => {
      // Test forbidden decision table creation (as specified in acceptance criteria)
      const decisionTableResponse = await page.request.post('/api/trpc/decisioning.create', {
        data: {
          name: 'Unauthorized Decision Table',
          description: 'This should fail with 403',
          rules: [
            {
              condition: 'age > 18',
              action: 'approve',
            },
          ],
        },
      });
      
      // Should return 403 Forbidden
      expect(decisionTableResponse.status()).toBe(403);
      
      // Test additional forbidden actions
      
      // Forbidden workflow creation
      const workflowResponse = await page.request.post('/api/trpc/workflow.create', {
        data: {
          name: 'Unauthorized Workflow',
          description: 'This should fail with 403',
        },
      });
      expect(workflowResponse.status()).toBe(403);
      
      // Forbidden model creation
      const modelResponse = await page.request.post('/api/trpc/model.create', {
        data: {
          name: 'Unauthorized Model',
          type: 'classification',
        },
      });
      expect(modelResponse.status()).toBe(403);
      
      // Forbidden role management
      const roleResponse = await page.request.post('/api/trpc/role.create', {
        data: {
          name: 'Unauthorized Role',
          description: 'This should fail with 403',
        },
      });
      expect(roleResponse.status()).toBe(403);
      
      // Forbidden permission management
      const permissionResponse = await page.request.post('/api/trpc/permission.create', {
        data: {
          slug: 'unauthorized:permission',
          name: 'Unauthorized Permission',
          category: 'test',
        },
      });
      expect(permissionResponse.status()).toBe(403);
      
      // Forbidden user management
      const userResponse = await page.request.post('/api/trpc/user.create', {
        data: {
          email: 'unauthorized@test.com',
          name: 'Unauthorized User',
        },
      });
      expect(userResponse.status()).toBe(403);
      
      // Test DELETE operations (should also be forbidden)
      const deleteWorkflowResponse = await page.request.delete('/api/trpc/workflow.delete', {
        data: { id: 1 },
      });
      expect(deleteWorkflowResponse.status()).toBe(403);
      
      const deleteModelResponse = await page.request.delete('/api/trpc/model.delete', {
        data: { id: 1 },
      });
      expect(deleteModelResponse.status()).toBe(403);
      
      // Test UPDATE operations (should also be forbidden)
      const updateWorkflowResponse = await page.request.put('/api/trpc/workflow.update', {
        data: {
          id: 1,
          data: { name: 'Updated Name' },
        },
      });
      expect(updateWorkflowResponse.status()).toBe(403);
    });
  });

  test('Comprehensive Viewer Role Validation', async ({ page }) => {
    await withAuthScenario(page, 'viewerOnly', async () => {
      // Verify viewer can access read-only pages
      const allowedPages = [
        '/admin/workflows',
        '/admin/models',
        '/admin/decisioning',
        '/admin/documents',
      ];
      
      for (const pagePath of allowedPages) {
        await page.goto(pagePath);
        // Should not see access denied
        await expect(page.locator('text=Access Denied')).not.toBeVisible();
        // Should see the page content
        await expect(page.locator('h1')).toBeVisible();
      }
      
      // Verify viewer cannot access admin pages
      const forbiddenPages = [
        '/admin/roles',
        '/admin/permissions',
        '/admin/users',
        '/admin/settings',
      ];
      
      for (const pagePath of forbiddenPages) {
        await page.goto(pagePath);
        // Should see access denied
        await expect(page.locator('text=Access Denied')).toBeVisible();
      }
      
      // Verify navigation restrictions
      await page.goto('/');
      
      // Should not see admin navigation
      await expect(page.locator('[data-testid="admin-nav"]')).not.toBeVisible();
      await expect(page.locator('text=Role Management')).not.toBeVisible();
      await expect(page.locator('text=User Management')).not.toBeVisible();
      await expect(page.locator('text=Permissions')).not.toBeVisible();
      
      // Should see read-only navigation
      await expect(page.locator('text=Workflows')).toBeVisible();
      await expect(page.locator('text=Models')).toBeVisible();
      await expect(page.locator('text=Documents')).toBeVisible();
    });
  });

  test('Viewer Role API Read Access Validation', async ({ page }) => {
    await withAuthScenario(page, 'viewerOnly', async () => {
      // Viewer should be able to read data (GET requests)
      const readWorkflowsResponse = await page.request.get('/api/trpc/workflow.getAll');
      expect(readWorkflowsResponse.status()).toBe(200);
      
      const readModelsResponse = await page.request.get('/api/trpc/model.getAll');
      expect(readModelsResponse.status()).toBe(200);
      
      const readDocumentsResponse = await page.request.get('/api/trpc/document.getAll');
      expect(readDocumentsResponse.status()).toBe(200);
      
      // But should NOT be able to access admin data
      const adminStatsResponse = await page.request.get('/api/trpc/admin.getSystemStats');
      expect(adminStatsResponse.status()).toBe(403);
      
      const allUsersResponse = await page.request.get('/api/trpc/user.getAll');
      expect(allUsersResponse.status()).toBe(403);
      
      const allRolesResponse = await page.request.get('/api/trpc/role.getAll');
      expect(allRolesResponse.status()).toBe(403);
    });
  });
}); 