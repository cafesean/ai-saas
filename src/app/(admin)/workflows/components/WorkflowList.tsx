"use client";
import Link from "next/link";
import { Route } from "next";
import { Clock, MoreHorizontal } from "lucide-react"; // Added icons for grid view

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTimeAgo } from "@/utils/func";
import { SampleButton } from "@/components/ui/sample-button";
import { AdminRoutes } from "@/constants/routes";
import { WorkflowCardProps } from "@/types/Workflow";
import { WorkflowStatus } from "@/constants/general";

export const WorkflowList = ({
  workflows,
  onDelete,
  onChangeStatus,
}: {
  workflows: WorkflowCardProps[];
  onDelete: (workflow: any) => void;
  onChangeStatus: (workflow: any) => void;
}) => {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow.uuid}>
                <TableCell className="font-medium">
                  <Link
                    href={`/workflows/${workflow.uuid}`}
                    className="hover:underline"
                  >
                    {workflow.name}
                  </Link>
                </TableCell>
                <TableCell>{workflow.type}</TableCell>
                <TableCell>{workflow.status}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{getTimeAgo(workflow.updatedAt)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SampleButton
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        <span className="sr-only">More Options</span>
                      </SampleButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link
                          href={`${
                            AdminRoutes.workflowDetail.replace(
                              ":uuid",
                              workflow.uuid,
                            ) as Route
                          }`}
                        >
                          Edit Model
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onChangeStatus(workflow)}
                      >
                        {workflow.status === WorkflowStatus.PUBLISHED
                          ? "Pause Workflow"
                          : "Publish Workflow"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => onDelete(workflow)}
                      >
                        Delete Workflow
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
