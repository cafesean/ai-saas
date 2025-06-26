import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';
import { roles, permissions, rolePermissions } from '../schema/rbac';
import { PROVIDER_PERMISSIONS, type Permission } from '../../constants/permissions';

// Load environment variables
config({ path: '.env.local' });

// Direct database connection (avoid env.mjs validation issues during seeding)
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

/**
 * Provider Permissions Seeding Script
 * 
 * This script seeds the database with provider management permissions
 * and assigns them to appropriate roles.
 */

async function seedProviderPermissions() {
  console.log('🔌 Starting Provider Permissions database seeding...');

  const client = postgres(DATABASE_URL!);
  const db = drizzle(client);

  try {
    // 1. Check existing permissions to avoid duplicates
    console.log('📝 Checking existing provider permissions...');
    
    const existingPermissions = await db.select().from(permissions);
    const existingPermissionSlugs = existingPermissions.map(p => p.slug);
    
    // Filter provider permissions that don't exist yet
    const newProviderPermissions = PROVIDER_PERMISSIONS.filter(
      (perm: Permission) => !existingPermissionSlugs.includes(perm.slug)
    );

    // 2. Insert new provider permissions
    if (newProviderPermissions.length > 0) {
      console.log(`📋 Adding ${newProviderPermissions.length} new provider permissions...`);
      
      const permissionInserts = newProviderPermissions.map((permission: Permission) => ({
        slug: permission.slug,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        isActive: true,
      }));

      await db.insert(permissions).values(permissionInserts);
      console.log(`✅ Successfully inserted ${permissionInserts.length} provider permissions`);
      
      // Log each permission added
      newProviderPermissions.forEach((perm: Permission) => {
        console.log(`   • ${perm.slug} - ${perm.name}`);
      });
    } else {
      console.log('ℹ️  All provider permissions already exist, skipping permission creation');
    }

    // 3. Get all roles and current permissions for mapping
    console.log('🔗 Setting up role-permission mappings...');
    
    const allRoles = await db.select().from(roles);
    const allPermissions = await db.select().from(permissions);
    const existingMappings = await db.select().from(rolePermissions);
    
    // Create maps for easy lookup
    const permissionMap = new Map<string, number>();
    allPermissions.forEach((p: any) => permissionMap.set(p.slug, p.id));
    
    const roleMap = new Map<string, number>();
    allRoles.forEach((r: any) => roleMap.set(r.name, r.id));
    
    // 4. Assign provider permissions to Developer role (full access)
    const developerRoleId = roleMap.get('Developer');
    if (developerRoleId) {
      console.log('👨‍💻 Assigning all provider permissions to Developer role...');
      
      let developerAssignments = 0;
      for (const permission of PROVIDER_PERMISSIONS) {
        const permissionId = permissionMap.get(permission.slug);
        if (!permissionId) continue;
        
        // Check if mapping already exists
        const existingMapping = existingMappings.find(
          m => m.roleId === developerRoleId && m.permissionId === permissionId
        );
        
        if (!existingMapping) {
          try {
            await db.insert(rolePermissions).values({
              roleId: developerRoleId,
              permissionId: permissionId,
            });
            console.log(`   ✅ Assigned ${permission.slug} to Developer role`);
            developerAssignments++;
          } catch (error) {
            console.log(`   ⚠️  Failed to assign ${permission.slug} to Developer role`);
          }
        } else {
          console.log(`   ℹ️  ${permission.slug} already assigned to Developer role`);
        }
      }
      console.log(`📊 Developer role: ${developerAssignments} new assignments`);
    } else {
      console.log('⚠️  Developer role not found');
    }

    // 5. Assign read permissions to Viewer role
    const viewerRoleId = roleMap.get('Viewer');
    if (viewerRoleId) {
      console.log('👀 Assigning read permissions to Viewer role...');
      
      const viewerPermissions = [
        'provider:read',
        'provider:health'
      ];
      
      let viewerAssignments = 0;
      for (const permSlug of viewerPermissions) {
        const permissionId = permissionMap.get(permSlug);
        if (!permissionId) continue;
        
        // Check if mapping already exists
        const existingMapping = existingMappings.find(
          m => m.roleId === viewerRoleId && m.permissionId === permissionId
        );
        
        if (!existingMapping) {
          try {
            await db.insert(rolePermissions).values({
              roleId: viewerRoleId,
              permissionId: permissionId,
            });
            console.log(`   ✅ Assigned ${permSlug} to Viewer role`);
            viewerAssignments++;
          } catch (error) {
            console.log(`   ⚠️  Failed to assign ${permSlug} to Viewer role`);
          }
        } else {
          console.log(`   ℹ️  ${permSlug} already assigned to Viewer role`);
        }
      }
      console.log(`📊 Viewer role: ${viewerAssignments} new assignments`);
    } else {
      console.log('⚠️  Viewer role not found');
    }

    // 6. Assign all provider permissions to Owner and Admin roles (if they exist)
    const ownerRoleId = roleMap.get('owner');
    const adminRoleId = roleMap.get('admin');
    
    for (const [roleName, roleId] of [['owner', ownerRoleId], ['admin', adminRoleId]]) {
      if (typeof roleId === 'number') {
        console.log(`👑 Assigning all provider permissions to ${roleName} role...`);
        
        let assignments = 0;
        for (const permission of PROVIDER_PERMISSIONS) {
          const permissionId = permissionMap.get(permission.slug);
          if (!permissionId) continue;
          
          // Check if mapping already exists
          const existingMapping = existingMappings.find(
            m => m.roleId === roleId && m.permissionId === permissionId
          );
          
          if (!existingMapping) {
            try {
              await db.insert(rolePermissions).values({
                roleId: roleId,
                permissionId: permissionId,
              });
              console.log(`   ✅ Assigned ${permission.slug} to ${roleName} role`);
              assignments++;
            } catch (error) {
              console.log(`   ⚠️  Failed to assign ${permission.slug} to ${roleName} role`);
            }
          }
        }
        console.log(`📊 ${roleName} role: ${assignments} new assignments`);
      }
    }

    // 7. Final summary
    console.log('\n📊 Provider Permissions Seeding Summary:');
    
    const finalPermissions = await db.select().from(permissions).where(
      eq(permissions.category, 'provider')
    );
    const finalMappings = await db.select().from(rolePermissions);
    
    console.log(`   • Total Provider Permissions: ${finalPermissions.length}`);
    console.log(`   • New Permissions Added: ${newProviderPermissions.length}`);
    
    // Show provider permissions by role
    for (const role of allRoles) {
      const providerPermCount = finalMappings.filter(m => {
        const permission = allPermissions.find(p => p.id === m.permissionId);
        return m.roleId === role.id && permission?.category === 'provider';
      }).length;
      
      if (providerPermCount > 0) {
        console.log(`   • ${role.name}: ${providerPermCount} provider permissions`);
      }
    }

    console.log('\n✅ Provider permissions seeding completed successfully!');
    console.log('\n🔧 Next Steps:');
    console.log('   1. Restart your application to pick up the new permissions');
    console.log('   2. Users with Developer role can now manage providers');
    console.log('   3. Users with Viewer role can view provider status');
    console.log('   4. Test the provider management interface at /providers');

  } catch (error) {
    console.error('❌ Error during provider permissions seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedProviderPermissions()
    .then(() => {
      console.log('🎉 Provider permissions seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Provider permissions seeding failed:', error);
      process.exit(1);
    });
}

export { seedProviderPermissions }; 