"use client";

import { useAuthStore } from "@/framework/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AuthDebug() {
  const { 
    user, 
    role, 
    permissions, 
    authenticated, 
    loading 
  } = useAuthStore();

  if (!authenticated) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Auth Debug - Not Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User is not authenticated</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">User:</h4>
          <p>ID: {user?.id}</p>
          <p>Email: {user?.email}</p>
          <p>Name: {user?.name}</p>
        </div>
        
        <div>
          <h4 className="font-semibold">Role:</h4>
          <p>Name: {role?.name}</p>
          <p>Description: {role?.description}</p>
          <p>System Role: {role?.isSystemRole ? 'Yes' : 'No'}</p>
        </div>
        
        <div>
          <h4 className="font-semibold">Permissions ({permissions.length}):</h4>
          <div className="flex flex-wrap gap-1 mt-2">
            {permissions.map((permission, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold">Status:</h4>
          <p>Authenticated: {authenticated ? 'Yes' : 'No'}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 