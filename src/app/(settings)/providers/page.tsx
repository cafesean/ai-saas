"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { ProviderDataTable } from "./components/ProviderDataTable";
import { ProviderFormDialog } from "./components/ProviderFormDialog";
import { DeleteProviderDialog } from "./components/DeleteProviderDialog";
import { type ProviderConfig } from "@/types/provider.types";

// Type for provider list items from the API
type ProviderListItem = {
  id: string;
  type: string;
  name: string;
  description?: string;
  enabled: boolean;
  isInitialized: boolean;
  status: string;
};
import { SessionDebug } from "@/components/debug/SessionDebug";

export default function ProvidersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderListItem | null>(null);

  // Fetch providers
  const { 
    data: providers = [], 
    isLoading, 
    refetch 
  } = api.provider.list.useQuery({});

  // Mutations
  const deleteMutation = api.provider.unregister.useMutation({
    onSuccess: () => {
      toast.success("Provider deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete provider: ${error.message}`);
    },
  });

  // Event handlers
  const handleCreateProvider = () => {
    setSelectedProvider(null);
    setCreateDialogOpen(true);
  };

  const handleEditProvider = (provider: ProviderListItem) => {
    setSelectedProvider(provider);
    setEditDialogOpen(true);
  };

  const handleDeleteProvider = (provider: ProviderListItem) => {
    setSelectedProvider(provider);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
    toast.success("Provider created successfully");
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedProvider(null);
    refetch();
    toast.success("Provider updated successfully");
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedProvider(null);
  };

  const handleDeleteSuccess = () => {
    if (selectedProvider) {
      deleteMutation.mutate({ providerId: selectedProvider.id });
    }
    setDeleteDialogOpen(false);
    setSelectedProvider(null);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedProvider(null);
  };

  return (
          <RouteGuard permission="provider:read" showAccessDenied={true}>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Provider Management</h1>
            <p className="text-muted-foreground">
              Manage AI provider configurations and API keys for your organization
            </p>
          </div>
          <Button onClick={handleCreateProvider}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>

        {/* Provider Table */}
        <ProviderDataTable 
          data={providers} 
          isLoading={isLoading}
          onEdit={handleEditProvider}
          onDelete={handleDeleteProvider}
          onRefresh={refetch}
        />

        {/* Provider Form Dialog (Create/Edit) */}
        <ProviderFormDialog
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
          provider={selectedProvider}
          mode={createDialogOpen ? "create" : "edit"}
        />

        {/* Delete Provider Dialog */}
        <DeleteProviderDialog
          open={deleteDialogOpen}
          onClose={handleDeleteClose}
          onSuccess={handleDeleteSuccess}
          provider={selectedProvider}
        />
        
        {/* Debug Component */}
        <SessionDebug />
      </div>
    </RouteGuard>
  );
} 