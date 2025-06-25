import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { roles, permissions, rolePermissions } from '../schema/rbac';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Permission Fix Migration Script
 * 
 * This script fixes the mismatch between database permissions and code expectations:
 * - Adds new standardized permission slugs (users:*, rules:*, bases:*, orgs:*, roles:*, admin:*)
 * - Maps existing roles to new permissions
 * - Ensures admin users have all necessary permissions
 */

async function fixPermissionsMigration() {
  console.log('🔧 Starting permissions fix migration...');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // 1. Add new standardized permissions
    console.log('📝 Adding new standardized permissions...');
    
    const newPermissions = [
      // Users permissions (plural)
      { slug: 'users:read', name: 'View Users', description: 'View user accounts and profiles', category: 'users' },
      { slug: 'users:create', name: 'Create Users', description: 'Create new user accounts', category: 'users' },
      { slug: 'users:update', name: 'Edit Users', description: 'Edit user accounts and profiles', category: 'users' },
      { slug: 'users:delete', name: 'Delete Users', description: 'Delete user accounts', category: 'users' },
      { slug: 'users:assign_roles', name: 'Assign User Roles', description: 'Assign and manage user roles', category: 'users' },

      // Roles permissions (plural)
      { slug: 'roles:read', name: 'View Roles', description: 'View roles and their permissions', category: 'roles' },
      { slug: 'roles:create', name: 'Create Roles', description: 'Create new roles', category: 'roles' },
      { slug: 'roles:update', name: 'Edit Roles', description: 'Edit existing roles', category: 'roles' },
      { slug: 'roles:delete', name: 'Delete Roles', description: 'Delete roles', category: 'roles' },
      { slug: 'roles:assign_permissions', name: 'Assign Role Permissions', description: 'Assign permissions to roles', category: 'roles' },

      // Rules permissions (renamed from decision_table)
      { slug: 'rules:read', name: 'View Rules', description: 'View decision table structure and rules', category: 'rules' },
      { slug: 'rules:create', name: 'Create Rules', description: 'Create new decision tables and rules', category: 'rules' },
      { slug: 'rules:update', name: 'Edit Rules', description: 'Edit decision table rules and conditions', category: 'rules' },
      { slug: 'rules:delete', name: 'Delete Rules', description: 'Delete decision tables and rules', category: 'rules' },
      { slug: 'rules:publish', name: 'Publish Rules', description: 'Publish decision tables to production', category: 'rules' },
      { slug: 'rules:test', name: 'Test Rules', description: 'Execute test cases against decision tables', category: 'rules' },

      // Bases permissions (renamed from knowledge_base)
      { slug: 'bases:read', name: 'View Knowledge Bases', description: 'View knowledge base content', category: 'bases' },
      { slug: 'bases:create', name: 'Create Knowledge Bases', description: 'Create new knowledge bases', category: 'bases' },
      { slug: 'bases:update', name: 'Edit Knowledge Bases', description: 'Edit knowledge base content', category: 'bases' },
      { slug: 'bases:delete', name: 'Delete Knowledge Bases', description: 'Delete knowledge bases', category: 'bases' },
      { slug: 'bases:upload_document', name: 'Upload Documents', description: 'Upload documents to knowledge bases', category: 'bases' },
      { slug: 'bases:chat', name: 'Chat with Knowledge Base', description: 'Chat with knowledge base AI', category: 'bases' },
      { slug: 'bases:callback', name: 'Knowledge Base Callbacks', description: 'Handle knowledge base processing callbacks', category: 'bases' },

      // Orgs permissions (renamed from org)
      { slug: 'orgs:read', name: 'View Organizations', description: 'View organization details', category: 'orgs' },
      { slug: 'orgs:create', name: 'Create Organizations', description: 'Create new organizations', category: 'orgs' },
      { slug: 'orgs:update', name: 'Edit Organizations', description: 'Edit organization details', category: 'orgs' },
      { slug: 'orgs:delete', name: 'Delete Organizations', description: 'Delete organizations', category: 'orgs' },

      // Admin permissions
      { slug: 'admin:debug_context', name: 'Debug Context Access', description: 'Access system debug information and context data', category: 'admin' },
      { slug: 'admin:seed_rbac', name: 'Seed RBAC', description: 'Initialize/modify RBAC system structure', category: 'admin' },
      { slug: 'admin:seed_orgs', name: 'Seed Orgs', description: 'Initialize/modify org structure', category: 'admin' },
    ];

    // Insert new permissions (skip if they already exist)
    for (const perm of newPermissions) {
      try {
        await db.insert(permissions).values({
          slug: perm.slug,
          name: perm.name,
          description: perm.description,
          category: perm.category,
          isActive: true,
        }).onConflictDoNothing();
        console.log(`  ✅ Added permission: ${perm.slug}`);
      } catch (error) {
        console.log(`  ⚠️  Permission ${perm.slug} already exists or failed to add`);
      }
    }

    // 2. Get all permissions and roles for mapping
    console.log('🔗 Mapping new permissions to existing roles...');
    
    const allRoles = await db.select().from(roles);
    const allPermissions = await db.select().from(permissions);
    
    // Create permission slug to ID mapping
    const permissionMap = new Map<string, number>();
    allPermissions.forEach((p: any) => permissionMap.set(p.slug, p.id));
    
    // Create role name to ID mapping
    const roleMap = new Map();
    allRoles.forEach(r => roleMap.set(r.name, r.id));

    // 3. Assign all new permissions to owner role
    console.log('👑 Assigning all permissions to owner role...');
    
    const ownerRole = allRoles.find(r => r.name === 'owner');
    if (ownerRole) {
      for (const perm of newPermissions) {
        const permissionId = permissionMap.get(perm.slug);
        if (permissionId) {
          try {
            await db.insert(rolePermissions).values({
              roleId: ownerRole.id,
              permissionId: permissionId,
            }).onConflictDoNothing();
            console.log(`  ✅ Assigned ${perm.slug} to owner role`);
          } catch (error) {
            console.log(`  ⚠️  Permission ${perm.slug} already assigned to owner`);
          }
        }
      }
    }

    // 4. Assign new permissions to admin role
    console.log('🔧 Assigning relevant permissions to admin role...');
    
    const adminRole = allRoles.find(r => r.name === 'admin');
    if (adminRole) {
      const adminPermissions = [
        'users:read', 'users:create', 'users:update', 'users:delete', 'users:assign_roles',
        'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'roles:assign_permissions',
        'rules:read', 'rules:create', 'rules:update', 'rules:delete', 'rules:publish', 'rules:test',
        'bases:read', 'bases:create', 'bases:update', 'bases:delete', 'bases:upload_document', 'bases:chat',
        'orgs:read', 'orgs:create', 'orgs:update', 'orgs:delete',
        'admin:debug_context', 'admin:seed_rbac', 'admin:seed_orgs',
      ];

      for (const permSlug of adminPermissions) {
        const permissionId = permissionMap.get(permSlug);
        if (permissionId) {
          try {
            await db.insert(rolePermissions).values({
              roleId: adminRole.id,
              permissionId: permissionId,
            }).onConflictDoNothing();
            console.log(`  ✅ Assigned ${permSlug} to admin role`);
          } catch (error) {
            console.log(`  ⚠️  Permission ${permSlug} already assigned to admin`);
          }
        }
      }
    }

    // 5. Validation Summary
    console.log('\n📊 Migration Summary:');
    const finalPermissions = await db.select().from(permissions);
    const finalMappings = await db.select().from(rolePermissions);
    
    console.log(`   • Total Permissions: ${finalPermissions.length}`);
    console.log(`   • Total Role-Permission Mappings: ${finalMappings.length}`);
    
    // Show permission counts by category
    const categoryCounts = finalPermissions.reduce((acc: any, p: any) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📋 Permissions by Category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} permissions`);
    });

    // Show role permission counts
    console.log('\n👥 Role Permission Counts:');
    for (const role of allRoles) {
      const mappingCount = finalMappings.filter((m: any) => m.roleId === role.id).length;
      console.log(`   • ${role.name}: ${mappingCount} permissions`);
    }

    console.log('\n✅ Permissions fix migration completed successfully!');
    console.log('\n🔐 Your admin access should now be restored.');

  } catch (error) {
    console.error('❌ Error during permissions fix migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fixPermissionsMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { fixPermissionsMigration }; 