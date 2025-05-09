"use client";

import { useState, Suspense } from "react";
import { LucidePlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { SampleButton } from "@/components/ui/sample-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { KnowledgeBasesList } from "@/components/knowledge-bases/knowledge-bases-list";
import { KnowledgeBaseSkeleton } from "@/components/skeletons/knowledge-base-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { CreateKnowledgeBaseDialog } from "@/components/knowledge-bases/create-knowledge-base-dialog";
import { api, useUtils } from "@/utils/trpc";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModalState } from "@/framework/hooks/useModalState";
import { KnowledgeBaseStatus } from "@/constants/knowledgeBase";
import { S3_API, KNOWLEDGE_BASE_API } from "@/constants/api";

// Replace the utility access with direct values
export const dynamic = "force-dynamic";

export default function KnowledgeBasesPage() {
  const {
    deleteConfirmOpen: changeStatusConfirmOpen,
    selectedItem: updateStatusKnowledgeBase,
    openDeleteConfirm: openChangeStatusConfirm,
    closeDeleteConfirm: closeChangeStatusConfirm,
  } = useModalState<any>();
  const {
    deleteConfirmOpen,
    selectedItem: selectedKnowledgeBase,
    openDeleteConfirm,
    closeDeleteConfirm,
  } = useModalState<any>();
  const {
    data: knowledgeBasesResult,
    isLoading: isLoadingKbs,
    error: kbsError,
  } = api.knowledgeBases.getAllKnowledgeBases.useQuery();
  const utils = useUtils();
  const create = api.knowledgeBases.createKnowledgeBase.useMutation({
    onSuccess: () => {
      utils.knowledgeBases.getAllKnowledgeBases.invalidate();
      toast.success("Knowledge Base created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateStatus = api.knowledgeBases.updateKnowledgeBaseStatus.useMutation(
    {
      onSuccess: () => {
        utils.knowledgeBases.getAllKnowledgeBases.invalidate();
        toast.success("Knowledge Base status updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  );
  const deleteKnowledgeBase =
    api.knowledgeBases.deleteKnowledgeBase.useMutation({
      onSuccess: () => {
        utils.knowledgeBases.getAllKnowledgeBases.invalidate();
        toast.success("Knowledge Base deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletingKnowledgeBase, setDeletingKnowledgeBase] = useState(false);

  const handleCreateKnowledgeBase = async (formData: any) => {
    try {
      setCreateDialogOpen(false);
      await create.mutateAsync({
        name: formData.name,
        description: formData.description || "",
        vectorDB: formData.vectorDB,
        embeddingModel: formData.embeddingModel,
      });
    } catch (error) {
      console.error("Error creating knowledge base:", error);
    }
  };

  const confirmChangeStatus = async () => {
    closeChangeStatusConfirm();
    if (updateStatusKnowledgeBase) {
      try {
        await updateStatus.mutateAsync({
          uuid: updateStatusKnowledgeBase.uuid,
          status:
            updateStatusKnowledgeBase.status === KnowledgeBaseStatus.draft
              ? KnowledgeBaseStatus.ready
              : KnowledgeBaseStatus.draft,
        });
      } catch (error) {
        toast.error("Update status error.");
      }
    }
  };

  const confirmDelete = async () => {
    closeDeleteConfirm();
    if (selectedKnowledgeBase) {
      setDeletingKnowledgeBase(true);
      // Delete document

      try {
        // Get all documents uuids from selected knowledge base
        const documentIds = selectedKnowledgeBase.documents?.map(
          (document: any) => document.uuid,
        );
        // Get all documents path
        const documentsKeysToDelete = selectedKnowledgeBase.documents?.map(
          (document: any) => document.path,
        );
        // Delete from s3
        const deleteDocuments = await axios.delete(S3_API.delete, {
          data: {
            keys: documentsKeysToDelete,
          },
        });
        // Delete embeddings from vector db
        if (deleteDocuments.data.success) {
          const deleteEmbeddings = await axios.delete(
            KNOWLEDGE_BASE_API.embeddingDocument,
            {
              data: {
                kbId: selectedKnowledgeBase?.uuid,
                documents: documentIds,
              },
            },
          );
          if (deleteEmbeddings.data.success) {
            await deleteKnowledgeBase.mutateAsync({
              uuid: selectedKnowledgeBase.uuid,
            });
            setDeletingKnowledgeBase(false);
          }
        }
      } catch (error) {
        setDeletingKnowledgeBase(false);
        toast.error("Delete knowledge base error.");
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex-1 p-8 pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Knowledge Bases
            </h1>
            <p className="text-muted-foreground">
              Create and manage vector databases for retrieval-augmented
              generation
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <SampleButton
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </SampleButton>
            <SampleButton
              onClick={() => setCreateDialogOpen(true)}
              variant="outline"
              size="sm"
            >
              <LucidePlus className="mr-2 h-4 w-4" />
              New Knowledge Base
            </SampleButton>
          </div>
        </div>

        <Separator className="my-6" />

        <ErrorBoundary
          fallback={
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription>
                  Failed to load knowledge bases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>There was an error loading the knowledge bases.</p>
              </CardContent>
              <CardFooter>
                <SampleButton
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </SampleButton>
              </CardFooter>
            </Card>
          }
        >
          <Suspense fallback={<KnowledgeBaseSkeleton count={3} />}>
            <KnowledgeBasesList
              knowledgeBases={knowledgeBasesResult?.knowledgeBases || []}
              isLoadingKbs={isLoadingKbs}
              kbsError={kbsError}
              onChangeStatus={openChangeStatusConfirm}
              onDelete={openDeleteConfirm}
            />
            <Dialog
              open={changeStatusConfirmOpen}
              onOpenChange={closeChangeStatusConfirm}
            >
              <DialogContent className="modal-content">
                <DialogHeader className="modal-header">
                  <DialogTitle className="modal-title">
                    {updateStatusKnowledgeBase?.status ===
                    KnowledgeBaseStatus.draft
                      ? "Ready Knowledge Base"
                      : "Draft Knowledge Base"}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription />
                <div className="modal-section">
                  <p className="modal-text">
                    Are you sure you want to{" "}
                    {updateStatusKnowledgeBase?.status ===
                    KnowledgeBaseStatus.draft
                      ? "Ready"
                      : "Draft"}{" "}
                    this knowledge base?
                  </p>
                </div>
                <DialogFooter className="modal-footer">
                  <SampleButton
                    type="button"
                    variant="secondary"
                    className="modal-button"
                    onClick={() => closeChangeStatusConfirm()}
                  >
                    Cancel
                  </SampleButton>
                  <SampleButton
                    type="button"
                    variant="default"
                    className="modal-button"
                    onClick={confirmChangeStatus}
                  >
                    {updateStatusKnowledgeBase?.status ===
                    KnowledgeBaseStatus.draft
                      ? "Ready"
                      : "Draft"}
                  </SampleButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
              <DialogContent className="modal-content">
                <DialogHeader className="modal-header">
                  <DialogTitle className="modal-title">Delete Role</DialogTitle>
                </DialogHeader>
                <DialogDescription />
                <div className="modal-section">
                  <p className="modal-text">
                    Are you sure you want to delete this knowledge base? This
                    action cannot be undone.
                  </p>
                </div>
                <DialogFooter className="modal-footer">
                  <SampleButton
                    type="button"
                    variant="secondary"
                    className="modal-button"
                    onClick={() => closeDeleteConfirm()}
                  >
                    Cancel
                  </SampleButton>
                  <SampleButton
                    type="button"
                    variant="danger"
                    className="modal-button"
                    onClick={confirmDelete}
                  >
                    Delete
                  </SampleButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Suspense>
        </ErrorBoundary>

        <CreateKnowledgeBaseDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={handleCreateKnowledgeBase}
        />
        {(create.isPending || deletingKnowledgeBase) && <FullScreenLoading />}
      </main>
    </div>
  );
}
