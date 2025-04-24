"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Copy,
  RefreshCw,
  Clock,
  Check,
  AlertTriangle,
  Filter,
  FileStack,
  FileCog,
  User,
  Star,
  Share2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ViewToggle } from "@/components/view-toggle";

// Sample data for AI documents
const documents = [
  {
    id: "doc-1",
    title: "Microfinance Loan Approval Report",
    description:
      "AI-generated risk assessment and loan approval recommendation",
    status: "completed",
    type: "Credit Memo",
    createdDate: "2 days ago",
    creator: "Ahmed Al-Mansouri",
    applicationId: "APP-2023-7845",
    workflow: "Credit Risk Scorecard",
    starredBy: ["user-1", "user-3"],
  },
  {
    id: "doc-2",
    title: "Customer Churn Analysis",
    description: "Predictive analysis of customer churn risk factors",
    status: "completed",
    type: "Analytical Report",
    createdDate: "5 days ago",
    creator: "Fatima Al-Zahrani",
    applicationId: "N/A",
    workflow: "Churn Prediction",
    starredBy: ["user-2"],
  },
  {
    id: "doc-3",
    title: "Regulatory Compliance Summary",
    description: "Summary of regulatory compliance for new product launch",
    status: "in-progress",
    type: "Compliance Report",
    createdDate: "1 day ago",
    creator: "Mohammed Al-Otaibi",
    applicationId: "N/A",
    workflow: "Compliance Check",
    starredBy: [],
  },
  {
    id: "doc-4",
    title: "SME Loan Evaluation",
    description: "Business loan evaluation and scoring summary",
    status: "failed",
    type: "Credit Memo",
    createdDate: "3 days ago",
    creator: "Saeed Al-Ghamdi",
    applicationId: "APP-2023-8012",
    workflow: "SME Loan Approval",
    starredBy: [],
  },
  {
    id: "doc-5",
    title: "Credit Risk Assessment",
    description:
      "Comprehensive credit risk evaluation for high-value applicant",
    status: "completed",
    type: "Credit Memo",
    createdDate: "1 week ago",
    creator: "Aisha Al-Farsi",
    applicationId: "APP-2023-7692",
    workflow: "Credit Risk Scorecard",
    starredBy: ["user-1"],
  },
];

// Templates for document creation
const documentTemplates = [
  {
    id: "template-1",
    name: "Credit Memo",
    description: "Standard credit risk assessment and approval recommendation",
  },
  {
    id: "template-2",
    name: "Analytical Report",
    description: "Data-driven analytical report with visualizations",
  },
  {
    id: "template-3",
    name: "Compliance Report",
    description: "Regulatory compliance evaluation and recommendations",
  },
  {
    id: "template-4",
    name: "Customer Summary",
    description: "Customer profile and relationship summary",
  },
];

// Available workflows
const workflows = [
  {
    id: "workflow-1",
    name: "Credit Risk Scorecard",
    description: "Risk scoring for loan applications",
  },
  {
    id: "workflow-2",
    name: "Churn Prediction",
    description: "Customer churn likelihood analysis",
  },
  {
    id: "workflow-3",
    name: "Compliance Check",
    description: "Regulatory compliance verification",
  },
  {
    id: "workflow-4",
    name: "SME Loan Approval",
    description: "Business loan evaluation workflow",
  },
];

