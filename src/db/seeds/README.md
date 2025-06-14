# Database Seeds and Migrations

This directory contains database seeding scripts and migration utilities for the RBAC system.

## Files

### `rbac-seed.ts`
Main RBAC seeding script that creates:
- Default permissions (from `src/constants/permissions.ts`)
- Default roles with their permission assignments
- System users and tenant assignments

### `migrate-twilio-permissions.ts`
Permission migration script that updates existing role permissions from legacy `twilio:templates` to new workflow-based permissions.

## Permission Migration Guide

### Background
As part of the permission hierarchy improvement (SAAS-57), we're replacing the legacy `twilio:templates` permission with more granular workflow-based permissions:

- `workflow:manage_templates` - Manage workflow templates including Twilio message templates
- `workflow:configure_integrations` - Configure external integrations like Twilio, webhooks, and third-party services

### Migration Process

1. **Update Permission Definitions** (SAAS-58)
   - Add new workflow permissions to `src/constants/permissions.ts`
   - Mark legacy permissions as deprecated

2. **Update Code References** (SAAS-59)
   - Update tRPC routers to use new permissions
   - Update API routes to use new permissions

3. **Migrate Database** (SAAS-60)
   - Run the migration script to update existing role assignments
   - Verify all users retain appropriate access

### Running the Migration

```bash
# Run the permission migration
pnpm migrate:twilio-permissions
```

The migration script will:
1. Find all roles that currently have `twilio:templates` permission
2. Add the new `workflow:manage_templates` permission to those roles
3. Remove the legacy `twilio:templates` permission assignments
4. Provide a detailed summary of changes

### Verification

After running the migration:

1. **Check Role Permissions**
   ```sql
   SELECT r.name as role_name, p.slug as permission_slug
   FROM roles r
   JOIN role_permissions rp ON r.id = rp.role_id
   JOIN permissions p ON rp.permission_id = p.id
   WHERE p.slug LIKE 'workflow:%'
   ORDER BY r.name, p.slug;
   ```

2. **Verify No Legacy Permissions**
   ```sql
   SELECT r.name as role_name, p.slug as permission_slug
   FROM roles r
   JOIN role_permissions rp ON r.id = rp.role_id
   JOIN permissions p ON rp.permission_id = p.id
   WHERE p.slug = 'twilio:templates';
   ```

3. **Test Functionality**
   - Verify users can still access Twilio template management
   - Check that permission checks work correctly in the application

### Rollback (if needed)

If you need to rollback the migration:

1. **Re-add Legacy Permissions**
   ```sql
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT r.id, p.id
   FROM roles r, permissions p
   WHERE r.name IN ('Admin', 'Developer', 'Analyst') -- adjust as needed
   AND p.slug = 'twilio:templates';
   ```

2. **Remove New Permissions** (optional)
   ```sql
   DELETE FROM role_permissions
   WHERE permission_id IN (
     SELECT id FROM permissions 
     WHERE slug IN ('workflow:manage_templates', 'workflow:configure_integrations')
   );
   ```

### Best Practices

- Always backup your database before running migrations
- Test migrations in a development environment first
- Verify user access after migration
- Document any custom role configurations that may need special handling 