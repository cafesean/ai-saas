"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Plus,
  Eye,
  Download,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Checkbox from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChunkingStrategyOptions } from "@/constants/knowledgeBase";
import { api } from "@/utils/trpc";

interface Chunk {
  id: string;
  uuid: string;
  content: string;
  chunkingStrategy: string;
  chunkSize: number;
  chunkOverlap: number;
  isManual: boolean;
  status: string;
  metadata?: {
    chunkIndex: number;
    startChar: number;
    endChar: number;
    pageNumber?: number;
    section?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  document: {
    name: string;
    uuid: string;
  };
}

interface DataManagementTabProps {
  documentId: string;
  knowledgeBaseId: string;
}

export function DataManagementTab({ documentId, knowledgeBaseId }: DataManagementTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState<string>("all");
  const [selectedChunks, setSelectedChunks] = useState<string[]>([]);
  const [editingChunk, setEditingChunk] = useState<Chunk | null>(null);
  const [viewingChunk, setViewingChunk] = useState<Chunk | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);

  // API calls - only run if documentId is valid
  const {
    data: chunksData,
    isLoading: isLoadingChunks,
    refetch: refetchChunks,
  } = api.knowledgeBases.getDocumentChunks.useQuery({
    documentId,
    search: searchQuery || undefined,
    chunkingStrategy: selectedStrategy && selectedStrategy !== "all" ? selectedStrategy : undefined,
    limit: pageSize,
    offset: page * pageSize,
  }, {
    enabled: !!documentId && documentId.length > 0,
  });

  const {
    data: statsData,
    isLoading: isLoadingStats,
  } = api.knowledgeBases.getChunkStats.useQuery({
    documentId,
  }, {
    enabled: !!documentId && documentId.length > 0,
  });

  const updateChunkMutation = api.knowledgeBases.updateChunk.useMutation({
    onSuccess: () => {
      toast.success("Chunk updated successfully");
      setEditingChunk(null);
      refetchChunks();
    },
    onError: (error) => {
      toast.error("Failed to update chunk: " + error.message);
    },
  });

