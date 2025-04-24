"use client";

import { KnowledgeBaseSkeleton } from "@/components/skeletons/knowledge-base-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ViewToggle } from "@/components/view-toggle"; // Remove type import here
import { useViewToggle, type ViewMode } from "@/framework/hooks/useViewToggle"; // Import hook and type
import type {
  EmbeddingModel,
  KnowledgeBase,
  VectorDatabase,
} from "@/types/knowledge-base";
import { api } from "@/utils/trpc";
import {
  ArrowLeft,
  Copy,
  Database,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export const KnowledgeBasesContent = () => {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isVectorDbDialogOpen, setIsVectorDbDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] =
    useState<KnowledgeBase | null>(null);
  const [newKbName, setNewKbName] = useState("");
  const [newKbDescription, setNewKbDescription] = useState("");
  const [embeddingModel, setEmbeddingModel] = useState("");
  const [vectorDb, setVectorDb] = useState("");
  const [chunkSize, setChunkSize] = useState("1000");
  const [chunkOverlap, setChunkOverlap] = useState("200");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Remove local state: const [viewMode, setViewMode] = useState<ViewMode>("medium-grid")
  const { viewMode, setViewMode } = useViewToggle<ViewMode>("medium-grid"); // Use hook

  const {
    data: knowledgeBasesResult,
    isLoading: isLoadingKbs,
    error: kbsError,
  } = api.knowledgeBases.getAllKnowledgeBases.useQuery();
  const {
    data: vectorDatabasesResult,
    isLoading: isLoadingVdbs,
    error: vdbsError,
  } = api.knowledgeBases.getVectorDatabases.useQuery();
  const {
    data: embeddingModelsResult,
    isLoading: isLoadingEms,
    error: emsError,
  } = api.knowledgeBases.getEmbeddingModels.useQuery();

  const knowledgeBases = useMemo(
    () => knowledgeBasesResult?.knowledgeBases || [],
    [knowledgeBasesResult],
  );
  const vectorDatabases = useMemo(
    () => vectorDatabasesResult?.vectorDatabases || [],
    [vectorDatabasesResult],
  );
  const embeddingModels = useMemo(
    () => embeddingModelsResult?.embeddingModels || [],
    [embeddingModelsResult],
  );

  useEffect(() => {
    if (embeddingModels && embeddingModels.length > 0 && !embeddingModel) {
      setEmbeddingModel(embeddingModels[0]!.id);
    }
  }, [embeddingModels, embeddingModel]);

  useEffect(() => {
    if (vectorDatabases && vectorDatabases.length > 0 && !vectorDb) {
      setVectorDb(vectorDatabases[0]!.id);
    }
  }, [vectorDatabases, vectorDb]);

  const filteredKnowledgeBases = useMemo(() => {
    if (!searchQuery) return knowledgeBases;
    return knowledgeBases.filter(
      (kb: KnowledgeBase) =>
        kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (kb.description &&
          kb.description.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [knowledgeBases, searchQuery]);

  const handleCreateKnowledgeBase = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep("Initializing knowledge base...");

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsCreateDialogOpen(false);
          setNewKbName("");
          setNewKbDescription("");
          return 100;
        }

        if (prev < 20) {
          setProcessingStep("Initializing knowledge base...");
        } else if (prev < 40) {
          setProcessingStep("Configuring vector database...");
        } else if (prev < 60) {
          setProcessingStep("Setting up embedding model...");
        } else if (prev < 80) {
          setProcessingStep("Finalizing configuration...");
        } else {
          setProcessingStep("Completing setup...");
        }

        return prev + 5;
      });
    }, 200);
  };

  const handleUploadDocuments = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep("Preparing documents...");

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsUploadDialogOpen(false);
          return 100;
        }

        if (prev < 20) {
          setProcessingStep("Uploading documents...");
        } else if (prev < 40) {
          setProcessingStep("Parsing document content...");
        } else if (prev < 60) {
          setProcessingStep("Chunking text...");
        } else if (prev < 80) {
          setProcessingStep("Generating embeddings...");
        } else {
          setProcessingStep("Storing in vector database...");
        }

        return prev + 2;
      });
    }, 100);
  };

  const handleDuplicateKnowledgeBase = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep("Initializing duplication...");

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsDuplicateDialogOpen(false);
          return 100;
        }

        if (prev < 20) {
          setProcessingStep("Copying configuration...");
        } else if (prev < 40) {
          setProcessingStep("Duplicating document references...");
        } else if (prev < 60) {
          setProcessingStep("Setting up vector database...");
        } else if (prev < 80) {
          setProcessingStep("Copying embeddings...");
        } else {
          setProcessingStep("Finalizing duplication...");
        }

        return prev + 5;
      });
    }, 200);
  };

  const handleRegenerateEmbeddings = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep("Preparing to regenerate embeddings...");

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsRegenerateDialogOpen(false);
          return 100;
        }

        if (prev < 20) {
          setProcessingStep("Retrieving documents...");
        } else if (prev < 40) {
          setProcessingStep("Preparing content for embedding...");
        } else if (prev < 60) {
          setProcessingStep("Generating new embeddings...");
        } else if (prev < 80) {
          setProcessingStep("Updating vector database...");
        } else {
          setProcessingStep("Finalizing regeneration...");
        }

        return prev + 3;
      });
    }, 150);
  };

  const handleConnectVectorDb = () => {
    setIsVectorDbDialogOpen(false);
  };

  const navigateToKnowledgeBaseDetail = (kbId: string) => {
    router.push(`/knowledge-bases/${kbId}`);
  };

  const getGridClass = () => {
    switch (viewMode) {
      case "large-grid":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";
      case "medium-grid":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "list":
        return "grid-cols-1";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  if (isLoadingKbs || isLoadingVdbs || isLoadingEms) {
    return <KnowledgeBaseSkeleton count={6} />;
  }

  if (kbsError || vdbsError || emsError) {
    return (
      <div>
        Error loading data:{" "}
        {kbsError?.message || vdbsError?.message || emsError?.message}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-xl font-semibold">AI Knowledge Bases</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <SampleButton
            variant="outline"
            size="sm"
            onClick={() => setIsVectorDbDialogOpen(true)}
          >
            <Database className="mr-2 h-4 w-4" />
            Vector DBs
          </SampleButton>
          <SampleButton variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </SampleButton>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Knowledge Base Library
            </h2>
            <p className="text-muted-foreground">
              Create RAG-powered expert knowledge bases from your domain
              documents
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search knowledge bases..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Pass hook's state and setter */}
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <SampleButton>
                  <Plus className="mr-2 h-4 w-4" />
                  New Knowledge Base
                </SampleButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Knowledge Base</DialogTitle>
                  <DialogDescription>
                    Create a new AI knowledge base for domain-specific question
                    answering.
                  </DialogDescription>
                </DialogHeader>
                {isProcessing ? (
                  <div className="py-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">
                        Creating Knowledge Base
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
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="kb-name">Name</Label>
                        <Input
                          id="kb-name"
                          placeholder="Enter knowledge base name"
                          value={newKbName}
                          onChange={(e) => setNewKbName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="kb-description">Description</Label>
                        <Textarea
                          id="kb-description"
                          placeholder="Enter a description of this knowledge base"
                          value={newKbDescription}
                          onChange={(e) => setNewKbDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="embedding-model" className="text-right">
                          Embedding Model
                        </Label>
                        <Select
                          value={embeddingModel}
                          onValueChange={setEmbeddingModel}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {embeddingModels.map((model: EmbeddingModel) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name} ({model.dimensions} dim)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {embeddingModel && (
                          <div className="col-span-3 col-start-2 text-xs text-muted-foreground">
                            Dimensions:{" "}
                            {embeddingModels.find(
                              (m: EmbeddingModel) => m.id === embeddingModel,
                            )?.dimensions || "N/A"}{" "}
                            • Provider:{" "}
                            {embeddingModels.find(
                              (m: EmbeddingModel) => m.id === embeddingModel,
                            )?.provider || "N/A"}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vector-db" className="text-right">
                          Vector Database
                        </Label>
                        <Select value={vectorDb} onValueChange={setVectorDb}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select database" />
                          </SelectTrigger>
                          <SelectContent>
                            {vectorDatabases.map((db: VectorDatabase) => (
                              <SelectItem key={db.id} value={db.id}>
                                {db.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="chunk-size">Chunk Size</Label>
                          <Input
                            id="chunk-size"
                            value={chunkSize}
                            onChange={(e) => setChunkSize(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Characters per chunk
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="chunk-overlap">Chunk Overlap</Label>
                          <Input
                            id="chunk-overlap"
                            value={chunkOverlap}
                            onChange={(e) => setChunkOverlap(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Overlap between chunks
                          </p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <SampleButton
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </SampleButton>
                      <SampleButton
                        onClick={handleCreateKnowledgeBase}
                        disabled={!newKbName}
                      >
                        Create Knowledge Base
                      </SampleButton>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Knowledge Bases</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className={`grid gap-4 ${getGridClass()}`}>
              {filteredKnowledgeBases.map((kb: KnowledgeBase) => (
                <KnowledgeBaseCard
                  key={kb.id}
                  knowledgeBase={kb}
                  viewMode={viewMode}
                  onCardClick={() => navigateToKnowledgeBaseDetail(kb.id)}
                  onUploadClick={(kb) => {
                    setSelectedKnowledgeBase(kb);
                    setIsUploadDialogOpen(true);
                  }}
                  onDuplicateClick={(kb) => {
                    setSelectedKnowledgeBase(kb);
                    setIsDuplicateDialogOpen(true);
                  }}
                  onRegenerateClick={(kb) => {
                    setSelectedKnowledgeBase(kb);
                    setIsRegenerateDialogOpen(true);
                  }}
                  onDeleteClick={(kbId) => {
                    // Implement delete logic
                  }}
                />
              ))}
              {filteredKnowledgeBases.length === 0 && !isLoadingKbs && (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No knowledge bases found matching your search.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className={`grid gap-4 ${getGridClass()}`}>
              {filteredKnowledgeBases
                .filter((kb: KnowledgeBase) => kb.status === "Active")
                .map((kb: KnowledgeBase) => (
                  <KnowledgeBaseCard
                    key={kb.id}
                    knowledgeBase={kb}
                    viewMode={viewMode}
                    onCardClick={() => navigateToKnowledgeBaseDetail(kb.id)}
                    onUploadClick={(kb) => {
                      setSelectedKnowledgeBase(kb);
                      setIsUploadDialogOpen(true);
                    }}
                    onDuplicateClick={(kb) => {
                      setSelectedKnowledgeBase(kb);
                      setIsDuplicateDialogOpen(true);
                    }}
                    onRegenerateClick={(kb) => {
                      setSelectedKnowledgeBase(kb);
                      setIsRegenerateDialogOpen(true);
                    }}
                    onDeleteClick={(kbId) => {
                      // Implement delete logic
                    }}
                  />
                ))}
              {filteredKnowledgeBases.filter(
                (kb: KnowledgeBase) => kb.status === "Active",
              ).length === 0 &&
                !isLoadingKbs && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No active knowledge bases found.
                  </p>
                )}
            </div>
          </TabsContent>

          <TabsContent value="processing" className="mt-6">
            <div className={`grid gap-4 ${getGridClass()}`}>
              {filteredKnowledgeBases
                .filter((kb: KnowledgeBase) => kb.status === "Processing")
                .map((kb: KnowledgeBase) => (
                  <KnowledgeBaseCard
                    key={kb.id}
                    knowledgeBase={kb}
                    viewMode={viewMode}
                    onCardClick={() => navigateToKnowledgeBaseDetail(kb.id)}
                    onUploadClick={(kb) => {
                      setSelectedKnowledgeBase(kb);
                      setIsUploadDialogOpen(true);
                    }}
                    onDuplicateClick={(kb) => {
                      setSelectedKnowledgeBase(kb);
                      setIsDuplicateDialogOpen(true);
                    }}
                    onRegenerateClick={(kb) => {
                      setSelectedKnowledgeBase(kb);
                      setIsRegenerateDialogOpen(true);
                    }}
                    onDeleteClick={(kbId) => {
                      // Implement delete logic
                    }}
                  />
                ))}
              {filteredKnowledgeBases.filter(
                (kb: KnowledgeBase) => kb.status === "Processing",
              ).length === 0 &&
                !isLoadingKbs && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No processing knowledge bases found.
                  </p>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Rest of the dialogs would go here */}
    </div>
  );
};

// Add the KnowledgeBaseCard component
interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase;
  viewMode: ViewMode;
  onCardClick: () => void;
  onUploadClick: (kb: KnowledgeBase) => void;
  onDuplicateClick: (kb: KnowledgeBase) => void;
  onRegenerateClick: (kb: KnowledgeBase) => void;
  onDeleteClick: (kbId: string) => void;
}

export const KnowledgeBaseCard = ({
  knowledgeBase,
  viewMode,
  onCardClick,
  onUploadClick,
  onDuplicateClick,
  onRegenerateClick,
  onDeleteClick,
}: KnowledgeBaseCardProps) => {
  if (viewMode === "list") {
    return (
      <Card
        className="overflow-hidden transition-all hover:border-primary/50 animate-scale cursor-pointer"
        onClick={onCardClick}
      >
        {/* List view UI */}
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-lg">{knowledgeBase.name}</h3>
              <Badge
                variant={
                  knowledgeBase.status === "Active" ? "default" : "secondary"
                }
                className={
                  knowledgeBase.status === "Processing" ? "animate-pulse" : ""
                }
              >
                {knowledgeBase.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {knowledgeBase.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>Docs: {knowledgeBase.documentCount}</span>
              <span>•</span>
              <span>Dims: {knowledgeBase.embeddingDimensions}</span>
              <span>•</span>
              <span>{knowledgeBase.vectorDb}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SampleButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUploadClick(knowledgeBase);
              }}
            >
              <Upload className="h-3.5 w-3.5" />
            </SampleButton>

            <SampleButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRegenerateClick(knowledgeBase);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </SampleButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SampleButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </SampleButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={onCardClick}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUploadClick(knowledgeBase)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRegenerateClick(knowledgeBase)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Embeddings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDuplicateClick(knowledgeBase)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteClick(knowledgeBase.id)}
                  className="text-destructive"
                >
                  Delete Knowledge Base
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden transition-all hover:border-primary/50 animate-scale cursor-pointer"
      onClick={onCardClick}
    >
      {/* Grid view UI */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{knowledgeBase.name}</CardTitle>
          <Badge
            variant={
              knowledgeBase.status === "Active" ? "default" : "secondary"
            }
            className={
              knowledgeBase.status === "Processing" ? "animate-pulse" : ""
            }
          >
            {knowledgeBase.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {knowledgeBase.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <div className="text-muted-foreground">Documents:</div>
          <div className="font-medium text-right">
            {knowledgeBase.documentCount}
          </div>

          <div className="text-muted-foreground">Embedding Model:</div>
          <div className="font-medium text-right">
            {knowledgeBase.embeddingModel.split("-").pop()}
          </div>

          <div className="text-muted-foreground">Dimensions:</div>
          <div className="font-medium text-right">
            {knowledgeBase.embeddingDimensions}
          </div>

          <div className="text-muted-foreground">Vector DB:</div>
          <div className="font-medium text-right">{knowledgeBase.vectorDb}</div>

          <div className="text-muted-foreground">Last Updated:</div>
          <div className="font-medium text-right">
            {knowledgeBase.lastUpdated}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-2 bg-muted/20">
        <SampleButton
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onUploadClick(knowledgeBase);
          }}
        >
          <Upload className="mr-1 h-3.5 w-3.5" />
          Upload
        </SampleButton>

        <SampleButton
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRegenerateClick(knowledgeBase);
          }}
        >
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          Regenerate
        </SampleButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SampleButton
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </SampleButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onCardClick}>
              <FileText className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicateClick(knowledgeBase)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDeleteClick(knowledgeBase.id)}
              className="text-destructive"
            >
              Delete Knowledge Base
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
