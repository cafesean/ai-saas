"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SampleCheckbox } from "@/components/ui/sample-checkbox";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { type UserWithStats } from "@/types/user";
import { formatDistanceToNow } from "date-fns";

interface UseUserTableColumnsProps {
  onEdit: (user: UserWithStats) => void;
  onDelete: (user: UserWithStats) => void;
  onManageRoles: (user: UserWithStats) => void;
  onToggleStatus: (user: UserWithStats) => void;
}

export function useUserTableColumns({
  onEdit,
  onDelete,
  onManageRoles,
  onToggleStatus,
}: UseUserTableColumnsProps): ColumnDef<UserWithStats>[] {
  return [
    // Selection column
    {
      id: "select",
      header: ({ table }) => (
        <SampleCheckbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <SampleCheckbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={false} // No system users to protect like roles
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // Name column
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User';
        
        return (
          <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            {user.username && (
              <span className="text-xs text-muted-foreground">@{user.username}</span>
            )}
          </div>
        );
      },
    },
    // Email column
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return (
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{email}</span>
          </div>
        );
      },
    },
    // Status column
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    // Roles column
    {
      accessorKey: "roleCount",
      header: "Roles",
      cell: ({ row }) => {
        const user = row.original;
        const roleCount = user.roleCount;
        
        if (roleCount === 0) {
          return <span className="text-muted-foreground">No roles</span>;
        }
        
        return (
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>{roleCount} role{roleCount !== 1 ? 's' : ''}</span>
            {user.roles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.roles.slice(0, 2).map((role) => (
                  <Badge key={`${role.id}-${role.tenantId}`} variant="outline" className="text-xs">
                    {role.name}
                  </Badge>
                ))}
                {user.roles.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.roles.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    // Tenants column
    {
      accessorKey: "tenantCount",
      header: "Tenants",
      cell: ({ row }) => {
        const tenantCount = row.getValue("tenantCount") as number;
        return (
          <span className={tenantCount === 0 ? "text-muted-foreground" : ""}>
            {tenantCount} tenant{tenantCount !== 1 ? 's' : ''}
          </span>
        );
      },
    },
    // Phone column
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string | null;
        if (!phone) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{phone}</span>
          </div>
        );
      },
    },
    // Last Login column
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => {
        const lastLoginAt = row.getValue("lastLoginAt") as Date | null;
        if (!lastLoginAt) {
          return <span className="text-muted-foreground">Never</span>;
        }
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {formatDistanceToNow(lastLoginAt, { addSuffix: true })}
            </span>
          </div>
        );
      },
    },
    // Created At column
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
        );
      },
    },
    // Actions column
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageRoles(user)}>
                <Shield className="mr-2 h-4 w-4" />
                Manage Roles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onToggleStatus(user)}
                className={user.isActive ? "text-orange-600" : "text-green-600"}
              >
                {user.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(user)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 