  const deleteChunksMutation = api.knowledgeBases.deleteChunks.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} chunk(s) deleted successfully`);
      setSelectedChunks([]);
      refetchChunks();
    },
    onError: (error) => {
      toast.error("Failed to delete chunks: " + error.message);
    },
  });

  const reEmbedChunksMutation = api.knowledgeBases.reEmbedChunks.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.updatedCount} chunk(s) queued for re-embedding`);
      setSelectedChunks([]);
      refetchChunks();
    },
    onError: (error) => {
      toast.error("Failed to re-embed chunks: " + error.message);
    },
  });

  const createChunkMutation = api.knowledgeBases.createChunk.useMutation({
    onSuccess: () => {
      toast.success("Chunk created successfully");
      setIsCreateDialogOpen(false);
      refetchChunks();
    },
    onError: (error) => {
      toast.error("Failed to create chunk: " + error.message);
    },
  });

  const chunks = chunksData?.chunks || [];
  const totalChunks = chunksData?.total || 0;

  const filteredChunks = useMemo(() => {
    return chunks;
  }, [chunks]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedChunks(chunks.map(chunk => chunk.uuid));
    } else {
      setSelectedChunks([]);
    }
  };

  const handleSelectChunk = (chunkId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedChunks(prev => [...prev, chunkId]);
    } else {
      setSelectedChunks(prev => prev.filter(id => id !== chunkId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedChunks.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedChunks.length} chunk(s)?`)) {
      deleteChunksMutation.mutate({ chunkIds: selectedChunks });
    }
  };

  const handleReEmbedSelected = () => {
    if (selectedChunks.length === 0) return;
    
    reEmbedChunksMutation.mutate({ chunkIds: selectedChunks });
  };

  const handleEditChunk = (chunk: Chunk) => {
    setEditingChunk(chunk);
  };

  const handleSaveEdit = (content: string) => {
    if (!editingChunk) return;
    
    updateChunkMutation.mutate({
      chunkId: editingChunk.uuid,
      content,
    });
  };

  const handleCreateChunk = (content: string) => {
    createChunkMutation.mutate({
      documentId,
      content,
      chunkingStrategy: "manual",
      metadata: {
        chunkIndex: chunks.length,
        startChar: 0,
        endChar: content.length,
        chunkingStrategy: "manual",
      },
    });
  };

  const getStrategyBadgeVariant = (strategy: string) => {
    switch (strategy) {
      case "semantic": return "default";
      case "fixed-length": return "secondary";
      case "sentence": return "outline";
      case "paragraph": return "destructive";
      case "manual": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalChunks}</div>
            <p className="text-xs text-muted-foreground">Total Chunks</p>
          </CardContent>
        </Card>
        {statsData?.byStrategy.map((stat) => (
          <Card key={stat.strategy}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stat.total}</div>
              <p className="text-xs text-muted-foreground capitalize">
                {stat.strategy.replace("-", " ")} Strategy
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chunk Management</CardTitle>
              <CardDescription>
                View, edit, and manage individual text chunks
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedChunks.length > 0 && (
                <>
                  <SampleButton
                    variant="outline"
                    size="sm"
                    onClick={handleReEmbedSelected}
                    disabled={reEmbedChunksMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Re-embed ({selectedChunks.length})
                  </SampleButton>
                  <SampleButton
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={deleteChunksMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedChunks.length})
                  </SampleButton>
                </>
              )}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <SampleButton size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Chunk
                  </SampleButton>
                </DialogTrigger>
                <CreateChunkDialog
                  onSave={handleCreateChunk}
                  isLoading={createChunkMutation.isPending}
                />
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chunk content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                {ChunkingStrategyOptions.map((strategy) => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chunks Table */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-4 pb-2 border-b">
              <Checkbox
                checked={selectedChunks.length === chunks.length && chunks.length > 0}
                onChange={handleSelectAll}
              />
              <div className="flex-1 text-sm font-medium">Content Preview</div>
              <div className="w-24 text-sm font-medium">Strategy</div>
              <div className="w-20 text-sm font-medium">Size</div>
              <div className="w-20 text-sm font-medium">Status</div>
              <div className="w-10"></div>
            </div>

            {/* Chunks */}
            {isLoadingChunks ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading chunks...
              </div>
            ) : filteredChunks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No chunks found. Upload documents to see chunks here.
              </div>
            ) : (
              filteredChunks.map((chunk) => (
                <div
                  key={chunk.uuid}
                  className="flex items-center space-x-4 py-3 border-b last:border-b-0 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedChunks.includes(chunk.uuid)}
                    onChange={(e) => handleSelectChunk(chunk.uuid, e)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm mb-1 overflow-hidden">
                      <div className="max-h-10 overflow-hidden">
                        {chunk.content.substring(0, 200)}...
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Chunk {chunk.metadata?.chunkIndex || 0} • 
                      {chunk.document.name}
                      {chunk.isManual && " • Manual"}
                    </div>
                  </div>
                  <div className="w-24">
                    <Badge variant={getStrategyBadgeVariant(chunk.chunkingStrategy)}>
                      {chunk.chunkingStrategy}
                    </Badge>
                  </div>
                  <div className="w-20 text-sm text-muted-foreground">
                    {chunk.chunkSize}
                  </div>
                  <div className="w-20">
                    <Badge variant={chunk.status === "processed" ? "default" : "secondary"}>
                      {chunk.status}
                    </Badge>
                  </div>
                  <div className="w-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SampleButton variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </SampleButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingChunk(chunk)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Content
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditChunk(chunk)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Content
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(chunk.content)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Content
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleReEmbedSelected()}
                          className="text-blue-600"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Re-embed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteSelected()}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalChunks > pageSize && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {page * pageSize + 1} to{" "}
                {Math.min((page + 1) * pageSize, totalChunks)} of {totalChunks} chunks
              </div>
              <div className="flex items-center gap-2">
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </SampleButton>
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * pageSize >= totalChunks}
                >
                  Next
                </SampleButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Chunk Dialog */}
      {editingChunk && (
        <EditChunkDialog
          chunk={editingChunk}
          onSave={handleSaveEdit}
          onClose={() => setEditingChunk(null)}
          isLoading={updateChunkMutation.isPending}
        />
      )}

      {/* View Chunk Dialog */}
      {viewingChunk && (
        <ViewChunkDialog
          chunk={viewingChunk}
          onClose={() => setViewingChunk(null)}
        />
      )}
    </div>
  );
}

// Edit Chunk Dialog Component
function EditChunkDialog({
  chunk,
  onSave,
  onClose,
  isLoading,
}: {
  chunk: Chunk;
  onSave: (content: string) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [content, setContent] = useState(chunk.content);

  const handleSave = () => {
    onSave(content);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Chunk</DialogTitle>
          <DialogDescription>
            Modify the content of this chunk. Changes will clear existing embeddings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Strategy: <Badge>{chunk.chunkingStrategy}</Badge></div>
            <div>Size: {chunk.chunkSize} characters</div>
            <div>Document: {chunk.document.name}</div>
            <div>Index: {chunk.metadata?.chunkIndex || 0}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Enter chunk content..."
            />
            <div className="text-xs text-muted-foreground">
              {content.length} characters
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <SampleButton variant="outline" onClick={onClose}>
              Cancel
            </SampleButton>
            <SampleButton onClick={handleSave} disabled={isLoading || !content.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </SampleButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// View Chunk Dialog Component
function ViewChunkDialog({
  chunk,
  onClose,
}: {
  chunk: Chunk;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>View Chunk</DialogTitle>
          <DialogDescription>
            Full content and metadata for this chunk
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
            <div>Strategy: <Badge>{chunk.chunkingStrategy}</Badge></div>
            <div>Size: {chunk.chunkSize} characters</div>
            <div>Document: {chunk.document.name}</div>
            <div>Index: {chunk.metadata?.chunkIndex || 0}</div>
            <div>Status: <Badge>{chunk.status}</Badge></div>
            <div>Manual: {chunk.isManual ? "Yes" : "No"}</div>
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <div className="border rounded-lg p-4 bg-muted/50 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {chunk.content}
              </pre>
            </div>
            <div className="text-xs text-muted-foreground">
              {chunk.content.length} characters
            </div>
          </div>
          <div className="flex justify-end">
            <SampleButton onClick={onClose}>
              Close
            </SampleButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Create Chunk Dialog Component
function CreateChunkDialog({
  onSave,
  isLoading,
}: {
  onSave: (content: string) => void;
  isLoading: boolean;
}) {
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
      setContent("");
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Create Manual Chunk</DialogTitle>
        <DialogDescription>
          Create a manually defined chunk for this document
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newContent">Content</Label>
          <Textarea
            id="newContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Enter chunk content..."
          />
          <div className="text-xs text-muted-foreground">
            {content.length} characters
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <SampleButton 
            onClick={handleSave} 
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? "Creating..." : "Create Chunk"}
          </SampleButton>
        </div>
      </div>
    </DialogContent>
  );
}