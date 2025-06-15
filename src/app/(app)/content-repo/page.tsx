"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Upload,
  MoreHorizontal,
  RefreshCw,
  Settings,
  FileText,
  Copy,
  Trash2,
  Filter,
  Download,
  Eye,
  Share2,
  Clock,
  Tag,
  Folder,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  FileStack,
  Globe,
  Database,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SampleButton } from "@/components/ui/sample-button";
import { SampleInput } from "@/components/ui/sample-input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { ViewToggle } from "@/components/view-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SampleCheckbox } from "@/components/ui/sample-checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for document categories
const contentCategories = [
  { id: "cat-1", name: "Banking Regulations", count: 156 },
  { id: "cat-2", name: "Loan Processing", count: 78 },
  { id: "cat-3", name: "Customer Service", count: 42 },
  { id: "cat-4", name: "Credit Risk", count: 124 },
  { id: "cat-5", name: "Compliance", count: 93 },
  { id: "cat-6", name: "Web Content", count: 35 },
];

// Sample data for document tags
const documentTags = [
  { id: "tag-1", name: "Regulations", count: 210 },
  { id: "tag-2", name: "Guidelines", count: 145 },
  { id: "tag-3", name: "Procedures", count: 87 },
  { id: "tag-4", name: "Policies", count: 112 },
  { id: "tag-5", name: "Reports", count: 64 },
];

// Sample data for content types
const contentTypes = [
  { id: "type-1", name: "PDF", count: 4 },
  { id: "type-2", name: "DOCX", count: 2 },
  { id: "type-3", name: "XLSX", count: 1 },
  { id: "type-4", name: "URL", count: 3 },
  { id: "type-5", name: "TXT", count: 0 },
];

