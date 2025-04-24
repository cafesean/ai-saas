"use client";

import { Route } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SampleCheckbox } from "@/components/ui/sample-checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Download,
  Eye,
  FileStack,
  FileText,
  History,
  Maximize,
  MoreHorizontal,
  RefreshCw,
  Share2,
  SquarePen,
  Trash2,
  Upload,
  User,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Sample content data
const content = {
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
  tags: ["Regulations", "Compliance", "Banking", "Saudi Arabia"],
  usedIn: [
    {
      id: "kb-1",
      name: "Banking Regulations KB",
      type: "Knowledge Base",
      version: "1.2",
      status: "Active",
      lastUpdated: "15 days ago",
    },
    {
      id: "kb-2",
      name: "Compliance Documentation KB",
      type: "Knowledge Base",
      version: "1.1",
      status: "Active",
      lastUpdated: "20 days ago",
    },
    {
      id: "workflow-1",
      name: "Compliance Check Workflow",
      type: "Workflow",
      version: "1.0",
      status: "Active",
      lastUpdated: "25 days ago",
    },
  ],
  accessLevel: "Organization",
  versions: [
    {
      id: "v1",
      version: "1.0",
      date: "30 days ago",
      size: "4.0 MB",
      uploadedBy: "Ahmed Al-Mansouri",
      kbVersions: [
        { kbId: "kb-1", kbName: "Banking Regulations KB", kbVersion: "1.0" },
        {
          kbId: "kb-2",
          kbName: "Compliance Documentation KB",
          kbVersion: "1.0",
        },
      ],
    },
    {
      id: "v2",
      version: "1.1",
      date: "20 days ago",
      size: "4.1 MB",
      uploadedBy: "Ahmed Al-Mansouri",
      kbVersions: [
        { kbId: "kb-1", kbName: "Banking Regulations KB", kbVersion: "1.1" },
        {
          kbId: "kb-2",
          kbName: "Compliance Documentation KB",
          kbVersion: "1.1",
        },
      ],
    },
    {
      id: "v3",
      version: "1.2",
      date: "15 days ago",
      size: "4.2 MB",
      uploadedBy: "Ahmed Al-Mansouri",
      kbVersions: [
        { kbId: "kb-1", kbName: "Banking Regulations KB", kbVersion: "1.2" },
      ],
    },
  ],
  chunks: 218,
  totalTokens: 125480,
  activityLog: [
    {
      id: "act-1",
      action: "Content Uploaded",
      details: "Initial upload of document",
      user: "Ahmed Al-Mansouri",
      timestamp: "30 days ago",
      version: "1.0",
    },
    {
      id: "act-2",
      action: "Content Processed",
      details: "Document processed and indexed",
      user: "System",
      timestamp: "30 days ago",
      version: "1.0",
    },
    {
      id: "act-3",
      action: "KB Version Created",
      details: "Added to Banking Regulations KB v1.0",
      user: "System",
      timestamp: "30 days ago",
      version: "1.0",
    },
    {
      id: "act-4",
      action: "KB Version Created",
      details: "Added to Compliance Documentation KB v1.0",
      user: "System",
      timestamp: "30 days ago",
      version: "1.0",
    },
    {
      id: "act-5",
      action: "Content Updated",
      details: "Updated with new compliance regulations",
      user: "Ahmed Al-Mansouri",
      timestamp: "20 days ago",
      version: "1.1",
    },
    {
      id: "act-6",
      action: "KB Version Updated",
      details: "Updated in Banking Regulations KB to v1.1",
      user: "System",
      timestamp: "20 days ago",
      version: "1.1",
    },
    {
      id: "act-7",
      action: "KB Version Updated",
      details: "Updated in Compliance Documentation KB to v1.1",
      user: "System",
      timestamp: "20 days ago",
      version: "1.1",
    },
    {
      id: "act-8",
      action: "Content Updated",
      details: "Added section on international compliance",
      user: "Ahmed Al-Mansouri",
      timestamp: "15 days ago",
      version: "1.2",
    },
    {
      id: "act-9",
      action: "KB Version Updated",
      details: "Updated in Banking Regulations KB to v1.2",
      user: "System",
      timestamp: "15 days ago",
      version: "1.2",
    },
  ],
};

