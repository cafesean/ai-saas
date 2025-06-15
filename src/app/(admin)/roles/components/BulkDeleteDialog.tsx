"use client";

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
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2, Users, Shield } from "lucide-react";
import { type RoleWithStats } from "@/types/role";

interface BulkDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roles: RoleWithStats[];
  isLoading?: boolean;
}

export function BulkDeleteDialog({
  open,
  onClose,
  onConfirm,
  roles,
  isLoading = false,
}: BulkDeleteDialogProps) {
  const systemRoles = roles.filter(role => role.isSystemRole);
  const customRoles = roles.filter(role => !role.isSystemRole);
  const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0);
  const totalPermissions = roles.reduce((sum, role) => sum + role.permissionCount, 0);

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Confirm Bulk Delete
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete {roles.length} role(s). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* System Roles Warning */}
          {systemRoles.length > 0 && (
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">System Roles Cannot Be Deleted</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                The following {systemRoles.length} system role(s) will be skipped:
              </p>
              <div className="flex flex-wrap gap-1">
                {systemRoles.map(role => (
                  <Badge key={role.id} variant="secondary" className="text-xs">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Roles to Delete */}
          {customRoles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="font-medium">Roles to Delete ({customRoles.length})</span>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-2">
                {customRoles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{role.name}</span>
                      {role.description && (
                        <span className="text-xs text-muted-foreground">
                          - {role.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {role.userCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {role.permissionCount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Summary */}
          {customRoles.length > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Users Affected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{totalPermissions}</div>
                  <div className="text-sm text-muted-foreground">Permissions Removed</div>
                </div>
              </div>
            </>
          )}

          {/* No Deletable Roles */}
          {customRoles.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p>No roles can be deleted. All selected roles are system roles.</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading || customRoles.length === 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : `Delete ${customRoles.length} Role(s)`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 