// Sample data for content items
const contentItems = [
  {
    id: "doc-1",
    name: "Saudi Banking Compliance 2023.pdf",
    description:
      "Comprehensive guide to banking compliance regulations in Saudi Arabia for 2023",
    size: "4.2 MB",
    status: "Processed",
    uploadDate: "30 days ago",
    uploadedBy: "Ahmed Al-Mansouri",
    lastModified: "15 days ago",
    type: "PDF",
    contentType: "Document",
    version: "1.2",
    category: "Banking Regulations",
    tags: ["Regulations", "Compliance"],
    usedIn: [
      { id: "kb-1", name: "Banking Regulations KB", type: "Knowledge Base" },
      {
        id: "kb-2",
        name: "Compliance Documentation KB",
        type: "Knowledge Base",
      },
    ],
    accessLevel: "Organization",
  },
  {
    id: "doc-2",
    name: "Regulatory Framework Overview.docx",
    description:
      "Overview of the regulatory framework for financial institutions",
    size: "1.8 MB",
    status: "Processed",
    uploadDate: "30 days ago",
    uploadedBy: "Fatima Al-Zahrani",
    lastModified: "30 days ago",
    type: "DOCX",
    contentType: "Document",
    version: "1.0",
    category: "Banking Regulations",
    tags: ["Regulations", "Framework"],
    usedIn: [
      { id: "kb-1", name: "Banking Regulations KB", type: "Knowledge Base" },
    ],
    accessLevel: "Organization",
  },
  {
    id: "doc-3",
    name: "Microfinance Guidelines.pdf",
    description: "Guidelines for microfinance operations and loan processing",
    size: "2.1 MB",
    status: "Processed",
    uploadDate: "15 days ago",
    uploadedBy: "Mohammed Al-Otaibi",
    lastModified: "15 days ago",
    type: "PDF",
    contentType: "Document",
    version: "1.0",
    category: "Loan Processing",
    tags: ["Guidelines", "Microfinance"],
    usedIn: [
      { id: "kb-1", name: "Banking Regulations KB", type: "Knowledge Base" },
      { id: "kb-3", name: "Microfinance KB", type: "Knowledge Base" },
    ],
    accessLevel: "Organization",
  },
  {
    id: "url-1",
    name: "Central Bank Regulations Website",
    description: "Official website of the Central Bank with latest regulations",
    url: "https://centralbank.sa/regulations",
    status: "Processed",
    uploadDate: "5 days ago",
    uploadedBy: "Saeed Al-Ghamdi",
    lastModified: "5 days ago",
    type: "URL",
    contentType: "Website",
    version: "1.1",
    category: "Banking Regulations",
    tags: ["Regulations", "Official Source"],
    usedIn: [
      { id: "kb-1", name: "Banking Regulations KB", type: "Knowledge Base" },
      {
        id: "kb-2",
        name: "Compliance Documentation KB",
        type: "Knowledge Base",
      },
    ],
    accessLevel: "Organization",
  },
  {
    id: "url-2",
    name: "Financial Services Authority Guidelines",
    description: "Guidelines for financial services providers",
    url: "https://fsa.sa/guidelines",
    status: "Processed",
    uploadDate: "7 days ago",
    uploadedBy: "Layla Al-Shamsi",
    lastModified: "7 days ago",
    type: "URL",
    contentType: "Website",
    version: "1.0",
    category: "Compliance",
    tags: ["Guidelines", "Compliance"],
    usedIn: [
      {
        id: "kb-2",
        name: "Compliance Documentation KB",
        type: "Knowledge Base",
      },
    ],
    accessLevel: "Organization",
  },
  {
    id: "doc-4",
    name: "Capital Requirements Rules.pdf",
    description:
      "Rules and regulations regarding capital requirements for financial institutions",
    size: "3.5 MB",
    status: "Processed",
    uploadDate: "10 days ago",
    uploadedBy: "Saeed Al-Ghamdi",
    lastModified: "10 days ago",
    type: "PDF",
    contentType: "Document",
    version: "1.0",
    category: "Banking Regulations",
    tags: ["Regulations", "Capital"],
    usedIn: [
      { id: "kb-1", name: "Banking Regulations KB", type: "Knowledge Base" },
      { id: "kb-4", name: "Capital Requirements KB", type: "Knowledge Base" },
    ],
    accessLevel: "Organization",
  },
  {
    id: "doc-5",
    name: "Consumer Protection Guidelines.docx",
    description: "Guidelines for consumer protection in financial services",
    size: "1.2 MB",
    status: "Processed",
    uploadDate: "5 days ago",
    uploadedBy: "Aisha Al-Farsi",
    lastModified: "5 days ago",
    type: "DOCX",
    contentType: "Document",
    version: "1.0",
    category: "Customer Service",
    tags: ["Guidelines", "Consumer Protection"],
    usedIn: [
      { id: "kb-1", name: "Banking Regulations KB", type: "Knowledge Base" },
      { id: "kb-5", name: "Consumer Protection KB", type: "Knowledge Base" },
    ],
    accessLevel: "Organization",
  },
  {
    id: "url-3",
    name: "Banking Industry News Portal",
    description: "Latest news and updates in the banking industry",
    url: "https://bankingnews.sa",
    status: "Processing",
    uploadDate: "1 day ago",
    uploadedBy: "Khalid Al-Harbi",
    lastModified: "1 day ago",
    type: "URL",
    contentType: "Website",
    version: "1.0",
    category: "Banking Regulations",
    tags: ["News", "Updates"],
    usedIn: [],
    accessLevel: "Organization",
  },
  {
    id: "doc-6",
    name: "Anti-Money Laundering Rules.pdf",
    description: "Rules and procedures for anti-money laundering compliance",
    size: "5.7 MB",
    status: "Processing",
    uploadDate: "2 days ago",
    uploadedBy: "Khalid Al-Harbi",
    lastModified: "2 days ago",
    type: "PDF",
    contentType: "Document",
    version: "1.0",
    category: "Compliance",
    tags: ["Regulations", "AML"],
    usedIn: [
      { id: "kb-1", name: "Banking Regulations KB", type: "Knowledge Base" },
    ],
    accessLevel: "Organization",
  },
  {
    id: "doc-7",
    name: "Credit Scoring Methodology.xlsx",
    description: "Detailed methodology for credit risk assessment and scoring",
    size: "3.2 MB",
    status: "Processed",
    uploadDate: "7 days ago",
    uploadedBy: "Nasser Al-Qahtani",
    lastModified: "7 days ago",
    type: "XLSX",
    contentType: "Document",
    version: "1.1",
    category: "Credit Risk",
    tags: ["Methodology", "Credit"],
    usedIn: [
      { id: "kb-4", name: "Credit Risk KB", type: "Knowledge Base" },
      { id: "model-1", name: "Credit Risk Model", type: "Model" },
    ],
    accessLevel: "Group",
  },
  {
    id: "doc-8",
    name: "Customer Onboarding Process.pdf",
    description:
      "End-to-end process for customer onboarding in banking services",
    size: "2.8 MB",
    status: "Processed",
    uploadDate: "12 days ago",
    uploadedBy: "Layla Al-Shamsi",
    lastModified: "12 days ago",
    type: "PDF",
    contentType: "Document",
    version: "1.0",
    category: "Customer Service",
    tags: ["Procedures", "Onboarding"],
    usedIn: [
      { id: "kb-5", name: "Customer Service KB", type: "Knowledge Base" },
      {
        id: "workflow-1",
        name: "Customer Onboarding Workflow",
        type: "Workflow",
      },
    ],
    accessLevel: "Organization",
  },
];

