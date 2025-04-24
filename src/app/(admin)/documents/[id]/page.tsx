"use client";

import type React from "react";
import { toast } from "sonner";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  History,
  MoreHorizontal,
  RefreshCw,
  Save,
  Share2,
  Trash2,
  User,
  Edit,
  Plus,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Code,
  FileCode,
  Settings,
  Workflow,
} from "lucide-react";
import { SampleButton } from "@/components/ui/sample-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

// Sample document data
const documentData = {
  id: "doc-1",
  title: "Microfinance Loan Approval Report",
  description: "AI-generated risk assessment and loan approval recommendation",
  status: "completed",
  type: "Credit Memo",
  createdDate: "2023-11-15T14:30:00Z",
  updatedDate: "2023-11-15T16:45:00Z",
  creator: "Ahmed Al-Mansouri",
  applicationId: "APP-2023-7845",
  workflow: "Credit Risk Scorecard",
  templateId: "template-1",
  templateName: "Credit Memo Template",
  sections: [
    {
      id: "section-1",
      title: "Executive Summary",
      content:
        "This report provides a comprehensive analysis of the microfinance loan application [application.id]. Based on our AI-driven risk assessment model, we recommend [decision.recommendation] of the loan with [decision.terms].",
      type: "template",
      variables: [
        "application.id",
        "decision.recommendation",
        "decision.terms",
      ],
      lastEdited: "2023-11-15T15:30:00Z",
      editedBy: "Ahmed Al-Mansouri",
      order: 1,
    },
    {
      id: "section-2",
      title: "Applicant Profile",
      content:
        "Applicant Name: [applicant.name]\nBusiness: [business.name]\nYears in Operation: [business.yearsInOperation]\nAnnual Revenue: [business.annualRevenue]\nLoan Amount Requested: [application.loanAmount]\nPurpose: [application.purpose]",
      type: "workflow",
      workflowId: "workflow-1",
      workflowName: "Customer Profile Generator",
      workflowOutput: "applicantProfile",
      variables: [
        "applicant.name",
        "business.name",
        "business.yearsInOperation",
        "business.annualRevenue",
        "application.loanAmount",
        "application.purpose",
      ],
      lastEdited: "2023-11-15T14:35:00Z",
      order: 2,
    },
    {
      id: "section-3",
      title: "Risk Assessment",
      content:
        "Credit Score: [applicant.creditScore] ([applicant.creditRating])\nDebt-to-Income Ratio: [applicant.dti]\nBusiness Health Score: [business.healthScore]/100\nMarket Sector Risk: [market.riskLevel]\nOverall Risk Rating: [risk.overallRating]\n\nThe applicant demonstrates [risk.creditworthiness] with a [business.stability] business history and [business.financialHealth] financials. The requested loan amount represents a [risk.loanToRevenueRatio] of annual revenue.",
      type: "workflow",
      workflowId: "workflow-2",
      workflowName: "Risk Assessment Engine",
      workflowOutput: "riskAssessment",
      variables: [
        "applicant.creditScore",
        "applicant.creditRating",
        "applicant.dti",
        "business.healthScore",
        "market.riskLevel",
        "risk.overallRating",
        "risk.creditworthiness",
        "business.stability",
        "business.financialHealth",
        "risk.loanToRevenueRatio",
      ],
      lastEdited: "2023-11-15T14:40:00Z",
      order: 3,
    },
    {
      id: "section-4",
      title: "Recommendation",
      content:
        "Based on the comprehensive risk assessment, we recommend [decision.recommendation] of the loan application with the following terms:\n\n- Loan Amount: [decision.loanAmount]\n- Term: [decision.term]\n- Interest Rate: [decision.interestRate]\n- Collateral Requirement: [decision.collateral]\n- Special Conditions: [decision.specialConditions]",
      type: "workflow",
      workflowId: "workflow-3",
      workflowName: "Loan Decision Engine",
      workflowOutput: "loanDecision",
      variables: [
        "decision.recommendation",
        "decision.loanAmount",
        "decision.term",
        "decision.interestRate",
        "decision.collateral",
        "decision.specialConditions",
      ],
      lastEdited: "2023-11-15T14:45:00Z",
      order: 4,
    },
  ],
  versions: [
    {
      id: "v1",
      number: "1.0",
      date: "2023-11-15T14:30:00Z",
      author: "Ahmed Al-Mansouri",
      changes: "Initial document creation",
    },
    {
      id: "v2",
      number: "1.1",
      date: "2023-11-15T15:45:00Z",
      author: "Ahmed Al-Mansouri",
      changes: "Updated risk assessment section with new credit score data",
    },
    {
      id: "v3",
      number: "1.2",
      date: "2023-11-15T16:45:00Z",
      author: "Fatima Al-Zahrani",
      changes:
        "Revised recommendation based on updated business performance metrics",
    },
  ],
  relatedDocuments: [
    {
      id: "related-1",
      title: "Business Financial Statement Analysis",
      type: "Financial Analysis",
      date: "2023-11-10T10:15:00Z",
    },
    {
      id: "related-2",
      title: "Market Sector Risk Report",
      type: "Risk Analysis",
      date: "2023-11-12T09:30:00Z",
    },
  ],
};

