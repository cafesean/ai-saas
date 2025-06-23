import { db } from '../index.js';
import { permissions } from '../schema/index.js';
import { eq } from 'drizzle-orm';

const PERMISSION_SLUG_UPDATES = {
  // User permissions: user:* → users:*
  'user:create': 'users:create',
  'user:read': 'users:read', 
  'user:update': 'users:update',
  'user:delete': 'users:delete',
  'user:assign_roles': 'users:assign_roles',
  'user:manage_profile': 'users:manage_profile',
  
  // Decision table permissions: decision_table:* → rules:*
  'decision_table:create': 'rules:create',
  'decision_table:read': 'rules:read',
  'decision_table:update': 'rules:update', 
  'decision_table:delete': 'rules:delete',
  'decision_table:execute': 'rules:execute',
  'decision_table:import': 'rules:import',
  
  // Knowledge base permissions: knowledge_base:* → bases:*
  'knowledge_base:create': 'bases:create',
  'knowledge_base:read': 'bases:read',
  'knowledge_base:update': 'bases:update',
  'knowledge_base:delete': 'bases:delete',
  'knowledge_base:chat': 'bases:chat',
  'knowledge_base:embed': 'bases:embed',
  
  // Role permissions: role:* → roles:*
  'role:create': 'roles:create',
  'role:read': 'roles:read',
  'role:update': 'roles:update',
  'role:delete': 'roles:delete',
  'role:assign_permissions': 'roles:assign_permissions',
  
  // Organization permissions: org:* → orgs:*
  'org:create': 'orgs:create',
  'org:read': 'orgs:read', 
  'org:update': 'orgs:update',
  'org:delete': 'orgs:delete',
  
  // Add missing admin permissions
  'admin:debug_context': 'admin:debug_context',
  'admin:seed_rbac': 'admin:seed_rbac', 
  'admin:seed_orgs': 'admin:seed_orgs'
};

async function updatePermissionSlugs() {
  console.log('🔄 Starting permission slug updates...');
  
  try {
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const [oldSlug, newSlug] of Object.entries(PERMISSION_SLUG_UPDATES)) {
      try {
        // Check if old permission exists
        const existingPermission = await db.query.permissions.findFirst({
          where: eq(permissions.slug, oldSlug)
        });
        
        if (existingPermission) {
          // Update the slug
          await db.update(permissions)
            .set({ slug: newSlug })
            .where(eq(permissions.slug, oldSlug));
          
          console.log(`   ✅ Updated: ${oldSlug} → ${newSlug}`);
          updatedCount++;
        } else {
          console.log(`   ⚠️  Not found: ${oldSlug}`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error updating ${oldSlug}:`, error);
      }
    }
    
    console.log(`\n✅ Permission slug update complete!`);
    console.log(`   • Updated: ${updatedCount} permissions`);
    console.log(`   • Skipped: ${skippedCount} permissions`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updated permissions...');
    const allPermissions = await db.query.permissions.findMany({
      columns: { id: true, slug: true, description: true }
    });
    
    console.log(`Found ${allPermissions.length} total permissions:`);
    const newFormatPermissions = allPermissions.filter(p => 
      p.slug.includes('users:') || 
      p.slug.includes('rules:') || 
      p.slug.includes('bases:') || 
      p.slug.includes('roles:') || 
      p.slug.includes('orgs:')
    );
    
    console.log(`New format permissions: ${newFormatPermissions.length}`);
    newFormatPermissions.forEach(p => console.log(`   • ${p.slug}`));
    
  } catch (error) {
    console.error('❌ Error updating permission slugs:', error);
  }
  
  process.exit(0);
}

updatePermissionSlugs(); 