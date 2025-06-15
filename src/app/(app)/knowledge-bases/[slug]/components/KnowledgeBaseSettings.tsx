import React, { useState } from "react";
import { Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import { SampleButton } from "@/components/ui/sample-button";
import { Progress } from "@/components/ui/progress";
import { getTimeAgo } from "@/utils/func";
import { KnowledgeBaseEmbeddingModels } from "@/constants/knowledgeBase";

const KnowledgeBaseSettings = ({
  knowledgeBaseItem,
  handleUpdateKB,
}: {
  knowledgeBaseItem: any;
  handleUpdateKB: (updateInfo: any) => void;
}) => {
  const [isEmbeddingChangeDialogOpen, setIsEmbeddingChangeDialogOpen] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const [knowledgeBaseUpdateInfo, setKnowledgeBaseUpdateInfo] = useState<{
    name: string;
    description: string;
    embeddingModel?: string;
  }>({
    name: knowledgeBaseItem?.name || "",
    description: knowledgeBaseItem?.description || "",
    embeddingModel: knowledgeBaseItem?.embeddingModel || "",
  });

  const updateKnowledgeBaseUpdateInfo = (key: string, value: string) => {
    setKnowledgeBaseUpdateInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveChanges = () => {
    handleUpdateKB(knowledgeBaseUpdateInfo);
  };

  // Function to handle embedding model change
  const handleEmbeddingModelChange = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep("Preparing to change embedding model...");

    // Simulate the process
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsEmbeddingChangeDialogOpen(false);
          return 100;
        }

        // Update the processing step based on progress
        if (prev < 20) {
          setProcessingStep("Initializing embedding model change...");
        } else if (prev < 40) {
          setProcessingStep("Retrieving documents...");
        } else if (prev < 60) {
          setProcessingStep("Generating new embeddings...");
        } else if (prev < 80) {
          setProcessingStep("Updating vector database...");
        } else {
          setProcessingStep("Finalizing changes...");
        }

        return prev + 2;
      });
    }, 100);
  };

  return (
    <>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Details</CardTitle>
            <CardDescription>
              Manage your knowledge base settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <SampleInput
                    type="text"
                    value={knowledgeBaseUpdateInfo.name || ""}
                    onChange={(e) => {
                      updateKnowledgeBaseUpdateInfo("name", e.target.value);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <SampleInput
                    type="text"
                    value={knowledgeBaseUpdateInfo.description || ""}
                    onChange={(e) => {
                      updateKnowledgeBaseUpdateInfo(
                        "description",
                        e.target.value,
                      );
                    }}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <SampleInput
                    type="text"
                    value={knowledgeBaseItem?.status}
                    className="mt-1"
                    disabled
                  />
                </div>
                <div>
                  <Label>Created By</Label>
                  <SampleInput
                    type="text"
                    value={""}
                    className="mt-1"
                    disabled
                  />
                </div>
                <div>
                  <Label>Created Date</Label>
                  <SampleInput
                    type="text"
                    value={getTimeAgo(
                      knowledgeBaseItem?.createdAt || new Date(),
                    )}
                    className="mt-1"
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <SampleButton type="button" onClick={handleSaveChanges}>
                  Save Changes
                </SampleButton>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embedding Model</CardTitle>
            <CardDescription>
              Select the embedding model for your knowledge base.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Current Embedding Model</Label>
                <div className="p-3 border rounded-md bg-muted/20">
                  <div className="font-medium">
                    {knowledgeBaseItem?.embeddingModel}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {knowledgeBaseItem?.embeddingDimensions} dimensions
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="embedding-model">Change Embedding Model</Label>
                <Select
                  value={knowledgeBaseUpdateInfo.embeddingModel || ""}
                  onValueChange={(value) => {
                    updateKnowledgeBaseUpdateInfo("embeddingModel", value);
                    if (value !== knowledgeBaseItem?.embeddingModel) {
                      setIsEmbeddingChangeDialogOpen(true);
                    }
                  }}
                >
                  <SelectTrigger id="embedding-model">
                    <SelectValue placeholder="Select embedding model" />
                  </SelectTrigger>
                  <SelectContent>
                    {KnowledgeBaseEmbeddingModels.filter(
                      (model) => model.status === "Active",
                    ).map((model) => (
                      <SelectItem key={model.id} value={model.name}>
                        {model.name} ({model.dimensions} dimensions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Changing the embedding model will require regenerating all
                  embeddings.
                </p>
              </div>

              <div className="flex justify-end mt-4">
                <SampleButton>Save Changes</SampleButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Embedding Model Change Dialog */}
      <Dialog
        open={isEmbeddingChangeDialogOpen}
        onOpenChange={setIsEmbeddingChangeDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Embedding Model</DialogTitle>
            <DialogDescription>
              Changing the embedding model requires regenerating all embeddings
              in this knowledge base.
            </DialogDescription>
          </DialogHeader>
          {isProcessing ? (
            <div className="py-6 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Changing Embedding Model
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {processingStep}
                </p>
              </div>
              <Progress value={processingProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {processingProgress}% complete
              </p>
            </div>
          ) : (
            <>
              <div className="py-4 space-y-4">
                <div className="grid gap-2">
                  <Label>Current Model</Label>
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="font-medium">
                      {knowledgeBaseItem?.embeddingModel}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {knowledgeBaseItem?.embeddingDimensions} dimensions
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>New Model</Label>
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="font-medium">
                      {knowledgeBaseUpdateInfo.embeddingModel}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {
                        KnowledgeBaseEmbeddingModels.find(
                          (m) =>
                            m.id === knowledgeBaseUpdateInfo.embeddingModel,
                        )?.dimensions
                      }{" "}
                      dimensions
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-3 text-amber-600 dark:text-amber-300">
                  <div className="flex">
                    <Activity className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div className="text-sm">
                      This process will regenerate embeddings for all{" "}
                      {knowledgeBaseItem?.documentCount} documents in this
                      knowledge base. This may take some time and will update
                      the vector database.
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <SampleButton
                  variant="outline"
                  onClick={() => {
                    setIsEmbeddingChangeDialogOpen(false);
                    updateKnowledgeBaseUpdateInfo(
                      "embeddingModel",
                      knowledgeBaseItem?.embeddingModel,
                    );
                  }}
                >
                  Cancel
                </SampleButton>
                <SampleButton onClick={handleEmbeddingModelChange}>
                  Change Model & Regenerate
                </SampleButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KnowledgeBaseSettings;
