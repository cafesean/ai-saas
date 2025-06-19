import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { roles, permissions, rolePermissions, userRoles } from '../schema/rbac';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Comprehensive Role Permissions Fix
 * 
 * This script ensures:
 * 1. Owner role has ALL permissions
 * 2. Admin role has comprehensive permissions 
 * 3. User ID 1 is assigned to owner role
 * 4. All permission categories are properly mapped
 */

async function comprehensiveRolePermissionsFix() {
  console.log('🔧 Starting comprehensive role permissions fix...');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // 1. Get all permissions and roles
    console.log('📋 Fetching current permissions and roles...');
    
    const allRoles = await db.select().from(roles);
    const allPermissions = await db.select().from(permissions);
    
    console.log(`   • Found ${allRoles.length} roles`);
    console.log(`   • Found ${allPermissions.length} permissions`);
    
    // Create mappings
    const permissionMap = new Map<string, number>();
    allPermissions.forEach((p: any) => permissionMap.set(p.slug, p.id));
    
    const roleMap = new Map<string, number>();
    allRoles.forEach(r => roleMap.set(r.name, r.id));

    // 2. Clear existing role permissions for owner and admin to start fresh
    console.log('🧹 Clearing existing role permissions for owner and admin...');
    
    const ownerRoleId = roleMap.get('owner');
    const adminRoleId = roleMap.get('admin');
    
    if (ownerRoleId) {
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, ownerRoleId));
      console.log('   ✅ Cleared owner role permissions');
    }
    
    if (adminRoleId) {
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, adminRoleId));
      console.log('   ✅ Cleared admin role permissions');
    }

    // 3. Assign ALL permissions to owner role
    console.log('👑 Assigning ALL permissions to owner role...');
    
    if (ownerRoleId) {
      for (const permission of allPermissions) {
        try {
          await db.insert(rolePermissions).values({
            roleId: ownerRoleId,
            permissionId: permission.id,
          });
          console.log(`   ✅ Assigned ${permission.slug} to owner`);
        } catch (error) {
          console.log(`   ⚠️  Failed to assign ${permission.slug} to owner`);
        }
      }
    }

    // 4. Assign comprehensive permissions to admin role
    console.log('🔧 Assigning comprehensive permissions to admin role...');
    
    if (adminRoleId) {
      // Admin should have most permissions except super-admin ones
      const adminPermissionSlugs = allPermissions
        .filter((p: any) => !p.slug.startsWith('admin:seed_')) // Exclude seeding permissions
        .map((p: any) => p.slug);

      for (const permSlug of adminPermissionSlugs) {
        const permissionId = permissionMap.get(permSlug);
        if (permissionId) {
          try {
            await db.insert(rolePermissions).values({
              roleId: adminRoleId,
              permissionId: permissionId,
            });
            console.log(`   ✅ Assigned ${permSlug} to admin`);
          } catch (error) {
            console.log(`   ⚠️  Failed to assign ${permSlug} to admin`);
          }
        }
      }
    }

    // 5. Ensure user ID 1 is assigned to owner role
    console.log('👤 Checking user ID 1 role assignment...');
    
    const existingUserRoles = await db.select().from(userRoles).where(eq(userRoles.userId, 1));
    console.log(`   • User 1 currently has ${existingUserRoles.length} role assignments`);
    
    // Check if user 1 is already assigned to owner role
    const hasOwnerRole = existingUserRoles.some((ur: any) => ur.roleId === ownerRoleId);
    
    if (!hasOwnerRole && ownerRoleId) {
      try {
        await db.insert(userRoles).values({
          userId: 1,
          roleId: ownerRoleId,
          tenantId: 1, // Assuming tenant ID 1
        });
        console.log('   ✅ Assigned user 1 to owner role');
      } catch (error) {
        console.log('   ⚠️  Failed to assign user 1 to owner role:', error);
      }
    } else {
      console.log('   ✅ User 1 already has owner role');
    }

    // 6. Validation and Summary
    console.log('\n📊 Final Validation:');
    
    // Count permissions per role
    const ownerPermissions = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, ownerRoleId || 0));
    const adminPermissions = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, adminRoleId || 0));
    
    console.log(`   • Owner role permissions: ${ownerPermissions.length}`);
    console.log(`   • Admin role permissions: ${adminPermissions.length}`);
    
    // Check user 1 final state
    const finalUserRoles = await db.select().from(userRoles).where(eq(userRoles.userId, 1));
    console.log(`   • User 1 total role assignments: ${finalUserRoles.length}`);
    
    // Show permission categories
    const categoryCounts = allPermissions.reduce((acc: any, p: any) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📋 All Permission Categories:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} permissions`);
    });

    console.log('\n✅ Comprehensive role permissions fix completed!');
    console.log('🔐 User ID 1 should now have full owner access to all features.');

  } catch (error) {
    console.error('❌ Error during comprehensive fix:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run fix if this file is executed directly
if (require.main === module) {
  comprehensiveRolePermissionsFix()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { comprehensiveRolePermissionsFix }; 