// Sample generated documents using this template
const generatedDocuments = [
  {
    id: "gen-1",
    title: "Microfinance Loan Approval Report - APP-2023-7845",
    applicant: "Mohammed Al-Harbi",
    status: "completed",
    createdDate: "2023-11-15T14:30:00Z",
    decision: "Approved",
    sections: [
      {
        id: "gen-1-sec-1",
        sectionId: "section-1",
        lastGenerated: "2023-11-15T14:30:00Z",
        workflowVersion: "1.0",
      },
      {
        id: "gen-1-sec-2",
        sectionId: "section-2",
        lastGenerated: "2023-11-15T14:35:00Z",
        workflowVersion: "1.0",
      },
      {
        id: "gen-1-sec-3",
        sectionId: "section-3",
        lastGenerated: "2023-11-15T14:40:00Z",
        workflowVersion: "2.1",
      },
      {
        id: "gen-1-sec-4",
        sectionId: "section-4",
        lastGenerated: "2023-11-15T14:45:00Z",
        workflowVersion: "1.2",
      },
    ],
  },
  {
    id: "gen-2",
    title: "Microfinance Loan Approval Report - APP-2023-8012",
    applicant: "Saeed Al-Ghamdi",
    status: "completed",
    createdDate: "2023-11-16T10:15:00Z",
    decision: "Rejected",
    sections: [
      {
        id: "gen-2-sec-1",
        sectionId: "section-1",
        lastGenerated: "2023-11-16T10:15:00Z",
        workflowVersion: "1.0",
      },
      {
        id: "gen-2-sec-2",
        sectionId: "section-2",
        lastGenerated: "2023-11-16T10:20:00Z",
        workflowVersion: "1.0",
      },
      {
        id: "gen-2-sec-3",
        sectionId: "section-3",
        lastGenerated: "2023-11-16T10:25:00Z",
        workflowVersion: "2.1",
      },
      {
        id: "gen-2-sec-4",
        sectionId: "section-4",
        lastGenerated: "2023-11-16T10:30:00Z",
        workflowVersion: "1.2",
      },
    ],
  },
  {
    id: "gen-3",
    title: "Microfinance Loan Approval Report - APP-2023-8124",
    applicant: "Nora Al-Qahtani",
    status: "completed",
    createdDate: "2023-11-17T09:45:00Z",
    decision: "Approved with Conditions",
    sections: [
      {
        id: "gen-3-sec-1",
        sectionId: "section-1",
        lastGenerated: "2023-11-17T09:45:00Z",
        workflowVersion: "1.0",
      },
      {
        id: "gen-3-sec-2",
        sectionId: "section-2",
        lastGenerated: "2023-11-17T09:50:00Z",
        workflowVersion: "1.1",
      },
      {
        id: "gen-3-sec-3",
        sectionId: "section-3",
        lastGenerated: "2023-11-17T09:55:00Z",
        workflowVersion: "2.1",
      },
      {
        id: "gen-3-sec-4",
        sectionId: "section-4",
        lastGenerated: "2023-11-17T10:00:00Z",
        workflowVersion: "1.2",
      },
    ],
  },
  {
    id: "gen-4",
    title: "Microfinance Loan Approval Report - APP-2023-8256",
    applicant: "Khalid Al-Dossari",
    status: "in-progress",
    createdDate: "2023-11-18T11:30:00Z",
    decision: "Pending",
    sections: [
      {
        id: "gen-4-sec-1",
        sectionId: "section-1",
        lastGenerated: "2023-11-18T11:30:00Z",
        workflowVersion: "1.0",
      },
      {
        id: "gen-4-sec-2",
        sectionId: "section-2",
        lastGenerated: "2023-11-18T11:35:00Z",
        workflowVersion: "1.1",
      },
      {
        id: "gen-4-sec-3",
        sectionId: "section-3",
        lastGenerated: null,
        workflowVersion: null,
      },
      {
        id: "gen-4-sec-4",
        sectionId: "section-4",
        lastGenerated: null,
        workflowVersion: null,
      },
    ],
  },
];

