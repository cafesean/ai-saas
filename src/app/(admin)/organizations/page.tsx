"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrganizationDataTable } from "./components/OrganizationDataTable";
import { useOrganizationTableColumns } from "./hooks/useOrganizationTableColumns";
import { OrganizationFormDialog } from "./components/OrganizationFormDialog";
import { DeleteOrganizationDialog } from "./components/DeleteOrganizationDialog";
import { ManageUsersDialog } from "./components/ManageUsersDialog";
import { type OrganizationWithStats } from "@/types/organization";
import { api } from "@/utils/trpc";
import { toast } from "sonner";

export default function OrganizationsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manageUsersDialogOpen, setManageUsersDialogOpen] = useState(false);

  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationWithStats | null>(null);

  // Fetch organizations data
  const { 
    data: organizationsResponse, 
    isLoading, 
    refetch 
  } = api.tenant.getAllWithStats.useQuery({
    limit: 100,
    offset: 0,
  });

  const organizations = organizationsResponse?.tenants || [];

  // Mutations
  const deleteMutation = api.tenant.delete.useMutation({
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete organization: ${error.message}`);
    },
  });

  const updateMutation = api.tenant.update.useMutation({
    onSuccess: () => {
      toast.success("Organization updated successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update organization: ${error.message}`);
    },
  });

  // Event handlers
  const handleCreateOrganization = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
    toast.success("Organization created successfully");
  };

  const handleEditOrganization = (organization: OrganizationWithStats) => {
    setSelectedOrganization(organization);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedOrganization(null);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedOrganization(null);
    refetch();
    toast.success("Organization updated successfully");
  };

  const handleDeleteOrganization = (organization: OrganizationWithStats) => {
    setSelectedOrganization(organization);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedOrganization(null);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedOrganization(null);
    refetch();
  };

  const handleManageUsers = (organization: OrganizationWithStats) => {
    setSelectedOrganization(organization);
    setManageUsersDialogOpen(true);
  };

  const handleManageUsersClose = () => {
    setManageUsersDialogOpen(false);
    setSelectedOrganization(null);
  };

  const handleManageUsersSuccess = () => {
    setManageUsersDialogOpen(false);
    setSelectedOrganization(null);
    refetch();
  };

  const handleToggleStatus = (organization: OrganizationWithStats) => {
    updateMutation.mutate({
      id: organization.id,
      isActive: !organization.isActive,
    });
  };

  // Table columns
  const columns = useOrganizationTableColumns({
    onEdit: handleEditOrganization,
    onDelete: handleDeleteOrganization,
    onManageUsers: handleManageUsers,
    onToggleStatus: handleToggleStatus,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">Manage organizations, users, and settings</p>
        </div>
        <Button onClick={handleCreateOrganization}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Organization Table */}
      <OrganizationDataTable 
        data={organizations} 
        columns={columns} 
        isLoading={isLoading}
        onRefresh={refetch}
      />

      {/* Organization Form Dialog (Create/Edit) */}
      <OrganizationFormDialog
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
        organization={selectedOrganization}
        mode={createDialogOpen ? "create" : "edit"}
      />

      {/* Delete Organization Dialog */}
      <DeleteOrganizationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
        organization={selectedOrganization}
      />

      {/* Manage Users Dialog */}
      <ManageUsersDialog
        open={manageUsersDialogOpen}
        onClose={handleManageUsersClose}
        onSuccess={handleManageUsersSuccess}
        organization={selectedOrganization}
      />
    </div>
  );
}