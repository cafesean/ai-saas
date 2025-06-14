"use client";

import { useState } from "react";
import { SampleButton as Button } from "@/components/ui/sample-button";
import { SampleInput as Input } from "@/components/ui/sample-input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Shield, Users } from "lucide-react";
import { api } from "@/utils/trpc";
import { WithPermission } from "@/components/auth/WithPermission";
import { toast } from "sonner";

interface Role {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isActive: boolean;
  permissionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch roles with stats
  const { data: roles = [], isLoading, refetch } = api.role.getAllWithStats.useQuery();

  // Filter roles based on search term
  const filteredRoles = roles.filter((role: any) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <WithPermission permission="admin:role_management">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Manage system roles and their permissions
            </p>
          </div>
          <WithPermission permission="admin:role_management">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </WithPermission>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredRoles.length} of {roles.length} roles
            </div>
          </div>
        </Card>

        {/* Roles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role: any) => (
            <Card key={role.id} className="p-6">
              <div className="space-y-4">
                {/* Role Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <h3 className="text-lg font-semibold">{role.name}</h3>
                      {role.isSystemRole && (
                        <Badge variant="secondary" className="text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Role Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{role.permissionCount} permissions</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <WithPermission permission="admin:role_management">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </WithPermission>
                  
                  <WithPermission permission="admin:role_management">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Permissions
                    </Button>
                  </WithPermission>
                  
                  <WithPermission permission="admin:role_management">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={role.isSystemRole}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </WithPermission>
                </div>

                {role.isSystemRole && (
                  <p className="text-xs text-muted-foreground">
                    System roles cannot be deleted
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRoles.length === 0 && (
          <Card className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No roles found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No roles match your search criteria."
                : "Get started by creating your first role."}
            </p>
            {!searchTerm && (
              <WithPermission permission="admin:role_management">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </WithPermission>
            )}
          </Card>
        )}
      </div>
    </WithPermission>
  );
} 