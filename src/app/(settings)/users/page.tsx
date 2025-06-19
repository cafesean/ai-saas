"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserDataTable } from "./components/UserDataTable";
import { useUserTableColumns } from "./hooks/useUserTableColumns";
import { UserFormDialog } from "./components/UserFormDialog";
import { DeleteUserDialog } from "./components/DeleteUserDialog";
import { BulkUserOperationsDialog } from "./components/BulkUserOperationsDialog";
import { type UserWithStats } from "@/types/user";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { TRPCError } from "@trpc/server";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function UsersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  
  // Bulk operations state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<"activate" | "deactivate" | "delete">("activate");
  const [bulkUsers, setBulkUsers] = useState<UserWithStats[]>([]);

  // Fetch users data
  const { 
    data: usersResponse, 
    isLoading, 
    refetch 
  } = api.user.getAll.useQuery({
    limit: 100,
    offset: 0,
  });

  const users = usersResponse?.users || [];

  // Mutations
  const deleteMutation = api.user.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const bulkUpdateMutation = api.user.bulkUpdate.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Successfully updated ${data.updatedCount} users`);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update users: ${error.message}`);
    },
  });

  const bulkDeleteMutation = api.user.bulkDelete.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Successfully deleted ${data.deletedCount} users`);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete users: ${error.message}`);
    },
  });

  const updateMutation = api.user.update.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  // Event handlers
  const handleCreateUser = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
    toast.success("User created successfully");
  };

  const handleEditUser = (user: UserWithStats) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
    refetch();
    toast.success("User updated successfully");
  };

  const handleDeleteUser = (user: UserWithStats) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
    refetch();
  };

  const handleManageRoles = (user: UserWithStats) => {
    // Role management is now integrated into the edit dialog
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleToggleStatus = (user: UserWithStats) => {
    updateMutation.mutate({
      id: user.id,
      isActive: !user.isActive,
    });
  };

  // Bulk operations
  const handleBulkDelete = (users: UserWithStats[]) => {
    setBulkUsers(users);
    setBulkOperation("delete");
    setBulkDialogOpen(true);
  };

  const handleBulkActivate = (users: UserWithStats[]) => {
    setBulkUsers(users);
    setBulkOperation("activate");
    setBulkDialogOpen(true);
  };

  const handleBulkDeactivate = (users: UserWithStats[]) => {
    setBulkUsers(users);
    setBulkOperation("deactivate");
    setBulkDialogOpen(true);
  };

  const handleBulkClose = () => {
    setBulkDialogOpen(false);
    setBulkUsers([]);
  };

  const handleBulkSuccess = () => {
    setBulkDialogOpen(false);
    setBulkUsers([]);
    refetch();
  };

  // Table columns
  const columns = useUserTableColumns({
    onEdit: handleEditUser,
    onDelete: handleDeleteUser,
    onManageRoles: handleManageRoles,
    onToggleStatus: handleToggleStatus,
  });

  return (
    <RouteGuard permission="users:read" showAccessDenied={true}>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
          </div>
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

      {/* User Table */}
      <UserDataTable 
        data={users} 
        columns={columns} 
        isLoading={isLoading}
        onBulkDelete={handleBulkDelete}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onRefresh={refetch}
      />

      {/* User Form Dialog (Create/Edit) */}
      <UserFormDialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (createDialogOpen) {
              setCreateDialogOpen(false);
            } else {
              handleEditClose();
            }
          }
        }}
        onSuccess={createDialogOpen ? handleCreateSuccess : handleEditSuccess}
        user={selectedUser}
        mode={createDialogOpen ? "create" : "edit"}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
        user={selectedUser}
      />

      {/* Bulk Operations Dialog */}
      <BulkUserOperationsDialog
        open={bulkDialogOpen}
        onClose={handleBulkClose}
        onSuccess={handleBulkSuccess}
        users={bulkUsers}
        operation={bulkOperation}
      />
      </div>
    </RouteGuard>
  );
} 