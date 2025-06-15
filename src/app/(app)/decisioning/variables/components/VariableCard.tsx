"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Eye, Play, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { api, useUtils } from "@/utils/trpc";
import { VariableStatus, VariableLogicTypes } from "@/db/schema/variable";
import { getTimeAgo } from "@/utils/func";

interface Variable {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  dataType: string;
  logicType: string;
  formula: string | null;
  lookupTableId: string | null;
  defaultValue: string | null;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VariableCardProps {
  variable: Variable;
  onDelete: (variable: Variable) => void;
}

const VariableCard = ({ variable, onDelete }: VariableCardProps) => {
  const router = useRouter();
  const utils = useUtils();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeprecating, setIsDeprecating] = useState(false);

  const publishVariable = api.variable.publish.useMutation({
    onSuccess: () => {
      utils.variable.getAll.invalidate();
      toast.success("Variable published successfully");
      setIsPublishing(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsPublishing(false);
    },
  });

  const deprecateVariable = api.variable.deprecate.useMutation({
    onSuccess: () => {
      utils.variable.getAll.invalidate();
      toast.success("Variable deprecated successfully");
      setIsDeprecating(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsDeprecating(false);
    },
  });

  const handleEdit = () => {
    router.push(`/decisioning/variables/${variable.uuid}`);
  };

  const handleView = () => {
    router.push(`/decisioning/variables/${variable.uuid}`);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishVariable.mutateAsync({ uuid: variable.uuid });
    } catch (error) {
      console.error("Error publishing variable:", error);
    }
  };

  const handleDeprecate = async () => {
    setIsDeprecating(true);
    try {
      await deprecateVariable.mutateAsync(variable.uuid);
    } catch (error) {
      console.error("Error deprecating variable:", error);
    }
  };

  const getStatusBadge = () => {
    switch (variable.status) {
      case VariableStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case VariableStatus.PUBLISHED:
        return <Badge variant="default">Published</Badge>;
      case VariableStatus.DEPRECATED:
        return <Badge variant="destructive">Deprecated</Badge>;
      default:
        return <Badge variant="outline">{variable.status}</Badge>;
    }
  };

  const getLogicTypeBadge = () => {
    switch (variable.logicType) {
      case VariableLogicTypes.DIRECT_MAP:
        return <Badge variant="outline">Direct Map</Badge>;
      case VariableLogicTypes.FORMULA:
        return <Badge variant="outline">Formula</Badge>;
      case VariableLogicTypes.LOOKUP:
        return <Badge variant="outline">Lookup</Badge>;
      default:
        return <Badge variant="outline">{variable.logicType}</Badge>;
    }
  };

  const getLogicValue = () => {
    switch (variable.logicType) {
      case VariableLogicTypes.DIRECT_MAP:
        return variable.defaultValue || "No default value";
      case VariableLogicTypes.FORMULA:
        return variable.formula || "No formula defined";
      case VariableLogicTypes.LOOKUP:
        return variable.lookupTableId ? "Lookup table configured" : "No lookup table";
      default:
        return "Unknown logic type";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {variable.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {getLogicTypeBadge()}
              <Badge variant="outline" className="text-xs">
                {variable.dataType}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {variable.status === VariableStatus.DRAFT && (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isPublishing ? "Publishing..." : "Publish"}
                  </DropdownMenuItem>
                </>
              )}
              {variable.status === VariableStatus.PUBLISHED && (
                <DropdownMenuItem 
                  onClick={handleDeprecate}
                  disabled={isDeprecating}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {isDeprecating ? "Deprecating..." : "Deprecate"}
                </DropdownMenuItem>
              )}
              {variable.status === VariableStatus.DRAFT && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(variable)}
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
      </CardHeader>

      <CardContent className="pb-3">
        {variable.description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {variable.description}
          </CardDescription>
        )}
        
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Logic: </span>
            <span className="text-foreground font-mono text-xs bg-muted px-1 py-0.5 rounded">
              {getLogicValue()}
            </span>
          </div>
          
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Version: </span>
            <span className="text-foreground">{variable.version}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>
            {variable.status === VariableStatus.PUBLISHED && variable.publishedAt
              ? `Published ${getTimeAgo(variable.publishedAt)}`
              : `Updated ${getTimeAgo(variable.updatedAt)}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleView}
          >
            View →
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VariableCard; 