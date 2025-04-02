import Link from "next/link";
import { Route } from "next";
import {
  Clock,
  Grid3X3,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { SampleButton } from "@/components/ui/sample-button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DecisionStatus } from "@/constants/decisionTable";
import { AdminRoutes } from "@/constants/routes";
import { getTimeAgo } from "@/utils/func";

interface DecisionTableCardProps {
  table: {
    id: number;
    uuid: string;
    name: string;
    description?: string | null;
    status: string;
    decisionTableRows: any[];
    createdAt: Date;
    updatedAt: Date;
  };
  onDelete: (decisionTable: any) => void;
}

const DecisionTableCard = ({ table, onDelete }: DecisionTableCardProps) => {
  const timeAgo = getTimeAgo(table.updatedAt);
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/decisioning/${table.uuid}` as Route}
              className="hover:text-primary transition-colors"
            >
              <h3 className="font-medium">{table.name}</h3>
            </Link>
            <Badge
              variant={
                table.status === DecisionStatus.ACTIVE ? "default" : "secondary"
              }
              className="text-xs h-5"
            >
              {table.status === DecisionStatus.ACTIVE ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" /> Inactive
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SampleButton variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">More Options</span>
                </SampleButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link
                    href={
                      `${AdminRoutes.decisionTableDetail.replace(
                        ":uuid",
                        table.uuid,
                      )}` as Route
                    }
                    className="flex items-center gap-2"
                  >
                    Edit Table
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(table)}
                >
                  Delete Table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {table.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <Grid3X3 className="mr-1 h-3 w-3" />
            <span>{table.decisionTableRows.length} rows</span>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>Updated {timeAgo}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DecisionTableCard;