// Sample data for knowledge bases
const knowledgeBases = [
  { id: "kb-1", name: "Banking Regulations KB", count: 6 },
  { id: "kb-2", name: "Compliance Documentation KB", count: 3 },
  { id: "kb-3", name: "Microfinance KB", count: 1 },
  { id: "kb-4", name: "Credit Risk KB", count: 2 },
  { id: "kb-5", name: "Customer Service KB", count: 2 },
];

export default function DocumentRepositoryPage() {
  const router = useRouter();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<any>("list");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<
    string | null
  >(null);

  // Filter content items based on search query, category, tags, and knowledge base
  const filteredContentItems = contentItems.filter(
    (item) =>
      (searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === null || item.category === selectedCategory) &&
      (selectedTags.length === 0 ||
        selectedTags.some((tag) => item.tags.includes(tag))) &&
      (selectedKnowledgeBase === null ||
        item.usedIn.some((usage) => usage.id === selectedKnowledgeBase)),
  );

  // Toggle document selection
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId],
    );
  };

  // Select all documents
  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredContentItems.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredContentItems.map((doc) => doc.id));
    }
  };

  // Handle document upload
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
          setProcessingStep("Extracting metadata...");
        } else if (prev < 80) {
          setProcessingStep("Indexing content...");
        } else {
          setProcessingStep("Finalizing...");
        }

        return prev + 2;
      });
    }, 100);
  };

  // Handle document deletion
  const handleDeleteDocuments = () => {
    // In a real app, this would delete the documents
    console.log("Deleting documents:", selectedDocuments);
    setIsDeleteConfirmOpen(false);
    setSelectedDocuments([]);
  };

  // Open document viewer
  const openDocumentViewer = (document: any) => {
    setSelectedDocument(document);
    setIsDocumentViewerOpen(true);
    setZoomLevel(1);
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    // In a real app, this would add a new tag
    console.log("Adding new tag:", newTagName);
    setIsTagDialogOpen(false);
    setNewTagName("");
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    // In a real app, this would add a new category
    console.log("Adding new category:", newCategoryName);
    setIsCategoryDialogOpen(false);
    setNewCategoryName("");
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
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-xl font-semibold">Content Repository</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <SampleButton variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </SampleButton>
          <SampleButton variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </SampleButton>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Content Repository
            </h2>
            <p className="text-muted-foreground">
              Centralized repository for all content used across knowledge
              bases, models, and workflows
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <SampleInput
                type="search"
                placeholder="Search documents..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ViewToggle viewMode={viewMode} onChange={setViewMode} />

            <Dialog
              open={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
            >
              <DialogTrigger asChild>
                <SampleButton>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Content
                </SampleButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Upload Content</DialogTitle>
                  <DialogDescription>
                    Upload documents or add website URLs to the central
                    repository.
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
                    <Tabs defaultValue="document">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="document">Document</TabsTrigger>
                        <TabsTrigger value="url">Website URL</TabsTrigger>
                      </TabsList>

                      <TabsContent value="document">
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Files</Label>
                            <div className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, DOCX, XLSX, TXT, MD and CSV files supported
                                (max 50MB)
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
                            <Label htmlFor="doc-category">Category</Label>
                            <Select>
                              <SelectTrigger id="doc-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {contentCategories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="doc-tags">Tags</Label>
                            <Select>
                              <SelectTrigger id="doc-tags">
                                <SelectValue placeholder="Select tags" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTags.map((tag) => (
                                  <SelectItem
                                    key={tag.id}
                                    value={tag.id.toString()}
                                  >
                                    {tag.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="doc-access">Access Level</Label>
                            <Select defaultValue="organization">
                              <SelectTrigger id="doc-access">
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="organization">
                                  Organization
                                </SelectItem>
                                <SelectItem value="group">Group</SelectItem>
                                <SelectItem value="role">Role</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              Controls who can access and use this content
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="url">
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="url">Website URL</Label>
                            <SampleInput
                              id="url"
                              placeholder="https://example.com"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter the full URL including https://
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="url-name">Name</Label>
                            <SampleInput
                              id="url-name"
                              placeholder="Enter a descriptive name for this URL"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="url-description">Description</Label>
                            <Textarea
                              id="url-description"
                              placeholder="Enter a description"
                              rows={2}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="url-category">Category</Label>
                            <Select>
                              <SelectTrigger id="url-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {contentCategories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="url-tags">Tags</Label>
                            <Select>
                              <SelectTrigger id="url-tags">
                                <SelectValue placeholder="Select tags" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTags.map((tag) => (
                                  <SelectItem
                                    key={tag.id}
                                    value={tag.id.toString()}
                                  >
                                    {tag.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="url-access">Access Level</Label>
                            <Select defaultValue="organization">
                              <SelectTrigger id="url-access">
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="organization">
                                  Organization
                                </SelectItem>
                                <SelectItem value="group">Group</SelectItem>
                                <SelectItem value="role">Role</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted ${
                    selectedCategory === null ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <div className="flex items-center">
                    <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>All Categories</span>
                  </div>
                  <Badge variant="outline">{contentItems.length}</Badge>
                </div>
                {contentCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted ${
                      selectedCategory === category.name ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="flex items-center">
                      <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                ))}
                <SampleButton
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start mt-2"
                  onClick={() => setIsCategoryDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </SampleButton>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documentTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted ${
                      selectedTags.includes(tag.name) ? "bg-muted" : ""
                    }`}
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.includes(tag.name)
                          ? prev.filter((t) => t !== tag.name)
                          : [...prev, tag.name],
                      )
                    }
                  >
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{tag.name}</span>
                    </div>
                    <Badge variant="outline">{tag.count}</Badge>
                  </div>
                ))}
                <SampleButton
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start mt-2"
                  onClick={() => setIsTagDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </SampleButton>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Content Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contentTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between px-2 py-1.5"
                  >
                    <div className="flex items-center">
                      {type.name === "URL" ? (
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      )}
                      <span>{type.name}</span>
                    </div>
                    <Badge variant="outline">{type.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Knowledge Bases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted ${
                    selectedKnowledgeBase === null ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedKnowledgeBase(null)}
                >
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>All Knowledge Bases</span>
                  </div>
                  <Badge variant="outline">{contentItems.length}</Badge>
                </div>
                {knowledgeBases.map((kb) => (
                  <div
                    key={kb.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted ${
                      selectedKnowledgeBase === kb.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedKnowledgeBase(kb.id)}
                  >
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{kb.name}</span>
                    </div>
                    <Badge variant="outline">{kb.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">
                  {filteredContentItems.length}{" "}
                  {filteredContentItems.length === 1 ? "Document" : "Documents"}
                </h3>
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedCategory}
                    <button
                      className="ml-1 hover:bg-muted rounded-full"
                      onClick={() => setSelectedCategory(null)}
                    >
                      ✕
                    </button>
                  </Badge>
                )}
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <button
                      className="ml-1 hover:bg-muted rounded-full"
                      onClick={() =>
                        setSelectedTags((prev) => prev.filter((t) => t !== tag))
                      }
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDialogOpen(true)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </SampleButton>
                {selectedDocuments.length > 0 && (
                  <SampleButton
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedDocuments.length})
                  </SampleButton>
                )}
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <SampleCheckbox
                          checked={
                            selectedDocuments.length ===
                              filteredContentItems.length &&
                            filteredContentItems.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Knowledge Bases</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium w-12">
                          <SampleCheckbox
                            checked={selectedDocuments.includes(item.id)}
                            onCheckedChange={() =>
                              toggleDocumentSelection(item.id)
                            }
                            aria-label={`Select ${item.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {item.type === "URL" ? (
                              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                            ) : (
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            )}
                            <div>
                              <div>{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.type === "URL"
                                  ? item.url
                                  : item.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.contentType}</Badge>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.usedIn
                              .filter(
                                (usage) => usage.type === "Knowledge Base",
                              )
                              .map((usage) => (
                                <Badge
                                  key={usage.id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  <Link
                                    href={`/knowledge-bases/${usage.id}`}
                                    className="hover:underline"
                                  >
                                    {usage.name}
                                  </Link>
                                </Badge>
                              ))}
                            {item.usedIn.filter(
                              (usage) => usage.type === "Knowledge Base",
                            ).length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                Not used
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "Processed"
                                ? "outline"
                                : "secondary"
                            }
                            className={
                              item.status === "Processing"
                                ? "animate-pulse"
                                : ""
                            }
                          >
                            {item.status === "Processed" ? (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            ) : (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.version}</TableCell>
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
                                onClick={() => openDocumentViewer(item)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
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
                    {filteredContentItems.length === 0 && (
                      <TableCell colSpan={9} className="text-center">
                        <div className="py-8">
                          <FileStack className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <h3 className="font-medium text-lg mb-1">
                            No content found
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ||
                            selectedCategory ||
                            selectedTags.length > 0 ||
                            selectedKnowledgeBase
                              ? "Try adjusting your filters"
                              : "Upload documents or add URLs to get started"}
                          </p>
                          {!searchQuery &&
                            !selectedCategory &&
                            selectedTags.length === 0 &&
                            !selectedKnowledgeBase && (
                              <SampleButton
                                className="mt-4"
                                onClick={() => setIsUploadDialogOpen(true)}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Add Content
                              </SampleButton>
                            )}
                        </div>
                      </TableCell>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className={`grid gap-4 ${getGridClass()}`}>
                {filteredContentItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <FileStack className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <h3 className="font-medium text-lg mb-1">
                      No documents found
                    </h3>
                    <p className="text-sm">
                      {searchQuery ||
                      selectedCategory ||
                      selectedTags.length > 0
                        ? "Try adjusting your filters"
                        : "Upload documents to get started"}
                    </p>
                    {!searchQuery &&
                      !selectedCategory &&
                      selectedTags.length === 0 && (
                        <SampleButton
                          className="mt-4"
                          onClick={() => setIsUploadDialogOpen(true)}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Documents
                        </SampleButton>
                      )}
                  </div>
                ) : (
                  filteredContentItems.map((document) => (
                    <Card
                      key={document.id}
                      className="overflow-hidden transition-all hover:border-primary/50"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <SampleCheckbox
                              checked={selectedDocuments.includes(document.id)}
                              onCheckedChange={() =>
                                toggleDocumentSelection(document.id)
                              }
                              aria-label={`Select ${document.name}`}
                            />
                            <Badge
                              variant={
                                document.status === "Processed"
                                  ? "outline"
                                  : "secondary"
                              }
                              className={
                                document.status === "Processing"
                                  ? "animate-pulse"
                                  : ""
                              }
                            >
                              {document.status}
                            </Badge>
                          </div>
                          <Badge variant="outline">{document.type}</Badge>
                        </div>
                        <div className="flex items-start justify-between mt-2">
                          <CardTitle className="text-lg line-clamp-1">
                            {document.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {document.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {document.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          <div className="text-muted-foreground">Category:</div>
                          <div className="font-medium text-right">
                            {document.category}
                          </div>

                          <div className="text-muted-foreground">Size:</div>
                          <div className="font-medium text-right">
                            {document.size}
                          </div>

                          <div className="text-muted-foreground">Uploaded:</div>
                          <div className="font-medium text-right">
                            {document.uploadDate}
                          </div>

                          <div className="text-muted-foreground">By:</div>
                          <div className="font-medium text-right flex items-center justify-end gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px]">
                                {document.uploadedBy.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {document.uploadedBy.split(" ")[0]}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t p-3 bg-muted/20">
                        <SampleButton
                          variant="ghost"
                          size="sm"
                          onClick={() => openDocumentViewer(document)}
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          View
                        </SampleButton>

                        <SampleButton variant="ghost" size="sm">
                          <Download className="mr-2 h-3.5 w-3.5" />
                          Download
                        </SampleButton>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SampleButton variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </SampleButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
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
                      </CardFooter>
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          Used in:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {document.usedIn
                            .filter((usage) => usage.type === "Knowledge Base")
                            .map((usage) => (
                              <Badge
                                key={usage.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                <Link
                                  href={`/knowledge-bases/${usage.id}`}
                                  className="hover:underline"
                                >
                                  {usage.name}
                                </Link>
                              </Badge>
                            ))}
                          {document.usedIn.filter(
                            (usage) => usage.type === "Knowledge Base",
                          ).length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              Not used in any KB
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
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
                {selectedDocument?.type} • {selectedDocument?.size} • Version{" "}
                {selectedDocument?.version}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setZoomLevel((prev) => Math.max(0.5, prev - 0.1))
                  }
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Zoom Out
                </SampleButton>
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(1)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Reset
                </SampleButton>
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel((prev) => prev + 0.1)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Zoom In
                </SampleButton>
              </div>
              <div className="flex items-center gap-2">
                <SampleButton variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </SampleButton>
                <SampleButton variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </SampleButton>
              </div>
            </div>

            <div className="border rounded-md p-4 h-[60vh] overflow-auto">
              <div
                style={{
                  transformOrigin: "top left",
                  transform: `scale(${zoomLevel})`,
                  whiteSpace: "pre-wrap",
                }}
              >
                <p className="text-muted-foreground italic">
                  [Document preview would be displayed here. This is a
                  placeholder for {selectedDocument?.name}]
                </p>
                <p className="mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                  nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl
                  eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam
                  nisl nunc quis nisl.
                </p>
                <p className="mt-4">
                  Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                  nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl
                  eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam
                  nisl nunc quis nisl.
                </p>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Document Metadata</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedDocument?.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedDocument?.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded By</p>
                  <p className="font-medium">{selectedDocument?.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Upload Date</p>
                  <p className="font-medium">{selectedDocument?.uploadDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Modified</p>
                  <p className="font-medium">
                    {selectedDocument?.lastModified}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Access Level</p>
                  <p className="font-medium">{selectedDocument?.accessLevel}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Used In</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedDocument?.usedIn.map((usage: any) => (
                      <Badge
                        key={usage.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {usage.name} ({usage.type})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to categorize documents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <SampleInput
                id="tag-name"
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsTagDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton onClick={handleAddTag} disabled={!newTagName}>
              Add Tag
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize documents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <SampleInput
                id="category-name"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-description">
                Description (Optional)
              </Label>
              <Textarea
                id="category-description"
                placeholder="Enter a description for this category"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton
              onClick={handleAddCategory}
              disabled={!newCategoryName}
            >
              Add Category
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDocuments.length}{" "}
              {selectedDocuments.length === 1 ? "document" : "documents"}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p>
                    Deleting these documents may impact knowledge bases, models,
                    or workflows that use them. Please review the usage
                    information before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton variant="destructive" onClick={handleDeleteDocuments}>
              Delete
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filter Content</DialogTitle>
            <DialogDescription>
              Filter content by various criteria
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Content Type</Label>
              <div className="flex flex-wrap gap-2">
                <SampleButton
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  All Types
                </SampleButton>
                <SampleButton
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  Documents
                </SampleButton>
                <SampleButton
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  Websites
                </SampleButton>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory || ""}
                onValueChange={(value) => setSelectedCategory(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {contentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Knowledge Base</Label>
              <Select
                value={selectedKnowledgeBase || ""}
                onValueChange={(value) =>
                  setSelectedKnowledgeBase(value || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Knowledge Bases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Knowledge Bases</SelectItem>
                  {knowledgeBases.map((kb) => (
                    <SelectItem key={kb.id} value={kb.id}>
                      {kb.name} ({kb.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {documentTags.map((tag) => (
                  <SampleButton
                    key={tag.id}
                    variant={
                      selectedTags.includes(tag.name) ? "default" : "outline"
                    }
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag.name)
                          ? prev.filter((t) => t !== tag.name)
                          : [...prev, tag.name],
                      );
                    }}
                  >
                    {tag.name}
                  </SampleButton>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                <SampleButton
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  All
                </SampleButton>
                <SampleButton
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  Processed
                </SampleButton>
                <SampleButton
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  Processing
                </SampleButton>
              </div>
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedTags([]);
                setSelectedKnowledgeBase(null);
              }}
            >
              Reset Filters
            </SampleButton>
            <SampleButton onClick={() => setIsFilterDialogOpen(false)}>
              Apply Filters
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
