"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
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

interface DeleteProviderDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  provider: ProviderListItem | null;
}

export function DeleteProviderDialog({
  open,
  onClose,
  onSuccess,
  provider,
}: DeleteProviderDialogProps) {
  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Provider
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete the provider{" "}
              <strong>{provider.name}</strong>?
            </p>
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Provider Details:</span>
                <Badge variant="outline">{provider.type}</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Name: {provider.name}</p>
                <p>Type: {provider.type}</p>
                {provider.description && (
                  <p>Description: {provider.description}</p>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. The provider
                configuration will be permanently deleted, and any models or
                inference operations using this provider may fail.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onSuccess}
          >
            Delete Provider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 