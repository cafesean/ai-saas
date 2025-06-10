"use client";

import React, { useState, useMemo } from "react";
import { Route } from "next";
import { useParams } from "next/navigation";
import axios, { AxiosProgressEvent } from "axios";
import { toast } from "sonner";
import {
  Clock,
  Copy,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Maximize,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  Upload,
  User,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, useUtils } from "@/utils/trpc";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { KnowledgeBaseDetailSkeleton } from "@/components/skeletons/knowledge-base-detail-skeleton";
import { AdminRoutes } from "@/constants/routes";
import {
  KnowledgeBaseStatus,
  KnowledgeBaseDocumentStatus,
} from "@/constants/knowledgeBase";
import { getTimeAgo, formatSize } from "@/utils/func";
import { S3_UPLOAD } from "@/constants/general";
import { S3_API, KNOWLEDGE_BASE_API } from "@/constants/api";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { useModalState } from "@/framework/hooks/useModalState";
import KnowledgeBaseSettings from "./components/KnowledgeBaseSettings";
import ChatHistory from "./components/ChatHistory";

// Sample data for a specific knowledge base
const knowledgeBase = {
  id: "kb-1",
  name: "Banking Regulations",
  description: "Saudi Arabia banking regulations and compliance documentation",
  documentCount: 156,
  lastUpdated: "2 days ago",
  status: "Active",
  embeddingModel: "text-embedding-3-small",
  embeddingDimensions: 1536,
  vectorDb: "PostgreSQL",
  creator: "Ahmed Al-Mansouri",
  created: "1 month ago",
  totalTokens: 1254780,
  executions: 3245,
  versions: [
    {
      id: "v1",
      name: "Version 1.0",
      created: "1 month ago",
      documentCount: 120,
      status: "Active",
    },
    {
      id: "v2",
      name: "Version 1.1",
      created: "2 weeks ago",
      documentCount: 156,
      status: "Active",
    },
  ],
  activityLog: [
    {
      id: "act-1",
      action: "Document Added",
      details: "Added 'Saudi Banking Compliance 2023.pdf'",
      user: "Ahmed Al-Mansouri",
      timestamp: "30 days ago",
      version: "v1",
    },
    {
      id: "act-2",
      action: "Embeddings Generated",
      details: "Generated embeddings for 120 documents",
      user: "System",
      timestamp: "30 days ago",
      version: "v1",
    },
    {
      id: "act-3",
      action: "Document Added",
      details: "Added 36 new documents",
      user: "Fatima Al-Zahrani",
      timestamp: "15 days ago",
      version: "v2",
    },
    {
      id: "act-4",
      action: "Embeddings Regenerated",
      details: "Changed embedding model to text-embedding-3-small",
      user: "Mohammed Al-Otaibi",
      timestamp: "10 days ago",
      version: "v2",
    },
    {
      id: "act-5",
      action: "Knowledge Base Queried",
      details: "3245 queries executed",
      user: "Various",
      timestamp: "Ongoing",
      version: "v2",
    },
  ],
};

// Sample chat history
const chatHistory = [
  {
    id: "chat-1",
    title: "Banking regulation compliance",
    date: "2 days ago",
    messageCount: 15,
  },
  {
    id: "chat-2",
    title: "Microfinance lending requirements",
    date: "4 days ago",
    messageCount: 24,
  },
  {
    id: "chat-3",
    title: "Consumer protection questions",
    date: "1 week ago",
    messageCount: 8,
  },
];

