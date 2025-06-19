import { db } from "@/db";
import { permissions, rolePermissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const MISSING_PERMISSIONS = [
  // Organization permissions
  {
    slug: 'orgs:read',
    name: 'View Organizations',
    description: 'View organization information and settings'
  },
  {
    slug: 'orgs:create',
    name: 'Create Organizations',
    description: 'Create new organizations'
  },
  {
    slug: 'orgs:update',
    name: 'Update Organizations',
    description: 'Update organization information and settings'
  },
  {
    slug: 'orgs:delete',
    name: 'Delete Organizations',
    description: 'Delete organizations'
  },
  // Decisioning permissions
  {
    slug: 'decisioning:variable:read',
    name: 'View Decision Variables',
    description: 'View decision variables'
  },
  {
    slug: 'decisioning:variable:create',
    name: 'Create Decision Variables',
    description: 'Create new decision variables'
  },
  {
    slug: 'decisioning:lookup:read',
    name: 'View Lookup Tables',
    description: 'View lookup tables'
  },
  {
    slug: 'decisioning:lookup:create',
    name: 'Create Lookup Tables',
    description: 'Create new lookup tables'
  },
  {
    slug: 'decisioning:ruleset:read',
    name: 'View Rule Sets',
    description: 'View rule sets'
  },
  {
    slug: 'decisioning:ruleset:create',
    name: 'Create Rule Sets',
    description: 'Create new rule sets'
  },
  // Missing admin permissions
  {
    slug: 'admin:debug_context',
    name: 'Debug Context Access',
    description: 'Access to debug context information'
  },
  {
    slug: 'admin:seed_rbac',
    name: 'Seed RBAC Data',
    description: 'Permission to seed RBAC data'
  },
  {
    slug: 'admin:seed_tenants',
    name: 'Seed Tenant Data',
    description: 'Permission to seed tenant data'
  }
];

export async function POST() {
  try {
    console.log('🔄 Adding missing permissions...');
    
    let addedCount = 0;
    let skippedCount = 0;
    const results = [];
    
    // Add missing permissions
    for (const permissionData of MISSING_PERMISSIONS) {
      try {
        // Check if permission already exists
        const existingPermission = await db.query.permissions.findFirst({
          where: eq(permissions.slug, permissionData.slug)
        });
        
        if (!existingPermission) {
          // Create the permission
          const [newPermission] = await db.insert(permissions)
            .values({
              slug: permissionData.slug,
              name: permissionData.name,
              description: permissionData.description
            })
            .returning();
          
          results.push({ status: 'added', slug: permissionData.slug, id: newPermission.id });
          addedCount++;
        } else {
          results.push({ status: 'exists', slug: permissionData.slug, id: existingPermission.id });
          skippedCount++;
        }
      } catch (error) {
        results.push({ 
          status: 'error', 
          slug: permissionData.slug, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }
    
    // Assign all new permissions to owner role (role ID 5)
    console.log('🔄 Assigning new permissions to owner role...');
    
    const ownerRole = await db.query.roles.findFirst({
      where: (roles, { eq }) => eq(roles.name, 'owner')
    });
    
    if (ownerRole) {
      let assignedCount = 0;
      
      for (const result of results) {
        if (result.status === 'added' || result.status === 'exists') {
          try {
            // Check if role already has this permission
            const existingRolePermission = await db.query.rolePermissions.findFirst({
              where: (rp, { eq, and }) => and(
                eq(rp.roleId, ownerRole.id),
                eq(rp.permissionId, result.id)
              )
            });
            
            if (!existingRolePermission) {
              await db.insert(rolePermissions)
                .values({
                  roleId: ownerRole.id,
                  permissionId: result.id
                });
              assignedCount++;
            }
          } catch (error) {
            console.error(`Error assigning permission ${result.slug}:`, error);
          }
        }
      }
      
      console.log(`✅ Assigned ${assignedCount} new permissions to owner role`);
    }
    
    // Verify total permissions
    const allPermissions = await db.query.permissions.findMany({
      columns: { id: true, slug: true }
    });
    
    return NextResponse.json({
      success: true,
      summary: {
        added: addedCount,
        skipped: skippedCount,
        total: MISSING_PERMISSIONS.length
      },
      results,
      verification: {
        totalPermissions: allPermissions.length,
        newPermissions: results.filter(r => r.status === 'added').map(r => r.slug)
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding missing permissions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 