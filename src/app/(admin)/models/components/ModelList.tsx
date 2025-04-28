"use client";
import Link from "next/link";
import { Route } from "next";
import { memo } from "react";
import { Clock, Layers3, Tag, Cpu, MoreHorizontal } from "lucide-react"; // Added icons for grid view

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
import { type ViewMode } from "@/framework/hooks/useViewToggle"; // Import ViewMode type
import { getTimeAgo, capitalizeFirstLetterLowercase } from "@/utils/func";
import { SampleButton } from "@/components/ui/sample-button";
import { AdminRoutes } from "@/constants/routes";

interface ModelsListProps {
  models: any[];
  viewMode: ViewMode; // Add prop
  onDelete: (model: any) => void;
}

function ModelsListComponent({ models, viewMode, onDelete }: ModelsListProps) {
  if (models.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Models Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            No models are available. Try creating one.
          </p>
        </CardContent>
      </Card>
    );
  }

  // List View (Table)
  if (viewMode === "list") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/models/${model.id}`}
                      className="hover:underline"
                    >
                      {model.name}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      v{model.metrics[0].version}
                    </div>
                  </TableCell>
                  <TableCell>
                    {model.type
                      ? capitalizeFirstLetterLowercase(model.type)
                      : ""}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        model.status === "champion" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {model.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {model.framework ? model.framework : ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getTimeAgo(model.updatedAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {model?.metrics[0]?.accuracy
                      ? (parseFloat(model?.metrics[0]?.accuracy) * 100).toFixed(1)
                      : 0}
                    %
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
                              AdminRoutes.modelDetail.replace(
                                ":uuid",
                                model.uuid,
                              ) as Route
                            }`}
                          >
                            Edit Model
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => onDelete(model)}
                        >
                          Delete Model
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
  }

  // Grid View
  // Determine grid columns based on viewMode (large-grid vs medium-grid/grid)
  const gridColsClass =
    viewMode === "large-grid"
      ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"; // Default to medium/smaller grid

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-4`}>
      {models.map((model: any) => (
        <Card
          key={model.id}
          className="flex flex-col overflow-hidden transition-all hover:shadow-md"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">
                <Link
                  href={`/models/${model.uuid}`}
                  className="hover:underline"
                >
                  {model.name}
                </Link>
              </CardTitle>
              <Badge
                variant={model.status === "champion" ? "default" : "secondary"}
                className="capitalize flex-shrink-0"
              >
                {model.status}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              v{model.metrics[0]?.version}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-2 text-sm">
            {model.type && (
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-muted-foreground" />
                <span>{capitalizeFirstLetterLowercase(model.type)}</span>
              </div>
            )}
            {model.framework && (
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span>{model.framework}</span>
              </div>
            )}
            {model?.metrics[0]?.accuracy && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>
                  Accuracy:{" "}
                  {model?.metrics[0]?.accuracy
                    ? (parseFloat(model?.metrics[0]?.accuracy) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/50 p-3 text-xs text-muted-foreground border-t">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{getTimeAgo(model.updatedAt)}</span>
            </div>
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
                        AdminRoutes.modelDetail.replace(
                          ":uuid",
                          model.uuid,
                        ) as Route
                      }`}
                    >
                      Edit Model
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => onDelete(model)}
                  >
                    Delete Model
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export const ModelsList = memo(ModelsListComponent);
