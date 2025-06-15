"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SampleCheckbox as Checkbox } from "@/components/ui/sample-checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Users,
  Calendar
} from "lucide-react";
import { WithPermission } from "@/components/auth/WithPermission";
import { type RoleWithStats } from "@/types/role";
import { formatDistanceToNow } from "date-fns";

interface UseRoleTableColumnsProps {
  onEdit?: (role: RoleWithStats) => void;
  onDelete?: (role: RoleWithStats) => void;
  onManagePermissions?: (role: RoleWithStats) => void;
}

export function useRoleTableColumns({
  onEdit,
  onDelete,
  onManagePermissions,
}: UseRoleTableColumnsProps = {}) {
  const columns = useMemo<ColumnDef<RoleWithStats>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked: boolean) => table.toggleAllPageRowsSelected(checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked: boolean) => row.toggleSelected(checked)}
          aria-label="Select row"
          disabled={row.original.isSystemRole}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{role.name}</div>
              {role.description && (
                <div className="text-sm text-muted-foreground">
                  {role.description}
                </div>
              )}
            </div>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "isSystemRole",
      header: "Type",
      cell: ({ getValue }) => {
        const isSystemRole = getValue() as boolean;
        return (
          <Badge variant={isSystemRole ? "secondary" : "outline"}>
            {isSystemRole ? "System" : "Custom"}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "permissionCount",
      header: "Permissions",
      cell: ({ getValue }) => {
        const count = getValue() as number;
        return (
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span>{count}</span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "userCount",
      header: "Users",
      cell: ({ getValue }) => {
        const count = getValue() as number;
        return (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{count}</span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original;
        
        return (
          <WithPermission permission="admin:role_management">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit?.(role)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Role
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onManagePermissions?.(role)}
                  className="cursor-pointer"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Manage Permissions
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(role)}
                  disabled={role.isSystemRole}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </WithPermission>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], [onEdit, onDelete, onManagePermissions]);

  return columns;
} 