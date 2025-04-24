"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
import { FileText, Database, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  useKnowledgeBases,
  type KnowledgeBase,
} from "@/framework/hooks/useKnowledgeBases";

export function KnowledgeBasesList() {
  const { knowledgeBases } = useKnowledgeBases();

  if (knowledgeBases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Knowledge Bases</CardTitle>
          <CardDescription>
            You haven't created any knowledge bases yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Knowledge bases allow you to create searchable, context-aware vector
            databases from your documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {knowledgeBases.map((kb) => (
        <KnowledgeBaseCard key={kb.id} knowledgeBase={kb} />
      ))}
    </div>
  );
}

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase;
}

function KnowledgeBaseCard({ knowledgeBase }: KnowledgeBaseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl truncate">
            {knowledgeBase.name}
          </CardTitle>
          <StatusBadge status={knowledgeBase.status} />
        </div>
        <CardDescription className="line-clamp-2">
          {knowledgeBase.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Database className="mr-1 h-4 w-4" />
            <span>{knowledgeBase.vectorDb}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="mr-1 h-4 w-4" />
            <span>{knowledgeBase.documentCount} documents</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {knowledgeBase.lastUpdated}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t bg-muted/50">
        <SampleButton variant="outline" size="sm">
          <RefreshCw className="mr-2 h-3 w-3" />
          Refresh
        </SampleButton>
        <SampleButton variant="outline" size="sm" asChild>
          <Link href={`/knowledge-bases/${knowledgeBase.id}`}>
            View Details
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </SampleButton>
      </CardFooter>
    </Card>
  );
}

function StatusBadge({ status }: { status: KnowledgeBase["status"] }) {
  const variants: Record<
    KnowledgeBase["status"],
    "default" | "outline" | "destructive" | "secondary"
  > = {
    empty: "outline",
    indexing: "secondary",
    ready: "default",
    error: "destructive",
  };

  return <Badge variant={variants[status]}>{status}</Badge>;
}
