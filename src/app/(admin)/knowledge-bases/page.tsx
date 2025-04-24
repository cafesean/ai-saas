"use client";

import { useState, Suspense } from "react";
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
import { CreateKnowledgeBaseFormValues } from "@/schemas/knowledge-bases";
import { useKnowledgeBases } from "@/framework/hooks/useKnowledgeBases";
import { LucidePlus, RefreshCw } from "lucide-react";

// Replace the utility access with direct values
export const dynamic = "force-dynamic";

export default function KnowledgeBasesPage() {
  const { createKnowledgeBase } = useKnowledgeBases();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateKnowledgeBase = async (
    formData: CreateKnowledgeBaseFormValues,
  ) => {
    try {
      await createKnowledgeBase({
        name: formData.name,
        description: formData.description || "No description provided",
        vectorDb: formData.vectorDb,
        embeddingModel: formData.embeddingModel,
        sources: [],
        documentCount: 0,
        status: "empty",
        lastUpdated: "Just now",
      });
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating knowledge base:", error);
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
            <KnowledgeBasesList />
          </Suspense>
        </ErrorBoundary>

        <CreateKnowledgeBaseDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={handleCreateKnowledgeBase}
        />
      </main>
    </div>
  );
}
