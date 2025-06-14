import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../env.mjs';
import { roles, permissions, rolePermissions } from '../schema/rbac';
import { eq, and } from 'drizzle-orm';

/**
 * Permission Migration Script
 * 
 * This script migrates existing role permissions from legacy twilio:templates
 * to the new workflow-based permissions:
 * - workflow:manage_templates
 * - workflow:configure_integrations
 */

async function migrateTwilioPermissions() {
  console.log('🔄 Starting Twilio permission migration...');

  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // 1. Get permission IDs
    console.log('📝 Looking up permission IDs...');
    
    const oldPermission = await db.select()
      .from(permissions)
      .where(eq(permissions.slug, 'twilio:templates'))
      .limit(1);

    const newPermissions = await db.select()
      .from(permissions)
      .where(eq(permissions.slug, 'workflow:manage_templates'));

    if (oldPermission.length === 0) {
      console.log('ℹ️  No legacy twilio:templates permission found, migration not needed');
      return;
    }

    if (newPermissions.length === 0) {
      console.error('❌ New workflow:manage_templates permission not found! Please run RBAC seed first.');
      process.exit(1);
    }

    const oldPermissionId = oldPermission[0]!.id;
    const newPermissionId = newPermissions[0]!.id;

    console.log(`📋 Found permissions:
      - Legacy: twilio:templates (ID: ${oldPermissionId})
      - New: workflow:manage_templates (ID: ${newPermissionId})`);

    // 2. Find roles that have the old permission
    console.log('🔍 Finding roles with legacy permission...');
    
    const rolePermissionsToMigrate = await db.select({
      roleId: rolePermissions.roleId,
      roleName: roles.name
    })
    .from(rolePermissions)
    .innerJoin(roles, eq(roles.id, rolePermissions.roleId))
    .where(eq(rolePermissions.permissionId, oldPermissionId));

    if (rolePermissionsToMigrate.length === 0) {
      console.log('ℹ️  No roles found with legacy permission, migration not needed');
      return;
    }

    console.log(`📊 Found ${rolePermissionsToMigrate.length} role(s) to migrate:`);
    rolePermissionsToMigrate.forEach(rp => {
      console.log(`   - ${rp.roleName} (ID: ${rp.roleId})`);
    });

    // 3. Add new permissions to roles (if not already present)
    console.log('➕ Adding new permissions to roles...');
    
    let addedCount = 0;
    for (const rolePermission of rolePermissionsToMigrate) {
      // Check if role already has the new permission
      const existingMapping = await db.select()
        .from(rolePermissions)
        .where(and(
          eq(rolePermissions.roleId, rolePermission.roleId),
          eq(rolePermissions.permissionId, newPermissionId)
        ))
        .limit(1);

      if (existingMapping.length === 0) {
        // Add the new permission
        await db.insert(rolePermissions).values({
          roleId: rolePermission.roleId,
          permissionId: newPermissionId,
        });
        addedCount++;
        console.log(`   ✅ Added workflow:manage_templates to ${rolePermission.roleName}`);
      } else {
        console.log(`   ℹ️  ${rolePermission.roleName} already has workflow:manage_templates`);
      }
    }

    // 4. Remove old permissions (optional - keeping for backward compatibility)
    console.log('🗑️  Removing legacy permissions...');
    
    const deletedResult = await db.delete(rolePermissions)
      .where(eq(rolePermissions.permissionId, oldPermissionId));

    const deletedCount = Array.isArray(deletedResult) ? deletedResult.length : 0;
    console.log(`   🗑️  Removed ${deletedCount} legacy permission mappings`);

    // 5. Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   • Roles migrated: ${rolePermissionsToMigrate.length}`);
    console.log(`   • New permissions added: ${addedCount}`);
    console.log(`   • Legacy permissions removed: ${deletedCount}`);
    
    console.log('\n✅ Twilio permission migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during permission migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateTwilioPermissions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateTwilioPermissions }; 