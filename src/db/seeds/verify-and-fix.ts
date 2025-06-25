import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function verifyAndFix() {
  console.log('🔍 Verifying current database state...');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const sql = postgres(process.env.DATABASE_URL);

  try {
    // 1. Check current permissions
    console.log('\n📋 Current permissions in database:');
    const currentPermissions = await sql`SELECT slug, category FROM permissions ORDER BY category, slug`;
    console.log(`   • Total permissions: ${currentPermissions.length}`);
    
    // Show current permissions by category
    const categories = currentPermissions.reduce((acc: any, p: any) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} permissions`);
    });

    // 2. Check what permissions the code expects vs what exists
    const expectedPermissions = [
      'users:read', 'users:create', 'users:update', 'users:delete', 'users:assign_roles',
      'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'roles:assign_permissions',
      'rules:read', 'rules:create', 'rules:update', 'rules:delete', 'rules:publish', 'rules:test',
      'bases:read', 'bases:create', 'bases:update', 'bases:delete', 'bases:upload_document', 'bases:chat', 'bases:callback',
      'orgs:read', 'orgs:create', 'orgs:update', 'orgs:delete',
      'admin:debug_context', 'admin:seed_rbac', 'admin:seed_orgs'
    ];

    console.log('\n🔍 Checking for missing critical permissions:');
    const existingSlugs = currentPermissions.map((p: any) => p.slug);
    const missingPermissions = expectedPermissions.filter(slug => !existingSlugs.includes(slug));
    
    if (missingPermissions.length > 0) {
      console.log(`   ❌ Missing ${missingPermissions.length} critical permissions:`);
      missingPermissions.forEach(slug => console.log(`      • ${slug}`));
      
      console.log('\n🔧 Adding missing permissions in a single transaction...');
      
      // Start transaction
      await sql.begin(async sql => {
        const permissionsToAdd = [
          // Users permissions
          { slug: 'users:read', name: 'View Users', description: 'View user accounts and profiles', category: 'users' },
          { slug: 'users:create', name: 'Create Users', description: 'Create new user accounts', category: 'users' },
          { slug: 'users:update', name: 'Edit Users', description: 'Edit user accounts and profiles', category: 'users' },
          { slug: 'users:delete', name: 'Delete Users', description: 'Delete user accounts', category: 'users' },
          { slug: 'users:assign_roles', name: 'Assign User Roles', description: 'Assign and manage user roles', category: 'users' },

          // Roles permissions
          { slug: 'roles:read', name: 'View Roles', description: 'View roles and their permissions', category: 'roles' },
          { slug: 'roles:create', name: 'Create Roles', description: 'Create new roles', category: 'roles' },
          { slug: 'roles:update', name: 'Edit Roles', description: 'Edit existing roles', category: 'roles' },
          { slug: 'roles:delete', name: 'Delete Roles', description: 'Delete roles', category: 'roles' },
          { slug: 'roles:assign_permissions', name: 'Assign Role Permissions', description: 'Assign permissions to roles', category: 'roles' },

          // Rules permissions
          { slug: 'rules:read', name: 'View Rules', description: 'View decision table structure and rules', category: 'rules' },
          { slug: 'rules:create', name: 'Create Rules', description: 'Create new decision tables and rules', category: 'rules' },
          { slug: 'rules:update', name: 'Edit Rules', description: 'Edit decision table rules and conditions', category: 'rules' },
          { slug: 'rules:delete', name: 'Delete Rules', description: 'Delete decision tables and rules', category: 'rules' },
          { slug: 'rules:publish', name: 'Publish Rules', description: 'Publish decision tables to production', category: 'rules' },
          { slug: 'rules:test', name: 'Test Rules', description: 'Execute test cases against decision tables', category: 'rules' },

          // Bases permissions
          { slug: 'bases:read', name: 'View Knowledge Bases', description: 'View knowledge base content', category: 'bases' },
          { slug: 'bases:create', name: 'Create Knowledge Bases', description: 'Create new knowledge bases', category: 'bases' },
          { slug: 'bases:update', name: 'Edit Knowledge Bases', description: 'Edit knowledge base content', category: 'bases' },
          { slug: 'bases:delete', name: 'Delete Knowledge Bases', description: 'Delete knowledge bases', category: 'bases' },
          { slug: 'bases:upload_document', name: 'Upload Documents', description: 'Upload documents to knowledge bases', category: 'bases' },
          { slug: 'bases:chat', name: 'Chat with Knowledge Base', description: 'Chat with knowledge base AI', category: 'bases' },
          { slug: 'bases:callback', name: 'Knowledge Base Callbacks', description: 'Handle knowledge base processing callbacks', category: 'bases' },

          // Orgs permissions
          { slug: 'orgs:read', name: 'View Organizations', description: 'View organization details', category: 'orgs' },
          { slug: 'orgs:create', name: 'Create Organizations', description: 'Create new organizations', category: 'orgs' },
          { slug: 'orgs:update', name: 'Edit Organizations', description: 'Edit organization details', category: 'orgs' },
          { slug: 'orgs:delete', name: 'Delete Organizations', description: 'Delete organizations', category: 'orgs' },

          // Admin permissions
          { slug: 'admin:debug_context', name: 'Debug Context Access', description: 'Access system debug information and context data', category: 'admin' },
          { slug: 'admin:seed_rbac', name: 'Seed RBAC', description: 'Initialize/modify RBAC system structure', category: 'admin' },
          { slug: 'admin:seed_orgs', name: 'Seed Orgs', description: 'Initialize/modify org structure', category: 'admin' },
        ];

        // Filter to only add missing ones
        const toAdd = permissionsToAdd.filter(p => missingPermissions.includes(p.slug));
        
        console.log(`   📝 Adding ${toAdd.length} permissions...`);
        
        for (const perm of toAdd) {
          const result = await sql`
            INSERT INTO permissions (slug, name, description, category, is_active, created_at, updated_at)
            VALUES (${perm.slug}, ${perm.name}, ${perm.description}, ${perm.category}, true, NOW(), NOW())
            RETURNING id, slug
          `;
          console.log(`      ✅ Added: ${result[0].slug} (ID: ${result[0].id})`);
        }

        // Now assign all new permissions to owner role (ID 5)
        console.log('\n   👑 Assigning new permissions to owner role...');
        const newPerms = await sql`
          SELECT id, slug FROM permissions 
          WHERE slug = ANY(${toAdd.map(p => p.slug)})
        `;

        for (const perm of newPerms) {
          await sql`
            INSERT INTO role_permissions (role_id, permission_id, created_at)
            VALUES (5, ${perm.id}, NOW())
          `;
          console.log(`      ✅ Assigned ${perm.slug} to owner`);
        }

        // Assign to admin role (ID 6) - exclude seeding permissions
        console.log('\n   🔧 Assigning new permissions to admin role...');
        const adminPerms = newPerms.filter((p: any) => !p.slug.includes('seed_'));
        
        for (const perm of adminPerms) {
          await sql`
            INSERT INTO role_permissions (role_id, permission_id, created_at)
            VALUES (6, ${perm.id}, NOW())
          `;
          console.log(`      ✅ Assigned ${perm.slug} to admin`);
        }
      });
      
    } else {
      console.log('   ✅ All critical permissions exist');
    }

    // 3. Final verification
    console.log('\n📊 Final verification:');
    const finalPermissions = await sql`SELECT COUNT(*) as count FROM permissions`;
    const ownerPermissions = await sql`SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 5`;
    const adminPermissions = await sql`SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 6`;
    
    console.log(`   • Total permissions: ${finalPermissions[0].count}`);
    console.log(`   • Owner role permissions: ${ownerPermissions[0].count}`);
    console.log(`   • Admin role permissions: ${adminPermissions[0].count}`);

    // Check critical permissions are assigned to owner
    const criticalAssigned = await sql`
      SELECT p.slug 
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = 5 
        AND p.slug IN ('users:read', 'roles:read', 'rules:read', 'bases:read', 'admin:debug_context')
      ORDER BY p.slug
    `;

    console.log('\n🔑 Critical permissions assigned to owner:');
    if (criticalAssigned.length > 0) {
      criticalAssigned.forEach((p: any) => console.log(`   ✅ ${p.slug}`));
    } else {
      console.log('   ❌ No critical permissions found!');
    }

    console.log('\n✅ Verification and fix completed!');
    console.log('🔄 Please refresh your browser to test access.');

  } catch (error) {
    console.error('❌ Error during verification and fix:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  verifyAndFix()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { verifyAndFix }; 