"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface Role {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isActive: boolean;
}

interface DeleteRoleDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export function DeleteRoleDialog({ open, onClose, role }: DeleteRoleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRoleMutation = api.role.delete.useMutation();

  const handleDelete = async () => {
    if (!role) return;

    setIsDeleting(true);

    try {
      await deleteRoleMutation.mutateAsync(role.id);
      toast.success(`Role "${role.name}" deleted successfully`);
      onClose();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast.error(error.message || "Failed to delete role");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Role
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-medium text-destructive mb-2">Warning</h4>
            <ul className="text-sm text-destructive/80 space-y-1">
              <li>• This role will be permanently deleted</li>
              <li>• Users with this role will lose associated permissions</li>
              <li>• This action cannot be undone</li>
            </ul>
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
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 