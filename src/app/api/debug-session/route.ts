import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth-simple";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        error: "No session found",
        authenticated: false 
      });
    }

    const debugInfo = {
      authenticated: true,
      user: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
        tenantId: session.user?.tenantId,
        currentTenant: session.user?.currentTenant,
        availableTenants: session.user?.availableTenants,
        rolesCount: session.user?.roles?.length || 0,
        roles: session.user?.roles?.map(role => ({
          id: role.id,
          name: role.name,
          tenantId: role.tenantId,
          permissionsCount: role.policies?.length || 0,
          permissions: role.policies?.map(p => p.name) || []
        })) || []
      },
      allPermissions: session.user?.roles?.flatMap(role => 
        role.policies?.map(policy => policy.name) || []
      ) || [],
      totalPermissions: session.user?.roles?.flatMap(role => 
        role.policies?.map(policy => policy.name) || []
      )?.length || 0,
      multiTenantInfo: {
        hasMultipleTenants: (session.user?.availableTenants?.length || 0) > 1,
        tenantCount: session.user?.availableTenants?.length || 0,
        activeTenantName: session.user?.currentTenant?.name,
        activeTenantId: session.user?.currentTenant?.id
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to get session", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 