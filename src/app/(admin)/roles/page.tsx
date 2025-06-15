"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { api } from "@/utils/trpc";
import { WithPermission } from "@/components/auth/WithPermission";
import { toast } from "sonner";
import { useAuthStore } from "@/framework/store/auth.store";
import { RoleDataTable } from "./components/RoleDataTable";
import { useRoleTableColumns } from "./hooks/useRoleTableColumns";
import { CreateRoleDialog } from "./components/CreateRoleDialog";
import { EditRoleDialog } from "./components/EditRoleDialog";
import { DeleteRoleDialog } from "./components/DeleteRoleDialog";
import { type RoleWithStats } from "@/types/role";

export default function RolesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithStats | null>(null);

  // Get auth state for debugging
  const { user, permissions, authenticated, role } = useAuthStore();

  // Fetch roles with stats
  const { data: roles = [], isLoading, refetch } = api.role.getAllWithStats.useQuery();

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
    toast.info(`Manage permissions for: ${role.name}`);
    // TODO: Implement permission management (SAAS-66)
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

  // Table columns
  const columns = useRoleTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onManagePermissions: handleManagePermissions,
  });

  return (
    <WithPermission 
      permission="admin:role_management"
      fallback={
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access role management.
            </p>
            <p className="text-sm text-muted-foreground">
              Required permission: <code>admin:role_management</code>
            </p>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium">Debug Info</summary>
              <div className="mt-2 p-3 bg-muted rounded text-xs">
                <p><strong>Authenticated:</strong> {authenticated ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? user.name : 'None'}</p>
                <p><strong>Role:</strong> {role ? role.name : 'None'}</p>
                <p><strong>Permissions:</strong> {permissions?.length || 0} total</p>
                <p><strong>Has admin:role_management:</strong> {permissions?.some(p => (typeof p === 'string' ? p : p.slug) === 'admin:role_management') ? 'Yes' : 'No'}</p>
                <details className="mt-2">
                  <summary>All Permissions</summary>
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    {permissions?.map((p, i) => <div key={i} className="text-xs">{typeof p === 'string' ? p : p.slug}</div>) || 'No permissions'}
                  </div>
                </details>
              </div>
            </details>
          </div>
        </div>
      }
    >
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
      </div>
    </WithPermission>
  );
} 