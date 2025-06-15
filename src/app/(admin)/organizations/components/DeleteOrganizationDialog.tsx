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
import { Loader2, AlertTriangle, Building2, Users, Globe } from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type OrganizationWithStats } from "@/types/organization";

interface DeleteOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  organization: OrganizationWithStats | null;
}

export function DeleteOrganizationDialog({ 
  open, 
  onClose, 
  onSuccess,
  organization 
}: DeleteOrganizationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteOrganizationMutation = api.tenant.delete.useMutation();
  const utils = api.useUtils();

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!organization) return;

    setIsDeleting(true);

    try {
      await deleteOrganizationMutation.mutateAsync(organization.id);

      // Invalidate and refetch relevant queries
      await Promise.all([
        utils.tenant.getAllWithStats.invalidate(),
        utils.tenant.getAll.invalidate(),
        utils.tenant.getById.invalidate(),
      ]);
      
      toast.success(`Organization "${organization.name}" has been deleted successfully`);
      
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting organization:", error);
      
      // Properly handle unknown error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes("not found")) {
        toast.error("Organization not found. It may have already been deleted.");
      } else if (errorMessage.includes("system default") || errorMessage.includes("Cannot delete")) {
        toast.error("Cannot delete the system default organization.");
      } else if (errorMessage.includes("has active users")) {
        toast.error("Cannot delete organization with active users. Please remove users first.");
      } else {
        toast.error("Failed to delete organization. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!organization) return null;

  const isSystemOrg = organization.slug === 'default-org' || organization.name === 'Default Organization';
  const hasUsers = organization.userCount > 0;
  const hasActiveUsers = organization.activeUserCount > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Organization
            {isSystemOrg && (
              <Badge variant="outline" className="text-xs ml-2">System</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the organization and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* System Organization Warning */}
          {isSystemOrg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>System Organization:</strong> This is the system default organization and cannot be deleted.
              </p>
            </div>
          )}

          {/* Organization Information */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organization Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{organization.name}</span>
              </div>
              {organization.slug && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug:</span>
                  <span className="font-medium">/{organization.slug}</span>
                </div>
              )}
              {organization.website && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Website:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {organization.website.replace(/^https?:\/\//, '')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={organization.isActive ? "default" : "secondary"}>
                  {organization.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Users Impact Warning */}
          {hasUsers && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-orange-800">
                <Users className="h-4 w-4" />
                User Impact
              </h4>
              <p className="text-sm text-orange-700 mb-2">
                This organization has <strong>{organization.userCount}</strong> user(s) associated with it
                {hasActiveUsers && (
                  <span>, including <strong>{organization.activeUserCount}</strong> active user(s)</span>
                )}.
              </p>
              <p className="text-sm text-orange-700">
                Deleting this organization will remove all user associations and may affect user access to resources.
              </p>
            </div>
          )}

          {/* Confirmation */}
          {!isSystemOrg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action is permanent and cannot be undone. 
                The organization will be deactivated and marked as deleted.
              </p>
            </div>
          )}
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
          {!isSystemOrg && (
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}