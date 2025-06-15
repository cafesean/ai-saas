"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { Loader2, Search, Shield } from "lucide-react";

interface Role {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isActive: boolean;
}

interface Permission {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
}

interface RolePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RolePermissionsDialog({ open, onClose, role }: RolePermissionsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all permissions
  const { data: allPermissions = [], isLoading: loadingPermissions } = api.permission.getAll.useQuery();
  
  // Fetch role permissions
  const { data: roleData, isLoading: loadingRole } = api.role.getWithPermissions.useQuery(
    role?.id || 0,
    { enabled: !!role?.id }
  );

  const assignPermissionsMutation = api.role.assignPermissions.useMutation();

  // Initialize selected permissions when role data loads
  useEffect(() => {
    if (roleData?.permissions) {
      const permissionIds = new Set(roleData.permissions.map(p => p.id));
      setSelectedPermissions(permissionIds);
    }
  }, [roleData]);

  // Filter permissions based on search term
  const filteredPermissions = allPermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (permission.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // Group permissions by category
  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
    const category = permission.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    if (checked) {
      newSelected.add(permissionId);
    } else {
      newSelected.delete(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSelectAll = (categoryPermissions: Permission[], checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    categoryPermissions.forEach(permission => {
      if (checked) {
        newSelected.add(permission.id);
      } else {
        newSelected.delete(permission.id);
      }
    });
    setSelectedPermissions(newSelected);
  };

  const handleSubmit = async () => {
    if (!role) return;

    setIsSubmitting(true);

    try {
      await assignPermissionsMutation.mutateAsync({
        roleId: role.id,
        permissionIds: Array.from(selectedPermissions),
      });
      
      toast.success("Role permissions updated successfully");
      onClose();
    } catch (error: any) {
      console.error("Error updating role permissions:", error);
      toast.error(error.message || "Failed to update role permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const isLoading = loadingPermissions || loadingRole;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions: {role?.name}
          </DialogTitle>
          <DialogDescription>
            Select the permissions that should be granted to this role.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Permission Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{selectedPermissions.size} of {allPermissions.length} permissions selected</span>
              <Badge variant="outline">
                {Object.keys(permissionsByCategory).length} categories
              </Badge>
            </div>

            {/* Permissions by Category */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                  const selectedInCategory = categoryPermissions.filter(p => 
                    selectedPermissions.has(p.id)
                  ).length;
                  const allSelected = selectedInCategory === categoryPermissions.length;
                  const someSelected = selectedInCategory > 0 && selectedInCategory < categoryPermissions.length;

                  return (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base capitalize flex items-center gap-2">
                            <Checkbox
                              checked={allSelected}
                              onChange={(e) => 
                                handleSelectAll(categoryPermissions, e.target.checked)
                              }
                            />
                            {category}
                            <Badge variant="secondary" className="text-xs">
                              {selectedInCategory}/{categoryPermissions.length}
                            </Badge>
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                            <Checkbox
                              checked={selectedPermissions.has(permission.id)}
                              onChange={(e) => 
                                handlePermissionToggle(permission.id, e.target.checked)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium cursor-pointer">
                                  {permission.name}
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  {permission.slug}
                                </Badge>
                              </div>
                              {permission.description && (
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 