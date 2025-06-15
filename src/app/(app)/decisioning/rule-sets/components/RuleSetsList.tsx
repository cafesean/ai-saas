"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Route } from "next";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Settings,
  CheckCircle,
  Archive,
  Clock,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SampleButton } from "@/components/ui/sample-button";
import { Badge } from "@/components/ui/badge";
import { RuleSetStatus } from "@/db/schema/rule_set";

interface RuleSet {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  inputSchema: unknown;
  outputSchema: unknown;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RuleSetsListProps {
  ruleSets: RuleSet[];
  viewMode: string;
  onDelete: (ruleSet: RuleSet) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case RuleSetStatus.DRAFT:
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>;
    case RuleSetStatus.PUBLISHED:
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Published</Badge>;
    case RuleSetStatus.DEPRECATED:
      return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">Deprecated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case RuleSetStatus.DRAFT:
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case RuleSetStatus.PUBLISHED:
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case RuleSetStatus.DEPRECATED:
      return <Archive className="h-4 w-4 text-gray-600" />;
    default:
      return <Settings className="h-4 w-4 text-gray-600" />;
  }
};

const formatDate = (date: Date | null) => {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const RuleSetsList = ({ ruleSets, viewMode, onDelete }: RuleSetsListProps) => {
  const router = useRouter();

  const handleView = (ruleSet: RuleSet) => {
    router.push(`/decisioning/rule-sets/${ruleSet.uuid}` as Route);
  };

  const handleEdit = (ruleSet: RuleSet) => {
    router.push(`/decisioning/rule-sets/${ruleSet.uuid}?edit=true` as Route);
  };

  if (viewMode === "table") {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ruleSets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No rule sets found
                </TableCell>
              </TableRow>
            ) : (
              ruleSets.map((ruleSet) => (
                <TableRow key={ruleSet.uuid} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ruleSet.status)}
                      <span onClick={() => handleView(ruleSet)}>{ruleSet.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={ruleSet.description || ""}>
                      {ruleSet.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(ruleSet.status)}</TableCell>
                  <TableCell>v{ruleSet.version}</TableCell>
                  <TableCell>{formatDate(ruleSet.updatedAt)}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">0 steps</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SampleButton variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </SampleButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(ruleSet)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {ruleSet.status === RuleSetStatus.DRAFT && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(ruleSet)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(ruleSet)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Card view
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ruleSets.length === 0 ? (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No rule sets found
        </div>
      ) : (
        ruleSets.map((ruleSet) => (
          <Card key={ruleSet.uuid} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(ruleSet.status)}
                  <CardTitle 
                    className="text-lg leading-tight cursor-pointer hover:text-primary"
                    onClick={() => handleView(ruleSet)}
                  >
                    {ruleSet.name}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SampleButton variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </SampleButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(ruleSet)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    {ruleSet.status === RuleSetStatus.DRAFT && (
                      <>
                        <DropdownMenuItem onClick={() => handleEdit(ruleSet)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(ruleSet)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="line-clamp-2">
                {ruleSet.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(ruleSet.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-medium">v{ruleSet.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Steps</span>
                  <span className="text-sm font-medium">0 steps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Updated</span>
                  <span className="text-sm">{formatDate(ruleSet.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default memo(RuleSetsList); 