export default function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isUploadNewVersionDialogOpen, setIsUploadNewVersionDialogOpen] =
    useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEditMetadataDialogOpen, setIsEditMetadataDialogOpen] =
    useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(
    content.versions[content.versions.length - 1]!.id,
  );

  // Handle document upload
  const handleUploadNewVersion = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep("Preparing document...");

    // Simulate the upload and processing
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsUploadNewVersionDialogOpen(false);
          return 100;
        }

        // Update the processing step based on progress
        if (prev < 20) {
          setProcessingStep("Uploading document...");
        } else if (prev < 40) {
          setProcessingStep("Parsing document content...");
        } else if (prev < 60) {
          setProcessingStep("Comparing with previous version...");
        } else if (prev < 80) {
          setProcessingStep("Updating indexes...");
        } else {
          setProcessingStep("Finalizing...");
        }

        return prev + 2;
      });
    }, 100);
  };

  // Handle document deletion
  const handleDeleteDocument = () => {
    // In a real app, this would delete the document
    console.log("Deleting document:", content.id);
    setIsDeleteConfirmOpen(false);
    router.push("/content-repo");
  };

  // Handle document sharing
  const handleShareDocument = () => {
    // In a real app, this would share the document
    console.log("Sharing document:", content.id);
    setIsShareDialogOpen(false);
  };

  // Handle metadata update
  const handleUpdateMetadata = () => {
    // In a real app, this would update the document metadata
    console.log("Updating document metadata:", content.id);
    setIsEditMetadataDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/content-repo"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Content Repository</span>
        </Link>
        <h1 className="text-xl font-semibold">Content Details</h1>
        <Badge
          variant={content.status === "Processed" ? "outline" : "secondary"}
          className="ml-2"
        >
          {content.status}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <SampleButton
            variant="outline"
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </SampleButton>
          <SampleButton variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </SampleButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SampleButton variant="outline" size="sm">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Actions
              </SampleButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIsUploadNewVersionDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Version
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsEditMetadataDialogOpen(true)}
              >
                <SquarePen className="mr-2 h-4 w-4" />
                Edit Metadata
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="border-b bg-muted/40">
        <div className="container py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-2xl font-bold">{content.name}</h2>
              </div>
              <div className="text-muted-foreground mt-1">
                {content.size} • Version {content.version} • Uploaded{" "}
                {content.uploadDate} • Last modified {content.lastModified}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container py-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Document Preview</CardTitle>
                  <div className="flex items-center gap-2">
                    <SampleButton
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setZoomLevel((prev) => Math.max(0.5, prev - 0.1))
                      }
                    >
                      <ZoomOut className="h-4 w-4" />
                    </SampleButton>
                    <SampleButton
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(1)}
                    >
                      <Maximize className="h-4 w-4" />
                    </SampleButton>
                    <SampleButton
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel((prev) => prev + 0.1)}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </SampleButton>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                      placeholder for {content.name}]
                    </p>
                    <p className="mt-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Nullam euismod, nisl eget aliquam ultricies, nunc nisl
                      aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam
                      euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                      nunc, quis aliquam nisl nunc quis nisl.
                    </p>
                    <p className="mt-4">
                      Nullam euismod, nisl eget aliquam ultricies, nunc nisl
                      aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam
                      euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                      nunc, quis aliquam nisl nunc quis nisl.
                    </p>
                    <p className="mt-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Nullam euismod, nisl eget aliquam ultricies, nunc nisl
                      aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam
                      euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                      nunc, quis aliquam nisl nunc quis nisl.
                    </p>
                    <p className="mt-4">
                      Nullam euismod, nisl eget aliquam ultricies, nunc nisl
                      aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam
                      euismod, nisl eget aliquam ultricies, nunc nisl aliquet
                      nunc, quis aliquam nisl nunc quis nisl.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="versions">
              <TabsList>
                <TabsTrigger value="versions">Version History</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>

              <TabsContent value="versions" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Version History</CardTitle>
                    <CardDescription>
                      Track changes across different versions of this document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded By</TableHead>
                          <TableHead>Knowledge Base Versions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {content.versions.map((version) => (
                          <TableRow key={version.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-muted-foreground" />
                                <span>v{version.version}</span>
                                {version.id ===
                                  content.versions[content.versions.length - 1]!
                                    .id && (
                                  <Badge variant="outline" className="ml-2">
                                    Current
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{version.date}</TableCell>
                            <TableCell>{version.size}</TableCell>
                            <TableCell>{version.uploadedBy}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {version.kbVersions.map((kbVersion) => (
                                  <Badge
                                    key={kbVersion.kbId}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Link
                                      href={`/knowledge-bases/${kbVersion.kbId}`}
                                      className="hover:underline"
                                    >
                                      {kbVersion.kbName} v{kbVersion.kbVersion}
                                    </Link>
                                  </Badge>
                                ))}
                                {version.kbVersions.length === 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    Not used in any KB
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <SampleButton variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </SampleButton>
                                <SampleButton variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </SampleButton>
                                <SampleButton variant="ghost" size="sm">
                                  <RefreshCw className="h-4 w-4" />
                                  <span className="sr-only">Restore</span>
                                </SampleButton>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                      History of actions performed on this document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {content.activityLog.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            {activity.action === "Content Uploaded" && (
                              <Upload className="h-5 w-5 text-primary" />
                            )}
                            {activity.action === "Content Processed" && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                            {activity.action === "Content Updated" && (
                              <SquarePen className="h-5 w-5 text-primary" />
                            )}
                            {activity.action === "KB Version Created" && (
                              <Database className="h-5 w-5 text-primary" />
                            )}
                            {activity.action === "KB Version Updated" && (
                              <RefreshCw className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.action}</h4>
                              <Badge variant="outline">
                                v{activity.version}
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

              <TabsContent value="usage" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Document Usage</CardTitle>
                    <CardDescription>
                      Where this document is being used across the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {content.usedIn.map((usage, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {usage.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{usage.type}</Badge>
                            </TableCell>
                            <TableCell>v{usage.version}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  usage.status === "Active"
                                    ? "outline"
                                    : "secondary"
                                }
                              >
                                {usage.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{usage.lastUpdated}</TableCell>
                            <TableCell className="text-right">
                              <SampleButton variant="ghost" size="sm" asChild>
                                <Link
                                  href={
                                    `/${usage.type
                                      .toLowerCase()
                                      .replace(" ", "-")}s/${usage.id}` as Route
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </SampleButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {content.usedIn.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-4 text-muted-foreground"
                            >
                              This content is not currently used in any
                              resources.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Content Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h4>
                  <p>{content.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Category
                  </h4>
                  <div className="flex items-center">
                    <FileStack className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{content.category}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {content.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Content Type
                    </h4>
                    <p>{content.contentType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      File Type
                    </h4>
                    <p>{content.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      File Size
                    </h4>
                    <p>{content.size}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Version
                    </h4>
                    <p>{content.version}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Chunks
                    </h4>
                    <p>{content.chunks}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Total Tokens
                    </h4>
                    <p>{content.totalTokens.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Uploaded By
                  </h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {content.uploadedBy.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{content.uploadedBy}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Access Level
                  </h4>
                  <Badge variant="outline">{content.accessLevel}</Badge>
                </div>

                <div className="pt-2">
                  <SampleButton
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsEditMetadataDialogOpen(true)}
                  >
                    <SquarePen className="mr-2 h-4 w-4" />
                    Edit Metadata
                  </SampleButton>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SampleButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsUploadNewVersionDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Version
                </SampleButton>
                <SampleButton
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Document
                </SampleButton>
                <SampleButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Document
                </SampleButton>
                <SampleButton
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </SampleButton>
                <SampleButton
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Document
                </SampleButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Upload New Version Dialog */}
      <Dialog
        open={isUploadNewVersionDialogOpen}
        onOpenChange={setIsUploadNewVersionDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload New Version</DialogTitle>
            <DialogDescription>
              Upload a new version of this document. The current version will be
              preserved in the version history.
            </DialogDescription>
          </DialogHeader>
          {isProcessing ? (
            <div className="py-6 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Processing Document
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
                  <Label>Current Version</Label>
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="font-medium">{content.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Version {content.version} • {content.size} • Last modified{" "}
                      {content.lastModified}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Upload New File</Label>
                  <div className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      File should be of the same type ({content.type})
                    </p>
                    <SampleButton variant="outline" size="sm" className="mt-4">
                      Select File
                    </SampleButton>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="version-notes">
                    Version Notes (Optional)
                  </Label>
                  <Textarea
                    id="version-notes"
                    placeholder="Describe what changed in this version"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Knowledge Bases to Update</Label>
                  <div className="border rounded-md p-3 space-y-2">
                    {content.usedIn
                      .filter((usage) => usage.type === "Knowledge Base")
                      .map((kb) => (
                        <div key={kb.id} className="flex items-center">
                          <SampleCheckbox id={`kb-${kb.id}`} defaultChecked />
                          <label
                            htmlFor={`kb-${kb.id}`}
                            className="ml-2 text-sm"
                          >
                            {kb.name} (currently v{kb.version})
                          </label>
                        </div>
                      ))}
                    {content.usedIn.filter(
                      (usage) => usage.type === "Knowledge Base",
                    ).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        This content is not currently used in any knowledge
                        bases.
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected knowledge bases will be updated with this new
                    version.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <SampleButton
                  variant="outline"
                  onClick={() => setIsUploadNewVersionDialogOpen(false)}
                >
                  Cancel
                </SampleButton>
                <SampleButton onClick={handleUploadNewVersion}>
                  Upload New Version
                </SampleButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p>
                    This document is used in {content.usedIn.length} resources.
                    Deleting it may impact:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    {content.usedIn.map((usage, index) => (
                      <li key={index}>
                        {usage.name} ({usage.type})
                      </li>
                    ))}
                  </ul>
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
            <SampleButton variant="destructive" onClick={handleDeleteDocument}>
              Delete
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Share this document with users, groups, or roles in your
              organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Document Link</Label>
              <div className="flex">
                <Input
                  readOnly
                  value={`https://your-domain.com/docs-repo/${content.id}`}
                  className="rounded-r-none"
                />
                <SampleButton variant="secondary" className="rounded-l-none">
                  <Copy className="h-4 w-4" />
                </SampleButton>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Share With</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select users, groups, or roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user-1">
                    Ahmed Al-Mansouri (User)
                  </SelectItem>
                  <SelectItem value="user-2">
                    Fatima Al-Zahrani (User)
                  </SelectItem>
                  <SelectItem value="group-1">
                    Compliance Team (Group)
                  </SelectItem>
                  <SelectItem value="role-1">
                    Compliance Officer (Role)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Permission Level</Label>
              <Select defaultValue="view">
                <SelectTrigger>
                  <SelectValue placeholder="Select permission level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-md p-3">
              <h4 className="font-medium mb-2">Current Access</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <span>Ahmed Al-Mansouri</span>
                  </div>
                  <Badge>Owner</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>CT</AvatarFallback>
                    </Avatar>
                    <span>Compliance Team</span>
                  </div>
                  <Badge variant="outline">View</Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton onClick={handleShareDocument}>Share</SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Dialog */}
      <Dialog
        open={isEditMetadataDialogOpen}
        onOpenChange={setIsEditMetadataDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Document Metadata</DialogTitle>
            <DialogDescription>
              Update the metadata for this document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="doc-name">Document Name</Label>
              <Input id="doc-name" defaultValue={content.name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="doc-description">Description</Label>
              <Textarea
                id="doc-description"
                defaultValue={content.description}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="doc-category">Category</Label>
              <Select defaultValue="banking-regulations">
                <SelectTrigger id="doc-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banking-regulations">
                    Banking Regulations
                  </SelectItem>
                  <SelectItem value="loan-processing">
                    Loan Processing
                  </SelectItem>
                  <SelectItem value="customer-service">
                    Customer Service
                  </SelectItem>
                  <SelectItem value="credit-risk">Credit Risk</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
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
                  <SelectItem value="regulations">Regulations</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="banking">Banking</SelectItem>
                  <SelectItem value="saudi-arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="guidelines">Guidelines</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {content.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button className="ml-1 hover:bg-muted rounded-full">
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="doc-access">Access Level</Label>
              <Select defaultValue="organization">
                <SelectTrigger id="doc-access">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsEditMetadataDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton onClick={handleUpdateMetadata}>
              Save Changes
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
