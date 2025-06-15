"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, User, Shield, Building2 } from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type UserWithStats } from "@/types/user";

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: UserWithStats | null;
}

export function DeleteUserDialog({ 
  open, 
  onClose, 
  onSuccess,
  user 
}: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUserMutation = api.user.delete.useMutation();
  const utils = api.useUtils();

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      await deleteUserMutation.mutateAsync(user.id);

      // Invalidate and refetch relevant queries
      await Promise.all([
        utils.user.getAll.invalidate(),
        utils.user.getById.invalidate(),
      ]);
      
      toast.success(`User "${user.name}" has been deleted successfully`);
      
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      
      // Properly handle unknown error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes("not found")) {
        toast.error("User not found. It may have already been deleted.");
      } else if (errorMessage.includes("cannot delete")) {
        toast.error("Cannot delete this user. They may have active assignments.");
      } else {
        toast.error("Failed to delete user. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  const hasActiveRoles = user.roles.some(role => role.isActive);
  const activeTenants = user.roles.filter(role => role.isActive).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Information */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              User Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Role Assignments Warning */}
          {hasActiveRoles && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-orange-800">
                <Shield className="h-4 w-4" />
                Active Role Assignments
              </h4>
              <p className="text-sm text-orange-700 mb-3">
                This user has {user.roleCount} active role assignment(s) across {activeTenants} tenant(s). 
                Deleting this user will remove all role assignments.
              </p>
              <div className="space-y-2">
                {user.roles.filter(role => role.isActive).slice(0, 3).map((role, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Building2 className="h-3 w-3 text-orange-600" />
                    <span className="font-medium">{role.tenantName}</span>
                    <span className="text-orange-600">→</span>
                    <span>{role.name}</span>
                  </div>
                ))}
                {user.roles.filter(role => role.isActive).length > 3 && (
                  <p className="text-xs text-orange-600">
                    ... and {user.roles.filter(role => role.isActive).length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Confirmation */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action is permanent and cannot be undone. 
              The user will be completely removed from the system.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 