// Available workflows for regenerating sections
const availableWorkflows = [
  {
    id: "workflow-1",
    name: "Customer Profile Generator",
    description: "Generates customer profile based on application data",
    outputSchema: {
      applicant: {
        name: "string",
        age: "number",
        occupation: "string",
      },
      business: {
        name: "string",
        yearsInOperation: "number",
        annualRevenue: "string",
      },
      application: {
        loanAmount: "string",
        purpose: "string",
      },
    },
    versions: [
      { id: "v1", number: "1.0", date: "2023-10-01" },
      { id: "v1.1", number: "1.1", date: "2023-11-01" },
      { id: "v1.2", number: "1.2", date: "2023-11-15" },
    ],
  },
  {
    id: "workflow-2",
    name: "Risk Assessment Engine",
    description: "Evaluates applicant risk based on multiple factors",
    outputSchema: {
      applicant: {
        creditScore: "number",
        creditRating: "string",
        dti: "number",
      },
      business: {
        healthScore: "number",
        stability: "string",
        financialHealth: "string",
      },
      market: {
        riskLevel: "string",
      },
      risk: {
        overallRating: "string",
        creditworthiness: "string",
        loanToRevenueRatio: "string",
      },
    },
    versions: [
      { id: "v2", number: "2.0", date: "2023-09-15" },
      { id: "v2.1", number: "2.1", date: "2023-10-20" },
      { id: "v2.2", number: "2.2", date: "2023-11-10" },
    ],
  },
  {
    id: "workflow-3",
    name: "Loan Decision Engine",
    description: "Generates loan approval recommendation and terms",
    outputSchema: {
      decision: {
        recommendation: "string",
        loanAmount: "string",
        term: "string",
        interestRate: "string",
        collateral: "string",
        specialConditions: "string",
      },
    },
    versions: [
      { id: "v1", number: "1.0", date: "2023-09-01" },
      { id: "v1.1", number: "1.1", date: "2023-10-15" },
      { id: "v1.2", number: "1.2", date: "2023-11-05" },
      { id: "v1.3", number: "1.3", date: "2023-11-18" },
    ],
  },
];

