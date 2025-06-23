import { db } from "@/db";
import { userRoles, users, roles, rolePermissions, permissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = 1; // Debug for user ID 1

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" });
    }

    // Check user roles
    const userRoleRecords = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
      with: {
        role: true,
        org: true
      }
    });

    // Check role permissions for each role
    const rolePermissionDetails = [];
    for (const userRole of userRoleRecords) {
      const rolePerms = await db.query.rolePermissions.findMany({
        where: eq(rolePermissions.roleId, userRole.roleId),
        with: {
          permission: true
        }
      });
      
      rolePermissionDetails.push({
        roleId: userRole.roleId,
        roleName: userRole.role.name,
        orgId: userRole.orgId,
        orgName: userRole.org.name,
        isActive: userRole.isActive,
        permissions: rolePerms.map(rp => ({
          id: rp.permission.id,
          slug: rp.permission.slug,
          name: rp.permission.name,
          description: rp.permission.description
        }))
      });
    }

    // Check total permissions in database
    const allPermissions = await db.query.permissions.findMany();

    // Check all roles
    const allRoles = await db.query.roles.findMany();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      userRoles: userRoleRecords.length,
      userRoleDetails: userRoleRecords.map((ur, index) => ({
        id: index + 1, // Use index as ID since userRoles table doesn't have an ID field
        userId: ur.userId,
        roleId: ur.roleId,
        roleName: ur.role.name,
        orgId: ur.orgId,
        orgName: ur.org.name,
        isActive: ur.isActive
      })),
      rolePermissionDetails,
      totalPermissionsInDB: allPermissions.length,
      totalRolesInDB: allRoles.length,
      permissionSample: allPermissions.slice(0, 10).map(p => p.slug)
    });
  } catch (error) {
    console.error('Debug permissions error:', error);
    return NextResponse.json({ 
      error: "Failed to debug permissions", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 