"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Shield, Key, Refresh } from 'lucide-react';
import { TenantSwitcher } from '@/components/auth/TenantSwitcher';
import { api } from '@/utils/trpc';
import { toast } from 'sonner';

export default function MultiTenantDebugPage() {
  const { data: session, status, update } = useSession();
  const getCurrentUserQuery = api.auth.getCurrentUser.useQuery();

  const handleRefreshSession = async () => {
    try {
      await update();
      await getCurrentUserQuery.refetch();
      toast.success('Session refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh session');
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading session...</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Not Authenticated</CardTitle>
            <CardDescription>
              Please log in to view multi-tenant debug information.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const user = session?.user;
  const currentTenant = user?.currentTenant;
  const availableTenants = user?.availableTenants || [];
  const allPermissions = user?.roles?.flatMap(role => role.policies?.map(p => p.name)) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Tenant Debug</h1>
          <p className="text-muted-foreground">
            Debug information for multi-tenant session management
          </p>
        </div>
        <Button onClick={handleRefreshSession} variant="outline">
          <Refresh className="mr-2 h-4 w-4" />
          Refresh Session
        </Button>
      </div>

      {/* Tenant Switcher Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Tenant Switcher Component
          </CardTitle>
          <CardDescription>
            Test the tenant switching functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantSwitcher />
        </CardContent>
      </Card>

      {/* Current Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Current Session Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">User Details</h4>
              <div className="space-y-1 text-sm">
                <div><strong>ID:</strong> {user?.id}</div>
                <div><strong>Email:</strong> {user?.email}</div>
                <div><strong>Name:</strong> {user?.name || 'Not set'}</div>
                <div><strong>Username:</strong> {user?.username || 'Not set'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Tenant Context</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Current Tenant ID:</strong> {user?.tenantId}</div>
                <div><strong>Current Tenant Name:</strong> {currentTenant?.name || 'None'}</div>
                <div><strong>Available Tenants:</strong> {availableTenants.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tenants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Available Tenants ({availableTenants.length})
          </CardTitle>
          <CardDescription>
            All tenants this user has access to
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableTenants.length === 0 ? (
            <div className="text-muted-foreground">No tenants available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className={`p-4 border rounded-lg ${
                    tenant.isActive ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{tenant.name}</h5>
                    {tenant.isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div><strong>ID:</strong> {tenant.id}</div>
                    <div><strong>Roles:</strong> {tenant.roles.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Current Permissions ({allPermissions.length})
          </CardTitle>
          <CardDescription>
            All permissions available in the current tenant context
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allPermissions.length === 0 ? (
            <div className="text-muted-foreground">No permissions available</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allPermissions.map((permission, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* tRPC Query Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            tRPC getCurrentUser Query
          </CardTitle>
          <CardDescription>
            Result from the auth.getCurrentUser tRPC endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getCurrentUserQuery.isLoading ? (
            <div>Loading...</div>
          ) : getCurrentUserQuery.error ? (
            <div className="text-red-600">
              Error: {getCurrentUserQuery.error.message}
            </div>
          ) : (
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
              {JSON.stringify(getCurrentUserQuery.data, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Raw Session Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Session Data</CardTitle>
          <CardDescription>
            Complete session object for debugging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 