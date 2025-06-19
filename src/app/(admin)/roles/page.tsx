"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { api } from "@/utils/trpc";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { toast } from "sonner";
import { RoleDataTable } from "./components/RoleDataTable";
import { useRoleTableColumns } from "./hooks/useRoleTableColumns";
import { CreateRoleDialog } from "./components/CreateRoleDialog";
import { EditRoleDialog } from "./components/EditRoleDialog";
import { DeleteRoleDialog } from "./components/DeleteRoleDialog";
import { ManagePermissionsDialog } from "./components/ManagePermissionsDialog";
import { type RoleWithStats } from "@/types/role";

export default function RolesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [managePermissionsDialogOpen, setManagePermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithStats | null>(null);



  // Fetch roles with stats
  const { data: roles = [], isLoading, refetch } = api.role.getAllWithStats.useQuery();

  // Bulk operations mutations
  const deleteMutation = api.role.delete.useMutation();
  const updateMutation = api.role.update.useMutation();

  // Table action handlers
  const handleEdit = (role: RoleWithStats) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleDelete = (role: RoleWithStats) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleManagePermissions = (role: RoleWithStats) => {
    setSelectedRole(role);
    setManagePermissionsDialogOpen(true);
  };

  const handleCreateRole = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  const handleManagePermissionsSuccess = () => {
    refetch();
  };

  const handleManagePermissionsClose = () => {
    setManagePermissionsDialogOpen(false);
    setSelectedRole(null);
  };

  // Bulk operation handlers
  const handleBulkDelete = async (rolesToDelete: RoleWithStats[]) => {
    try {
      await Promise.all(
        rolesToDelete.map(role => 
          deleteMutation.mutateAsync(role.id)
        )
      );
      toast.success(`Successfully deleted ${rolesToDelete.length} role(s)`);
      refetch();
    } catch (error) {
      toast.error("Failed to delete some roles");
      console.error("Bulk delete error:", error);
    }
  };

  const handleBulkActivate = async (rolesToActivate: RoleWithStats[]) => {
    // For now, we'll show a message that this feature needs API enhancement
    toast.info("Bulk activate feature requires API enhancement. Please use individual role actions.");
  };

  const handleBulkDeactivate = async (rolesToDeactivate: RoleWithStats[]) => {
    // For now, we'll show a message that this feature needs API enhancement  
    toast.info("Bulk deactivate feature requires API enhancement. Please use individual role actions.");
  };

  // Table columns
  const columns = useRoleTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onManagePermissions: handleManagePermissions,
  });

  return (
    <RouteGuard permission="roles:read" showAccessDenied={true}>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <Button onClick={handleCreateRole}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>

        {/* Role Table */}
        <RoleDataTable 
          data={roles} 
          columns={columns} 
          isLoading={isLoading}
          onBulkDelete={handleBulkDelete}
          onBulkActivate={handleBulkActivate}
          onBulkDeactivate={handleBulkDeactivate}
          onRefresh={refetch}
        />

        {/* Create Role Dialog */}
        <CreateRoleDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Edit Role Dialog */}
        <EditRoleDialog
          open={editDialogOpen}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
          role={selectedRole}
        />

        {/* Delete Role Dialog */}
        <DeleteRoleDialog
          open={deleteDialogOpen}
          onClose={handleDeleteClose}
          onSuccess={handleDeleteSuccess}
          role={selectedRole}
        />

        {/* Manage Permissions Dialog */}
        <ManagePermissionsDialog
          open={managePermissionsDialogOpen}
          onClose={handleManagePermissionsClose}
          onSuccess={handleManagePermissionsSuccess}
          role={selectedRole}
        />
      </div>
    </RouteGuard>
  );
} 