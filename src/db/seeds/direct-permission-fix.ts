import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Direct Permission Fix Script
 * 
 * This script uses direct SQL to add the missing standardized permissions
 * and assign them to the owner role (ID 5)
 */

async function directPermissionFix() {
  console.log('🔧 Starting direct permission fix...');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    // 1. Add missing permissions using direct SQL
    console.log('📝 Adding missing standardized permissions...');
    
    const missingPermissions = [
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

    // Insert permissions using direct SQL with ON CONFLICT DO NOTHING
    for (const perm of missingPermissions) {
      try {
        const result = await client`
          INSERT INTO permissions (slug, name, description, category, is_active, created_at, updated_at)
          VALUES (${perm.slug}, ${perm.name}, ${perm.description}, ${perm.category}, true, NOW(), NOW())
          ON CONFLICT (slug) DO NOTHING
          RETURNING id, slug
        `;
        
        if (result.length > 0) {
          console.log(`  ✅ Added permission: ${perm.slug} (ID: ${result[0].id})`);
        } else {
          console.log(`  ⚠️  Permission ${perm.slug} already exists`);
        }
      } catch (error) {
        console.log(`  ❌ Failed to add ${perm.slug}:`, error);
      }
    }

    // 2. Get all new permissions and assign to owner role (ID 5)
    console.log('\n👑 Assigning new permissions to owner role...');
    
    const newPermissions = await client`
      SELECT id, slug FROM permissions 
      WHERE slug LIKE 'users:%' OR slug LIKE 'roles:%' OR slug LIKE 'rules:%' 
         OR slug LIKE 'bases:%' OR slug LIKE 'orgs:%' OR slug LIKE 'admin:debug%' 
         OR slug LIKE 'admin:seed%'
    `;

    console.log(`   • Found ${newPermissions.length} new permissions to assign`);

    for (const perm of newPermissions) {
      try {
        const result = await client`
          INSERT INTO role_permissions (role_id, permission_id, created_at)
          VALUES (5, ${perm.id}, NOW())
          ON CONFLICT (role_id, permission_id) DO NOTHING
          RETURNING role_id, permission_id
        `;
        
        if (result.length > 0) {
          console.log(`  ✅ Assigned ${perm.slug} to owner role`);
        } else {
          console.log(`  ⚠️  Permission ${perm.slug} already assigned to owner`);
        }
      } catch (error) {
        console.log(`  ❌ Failed to assign ${perm.slug}:`, error);
      }
    }

    // 3. Assign to admin role (ID 6) - exclude seeding permissions
    console.log('\n🔧 Assigning new permissions to admin role...');
    
    const adminPerms = newPermissions.filter(p => !p.slug.includes('seed_'));
    
    for (const perm of adminPerms) {
      try {
        const result = await client`
          INSERT INTO role_permissions (role_id, permission_id, created_at)
          VALUES (6, ${perm.id}, NOW())
          ON CONFLICT (role_id, permission_id) DO NOTHING
          RETURNING role_id, permission_id
        `;
        
        if (result.length > 0) {
          console.log(`  ✅ Assigned ${perm.slug} to admin role`);
        } else {
          console.log(`  ⚠️  Permission ${perm.slug} already assigned to admin`);
        }
      } catch (error) {
        console.log(`  ❌ Failed to assign ${perm.slug}:`, error);
      }
    }

    // 4. Final validation
    console.log('\n📊 Final Validation:');
    
    const totalPermissions = await client`SELECT COUNT(*) as count FROM permissions`;
    const ownerPermissions = await client`SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 5`;
    const adminPermissions = await client`SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 6`;
    
    console.log(`   • Total Permissions: ${totalPermissions[0].count}`);
    console.log(`   • Owner Role Permissions: ${ownerPermissions[0].count}`);
    console.log(`   • Admin Role Permissions: ${adminPermissions[0].count}`);
    
    // Check specific permissions that the code needs
    const criticalPermissions = await client`
      SELECT slug FROM permissions 
      WHERE slug IN ('users:read', 'roles:read', 'rules:read', 'bases:read', 'admin:debug_context')
      ORDER BY slug
    `;
    
    console.log('\n🔑 Critical Permissions Added:');
    criticalPermissions.forEach(p => {
      console.log(`   ✅ ${p.slug}`);
    });

    console.log('\n✅ Direct permission fix completed successfully!');
    console.log('🔐 Your admin access should now be restored.');
    console.log('🔄 Please restart your development server to clear any cached session data.');

  } catch (error) {
    console.error('❌ Error during direct permission fix:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run fix if this file is executed directly
if (require.main === module) {
  directPermissionFix()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { directPermissionFix }; 