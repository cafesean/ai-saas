import { db } from "@/db";
import { rolePermissions, permissions, roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Find the admin role (ID 6)
    const adminRole = await db.query.roles.findFirst({
      where: eq(roles.id, 6)
    });

    if (!adminRole) {
      return NextResponse.json({ error: "Admin role not found" });
    }

    // Get all permissions
    const allPermissions = await db.query.permissions.findMany();

    if (allPermissions.length === 0) {
      return NextResponse.json({ error: "No permissions found in database" });
    }

    // Check existing role permissions
    const existingRolePermissions = await db.query.rolePermissions.findMany({
      where: eq(rolePermissions.roleId, 6)
    });

    const existingPermissionIds = new Set(existingRolePermissions.map(rp => rp.permissionId));

    // Insert missing permissions for admin role
    const missingPermissions = allPermissions.filter(p => !existingPermissionIds.has(p.id));
    
    if (missingPermissions.length === 0) {
      return NextResponse.json({ 
        message: "Admin role already has all permissions",
        totalPermissions: allPermissions.length,
        existingPermissions: existingRolePermissions.length
      });
    }

    const rolePermissionInserts = missingPermissions.map(permission => ({
      roleId: 6,
      permissionId: permission.id
    }));

    await db.insert(rolePermissions).values(rolePermissionInserts);

    // Verify the result
    const updatedRolePermissions = await db.query.rolePermissions.findMany({
      where: eq(rolePermissions.roleId, 6),
      with: {
        permission: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Assigned ${missingPermissions.length} permissions to admin role`,
      adminRole: {
        id: adminRole.id,
        name: adminRole.name
      },
      permissionsAdded: missingPermissions.length,
      totalPermissionsNow: updatedRolePermissions.length,
      permissionSample: updatedRolePermissions.slice(0, 10).map(rp => rp.permission.slug)
    });
  } catch (error) {
    console.error('Fix admin permissions error:', error);
    return NextResponse.json({ 
      error: "Failed to fix admin permissions", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 