export default function KnowledgeBaseDetail() {
  const params = useParams();
  const slug = params.slug as string;

  const router = useRouter();

  const {
    deleteConfirmOpen: openChatConfirmOpen,
    selectedItem: openChatKnowledgeBase,
    openDeleteConfirm: openChatConfirm,
    closeDeleteConfirm: closeOpenChatConfirm,
  } = useModalState<any>();
  // tRPC hooks
  const utils = useUtils();
  const {
    data: knowledgeBaseItem,
    isLoading,
    error,
  } = api.knowledgeBases.getKnowledgeBaseById.useQuery({
    uuid: slug,
  });
  const addKnowledgeBaseDocuments =
    api.knowledgeBases.addKnowledgeBaseDocuments.useMutation({
      onSuccess: () => {
        utils.knowledgeBases.getKnowledgeBaseById.invalidate({ uuid: slug });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  const deleteKnowledgeBaseDocuments =
    api.knowledgeBases.deleteKnowledgeBaseDocuments.useMutation({
      onSuccess: () => {
        utils.knowledgeBases.getKnowledgeBaseById.invalidate({ uuid: slug });
        toast.success("Documents deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  const updateKnowledgeBase =
    api.knowledgeBases.updateKnowledgeBase.useMutation({
      onSuccess: () => {
        utils.knowledgeBases.getKnowledgeBaseById.invalidate({ uuid: slug });
        toast.success("Knowledge base updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isReprocessDialogOpen, setIsReprocessDialogOpen] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [isEmbeddingChangeDialogOpen, setIsEmbeddingChangeDialogOpen] =
    useState(false);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState(
    knowledgeBase.embeddingModel,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const [chunkSize, setChunkSize] = useState<string>("1000");
  const [chunkOverlap, setChunkOverlap] = useState<string>("200");
  const [files, setFiles] = useState<File[]>([]);
  const [deleteingDocuments, setDeleteingDocuments] = useState<boolean>(false);

  // Function to toggle document selection
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId],
    );
  };

  // Function to filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (isLoading) {
      return [];
    }
    if (!searchQuery && knowledgeBaseItem) {
      return knowledgeBaseItem?.documents;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    if (knowledgeBaseItem) {
      return knowledgeBaseItem?.documents.filter((doc: any) =>
        doc.name.toLowerCase().includes(lowerCaseQuery),
      );
    }
    return [];
  }, [searchQuery, knowledgeBaseItem?.documents, isLoading]);

  // Function to open document viewer
  const openDocumentViewer = (document: any) => {
    setSelectedDocument(document);
    setIsDocumentViewerOpen(true);
    setZoomLevel(1);
  };

  // Function to handle document reprocessing
  const handleReprocessDocuments = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    // Download document from s3
  };

  // Function to handle document upload
  const handleUploadDocuments = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep("Preparing documents...");

    // Total size equayl upload and embedding
    const totalSize = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0,
    );
    let uploadedSize = 0;

    const uploadTrackers = files.map((file) => ({
      file,
      uploaded: 0,
      total: file.size,
      path: `${S3_UPLOAD.knowledgebasePath}/${knowledgeBaseItem?.uuid}`,
    }));

    const uploadTasks = uploadTrackers.map((tracker) => {
      const formData = new FormData();
      formData.append("file", tracker.file);
      formData.append("path", tracker.path);

      return axios.post(S3_API.upload, formData, {
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const delta = Math.min(
              progressEvent.loaded - tracker.uploaded,
              tracker.total - tracker.uploaded,
            );

            tracker.uploaded += delta;
            uploadedSize += delta;
            const UPLOAD_PHASE_RATIO = 0.94;
            const overallProgress = Math.min(
              Math.round((uploadedSize / totalSize) * 100 * UPLOAD_PHASE_RATIO),
              94,
            );

            setProcessingProgress(overallProgress);
            updateUploadDocumentStep(overallProgress);
          }
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    });

    try {
      const uploadRes = await Promise.all(uploadTasks);
      const allSuccess = uploadRes.every((result: any) => {
        return result.data.success;
      });
      if (allSuccess) {
        // Do insert documents
        if (knowledgeBaseItem?.uuid) {
          const payload = {
            kbId: knowledgeBaseItem?.uuid,
            chunkSize,
            chunkOverlap,
            documents: uploadRes.map((upload) => ({
              uuid: upload.data.data.uuid,
              name: upload.data.data.originalName,
              size: upload.data.data.size,
              path: upload.data.data.key,
            })),
          };
          const addDocumentsRes = await addKnowledgeBaseDocuments.mutateAsync(
            payload,
          );
          if (addDocumentsRes.success) {
            handleEmbeddingDocument(files, payload);
            simulatePostUploadDocument();
          }
        }
      }
    } catch (error: any) {
      setIsProcessing(false);
      setProcessingStep("Upload failed");
      if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.error);
      } else {
        toast.error(error?.message);
      }
    }
  };

  const handleEmbeddingDocument = async (
    preEmbeddingFiles: any,
    payload: any,
  ) => {
    const embeddingFiles = [...preEmbeddingFiles];
    const embeddingTrackers = embeddingFiles.map((file) => ({
      file,
      uploaded: 0,
      total: file.size,
    }));
    const embeddingTasks = embeddingTrackers.map((tracker, index) => {
      const formData = new FormData();
      formData.append("file", tracker.file);
      formData.append("user_id", process.env.NEXT_PUBLIC_MOCK_USER_ID || "");
      formData.append("kb_id", knowledgeBaseItem?.uuid || "");
      formData.append("document_id", payload.documents[index]?.uuid || "");
      formData.append("chunk_size", payload.chunkSize || "1000");
      formData.append("chunk_overlap", payload.chunkOverlap || "200");

      return axios.post(KNOWLEDGE_BASE_API.embeddingDocument, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    });

    try {
      const embeddingRes = await Promise.all(embeddingTasks);
      const allSuccess = embeddingRes.every((result: any) => {
        return result.data.success;
      });
      if (allSuccess) {
        return true;
      }
    } catch (error) {
      setIsProcessing(false);
      setProcessingStep("Embedding failed");
      throw error;
    }
  };

  const updateUploadDocumentStep = (progress: number) => {
    if (progress < 30) {
      setProcessingStep("Uploading documents...");
    } else if (progress < 60) {
      setProcessingStep("Parsing document content...");
    } else {
      setProcessingStep("Storing in database...");
    }
  };

  const simulatePostUploadDocument = () => {
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          toggleUploadDocuments(false);
          setIsProcessing(false);
          return 100;
        }

        updateUploadDocumentStep(prev);
        return prev + 2;
      });
    }, 200);
  };

  // Click delete for one document
  const handleDeleteOneDocument = async (documentId: string) => {
    setShowDeleteConfirm(true);
    setDocumentsToDelete([documentId]);
  };

  // Function to handle document deletion
  const handleDeleteDocuments = () => {
    setDocumentsToDelete(selectedDocuments);
    setShowDeleteConfirm(true);
  };

  // Function to confirm document deletion
  const confirmDeleteDocuments = async () => {
    if (documentsToDelete.length > 0) {
      setShowDeleteConfirm(false);
      setDeleteingDocuments(true);
      // Delete document
      try {
        // Get delete keys
        const documentsKeysToDelete = documentsToDelete.map((documentId) => {
          const document = knowledgeBaseItem?.documents.find(
            (doc: any) => doc.uuid === documentId,
          );
          return document?.path;
        });

        // Delete from s3
        const deleteDocuments = await axios.delete(S3_API.delete, {
          data: {
            keys: documentsKeysToDelete,
          },
        });
        if (deleteDocuments.data.success) {
          // Delete embedding
          const deleteEmbeddings = await axios.delete(
            KNOWLEDGE_BASE_API.embeddingDocument,
            {
              data: {
                kbId: knowledgeBaseItem?.uuid,
                documents: documentsToDelete,
              },
            },
          );
          if (deleteEmbeddings.data.success) {
            await deleteKnowledgeBaseDocuments.mutate({
              kbId: knowledgeBaseItem!.uuid,
              documents: documentsToDelete,
            });
          }
        }
      } catch (error: any) {
        setIsProcessing(false);
        setDeleteingDocuments(false);
        if (error?.response?.status === 400) {
          toast.error(error?.response?.data?.error);
        } else {
          toast.error(error?.message);
        }
      }
    }

    // Reset state
    setSelectedDocuments([]);
    setDocumentsToDelete([]);
    setDeleteingDocuments(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const toggleUploadDocuments = (open: boolean) => {
    setIsUploadDialogOpen(open);
    if (!open) {
      setFiles([]);
      setIsProcessing(false);
      setChunkSize("1000");
      setChunkOverlap("200");
    }
  };

  const handleClickChatWithKB = () => {
    const processingDocuments = knowledgeBaseItem?.documents.filter(
      (doc: any) => doc.status === KnowledgeBaseDocumentStatus.processing,
    );
    if (processingDocuments && processingDocuments?.length > 0) {
      openChatConfirm(knowledgeBaseItem);
    } else {
      router.push(
        AdminRoutes.knowledgebaseChat.replace(
          ":uuid",
          knowledgeBaseItem?.uuid || "",
        ) as Route,
      );
    }
  };

  const confirmOpenChat = async () => {
    closeOpenChatConfirm();
    router.push(
      AdminRoutes.knowledgebaseChat.replace(
        ":uuid",
        openChatKnowledgeBase.uuid || "",
      ) as Route,
    );
  };

  const handleUpdateKB = async (data: any) => {
    try {
      const payload = {
        ...data,
        uuid: knowledgeBaseItem?.uuid,
      };
      const updateRes = await updateKnowledgeBase.mutateAsync(payload);
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.error);
      }
    }
  };

  return (
    <div className="flex w-full flex-col bg-background animate-fade-in">
      {!isLoading ? (
        <>
          <Breadcrumbs
            items={[
              {
                label: "Back to Knowledge Bases",
                link: AdminRoutes.knowledgebase,
              },
            ]}
            title={knowledgeBaseItem?.name}
            badge={
              <Badge
                variant={
                  knowledgeBaseItem?.status === KnowledgeBaseStatus.draft
                    ? "default"
                    : knowledgeBaseItem?.status === KnowledgeBaseStatus.ready
                    ? "secondary"
                    : "outline"
                }
              >
                {knowledgeBaseItem?.status}
              </Badge>
            }
            rightChildren={
              <>
                <SampleButton variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </SampleButton>
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Refresh knowledge base
                    utils.knowledgeBases.getKnowledgeBaseById.refetch();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </SampleButton>
                <SampleButton onClick={handleClickChatWithKB}>
                  {/* Use resolved kbId */}
                  Chat with KB
                </SampleButton>
              </>
            }
          />
          <div className="border-b bg-muted/40">
            <div className="container py-4 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {knowledgeBaseItem?.name}
                    </h2>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {knowledgeBaseItem?.documents.length} documents • Created{" "}
                    {getTimeAgo(knowledgeBaseItem?.createdAt || new Date())}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SampleButton variant="outline">
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Actions
                      </SampleButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Clock className="mr-2 h-4 w-4" />
                        Version History
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem
                        onClick={() => setIsReprocessDialogOpen(true)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reprocess Documents
                      </DropdownMenuItem> */}
                      {/* <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Knowledge Base
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Dialog
                    open={isUploadDialogOpen}
                    onOpenChange={toggleUploadDocuments}
                  >
                    <DialogTrigger asChild>
                      <SampleButton>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Documents
                      </SampleButton>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Upload Documents</DialogTitle>
                        <DialogDescription>
                          Upload documents to your knowledge base for
                          vectorization.
                        </DialogDescription>
                      </DialogHeader>
                      {isProcessing ? (
                        <div className="py-6 space-y-4">
                          <div className="text-center">
                            <h3 className="text-lg font-medium mb-2">
                              Processing Documents
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {processingStep}
                            </p>
                          </div>
                          <Progress
                            value={processingProgress}
                            className="w-full"
                          />
                          <p className="text-sm text-center text-muted-foreground">
                            {processingProgress}% complete
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label>Knowledge Base</Label>
                              <div className="p-3 border rounded-md bg-muted/20">
                                <div className="font-medium">
                                  {knowledgeBaseItem?.name}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {knowledgeBaseItem?.documents.length}{" "}
                                  documents •{" "}
                                  {knowledgeBaseItem?.embeddingModel}
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <Label>Files</Label>
                              <div className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                                <input
                                  type="file"
                                  id="file-upload"
                                  className="hidden"
                                  multiple
                                  accept=".txt,.pdf,.docx,.md,.csv"
                                  onChange={handleFileChange}
                                />
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PDF, DOCX, TXT, MD and CSV files supported
                                  (max 50MB)
                                </p>
                                {files.length > 0 ? (
                                  <div className="mt-4 text-sm text-left">
                                    <p className="font-medium">
                                      Selected files:
                                    </p>
                                    <ul className="list-disc pl-5 mt-1">
                                      {files.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <SampleButton
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => {
                                      const fileInput = document.getElementById(
                                        "file-upload",
                                      ) as HTMLInputElement;
                                      if (fileInput) {
                                        fileInput.click();
                                      }
                                    }}
                                  >
                                    Browse Files
                                  </SampleButton>
                                )}
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="chunk-size">Chunk Size</Label>
                              <SampleInput
                                id="chunk-size"
                                value={chunkSize}
                                onChange={(e) => {
                                  if (
                                    (e.target.value &&
                                      !isNaN(parseFloat(e.target.value)) &&
                                      isFinite(Number(e.target.value))) ||
                                    !e.target.value
                                  ) {
                                    setChunkSize(e.target.value);
                                  }
                                }}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Number of characters per chunk. Larger chunks
                                provide more context but may be less precise.
                              </p>
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="chunk-overlap">
                                Chunk Overlap
                              </Label>
                              <SampleInput
                                id="chunk-overlap"
                                value={chunkOverlap}
                                onChange={(e) => {
                                  if (
                                    (e.target.value &&
                                      !isNaN(parseFloat(e.target.value)) &&
                                      isFinite(Number(e.target.value))) ||
                                    !e.target.value
                                  ) {
                                    setChunkOverlap(e.target.value);
                                  }
                                }}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Number of characters that overlap between chunks
                                to maintain context.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <SampleButton
                              variant="outline"
                              onClick={() => toggleUploadDocuments(false)}
                            >
                              Cancel
                            </SampleButton>
                            <SampleButton onClick={handleUploadDocuments}>
                              Upload & Process
                            </SampleButton>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 container py-6 space-y-8">
            <Tabs defaultValue="documents">
              <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-none md:flex">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="chat-history">Chat History</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <SampleInput
                      type="search"
                      placeholder="Search documents..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <SampleButton variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </SampleButton>
                    {selectedDocuments.length > 0 && (
                      <SampleButton
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteDocuments}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedDocuments.length})
                      </SampleButton>
                    )}
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={
                              selectedDocuments.length ===
                                filteredDocuments.length &&
                              filteredDocuments.length > 0
                            }
                            onChange={() => {
                              if (
                                selectedDocuments.length ===
                                filteredDocuments.length
                              ) {
                                setSelectedDocuments([]);
                              } else {
                                setSelectedDocuments(
                                  filteredDocuments.map((doc: any) => doc.uuid),
                                );
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((document: any) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium w-12">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={selectedDocuments.includes(
                                document.uuid,
                              )}
                              onChange={() =>
                                toggleDocumentSelection(document.uuid)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {document.name}
                          </TableCell>
                          <TableCell>{document.status}</TableCell>
                          <TableCell>{formatSize(document.size)}</TableCell>
                          <TableCell>
                            {getTimeAgo(document.updatedAt || new Date())}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SampleButton
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </SampleButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openDocumentViewer(document)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Regenerate Embeddings
                                </DropdownMenuItem> */}
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive cursor-pointer"
                                  onClick={() => {
                                    handleDeleteOneDocument(document.uuid);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredDocuments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            No documents found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="chat-history" className="space-y-6 pt-4">
                <ChatHistory
                  slug={knowledgeBaseItem?.uuid}
                  chatHistory={knowledgeBaseItem?.conversations}
                />
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                      History of changes and operations on this knowledge base
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {knowledgeBase.activityLog.map((activity, index) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            {activity.action === "Document Added" && (
                              <FileText className="h-5 w-5 text-primary" />
                            )}
                            {activity.action === "Embeddings Generated" && (
                              <Database className="h-5 w-5 text-primary" />
                            )}
                            {activity.action === "Embeddings Regenerated" && (
                              <RefreshCw className="h-5 w-5 text-primary" />
                            )}
                            {activity.action === "Knowledge Base Queried" && (
                              <Search className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.action}</h4>
                              <Badge variant="outline">
                                {activity.version}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.details}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{activity.user}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{activity.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 pt-4">
                <KnowledgeBaseSettings
                  knowledgeBaseItem={knowledgeBaseItem}
                  handleUpdateKB={handleUpdateKB}
                />
              </TabsContent>
            </Tabs>
          </main>

          {/* Document Viewer Dialog */}
          <Dialog
            open={isDocumentViewerOpen}
            onOpenChange={setIsDocumentViewerOpen}
          >
            <DialogContent className="sm:max-w-[90%] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{selectedDocument?.name}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {selectedDocument?.type} • {selectedDocument?.size} •{" "}
                    {selectedDocument?.chunks} chunks
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SampleButton
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setZoomLevel((prev) => Math.max(0.5, prev - 0.1))
                    }
                  >
                    <ZoomOut className="h-4 w-4" />
                  </SampleButton>
                  <SampleButton
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel(1)}
                  >
                    <Maximize className="h-4 w-4" />
                  </SampleButton>
                  <SampleButton
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel((prev) => prev + 0.1)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </SampleButton>
                </div>
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDocumentViewerOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </SampleButton>
              </div>
              <div
                className="overflow-auto"
                style={{
                  transformOrigin: "top left",
                  transform: `scale(${zoomLevel})`,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedDocument?.content}
              </div>
            </DialogContent>
          </Dialog>

          {/* Reprocess Documents Dialog */}
          <Dialog
            open={isReprocessDialogOpen}
            onOpenChange={setIsReprocessDialogOpen}
          >
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Reprocess Documents</DialogTitle>
                <DialogDescription>
                  Reprocessing will re-chunk and re-embed all documents in this
                  knowledge base. This may take some time.
                </DialogDescription>
              </DialogHeader>
              {isProcessing ? (
                <div className="py-6 space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">
                      Reprocessing Documents
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
                <DialogFooter>
                  <SampleButton
                    variant="outline"
                    onClick={() => setIsReprocessDialogOpen(false)}
                  >
                    Cancel
                  </SampleButton>
                  <SampleButton onClick={handleReprocessDocuments}>
                    Reprocess
                  </SampleButton>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Delete Confirmation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the selected documents?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <SampleButton
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </SampleButton>
                <SampleButton
                  variant="destructive"
                  onClick={confirmDeleteDocuments}
                >
                  Delete
                </SampleButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Open Chat confirm */}
          <Dialog
            open={openChatConfirmOpen}
            onOpenChange={closeOpenChatConfirm}
          >
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">
                  Open Knowledge Base Chat
                </DialogTitle>
              </DialogHeader>
              <DialogDescription />
              <div className="modal-section">
                <p className="modal-text">
                  Still have documents under processing. Are you sure you want
                  to open this knowledge base's chat?
                </p>
              </div>
              <DialogFooter className="modal-footer">
                <SampleButton
                  type="button"
                  variant="secondary"
                  className="modal-button"
                  onClick={() => closeOpenChatConfirm()}
                >
                  Cancel
                </SampleButton>
                <SampleButton
                  type="button"
                  variant="default"
                  className="modal-button"
                  onClick={confirmOpenChat}
                >
                  Open
                </SampleButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <KnowledgeBaseDetailSkeleton />
      )}
      {(deleteingDocuments || updateKnowledgeBase.isPending) && (
        <FullScreenLoading />
      )}
    </div>
  );
}
