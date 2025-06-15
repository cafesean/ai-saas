"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserDataTable } from "./components/UserDataTable";
import { useUserTableColumns } from "./hooks/useUserTableColumns";
import { type UserWithStats } from "@/types/user";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { TRPCError } from "@trpc/server";

export default function UsersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manageRolesDialogOpen, setManageRolesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);

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
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleManageRoles = (user: UserWithStats) => {
    setSelectedUser(user);
    setManageRolesDialogOpen(true);
  };

  const handleManageRolesClose = () => {
    setManageRolesDialogOpen(false);
    setSelectedUser(null);
  };

  const handleManageRolesSuccess = () => {
    setManageRolesDialogOpen(false);
    setSelectedUser(null);
    refetch();
    toast.success("User roles updated successfully");
  };

  const handleToggleStatus = (user: UserWithStats) => {
    updateMutation.mutate({
      id: user.id,
      isActive: !user.isActive,
    });
  };

  // Bulk operations
  const handleBulkDelete = (users: UserWithStats[]) => {
    const userIds = users.map(user => user.id);
    bulkDeleteMutation.mutate({ userIds });
  };

  const handleBulkActivate = (users: UserWithStats[]) => {
    const userIds = users.map(user => user.id);
    bulkUpdateMutation.mutate({ 
      userIds, 
      action: 'activate' 
    });
  };

  const handleBulkDeactivate = (users: UserWithStats[]) => {
    const userIds = users.map(user => user.id);
    bulkUpdateMutation.mutate({ 
      userIds, 
      action: 'deactivate' 
    });
  };

  // Table columns
  const columns = useUserTableColumns({
    onEdit: handleEditUser,
    onDelete: handleDeleteUser,
    onManageRoles: handleManageRoles,
    onToggleStatus: handleToggleStatus,
  });

  return (
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

      {/* TODO: Add dialogs for create, edit, delete, and manage roles */}
      {/* These will be implemented in the next phase */}
      
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Create User</h2>
            <p className="text-muted-foreground mb-4">Create user dialog will be implemented in the next phase.</p>
            <Button onClick={() => setCreateDialogOpen(false)}>Close</Button>
          </div>
        </div>
      )}

      {editDialogOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Edit User: {selectedUser.name}</h2>
            <p className="text-muted-foreground mb-4">Edit user dialog will be implemented in the next phase.</p>
            <Button onClick={handleEditClose}>Close</Button>
          </div>
        </div>
      )}

      {deleteDialogOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Delete User: {selectedUser.name}</h2>
            <p className="text-muted-foreground mb-4">Are you sure you want to delete this user?</p>
            <div className="flex space-x-2">
              <Button variant="destructive" onClick={handleDeleteSuccess}>Delete</Button>
              <Button variant="outline" onClick={handleDeleteClose}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {manageRolesDialogOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Manage Roles: {selectedUser.name}</h2>
            <p className="text-muted-foreground mb-4">Role management dialog will be implemented in the next phase.</p>
            <Button onClick={handleManageRolesClose}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
} 