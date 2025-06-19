"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrganizationDataTable } from "./components/OrganizationDataTable";
import { useOrganizationTableColumns } from "./hooks/useOrganizationTableColumns";
import { OrganizationDetailsDialog } from "./components/OrganizationDetailsDialog";
import { DeleteOrganizationDialog } from "./components/DeleteOrganizationDialog";
import { type OrganizationWithStats } from "@/types/organization";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function OrganizationsPage() {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

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
    setSelectedOrganization(null);
    setDialogMode("create");
    setDetailsDialogOpen(true);
  };

  const handleEditOrganization = (organization: OrganizationWithStats) => {
    setSelectedOrganization(organization);
    setDialogMode("edit");
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedOrganization(null);
  };

  const handleDetailsDialogSuccess = () => {
    setDetailsDialogOpen(false);
    setSelectedOrganization(null);
    refetch();
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
    onToggleStatus: handleToggleStatus,
  });

  return (
    <RouteGuard permission="orgs:read" showAccessDenied={true}>
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

      {/* Organization Details Dialog (Create/Edit/Manage Users) */}
      <OrganizationDetailsDialog
        open={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
        onSuccess={handleDetailsDialogSuccess}
        organization={selectedOrganization}
        mode={dialogMode}
      />

      {/* Delete Organization Dialog */}
      <DeleteOrganizationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
        organization={selectedOrganization}
      />
      </div>
    </RouteGuard>
  );
}