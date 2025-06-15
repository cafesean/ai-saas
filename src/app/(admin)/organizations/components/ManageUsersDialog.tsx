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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Users, 
  Plus,
  X,
  Search,
  User,
  Mail,
  Shield,
  Trash2
} from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type OrganizationWithStats, type OrganizationUser } from "@/types/organization";
import { ORGANIZATION_ROLES } from "@/types/organization";

interface ManageUsersDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  organization: OrganizationWithStats | null;
}

interface AvailableUser {
  id: number;
  uuid: string;
  name: string | null;
  email: string;
  isActive: boolean;
}

export function ManageUsersDialog({ 
  open, 
  onClose, 
  onSuccess,
  organization 
}: ManageUsersDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("Member");

  // API queries
  const { data: organizationDetails, refetch: refetchOrganization } = api.tenant.getById.useQuery(
    organization?.id || 0,
    { enabled: !!organization?.id && open }
  );

  const { data: allUsers = [] } = api.user.getAll.useQuery(
    { limit: 100, offset: 0 },
    { enabled: open }
  );

  // API mutations
  const addUserMutation = api.tenant.addUser.useMutation();
  const removeUserMutation = api.tenant.removeUser.useMutation();
  const updateUserRoleMutation = api.tenant.updateUserRole.useMutation();
  const utils = api.useUtils();

  // Current organization users
  const organizationUsers = organizationDetails?.users || [];

  // Available users (not yet in this organization)
  const availableUsers: AvailableUser[] = useMemo(() => {
    if (!allUsers.users) return [];
    
    const currentUserIds = new Set(organizationUsers.map(u => u.userId));
    
    return allUsers.users
      .filter(user => !currentUserIds.has(user.id) && user.isActive)
      .map(user => ({
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      }));
  }, [allUsers.users, organizationUsers]);

  // Filtered available users based on search
  const filteredAvailableUsers = useMemo(() => {
    if (!searchTerm) return availableUsers;
    
    const term = searchTerm.toLowerCase();
    return availableUsers.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }, [availableUsers, searchTerm]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedUserId("");
      setSelectedRole("Member");
    }
  }, [open]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Add user to organization
  const handleAddUser = async () => {
    if (!organization || !selectedUserId || !selectedRole) {
      toast.error("Please select a user and role");
      return;
    }

    setIsLoading(true);

    try {
      await addUserMutation.mutateAsync({
        tenantId: organization.id,
        userId: parseInt(selectedUserId),
        role: selectedRole,
      });

      toast.success("User added to organization successfully");
      
      // Reset form
      setSelectedUserId("");
      setSelectedRole("Member");
      setSearchTerm("");
      
      // Refresh data
      await Promise.all([
        refetchOrganization(),
        utils.tenant.getAllWithStats.invalidate(),
        utils.user.getAll.invalidate(),
      ]);

    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add user to organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Remove user from organization
  const handleRemoveUser = async (userId: number) => {
    if (!organization) return;

    setIsLoading(true);

    try {
      await removeUserMutation.mutateAsync({
        tenantId: organization.id,
        userId: userId,
      });

      toast.success("User removed from organization successfully");
      
      // Refresh data
      await Promise.all([
        refetchOrganization(),
        utils.tenant.getAllWithStats.invalidate(),
        utils.user.getAll.invalidate(),
      ]);

    } catch (error) {
      console.error("Error removing user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove user from organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update user role
  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    if (!organization) return;

    setIsLoading(true);

    try {
      await updateUserRoleMutation.mutateAsync({
        tenantId: organization.id,
        userId: userId,
        role: newRole,
      });

      toast.success("User role updated successfully");
      
      // Refresh data
      await refetchOrganization();

    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user role"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess?.();
    onClose();
  };

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Users: {organization.name}
          </DialogTitle>
          <DialogDescription>
            Add or remove users from this organization and manage their roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New User Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User to Organization
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Search/Select */}
              <div className="md:col-span-2 space-y-2">
                <Label>Search and Select User</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAvailableUsers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          {searchTerm ? "No users found matching search" : "No available users"}
                        </div>
                      ) : (
                        filteredAvailableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span>{user.name || "Unnamed User"}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleAddUser}
              disabled={!selectedUserId || !selectedRole || isLoading}
              className="w-full md:w-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add User to Organization
            </Button>
          </div>

          {/* Current Users Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Current Users ({organizationUsers.length})
            </h4>
            
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {organizationUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No users in this organization</p>
                  </div>
                ) : (
                  organizationUsers.map((user) => (
                    <div 
                      key={user.userId} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {user.userName || "Unnamed User"}
                            </span>
                            <Badge variant={user.userIsActive ? "default" : "secondary"}>
                              {user.userIsActive ? "Active" : "Inactive"}
                            </Badge>
                            {!user.relationshipIsActive && (
                              <Badge variant="outline">Disabled</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.userEmail}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Role Selection */}
                        <Select
                          value={user.tenantRole}
                          onValueChange={(newRole) => handleUpdateUserRole(user.userId, newRole)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORGANIZATION_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  {role}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Remove Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveUser(user.userId)}
                          disabled={isLoading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleFinish} disabled={isLoading}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}