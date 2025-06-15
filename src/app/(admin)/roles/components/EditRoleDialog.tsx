"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Lock } from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type RoleWithStats } from "@/types/role";

const editRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Role name can only contain letters, numbers, spaces, hyphens, and underscores"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isActive: z.boolean().default(true),
});

type EditRoleFormData = z.infer<typeof editRoleSchema>;

interface EditRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  role: RoleWithStats | null;
}

export function EditRoleDialog({ 
  open, 
  onClose, 
  onSuccess,
  role 
}: EditRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<EditRoleFormData>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const updateRoleMutation = api.role.update.useMutation();
  const utils = api.useUtils();

  const isActive = watch("isActive");
  const isSystemRole = role?.isSystemRole || false;

  // Pre-populate form when role changes
  useEffect(() => {
    if (role && open) {
      reset({
        name: role.name,
        description: role.description || "",
        isActive: role.isActive,
      });
    }
  }, [role, open, reset]);

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data: EditRoleFormData) => {
    if (!role) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedRole = await updateRoleMutation.mutateAsync({
        id: role.id,
        data: {
          name: data.name,
          description: data.description || null,
        },
      });

      // Invalidate and refetch roles
      await utils.role.getAllWithStats.invalidate();
      
      toast.success(`Role "${updatedRole?.name || role.name}" updated successfully`);
      
      reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error updating role:", error);
      
      if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        toast.error("A role with this name already exists");
      } else if (error.message?.includes("not found")) {
        toast.error("Role not found. It may have been deleted.");
      } else {
        toast.error("Failed to update role. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Edit Role
            {isSystemRole && (
              <Badge variant="secondary" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                System Role
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSystemRole 
              ? "System roles have limited editing capabilities to maintain system integrity."
              : "Update the role information and permissions."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Content Manager, Support Agent"
              {...register("name")}
              disabled={isSubmitting || isSystemRole}
              className={isSystemRole ? "bg-muted" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            {isSystemRole && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" />
                System role names cannot be modified
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role's purpose and responsibilities..."
              rows={3}
              {...register("description")}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                {isSystemRole 
                  ? "System roles are always active"
                  : "Active roles can be assigned to users"
                }
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              disabled={isSubmitting || isSystemRole}
            />
          </div>

          {/* Role Statistics */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Role Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Permissions:</span>
                <span className="ml-2 font-medium">{role.permissionCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Users:</span>
                <span className="ml-2 font-medium">{role.userCount}</span>
              </div>
            </div>
          </div>

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
              type="submit" 
              disabled={isSubmitting || !isDirty || (isSystemRole && !isDirty)}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 