"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Shield, 
  Search, 
  CheckSquare, 
  Square, 
  Lock,
  Users,
  AlertCircle
} from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type RoleWithStats } from "@/types/role";

interface Permission {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  roleCount?: number;
  roles?: Array<{
    roleId: number;
    roleName: string;
    isSystemRole: boolean;
  }>;
}

interface ManagePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  role: RoleWithStats | null;
}

export function ManagePermissionsDialog({ 
  open, 
  onClose, 
  onSuccess,
  role 
}: ManagePermissionsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());

  // Fetch all permissions with usage stats
  const { data: allPermissions = [], isLoading: permissionsLoading } = api.permission.getAllWithUsage.useQuery();
  
  // Fetch current role permissions
  const { data: roleWithPermissions, isLoading: roleLoading } = api.role.getWithPermissions.useQuery(
    role?.id || 0,
    { enabled: !!role?.id }
  );

  // Fetch permission categories
  const { data: categories = [] } = api.permission.getCategoriesWithCounts.useQuery();

  const assignPermissionsMutation = api.role.assignPermissions.useMutation();
  const utils = api.useUtils();

  const isSystemRole = role?.isSystemRole || false;
  const isLoading = permissionsLoading || roleLoading;

  // Initialize selected permissions when role data loads
  useEffect(() => {
    if (roleWithPermissions?.permissions && open) {
      const currentPermissionIds = new Set(
        roleWithPermissions.permissions.map(p => p.id)
      );
      setSelectedPermissions(currentPermissionIds);
    }
  }, [roleWithPermissions, open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedCategory("all");
      setSelectedPermissions(new Set());
    }
  }, [open]);

  // Filter permissions based on search and category
  const filteredPermissions = useMemo(() => {
    return allPermissions.filter(permission => {
      const matchesSearch = 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || (permission.category && permission.category === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [allPermissions, searchTerm, selectedCategory]);

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    filteredPermissions.forEach(permission => {
      const category = permission.category || 'uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  }, [filteredPermissions]);

  // Calculate changes
  const originalPermissions = new Set(roleWithPermissions?.permissions?.map(p => p.id) || []);
  const hasChanges = !areSetsEqual(originalPermissions, selectedPermissions);
  const addedPermissions = Array.from(selectedPermissions).filter(id => !originalPermissions.has(id));
  const removedPermissions = Array.from(originalPermissions).filter(id => !selectedPermissions.has(id));

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    if (isSystemRole) return; // Prevent changes to system roles
    
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(permissionId);
      } else {
        newSet.delete(permissionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (categoryPermissions: Permission[]) => {
    if (isSystemRole) return;
    
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      categoryPermissions.forEach(p => newSet.add(p.id));
      return newSet;
    });
  };

  const handleDeselectAll = (categoryPermissions: Permission[]) => {
    if (isSystemRole) return;
    
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      categoryPermissions.forEach(p => newSet.delete(p.id));
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!role) return;
    
    setIsSubmitting(true);
    
    try {
      await assignPermissionsMutation.mutateAsync({
        roleId: role.id,
        permissionIds: Array.from(selectedPermissions),
      });

      // Invalidate and refetch relevant queries
      await Promise.all([
        utils.role.getAllWithStats.invalidate(),
        utils.role.getWithPermissions.invalidate(role.id),
      ]);
      
      toast.success(`Permissions updated for role "${role.name}"`);
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      
      if (error.message?.includes("not found")) {
        toast.error("Role not found. It may have been deleted.");
      } else {
        toast.error("Failed to update permissions. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions
            {isSystemRole && (
              <Badge variant="secondary" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                System Role
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSystemRole 
              ? `System role "${role.name}" permissions are read-only to maintain system integrity.`
              : `Assign permissions to the "${role.name}" role. Users with this role will inherit these permissions.`
            }
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading permissions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={isSystemRole}
                  />
                </div>
              </div>
            </div>

            {/* Changes Summary */}
            {hasChanges && !isSystemRole && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Pending Changes
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-medium">
                      +{addedPermissions.length} Added
                    </span>
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">
                      -{removedPermissions.length} Removed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-auto">
                <TabsTrigger value="all">
                  All ({filteredPermissions.length})
                </TabsTrigger>
                                 {categories.map(category => (
                   <TabsTrigger key={category.category || 'uncategorized'} value={category.category || 'uncategorized'}>
                     {category.category || 'uncategorized'} ({category.count})
                   </TabsTrigger>
                 ))}
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                      <PermissionCategorySection
                        key={category}
                        category={category}
                        permissions={permissions}
                        selectedPermissions={selectedPermissions}
                        onPermissionToggle={handlePermissionToggle}
                        onSelectAll={handleSelectAll}
                        onDeselectAll={handleDeselectAll}
                        isSystemRole={isSystemRole}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

                             {categories.map(category => {
                 const categoryKey = category.category || 'uncategorized';
                 return (
                   <TabsContent key={categoryKey} value={categoryKey} className="mt-4">
                     <ScrollArea className="h-[400px] pr-4">
                       <PermissionCategorySection
                         category={categoryKey}
                         permissions={permissionsByCategory[categoryKey] || []}
                         selectedPermissions={selectedPermissions}
                         onPermissionToggle={handlePermissionToggle}
                         onSelectAll={handleSelectAll}
                         onDeselectAll={handleDeselectAll}
                         isSystemRole={isSystemRole}
                       />
                     </ScrollArea>
                   </TabsContent>
                 );
               })}
            </Tabs>
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
          <Button 
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !hasChanges || isSystemRole}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for permission category sections
interface PermissionCategorySectionProps {
  category: string;
  permissions: Permission[];
  selectedPermissions: Set<number>;
  onPermissionToggle: (permissionId: number, checked: boolean) => void;
  onSelectAll: (permissions: Permission[]) => void;
  onDeselectAll: (permissions: Permission[]) => void;
  isSystemRole: boolean;
}

function PermissionCategorySection({
  category,
  permissions,
  selectedPermissions,
  onPermissionToggle,
  onSelectAll,
  onDeselectAll,
  isSystemRole,
}: PermissionCategorySectionProps) {
  const selectedCount = permissions.filter(p => selectedPermissions.has(p.id)).length;
  const allSelected = selectedCount === permissions.length;
  const someSelected = selectedCount > 0 && selectedCount < permissions.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium capitalize">{category}</h4>
          <Badge variant="outline">
            {selectedCount}/{permissions.length}
          </Badge>
        </div>
        {!isSystemRole && (
          <div className="flex gap-2">
                         <Button
               variant="outline"
               size="sm"
               onClick={() => onSelectAll(permissions)}
               disabled={allSelected}
             >
               <CheckSquare className="h-3 w-3 mr-1" />
               All
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={() => onDeselectAll(permissions)}
               disabled={selectedCount === 0}
             >
               <Square className="h-3 w-3 mr-1" />
               None
             </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {permissions.map(permission => (
          <div
            key={permission.id}
            className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
          >
                         <input
               type="checkbox"
               id={`permission-${permission.id}`}
               checked={selectedPermissions.has(permission.id)}
               onChange={(e) => 
                 onPermissionToggle(permission.id, e.target.checked)
               }
               disabled={isSystemRole}
               className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
             />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={`permission-${permission.id}`}
                className="text-sm font-medium cursor-pointer"
              >
                {permission.name}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {permission.description || "No description available"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {permission.slug}
                </Badge>
                {permission.roleCount !== undefined && permission.roleCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {permission.roleCount} {permission.roleCount === 1 ? 'role' : 'roles'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to compare sets
function areSetsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
} 