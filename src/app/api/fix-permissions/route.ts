import { db } from "@/db";
import { permissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
  
  // Organization permissions: tenant:* → orgs:*
  'tenant:create': 'orgs:create',
  'tenant:read': 'orgs:read', 
  'tenant:update': 'orgs:update',
  'tenant:delete': 'orgs:delete'
};

export async function POST() {
  try {
    console.log('🔄 Starting permission slug updates...');
    
    let updatedCount = 0;
    let skippedCount = 0;
    const results = [];
    
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
          
          results.push({ status: 'updated', oldSlug, newSlug });
          updatedCount++;
        } else {
          results.push({ status: 'not_found', oldSlug, newSlug });
          skippedCount++;
        }
      } catch (error) {
        results.push({ 
          status: 'error', 
          oldSlug, 
          newSlug, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }
    
    // Verify the updates
    const allPermissions = await db.query.permissions.findMany({
      columns: { id: true, slug: true, description: true }
    });
    
    const newFormatPermissions = allPermissions.filter(p => 
      p.slug.includes('users:') || 
      p.slug.includes('rules:') || 
      p.slug.includes('bases:') || 
      p.slug.includes('roles:') || 
      p.slug.includes('orgs:')
    );
    
    return NextResponse.json({
      success: true,
      summary: {
        updated: updatedCount,
        skipped: skippedCount,
        total: Object.keys(PERMISSION_SLUG_UPDATES).length
      },
      results,
      verification: {
        totalPermissions: allPermissions.length,
        newFormatPermissions: newFormatPermissions.length,
        newFormatSlugs: newFormatPermissions.map(p => p.slug)
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating permission slugs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 