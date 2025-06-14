import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../env.mjs';
import { roles, permissions, rolePermissions } from '../schema/rbac';
import { ALL_PERMISSIONS, DEFAULT_ROLES, type Permission, type RoleConfig } from '../../constants/permissions';

/**
 * RBAC Seeding Script
 * 
 * This script seeds the database with:
 * 1. All permissions from the permissions catalog
 * 2. Default system roles
 * 3. Role-permission mappings
 */

async function seedRBAC() {
  console.log('🚀 Starting RBAC database seeding...');

  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // 1. Seed Permissions
    console.log('📝 Seeding permissions...');
    
    // Check if permissions already exist
    const existingPermissions = await db.select().from(permissions);
    if (existingPermissions.length === 0) {
      const permissionInserts = ALL_PERMISSIONS.map((permission: Permission) => ({
        slug: permission.slug,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        isActive: true,
      }));

      await db.insert(permissions).values(permissionInserts);
      console.log(`✅ Inserted ${permissionInserts.length} permissions`);
    } else {
      console.log(`ℹ️  Found ${existingPermissions.length} existing permissions, skipping permission seeding`);
    }

    // 2. Seed Roles
    console.log('👥 Seeding roles...');
    
    const existingRoles = await db.select().from(roles);
    const existingRoleNames = existingRoles.map(r => r.name);
    
    const newRoles = DEFAULT_ROLES.filter((role: RoleConfig) => !existingRoleNames.includes(role.name));
    
    if (newRoles.length > 0) {
      const roleInserts = newRoles.map((role: RoleConfig) => ({
        name: role.name,
        description: role.description,
        isSystemRole: role.isSystemRole,
        isActive: true,
      }));

      await db.insert(roles).values(roleInserts);
      console.log(`✅ Inserted ${roleInserts.length} new roles`);
    } else {
      console.log('ℹ️  All default roles already exist, skipping role seeding');
    }

    // 3. Seed Role-Permission Mappings
    console.log('🔗 Seeding role-permission mappings...');
    
    // Get all roles and permissions for mapping
    const allRoles = await db.select().from(roles);
    const allPermissions = await db.select().from(permissions);
    const existingMappings = await db.select().from(rolePermissions);
    
    // Create permission slug to ID mapping
    const permissionMap = new Map<string, number>();
    allPermissions.forEach((p: any) => permissionMap.set(p.slug, p.id));
    
    // Create role name to ID mapping
    const roleMap = new Map();
    allRoles.forEach(r => roleMap.set(r.name, r.id));
    
    // Generate mappings for each default role
    const mappingsToInsert = [];
    
    for (const roleConfig of DEFAULT_ROLES) {
      const roleId = roleMap.get(roleConfig.name);
      if (!roleId) continue;
      
      for (const permissionSlug of roleConfig.permissions) {
        const permissionId = permissionMap.get(permissionSlug);
        if (!permissionId) {
          console.warn(`⚠️  Permission not found: ${permissionSlug}`);
          continue;
        }
        
        // Check if mapping already exists
        const existingMapping = existingMappings.find(
          m => m.roleId === roleId && m.permissionId === permissionId
        );
        
        if (!existingMapping) {
          mappingsToInsert.push({
            roleId,
            permissionId,
          });
        }
      }
    }
    
    if (mappingsToInsert.length > 0) {
      await db.insert(rolePermissions).values(mappingsToInsert);
      console.log(`✅ Inserted ${mappingsToInsert.length} role-permission mappings`);
    } else {
      console.log('ℹ️  All role-permission mappings already exist');
    }

    // 4. Validation Summary
    console.log('\n📊 RBAC Seeding Summary:');
    const finalRoles = await db.select().from(roles);
    const finalPermissions = await db.select().from(permissions);
    const finalMappings = await db.select().from(rolePermissions);
    
    console.log(`   • Total Roles: ${finalRoles.length}`);
    console.log(`   • Total Permissions: ${finalPermissions.length}`);
    console.log(`   • Total Role-Permission Mappings: ${finalMappings.length}`);
    
    // Show role breakdown
    for (const role of finalRoles) {
      const mappingCount = finalMappings.filter(m => m.roleId === role.id).length;
      console.log(`   • ${role.name}: ${mappingCount} permissions`);
    }

    console.log('\n✅ RBAC seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during RBAC seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Validation function to check permissions sync
export async function validatePermissionsSync() {
  console.log('🔍 Validating permissions sync...');
  
  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client);
  
  try {
    const dbPermissions = await db.select().from(permissions);
    const dbSlugs = dbPermissions.map((p: any) => p.slug).sort();
    const catalogSlugs = ALL_PERMISSIONS.map((p: Permission) => p.slug).sort();
    
    const missing = catalogSlugs.filter((slug: string) => !dbSlugs.includes(slug));
    const extra = dbSlugs.filter((slug: string) => !catalogSlugs.includes(slug));
    
    if (missing.length > 0 || extra.length > 0) {
      console.error('❌ Permissions out of sync!');
      if (missing.length > 0) {
        console.error('Missing from database:', missing);
      }
      if (extra.length > 0) {
        console.error('Extra in database:', extra);
      }
      process.exit(1);
    } else {
      console.log('✅ Permissions are in sync');
    }
  } finally {
    await client.end();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedRBAC()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedRBAC }; 