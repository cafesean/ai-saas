"use client";
import { Route } from "next";
import { FileText, Database, MoreHorizontal, RefreshCw } from "lucide-react";
import Link from "next/link";

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
import { KnowledgeBase } from "@/types/knowledge-base";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { getTimeAgo } from "@/utils/func";
import { AdminRoutes } from "@/constants/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KnowledgeBaseStatus } from "@/constants/knowledgeBase";

export function KnowledgeBasesList({
  knowledgeBases,
  isLoadingKbs,
  kbsError,
  onChangeStatus,
  onDelete,
}: {
  knowledgeBases: KnowledgeBase[];
  isLoadingKbs: boolean;
  kbsError: any;
  onChangeStatus: (knowledgeBase: KnowledgeBase) => void;
  onDelete: (knowledgeBase: KnowledgeBase) => void;
}) {
  if (isLoadingKbs) {
    return <DefaultSkeleton count={5} className="m-6" />;
  }

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
        <KnowledgeBaseCard
          key={`kb-${kb.uuid}`}
          knowledgeBase={kb}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase;
  onChangeStatus: (knowledgeBase: KnowledgeBase) => void;
  onDelete: (knowledgeBase: KnowledgeBase) => void;
}

function KnowledgeBaseCard({
  knowledgeBase,
  onChangeStatus,
  onDelete,
}: KnowledgeBaseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl truncate">
            <Link
              href={`${
                AdminRoutes.knowledgebaseDetail.replace(
                  ":uuid",
                  knowledgeBase.uuid,
                ) as Route
              }`}
            >
              {knowledgeBase.name}
            </Link>
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
            <span>{knowledgeBase.vectorDB}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="mr-1 h-4 w-4" />
            <span>{knowledgeBase.documentCount} documents</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {getTimeAgo(knowledgeBase.updatedAt || new Date())}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t bg-muted/50">
        <SampleButton variant="outline" size="sm">
          <RefreshCw className="mr-2 h-3 w-3" />
          Refresh
        </SampleButton>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SampleButton variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span className="sr-only">More Options</span>
              </SampleButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link
                  href={`${
                    AdminRoutes.knowledgebaseDetail.replace(
                      ":uuid",
                      knowledgeBase.uuid,
                    ) as Route
                  }`}
                  className="flex items-center gap-2 w-full h-full"
                >
                  Edit Knowledge Base
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onChangeStatus(knowledgeBase)}
              >
                {knowledgeBase.status === KnowledgeBaseStatus.draft
                  ? "Ready"
                  : "Draft"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => onDelete(knowledgeBase)}
              >
                Delete Knowledge Base
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
