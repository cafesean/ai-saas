"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2 } from "lucide-react";

interface Role {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isActive: boolean;
}

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  role?: Role | null;
}

export function RoleFormDialog({ open, onClose, mode, role }: RoleFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRoleMutation = api.role.create.useMutation();
  const updateRoleMutation = api.role.update.useMutation();

  // Reset form when dialog opens/closes or role changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && role) {
        setName(role.name);
        setDescription(role.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [open, mode, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createRoleMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || null,
        });
        toast.success("Role created successfully");
      } else if (mode === "edit" && role) {
        await updateRoleMutation.mutateAsync({
          id: role.id,
          data: {
            name: name.trim(),
            description: description.trim() || null,
          },
        });
        toast.success("Role updated successfully");
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error saving role:", error);
      toast.error(error.message || "Failed to save role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new role with specific permissions."
              : "Update the role name and description."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name..."
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description..."
              disabled={isSubmitting}
              rows={3}
            />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Role" : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 