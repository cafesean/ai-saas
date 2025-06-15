"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/AlertDialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Shield, Users, Lock } from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type RoleWithStats } from "@/types/role";

interface DeleteRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  role: RoleWithStats | null;
}

export function DeleteRoleDialog({ 
  open, 
  onClose, 
  onSuccess,
  role 
}: DeleteRoleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRoleMutation = api.role.delete.useMutation();
  const utils = api.useUtils();

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!role) return;
    
    setIsDeleting(true);
    
    try {
      await deleteRoleMutation.mutateAsync(role.id);

      // Invalidate and refetch roles
      await utils.role.getAllWithStats.invalidate();
      
      toast.success(`Role "${role.name}" has been deleted successfully`);
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      
      if (error.message?.includes("FORBIDDEN") || error.message?.includes("system")) {
        toast.error("Cannot delete system roles");
      } else if (error.message?.includes("not found")) {
        toast.error("Role not found. It may have already been deleted.");
      } else if (error.message?.includes("constraint") || error.message?.includes("foreign key")) {
        toast.error("Cannot delete role. Users are still assigned to this role.");
      } else {
        toast.error("Failed to delete role. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!role) return null;

  const isSystemRole = role.isSystemRole;
  const hasUsers = role.userCount > 0;
  const hasPermissions = role.permissionCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Role
            {isSystemRole && (
              <Badge variant="secondary" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                System Role
              </Badge>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete the role <strong>"{role.name}"</strong>?
                {isSystemRole 
                  ? " System roles cannot be deleted as they are required for system functionality."
                  : " This action cannot be undone."
                }
              </p>

              {!isSystemRole && (
                <>
                  {/* Role Impact Information */}
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Impact Assessment
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          Users affected:
                        </span>
                        <Badge variant={hasUsers ? "destructive" : "secondary"}>
                          {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Shield className="h-3 w-3 text-muted-foreground" />
                          Permissions:
                        </span>
                        <Badge variant="outline">
                          {role.permissionCount} {role.permissionCount === 1 ? 'permission' : 'permissions'}
                        </Badge>
                      </div>
                    </div>

                    {hasUsers && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive font-medium">
                          ⚠️ Warning: {role.userCount} {role.userCount === 1 ? 'user is' : 'users are'} currently assigned to this role.
                        </p>
                        <p className="text-xs text-destructive/80 mt-1">
                          These users will lose all permissions associated with this role.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Deletion Details */}
                  <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                    <p><strong>What happens when you delete this role:</strong></p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>The role will be marked as inactive (soft delete)</li>
                      <li>Users will lose access to permissions from this role</li>
                      <li>Role assignments will be removed</li>
                      <li>Historical data will be preserved</li>
                    </ul>
                  </div>
                </>
              )}

              {isSystemRole && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">System Role Protection</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This role is protected because it's essential for system functionality. 
                    System roles cannot be deleted to maintain platform integrity.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || isSystemRole}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSystemRole ? "Cannot Delete" : "Delete Role"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 