export default function AIDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDesc, setDocumentDesc] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [currentUserId] = useState("user-1");
  const [viewMode, setViewMode] = useState<any>("medium-grid");

  // Function to filter documents based on search query
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.applicationId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to toggle star status
  const toggleStarred = (docId: string) => {
    // This would be implemented with actual state management in a real app
    console.log(`Toggle star for document ${docId}`);
  };

  const handleCreateDocument = () => {
    // In a real app, this would create a new document
    console.log("Creating document", {
      title: documentTitle,
      description: documentDesc,
      template: selectedTemplate,
      workflow: selectedWorkflow,
      applicationId,
    });

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTemplate("");
    setDocumentTitle("");
    setDocumentDesc("");
    setSelectedWorkflow("");
    setApplicationId("");
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
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
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
        <h1 className="text-xl font-semibold">AI Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <SampleButton variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </SampleButton>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">AI Docs</h2>
            <p className="text-muted-foreground">
              Create and manage AI-generated documents for various business
              processes
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

            <SampleButton variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </SampleButton>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <SampleButton>
                  <Plus className="mr-2 h-4 w-4" />
                  New Document
                </SampleButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create New AI Document</DialogTitle>
                  <DialogDescription>
                    Create a new AI-generated document based on a template and
                    workflow.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="doc-template">Document Template</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger id="doc-template">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {
                          documentTemplates.find(
                            (t) => t.id === selectedTemplate,
                          )?.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="doc-title">Document Title</Label>
                    <SampleInput
                      id="doc-title"
                      placeholder="Enter document title"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="doc-description">Description</Label>
                    <Textarea
                      id="doc-description"
                      placeholder="Enter a description for this document"
                      value={documentDesc}
                      onChange={(e) => setDocumentDesc(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="doc-workflow">Generation Workflow</Label>
                    <Select
                      value={selectedWorkflow}
                      onValueChange={setSelectedWorkflow}
                    >
                      <SelectTrigger id="doc-workflow">
                        <SelectValue placeholder="Select a workflow" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflows.map((workflow) => (
                          <SelectItem key={workflow.id} value={workflow.id}>
                            {workflow.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedWorkflow && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {
                          workflows.find((w) => w.id === selectedWorkflow)
                            ?.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="application-id">
                      Related Application ID (Optional)
                    </Label>
                    <SampleInput
                      id="application-id"
                      placeholder="e.g., APP-2023-7845"
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Link this document to an existing loan application or
                      leave blank.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <SampleButton
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </SampleButton>
                  <SampleButton
                    onClick={handleCreateDocument}
                    disabled={
                      !selectedTemplate || !documentTitle || !selectedWorkflow
                    }
                  >
                    Create Document
                  </SampleButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileStack className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <h3 className="font-medium text-lg mb-1">No documents found</h3>
                <p className="text-sm">
                  {searchQuery
                    ? `No documents matching "${searchQuery}" were found`
                    : "Create your first AI document to get started"}
                </p>
                {!searchQuery && (
                  <SampleButton
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Document
                  </SampleButton>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 ${getGridClass()}`}>
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    currentUserId={currentUserId}
                    onToggleStar={toggleStarred}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className={`grid gap-4 ${getGridClass()}`}>
              {filteredDocuments
                .filter((doc) => doc.status === "completed")
                .map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    currentUserId={currentUserId}
                    onToggleStar={toggleStarred}
                    viewMode={viewMode}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="mt-6">
            <div className={`grid gap-4 ${getGridClass()}`}>
              {filteredDocuments
                .filter((doc) => doc.status === "in-progress")
                .map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    currentUserId={currentUserId}
                    onToggleStar={toggleStarred}
                    viewMode={viewMode}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="failed" className="mt-6">
            <div className={`grid gap-4 ${getGridClass()}`}>
              {filteredDocuments
                .filter((doc) => doc.status === "failed")
                .map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    currentUserId={currentUserId}
                    onToggleStar={toggleStarred}
                    viewMode={viewMode}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="starred" className="mt-6">
            <div className={`grid gap-4 ${getGridClass()}`}>
              {filteredDocuments
                .filter((doc) => doc.starredBy.includes(currentUserId))
                .map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    currentUserId={currentUserId}
                    onToggleStar={toggleStarred}
                    viewMode={viewMode}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    description: string;
    status: string;
    type: string;
    createdDate: string;
    creator: string;
    applicationId: string;
    workflow: string;
    starredBy: string[];
  };
  currentUserId: string;
  onToggleStar: (docId: string) => void;
  viewMode: any;
}

function DocumentCard({
  document,
  currentUserId,
  onToggleStar,
  viewMode,
}: DocumentCardProps) {
  const isStarred = document.starredBy.includes(currentUserId);

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden transition-all hover:border-primary/50 animate-scale">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-lg">
                <Link
                  href={`/documents/${document.id}`}
                  className="hover:underline cursor-pointer"
                >
                  {document.title}
                </Link>
              </h3>
              <Badge
                variant={
                  document.status === "completed"
                    ? "outline"
                    : document.status === "in-progress"
                    ? "secondary"
                    : "destructive"
                }
                className={
                  document.status === "in-progress" ? "animate-pulse" : ""
                }
              >
                {document.status === "completed" ? (
                  <>
                    <Check className="mr-1 h-3 w-3" /> Completed
                  </>
                ) : document.status === "in-progress" ? (
                  <>
                    <Clock className="mr-1 h-3 w-3" /> Processing
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-1 h-3 w-3" /> Failed
                  </>
                )}
              </Badge>
              <Badge variant="outline">{document.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {document.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>{document.workflow}</span>
              <span>•</span>
              <span>{document.createdDate}</span>
              {document.applicationId !== "N/A" && (
                <>
                  <span>•</span>
                  <span>ID: {document.applicationId}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SampleButton
              variant="ghost"
              size="sm"
              className={`h-8 w-8 ${isStarred ? "text-yellow-500" : ""}`}
              onClick={() => onToggleStar(document.id)}
            >
              <Star
                className="h-4 w-4"
                fill={isStarred ? "currentColor" : "none"}
              />
            </SampleButton>

            <SampleButton variant="ghost" size="sm" asChild>
              <Link href={`/documents/${document.id}`}>
                <FileText className="h-4 w-4" />
              </Link>
            </SampleButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SampleButton variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </SampleButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/documents/${document.id}`}>View</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileCog className="mr-2 h-4 w-4" />
                  Edit Sections
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50 animate-scale">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <Badge
            variant={
              document.status === "completed"
                ? "outline"
                : document.status === "in-progress"
                ? "secondary"
                : "destructive"
            }
            className={document.status === "in-progress" ? "animate-pulse" : ""}
          >
            {document.status === "completed" ? (
              <>
                <Check className="mr-1 h-3 w-3" /> Completed
              </>
            ) : document.status === "in-progress" ? (
              <>
                <Clock className="mr-1 h-3 w-3" /> Processing
              </>
            ) : (
              <>
                <AlertTriangle className="mr-1 h-3 w-3" /> Failed
              </>
            )}
          </Badge>
          <Badge variant="outline">{document.type}</Badge>
        </div>
        <div className="flex items-start justify-between mt-2">
          <CardTitle className="text-xl line-clamp-2">
            <Link
              href={`/documents/${document.id}`}
              className="hover:underline cursor-pointer"
            >
              {document.title}
            </Link>
          </CardTitle>
          <SampleButton
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isStarred ? "text-yellow-500" : ""}`}
            onClick={() => onToggleStar(document.id)}
          >
            <Star
              className="h-5 w-5"
              fill={isStarred ? "currentColor" : "none"}
            />
          </SampleButton>
        </div>
        <CardDescription className="line-clamp-2">
          {document.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {document.applicationId !== "N/A" && (
            <>
              <div className="text-muted-foreground">Application ID:</div>
              <div className="font-medium text-right">
                {document.applicationId}
              </div>
            </>
          )}

          <div className="text-muted-foreground">Workflow:</div>
          <div className="font-medium text-right">{document.workflow}</div>

          <div className="text-muted-foreground">Created:</div>
          <div className="font-medium text-right">{document.createdDate}</div>

          <div className="text-muted-foreground">Creator:</div>
          <div className="font-medium text-right flex items-center justify-end gap-1">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px]">
                <User className="h-2 w-2" />
              </AvatarFallback>
            </Avatar>
            {document.creator}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-3 bg-muted/20">
        <SampleButton variant="ghost" size="sm" asChild>
          <Link href={`/documents/${document.id}`}>
            <FileText className="mr-2 h-3.5 w-3.5" />
            View
          </Link>
        </SampleButton>

        <SampleButton variant="ghost" size="sm">
          <Copy className="mr-2 h-3.5 w-3.5" />
          Duplicate
        </SampleButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SampleButton variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </SampleButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <FileCog className="mr-2 h-4 w-4" />
              Edit Sections
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
