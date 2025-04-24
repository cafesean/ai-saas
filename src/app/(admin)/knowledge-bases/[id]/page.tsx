"use client";

import { Route } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewToggle } from "@/components/view-toggle";
import {
  Activity,
  ArrowLeft,
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
  SquarePen,
  Trash2,
  Upload,
  User,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react"; // Import React and combine useState

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

// Sample documents in this knowledge base
const documents = [
  {
    id: "doc-1",
    name: "Saudi Banking Compliance 2023.pdf",
    size: "4.2 MB",
    status: "Processed",
    uploadDate: "30 days ago",
    chunks: 218,
    type: "PDF",
    content:
      "This is a sample content of the Saudi Banking Compliance 2023 document...",
    usedIn: ["Banking Regulations KB", "Compliance Documentation KB"],
    versions: [
      { id: "v1", date: "30 days ago", size: "4.2 MB" },
      { id: "v2", date: "15 days ago", size: "4.3 MB" },
    ],
  },
  {
    id: "doc-2",
    name: "Regulatory Framework Overview.docx",
    size: "1.8 MB",
    status: "Processed",
    uploadDate: "30 days ago",
    chunks: 142,
    type: "DOCX",
    content:
      "This is a sample content of the Regulatory Framework Overview document...",
    usedIn: ["Banking Regulations KB"],
    versions: [{ id: "v1", date: "30 days ago", size: "1.8 MB" }],
  },
  {
    id: "doc-3",
    name: "Microfinance Guidelines.pdf",
    size: "2.1 MB",
    status: "Processed",
    uploadDate: "15 days ago",
    chunks: 176,
    type: "PDF",
    content:
      "This is a sample content of the Microfinance Guidelines document...",
    usedIn: ["Banking Regulations KB", "Microfinance KB"],
    versions: [{ id: "v1", date: "15 days ago", size: "2.1 MB" }],
  },
  {
    id: "doc-4",
    name: "Capital Requirements Rules.pdf",
    size: "3.5 MB",
    status: "Processed",
    uploadDate: "10 days ago",
    chunks: 287,
    type: "PDF",
    content:
      "This is a sample content of the Capital Requirements Rules document...",
    usedIn: ["Banking Regulations KB", "Capital Requirements KB"],
    versions: [{ id: "v1", date: "10 days ago", size: "3.5 MB" }],
  },
  {
    id: "doc-5",
    name: "Consumer Protection Guidelines.docx",
    size: "1.2 MB",
    status: "Processed",
    uploadDate: "5 days ago",
    chunks: 98,
    type: "DOCX",
    content:
      "This is a sample content of the Consumer Protection Guidelines document...",
    usedIn: ["Banking Regulations KB", "Consumer Protection KB"],
    versions: [{ id: "v1", date: "5 days ago", size: "1.2 MB" }],
  },
  {
    id: "doc-6",
    name: "Anti-Money Laundering Rules.pdf",
    size: "5.7 MB",
    status: "Processing",
    uploadDate: "2 days ago",
    chunks: 0,
    type: "PDF",
    content:
      "This is a sample content of the Anti-Money Laundering Rules document...",
    usedIn: ["Banking Regulations KB"],
    versions: [{ id: "v1", date: "2 days ago", size: "5.7 MB" }],
  },
];

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

// Sample embedding models
const embeddingModels = [
  {
    id: "text-embedding-3-small",
    name: "text-embedding-3-small",
    dimensions: 1536,
    description: "Efficient embedding model with 1536 dimensions",
    provider: "OpenAI",
  },
  {
    id: "text-embedding-3-large",
    name: "text-embedding-3-large",
    dimensions: 3072,
    description: "High-quality embedding model with 3072 dimensions",
    provider: "OpenAI",
  },
  {
    id: "text-embedding-ada-002",
    name: "text-embedding-ada-002",
    dimensions: 1536,
    description: "Legacy embedding model with 1536 dimensions",
    provider: "OpenAI",
  },
];

export default function KnowledgeBaseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Assume params is Promise
  // Resolve params
  const resolvedParams = React.use(params);
  const kbId = resolvedParams.id; // Use resolved ID

  const router = useRouter();
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
  const [viewMode, setViewMode] = useState<any>("list");

  // Function to toggle document selection
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId],
    );
  };

  // Function to filter documents based on search query
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
    setProcessingStep("Initializing reprocessing...");

    // Simulate the reprocessing
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsReprocessDialogOpen(false);
          return 100;
        }

        // Update the processing step based on progress
        if (prev < 20) {
          setProcessingStep("Preparing documents for reprocessing...");
        } else if (prev < 40) {
          setProcessingStep("Updating embedding model...");
        } else if (prev < 60) {
          setProcessingStep("Generating new embeddings...");
        } else if (prev < 80) {
          setProcessingStep("Storing in vector database...");
        } else {
          setProcessingStep("Finalizing reprocessing...");
        }

        return prev + 2;
      });
    }, 100);
  };

  // Function to handle document upload
  const handleUploadDocuments = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep("Preparing documents...");

    // Simulate the upload and processing
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsUploadDialogOpen(false);
          return 100;
        }

        // Update the processing step based on progress
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

  // Function to handle document deletion
  const handleDeleteDocuments = () => {
    setDocumentsToDelete(selectedDocuments);
    setShowDeleteConfirm(true);
  };

  // Function to confirm document deletion
  const confirmDeleteDocuments = () => {
    // In a real app, this would delete the documents
    console.log("Deleting documents:", documentsToDelete);

    // Reset state
    setSelectedDocuments([]);
    setDocumentsToDelete([]);
    setShowDeleteConfirm(false);
  };

  // Get grid class based on view mode
  const getGridClass = () => {
    switch (viewMode) {
      case "large-grid":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";
      case "medium-grid":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "list":
        return "grid-cols-1";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/knowledge-bases"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Knowledge Bases</span>
        </Link>
        <h1 className="text-xl font-semibold">
          Knowledge Base: {knowledgeBase.name}
        </h1>
        <Badge
          variant={knowledgeBase.status === "Active" ? "default" : "secondary"}
          className="ml-2"
        >
          {knowledgeBase.status}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <SampleButton variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </SampleButton>
          <SampleButton variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </SampleButton>
          <SampleButton asChild>
            {/* Use resolved kbId */}
            <Link href={`/knowledge-bases/${kbId}/chat`}>Chat with KB</Link>
          </SampleButton>
        </div>
      </header>

      <div className="border-b bg-muted/40">
        <div className="container py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{knowledgeBase.name}</h2>
              </div>
              <div className="text-muted-foreground mt-1">
                {knowledgeBase.documentCount} documents •{" "}
                {knowledgeBase.totalTokens.toLocaleString()} tokens •
                {knowledgeBase.executions.toLocaleString()} executions • Created{" "}
                {knowledgeBase.created}
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
                    <SquarePen className="mr-2 h-4 w-4" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Clock className="mr-2 h-4 w-4" />
                    Version History
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsReprocessDialogOpen(true)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reprocess Documents
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Knowledge Base
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
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
                      Upload documents to your knowledge base for vectorization.
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
                      <Progress value={processingProgress} className="w-full" />
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
                              {knowledgeBase.name}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {knowledgeBase.documentCount} documents •{" "}
                              {knowledgeBase.embeddingModel}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Files</Label>
                          <div className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF, DOCX, TXT, MD and CSV files supported (max
                              50MB)
                            </p>
                            <SampleButton
                              variant="outline"
                              size="sm"
                              className="mt-4"
                            >
                              Select Files
                            </SampleButton>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="chunk-size">Chunk Size</Label>
                          <Input id="chunk-size" defaultValue="1000" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Number of characters per chunk. Larger chunks
                            provide more context but may be less precise.
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="chunk-overlap">Chunk Overlap</Label>
                          <Input id="chunk-overlap" defaultValue="200" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Number of characters that overlap between chunks to
                            maintain context.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <SampleButton
                          variant="outline"
                          onClick={() => setIsUploadDialogOpen(false)}
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
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <ViewToggle viewMode={viewMode} onChange={setViewMode} />
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
                              filteredDocuments.map((doc) => doc.id),
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
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium w-12">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedDocuments.includes(document.id)}
                          onChange={() => toggleDocumentSelection(document.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {document.name}
                      </TableCell>
                      <TableCell>{document.status}</TableCell>
                      <TableCell>{document.size}</TableCell>
                      <TableCell>{document.uploadDate}</TableCell>
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
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerate Embeddings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
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
            <div className="grid gap-4">
              {chatHistory.map((chat) => (
                <Card key={chat.id}>
                  <CardHeader>
                    <CardTitle>{chat.title}</CardTitle>
                    <CardDescription>
                      {chat.messageCount} messages • {chat.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SampleButton asChild variant="link">
                      {/* Use resolved kbId */}
                      <Link
                        href={
                          `/knowledge-bases/${kbId}/chat/${chat.id}` as Route
                        }
                      >
                        View Chat
                      </Link>
                    </SampleButton>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                          <Badge variant="outline">{activity.version}</Badge>
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
                        <Input
                          type="text"
                          value={knowledgeBase.name}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          type="text"
                          value={knowledgeBase.description}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Status</Label>
                        <Input
                          type="text"
                          value={knowledgeBase.status}
                          className="mt-1"
                          disabled
                        />
                      </div>
                      <div>
                        <Label>Created By</Label>
                        <Input
                          type="text"
                          value={knowledgeBase.creator}
                          className="mt-1"
                          disabled
                        />
                      </div>
                      <div>
                        <Label>Created Date</Label>
                        <Input
                          type="text"
                          value={knowledgeBase.created}
                          className="mt-1"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <SampleButton>Save Changes</SampleButton>
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
                          {knowledgeBase.embeddingModel}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {knowledgeBase.embeddingDimensions} dimensions
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="embedding-model">
                        Change Embedding Model
                      </Label>
                      <Select
                        value={selectedEmbeddingModel}
                        onValueChange={(value) => {
                          setSelectedEmbeddingModel(value);
                          if (value !== knowledgeBase.embeddingModel) {
                            setIsEmbeddingChangeDialogOpen(true);
                          }
                        }}
                      >
                        <SelectTrigger id="embedding-model">
                          <SelectValue placeholder="Select embedding model" />
                        </SelectTrigger>
                        <SelectContent>
                          {embeddingModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name} ({model.dimensions} dimensions)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Changing the embedding model will require regenerating
                        all embeddings.
                      </p>
                    </div>

                    <div className="flex justify-end mt-4">
                      <SampleButton>Save Changes</SampleButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                      {knowledgeBase.embeddingModel}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {knowledgeBase.embeddingDimensions} dimensions
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>New Model</Label>
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="font-medium">{selectedEmbeddingModel}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {
                        embeddingModels.find(
                          (m) => m.id === selectedEmbeddingModel,
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
                      {knowledgeBase.documentCount} documents in this knowledge
                      base. This may take some time and will update the vector
                      database.
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <SampleButton
                  variant="outline"
                  onClick={() => {
                    setIsEmbeddingChangeDialogOpen(false);
                    setSelectedEmbeddingModel(knowledgeBase.embeddingModel);
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
    </div>
  );
}