export default function DocumentDetailPage() {
  const [activeTab, setActiveTab] = useState("document");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionContent, setEditingSectionContent] = useState("");
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [editingSectionType, setEditingSectionType] = useState<
    "template" | "workflow"
  >("template");
  const [editingSectionWorkflow, setEditingSectionWorkflow] = useState("");
  const [editingSectionWorkflowOutput, setEditingSectionWorkflowOutput] =
    useState("");
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [regeneratingDocId, setRegeneratingDocId] = useState<string | null>(
    null,
  );
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<
    string | null
  >(null);
  const [selectedWorkflowVersion, setSelectedWorkflowVersion] = useState("");
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionType, setNewSectionType] = useState<"template" | "workflow">(
    "template",
  );
  const [newSectionWorkflow, setNewSectionWorkflow] = useState("");
  const [newSectionWorkflowOutput, setNewSectionWorkflowOutput] = useState("");
  const [newSectionContent, setNewSectionContent] = useState("");
  const [isViewGeneratedDocDialogOpen, setIsViewGeneratedDocDialogOpen] =
    useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleEditSection = (sectionId: string) => {
    const section = documentData.sections.find((s) => s.id === sectionId);
    if (section) {
      setEditingSectionId(sectionId);
      setEditingSectionTitle(section.title);
      setEditingSectionContent(section.content);
      setEditingSectionType(section.type as "template" | "workflow");
      setEditingSectionWorkflow(section.workflowId || "");
      setEditingSectionWorkflowOutput(section.workflowOutput || "");
      setIsEditDialogOpen(true);
    }
  };

  const saveEditedSection = () => {
    // In a real app, this would save the edited content to the backend
    toast.success("The section template has been successfully updated.");
    setIsEditDialogOpen(false);
  };

  const handleRegenerateSection = (docId: string, sectionId: string) => {
    const doc = generatedDocuments.find((d) => d.id === docId);
    const docSection = doc?.sections.find((s) => s.sectionId === sectionId);
    const templateSection = documentData.sections.find(
      (s) => s.id === sectionId,
    );

    if (
      templateSection &&
      templateSection.type === "workflow" &&
      templateSection.workflowId
    ) {
      const workflow = availableWorkflows.find(
        (w) => w.id === templateSection.workflowId,
      );
      if (workflow && workflow.versions.length > 0) {
        // Find the current version or default to latest
        const currentVersionId = docSection?.workflowVersion
          ? workflow.versions.find(
              (v) => v.number === docSection.workflowVersion,
            )?.id
          : workflow.versions[workflow.versions.length - 1]!.id;

        setSelectedWorkflowVersion(
          currentVersionId ||
            workflow.versions[workflow.versions.length - 1]!.id,
        );
      }
    }

    setRegeneratingDocId(docId);
    setRegeneratingSectionId(sectionId);
    setIsRegenerateDialogOpen(true);
  };

  const regenerateSection = () => {
    // In a real app, this would trigger the workflow to regenerate the section
    toast.success(
      "The section is being regenerated with the selected workflow version.",
    );
    setIsRegenerateDialogOpen(false);
  };

  const handleAddSection = () => {
    // In a real app, this would add a new section to the document
    toast.success("The new section has been added to the document.");
    setIsAddSectionDialogOpen(false);
    setNewSectionTitle("");
    setNewSectionType("template");
    setNewSectionWorkflow("");
    setNewSectionWorkflowOutput("");
    setNewSectionContent("");
  };

  const handleViewGeneratedDoc = (docId: string) => {
    setViewingDocId(docId);
    setIsViewGeneratedDocDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not generated";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleDragStart = (sectionId: string) => {
    setIsDragging(true);
    setDraggedSectionId(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (draggedSectionId === sectionId) return;

    // In a real app, this would reorder the sections
    // For now, we'll just show a visual indicator
    const draggedElement = document.getElementById(
      `section-${draggedSectionId}`,
    );
    const targetElement = document.getElementById(`section-${sectionId}`);

    if (draggedElement && targetElement) {
      targetElement.classList.add("border-primary");
    }
  };

  const handleDragLeave = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(`section-${sectionId}`);
    if (targetElement) {
      targetElement.classList.remove("border-primary");
    }
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (draggedSectionId === sectionId) return;

    // In a real app, this would reorder the sections
    toast.success("The section order has been updated.");
    const targetElement = document.getElementById(`section-${sectionId}`);
    if (targetElement) {
      targetElement.classList.remove("border-primary");
    }

    setIsDragging(false);
    setDraggedSectionId(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedSectionId(null);

    // Remove any lingering highlights
    document.querySelectorAll(".border-primary").forEach((el) => {
      el.classList.remove("border-primary");
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/documents"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to AI Docs</span>
        </Link>
        <h1 className="text-xl font-semibold">{documentData.title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <SampleButton variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </SampleButton>
          <SampleButton variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </SampleButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SampleButton variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </SampleButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Document Properties
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Save className="mr-2 h-4 w-4" />
                Save as Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {documentData.title}
              </h2>
              <Badge
                variant={
                  documentData.status === "completed"
                    ? "outline"
                    : documentData.status === "in-progress"
                    ? "secondary"
                    : "destructive"
                }
              >
                {documentData.status === "completed" ? (
                  <>
                    <Check className="mr-1 h-3 w-3" /> Completed
                  </>
                ) : documentData.status === "in-progress" ? (
                  <>
                    <Clock className="mr-1 h-3 w-3" /> Processing
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-1 h-3 w-3" /> Failed
                  </>
                )}
              </Badge>
              <Badge variant="outline">{documentData.type}</Badge>
            </div>
            <p className="text-muted-foreground">{documentData.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <SampleButton onClick={() => setIsAddSectionDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </SampleButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="document">Document Template</TabsTrigger>
                <TabsTrigger value="generated">Generated Documents</TabsTrigger>
                <TabsTrigger value="versions">Version History</TabsTrigger>
              </TabsList>

              <TabsContent value="document" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Document Sections</CardTitle>
                    <CardDescription>
                      Configure the template sections for this document. Each
                      section can be a template with variables or linked to a
                      workflow output.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {documentData.sections.map((section) => (
                      <div
                        key={section.id}
                        id={`section-${section.id}`}
                        className="border rounded-lg overflow-hidden"
                        draggable={true}
                        onDragStart={() => handleDragStart(section.id)}
                        onDragOver={(e) => handleDragOver(e, section.id)}
                        onDragLeave={(e) => handleDragLeave(e, section.id)}
                        onDrop={(e) => handleDrop(e, section.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-center justify-between p-3 bg-muted/30">
                          <div className="flex items-center gap-2">
                            <div
                              className="cursor-move p-1 hover:bg-muted rounded"
                              onMouseDown={() => handleDragStart(section.id)}
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium">{section.title}</h3>
                            {section.type === "workflow" && (
                              <Badge variant="secondary" className="text-xs">
                                <Workflow className="h-3 w-3 mr-1" />
                                {section.workflowName}
                              </Badge>
                            )}
                            {section.type === "template" && (
                              <Badge variant="outline" className="text-xs">
                                <FileCode className="h-3 w-3 mr-1" />
                                Template
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <SampleButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSection(section.id)}
                            >
                              <Settings className="h-3.5 w-3.5 mr-1" />
                              Configure
                            </SampleButton>
                            <SampleButton
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection(section.id)}
                            >
                              {expandedSections[section.id] ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </SampleButton>
                          </div>
                        </div>
                        {expandedSections[section.id] && (
                          <div className="p-4 border-t">
                            <div className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-3 rounded">
                              {section.content}
                            </div>
                            <div className="mt-4 pt-3 border-t">
                              <h4 className="text-sm font-medium mb-2">
                                Template Variables:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {section.variables?.map((variable) => (
                                  <Badge
                                    key={variable}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    [{variable}]
                                  </Badge>
                                ))}
                              </div>
                              <div className="mt-4 text-xs text-muted-foreground">
                                {section.type === "template" ? (
                                  <p>
                                    Last edited on{" "}
                                    {formatDate(section.lastEdited)}
                                  </p>
                                ) : (
                                  <p>
                                    Linked to workflow: {section.workflowName}{" "}
                                    (Output: {section.workflowOutput})
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Document Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div className="text-muted-foreground">Template:</div>
                      <div className="font-medium">
                        {documentData.templateName}
                      </div>

                      <div className="text-muted-foreground">
                        Application ID:
                      </div>
                      <div className="font-medium">
                        {documentData.applicationId}
                      </div>

                      <div className="text-muted-foreground">Workflow:</div>
                      <div className="font-medium">{documentData.workflow}</div>

                      <div className="text-muted-foreground">Created:</div>
                      <div className="font-medium">
                        {formatDate(documentData.createdDate)}
                      </div>

                      <div className="text-muted-foreground">Last Updated:</div>
                      <div className="font-medium">
                        {formatDate(documentData.updatedDate)}
                      </div>

                      <div className="text-muted-foreground">Created By:</div>
                      <div className="font-medium flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            <User className="h-2 w-2" />
                          </AvatarFallback>
                        </Avatar>
                        {documentData.creator}
                      </div>

                      <div className="text-muted-foreground">
                        Current Version:
                      </div>
                      <div className="font-medium">
                        {
                          documentData.versions[
                            documentData.versions.length - 1
                          ]!.number
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Related Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {documentData.relatedDocuments.map((doc) => (
                        <li
                          key={doc.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{doc.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {doc.type}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(doc.date)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="generated" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Generated Documents</CardTitle>
                    <CardDescription>
                      Documents that have been generated using this template.
                      You can view details and regenerate specific sections.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Title</TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Decision</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                              {doc.title}
                            </TableCell>
                            <TableCell>{doc.applicant}</TableCell>
                            <TableCell>{formatDate(doc.createdDate)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  doc.status === "completed"
                                    ? "outline"
                                    : doc.status === "in-progress"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={
                                  doc.status === "in-progress"
                                    ? "animate-pulse"
                                    : ""
                                }
                              >
                                {doc.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  doc.decision === "Approved"
                                    ? "default"
                                    : doc.decision === "Rejected"
                                    ? "destructive"
                                    : doc.decision ===
                                      "Approved with Conditions"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {doc.decision}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <SampleButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewGeneratedDoc(doc.id)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </SampleButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="versions" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Version History</CardTitle>
                    <CardDescription>
                      Track changes made to this document template over time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Changes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documentData.versions.map((version) => (
                          <TableRow key={version.id}>
                            <TableCell className="font-medium">
                              {version.number}
                            </TableCell>
                            <TableCell>{formatDate(version.date)}</TableCell>
                            <TableCell>{version.author}</TableCell>
                            <TableCell>{version.changes}</TableCell>
                            <TableCell className="text-right">
                              <SampleButton variant="ghost" size="sm">
                                <History className="h-4 w-4" />
                                <span className="sr-only">View version</span>
                              </SampleButton>
                            </TableCell>
                          </TableRow>
                        ))}
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
                <CardTitle>Template Configuration</CardTitle>
                <CardDescription>
                  Configure how this document template works.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Template Type</h4>
                  <Select defaultValue="credit-memo">
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-memo">Credit Memo</SelectItem>
                      <SelectItem value="analytical-report">
                        Analytical Report
                      </SelectItem>
                      <SelectItem value="compliance-report">
                        Compliance Report
                      </SelectItem>
                      <SelectItem value="customer-summary">
                        Customer Summary
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Default Workflow</h4>
                  <Select defaultValue="workflow-1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select default workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    The default workflow used to generate document sections.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Document Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="doc-title">Document Title Format</Label>
                      <Input
                        id="doc-title"
                        defaultValue="{type} - {applicationId}"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use variables like {"{type}"}, {"{applicationId}"},{" "}
                        {"{date}"} in the format.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="auto-generate">
                        Auto-Generate Sections
                      </Label>
                      <Select defaultValue="all">
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select when to auto-generate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All workflow sections
                          </SelectItem>
                          <SelectItem value="marked">
                            Only marked sections
                          </SelectItem>
                          <SelectItem value="none">
                            None (manual generation)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="version-history">
                          Keep Version History
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Track changes to generated documents
                        </p>
                      </div>
                      <Switch id="version-history" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allow-manual-edits">
                          Allow Manual Edits
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Allow editing generated content
                        </p>
                      </div>
                      <Switch id="allow-manual-edits" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <SampleButton variant="outline">Reset to Default</SampleButton>
                <SampleButton>Save Configuration</SampleButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Configure Section Template</DialogTitle>
            <DialogDescription>
              Configure how this section template works. You can set it as a
              manual template or link it to a workflow output.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="section-title">Section Title</Label>
              <Input
                id="section-title"
                value={editingSectionTitle}
                onChange={(e) => setEditingSectionTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="section-type">Section Type</Label>
              <Select
                value={editingSectionType}
                onValueChange={(value: "template" | "workflow") =>
                  setEditingSectionType(value)
                }
              >
                <SelectTrigger id="section-type">
                  <SelectValue placeholder="Select section type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">
                    Template (Manual Variables)
                  </SelectItem>
                  <SelectItem value="workflow">Workflow Output</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingSectionType === "workflow" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="section-workflow">Workflow</Label>
                  <Select
                    value={editingSectionWorkflow}
                    onValueChange={setEditingSectionWorkflow}
                  >
                    <SelectTrigger id="section-workflow">
                      <SelectValue placeholder="Select workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingSectionWorkflow && (
                  <div className="grid gap-2">
                    <Label htmlFor="section-output">Workflow Output</Label>
                    <Select
                      value={editingSectionWorkflowOutput}
                      onValueChange={setEditingSectionWorkflowOutput}
                    >
                      <SelectTrigger id="section-output">
                        <SelectValue placeholder="Select output" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(
                          availableWorkflows.find(
                            (w) => w.id === editingSectionWorkflow,
                          )?.outputSchema || {},
                        ).map((output) => (
                          <SelectItem key={output} value={output}>
                            {output}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {editingSectionWorkflowOutput && (
                      <div className="mt-2">
                        <Label>Available Variables:</Label>
                        <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                          <div className="grid grid-cols-1 gap-1">
                            {Object.entries(
                              availableWorkflows.find(
                                (w) => w.id === editingSectionWorkflow,
                              )?.outputSchema || {},
                            ).map(([key, value]) => {
                              if (key === editingSectionWorkflowOutput) {
                                return Object.entries(
                                  value as Record<string, string>,
                                ).map(([subKey, subValue]) => (
                                  <div
                                    key={`${key}.${subKey}`}
                                    className="flex items-center justify-between"
                                  >
                                    <code className="text-xs">
                                      [{key}.{subKey}]
                                    </code>
                                    <span className="text-xs text-muted-foreground">
                                      {subValue}
                                    </span>
                                  </div>
                                ));
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="section-content">Template Content</Label>
                {editingSectionType === "workflow" && (
                  <SampleButton variant="ghost" size="sm" className="h-8">
                    <Code className="h-3.5 w-3.5 mr-1" />
                    Insert Variable
                  </SampleButton>
                )}
              </div>
              <Textarea
                id="section-content"
                value={editingSectionContent}
                onChange={(e) => setEditingSectionContent(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use variables in square brackets like [variable.name] to insert
                dynamic content.
              </p>
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton onClick={saveEditedSection}>
              Save Configuration
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Section Dialog */}
      <Dialog
        open={isRegenerateDialogOpen}
        onOpenChange={setIsRegenerateDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Regenerate Section</DialogTitle>
            <DialogDescription>
              Regenerate this section using the selected workflow version. This
              will update the content in the generated document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {regeneratingSectionId && regeneratingDocId && (
              <>
                <div className="grid gap-2">
                  <Label>Document</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {
                      generatedDocuments.find((d) => d.id === regeneratingDocId)
                        ?.title
                    }
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Section</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {
                      documentData.sections.find(
                        (s) => s.id === regeneratingSectionId,
                      )?.title
                    }
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Workflow</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {
                      availableWorkflows.find(
                        (w) =>
                          w.id ===
                          documentData.sections.find(
                            (s) => s.id === regeneratingSectionId,
                          )?.workflowId,
                      )?.name
                    }
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="workflow-version">Workflow Version</Label>
                  <Select
                    value={selectedWorkflowVersion}
                    onValueChange={setSelectedWorkflowVersion}
                  >
                    <SelectTrigger id="workflow-version">
                      <SelectValue placeholder="Select workflow version" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkflows
                        .find(
                          (w) =>
                            w.id ===
                            documentData.sections.find(
                              (s) => s.id === regeneratingSectionId,
                            )?.workflowId,
                        )
                        ?.versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.number} (Released: {version.date})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Warning</Label>
                  <p className="text-sm text-amber-500">
                    Regenerating this section will update the content in the
                    generated document. Any manual edits to the generated
                    content will be lost.
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsRegenerateDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton onClick={regenerateSection}>
              Regenerate Section
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog
        open={isAddSectionDialogOpen}
        onOpenChange={setIsAddSectionDialogOpen}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Add a new section template to the document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="section-title">Section Title</Label>
              <Input
                id="section-title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Enter section title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="section-type">Section Type</Label>
              <Select
                value={newSectionType}
                onValueChange={(value: "template" | "workflow") =>
                  setNewSectionType(value)
                }
              >
                <SelectTrigger id="section-type">
                  <SelectValue placeholder="Select section type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">
                    Template (Manual Variables)
                  </SelectItem>
                  <SelectItem value="workflow">Workflow Output</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newSectionType === "workflow" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="section-workflow">Workflow</Label>
                  <Select
                    value={newSectionWorkflow}
                    onValueChange={setNewSectionWorkflow}
                  >
                    <SelectTrigger id="section-workflow">
                      <SelectValue placeholder="Select workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newSectionWorkflow && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {
                        availableWorkflows.find(
                          (w) => w.id === newSectionWorkflow,
                        )?.description
                      }
                    </p>
                  )}
                </div>

                {newSectionWorkflow && (
                  <div className="grid gap-2">
                    <Label htmlFor="section-output">Workflow Output</Label>
                    <Select
                      value={newSectionWorkflowOutput}
                      onValueChange={setNewSectionWorkflowOutput}
                    >
                      <SelectTrigger id="section-output">
                        <SelectValue placeholder="Select output" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(
                          availableWorkflows.find(
                            (w) => w.id === newSectionWorkflow,
                          )?.outputSchema || {},
                        ).map((output) => (
                          <SelectItem key={output} value={output}>
                            {output}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="section-content">Template Content</Label>
                <Textarea
                  id="section-content"
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  placeholder="Enter section template content with [variables]"
                  rows={5}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use variables in square brackets like [variable.name] to
                  insert dynamic content.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsAddSectionDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton
              onClick={handleAddSection}
              disabled={!newSectionTitle}
            >
              Add Section
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Generated Document Dialog */}
      <Dialog
        open={isViewGeneratedDocDialogOpen}
        onOpenChange={setIsViewGeneratedDocDialogOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewingDocId &&
                generatedDocuments.find((d) => d.id === viewingDocId)?.title}
            </DialogTitle>
            <DialogDescription>
              Generated document details and section management.
            </DialogDescription>
          </DialogHeader>

          {viewingDocId && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        generatedDocuments.find((d) => d.id === viewingDocId)
                          ?.status === "completed"
                          ? "outline"
                          : generatedDocuments.find(
                              (d) => d.id === viewingDocId,
                            )?.status === "in-progress"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {
                        generatedDocuments.find((d) => d.id === viewingDocId)
                          ?.status
                      }
                    </Badge>
                    <Badge variant="outline">
                      {
                        generatedDocuments.find((d) => d.id === viewingDocId)
                          ?.decision
                      }
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applicant:{" "}
                    {
                      generatedDocuments.find((d) => d.id === viewingDocId)
                        ?.applicant
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created:{" "}
                    {formatDate(
                      generatedDocuments.find((d) => d.id === viewingDocId)
                        ?.createdDate || null,
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <SampleButton variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </SampleButton>
                  <SampleButton variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </SampleButton>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Document Sections</h3>
                <p className="text-sm text-muted-foreground">
                  You can regenerate individual sections if needed.
                </p>

                {documentData.sections.map((section) => {
                  const docSection = generatedDocuments
                    .find((d) => d.id === viewingDocId)
                    ?.sections.find((s) => s.sectionId === section.id);

                  return (
                    <div
                      key={section.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3 bg-muted/30">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{section.title}</h4>
                          {section.type === "workflow" && (
                            <Badge variant="secondary" className="text-xs">
                              <Workflow className="h-3 w-3 mr-1" />
                              {section.workflowName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {section.type === "workflow" && (
                            <SampleButton
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRegenerateSection(
                                  viewingDocId,
                                  section.id,
                                )
                              }
                              disabled={!docSection?.lastGenerated}
                            >
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
                              Regenerate
                            </SampleButton>
                          )}
                        </div>
                      </div>
                      <div className="p-4 border-t">
                        {docSection?.lastGenerated ? (
                          <>
                            <div className="whitespace-pre-wrap bg-muted/20 p-3 rounded">
                              {/* This would be the actual generated content in a real app */}
                              {section.content.replace(
                                /\[(.*?)\]/g,
                                (match, variable) => {
                                  // Simulate replacing variables with actual values
                                  const sampleValues: Record<string, string> = {
                                    "application.id": "APP-2023-7845",
                                    "decision.recommendation": "APPROVAL",
                                    "decision.terms":
                                      "standard terms and conditions",
                                    "applicant.name": "Mohammed Al-Harbi",
                                    "business.name": "Al-Harbi Electronics",
                                    "business.yearsInOperation": "5",
                                    "business.annualRevenue": "SAR 1,200,000",
                                    "application.loanAmount": "SAR 250,000",
                                    "application.purpose":
                                      "Inventory expansion",
                                    "applicant.creditScore": "720",
                                    "applicant.creditRating": "Good",
                                    "applicant.dti": "0.32",
                                    "business.healthScore": "85",
                                    "market.riskLevel": "Low",
                                    "risk.overallRating": "Low-Medium",
                                    "risk.creditworthiness":
                                      "strong creditworthiness",
                                    "business.stability": "stable",
                                    "business.financialHealth": "healthy",
                                    "risk.loanToRevenueRatio":
                                      "a manageable 20%",
                                    "decision.loanAmount": "SAR 250,000",
                                    "decision.term": "36 months",
                                    "decision.interestRate": "8.5%",
                                    "decision.collateral": "None",
                                    "decision.specialConditions":
                                      "Quarterly business performance review",
                                  };
                                  return sampleValues[variable] || match;
                                },
                              )}
                            </div>
                            <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
                              <p>
                                Generated on{" "}
                                {formatDate(docSection.lastGenerated)} using
                                workflow version {docSection.workflowVersion}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center p-6 text-muted-foreground">
                            <p>This section has not been generated yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <SampleButton
              onClick={() => setIsViewGeneratedDocDialogOpen(false)}
            >
              Close
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
