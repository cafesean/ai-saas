"use client";

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  Users, 
  CheckCircle, 
  XCircle,
  UserCheck,
  UserX,
  Trash2
} from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type UserWithStats } from "@/types/user";

interface BulkUserOperationsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  users: UserWithStats[];
  operation: "activate" | "deactivate" | "delete";
}

export function BulkUserOperationsDialog({ 
  open, 
  onClose, 
  onSuccess,
  users,
  operation
}: BulkUserOperationsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    success: UserWithStats[];
    failed: { user: UserWithStats; error: string }[];
  }>({ success: [], failed: [] });
  const [showResults, setShowResults] = useState(false);

  const bulkUpdateMutation = api.user.bulkUpdate.useMutation();
  const bulkDeleteMutation = api.user.bulkDelete.useMutation();
  const utils = api.useUtils();

  const handleClose = () => {
    if (!isProcessing) {
      setResults({ success: [], failed: [] });
      setShowResults(false);
      setProgress(0);
      onClose();
    }
  };

  const getOperationConfig = () => {
    switch (operation) {
      case "activate":
        return {
          title: "Activate Users",
          description: "Activate the selected users to allow them to access the system.",
          icon: UserCheck,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          buttonText: "Activate Users",
          buttonVariant: "default" as const,
        };
      case "deactivate":
        return {
          title: "Deactivate Users",
          description: "Deactivate the selected users to prevent them from accessing the system.",
          icon: UserX,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          buttonText: "Deactivate Users",
          buttonVariant: "outline" as const,
        };
      case "delete":
        return {
          title: "Delete Users",
          description: "Permanently delete the selected users and all their associated data.",
          icon: Trash2,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          buttonText: "Delete Users",
          buttonVariant: "destructive" as const,
        };
    }
  };

  const config = getOperationConfig();
  const IconComponent = config.icon;

  const handleBulkOperation = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults({ success: [], failed: [] });

    try {
      const userIds = users.map(user => user.id);

      if (operation === "delete") {
        await bulkDeleteMutation.mutateAsync({ userIds });
      } else {
        await bulkUpdateMutation.mutateAsync({ 
          userIds, 
          action: operation 
        });
      }

      // Simulate progress for better UX
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // All operations succeeded
      setResults({ 
        success: users, 
        failed: [] 
      });

      // Invalidate and refetch relevant queries
      await Promise.all([
        utils.user.getAll.invalidate(),
        utils.user.getById.invalidate(),
      ]);
      
      const operationPastTense = operation === "delete" ? "deleted" : `${operation}d`;
      toast.success(`Successfully ${operationPastTense} ${users.length} user(s)`);
      
      setShowResults(true);
      
      // Auto-close after showing results
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);

    } catch (error: unknown) {
      console.error(`Error in bulk ${operation}:`, error);
      
      // Mark all as failed
              setResults({
          success: [],
          failed: users.map(user => ({
            user,
            error: error instanceof Error ? error.message : `Failed to ${operation} user`
          }))
        });
      
      toast.error(`Failed to ${operation} users. Please try again.`);
      setShowResults(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeUsers = users.filter(user => user.isActive);
  const inactiveUsers = users.filter(user => !user.isActive);
  const usersWithRoles = users.filter(user => user.roleCount > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${config.color}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Operation Summary */}
          <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Operation Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Users:</span>
                <span className="font-medium">{users.length}</span>
              </div>
              {operation !== "delete" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currently Active:</span>
                    <span className="font-medium">{activeUsers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currently Inactive:</span>
                    <span className="font-medium">{inactiveUsers.length}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users with Roles:</span>
                <span className="font-medium">{usersWithRoles.length}</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {operation === "delete" && usersWithRoles.length > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-orange-800">
                <strong>Warning:</strong> {usersWithRoles.length} user(s) have active role assignments. 
                Deleting these users will remove all their role assignments.
              </p>
            </div>
          )}

          {operation === "activate" && activeUsers.length === users.length && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All selected users are already active.
              </p>
            </div>
          )}

          {operation === "deactivate" && inactiveUsers.length === users.length && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All selected users are already inactive.
              </p>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Operation Results</h4>
              
              {results.success.length > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">
                      Successfully processed {results.success.length} user(s)
                    </span>
                  </div>
                </div>
              )}

              {results.failed.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">
                      Failed to process {results.failed.length} user(s)
                    </span>
                  </div>
                  <ScrollArea className="h-20">
                    <div className="space-y-1">
                      {results.failed.map((failure, index) => (
                        <div key={index} className="text-xs text-red-700">
                          {failure.user.name}: {failure.error}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* User List Preview */}
          {!showResults && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Selected Users ({users.length})</h4>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between text-sm p-2 border rounded">
                      <div>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-muted-foreground ml-2">({user.email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {user.roleCount > 0 && (
                          <Badge variant="outline">
                            {user.roleCount} role(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {showResults ? "Close" : "Cancel"}
          </Button>
          {!showResults && (
            <Button 
              type="button"
              variant={config.buttonVariant}
              onClick={handleBulkOperation}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? "Processing..." : config.buttonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 