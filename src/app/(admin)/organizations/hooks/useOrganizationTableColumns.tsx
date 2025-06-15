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
  Users,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Globe,
  MapPin
} from "lucide-react";
import { type OrganizationWithStats } from "@/types/organization";
import { formatDistanceToNow } from "date-fns";

interface UseOrganizationTableColumnsProps {
  onEdit: (organization: OrganizationWithStats) => void;
  onDelete: (organization: OrganizationWithStats) => void;
  onManageUsers: (organization: OrganizationWithStats) => void;
  onToggleStatus: (organization: OrganizationWithStats) => void;
}

export function useOrganizationTableColumns({
  onEdit,
  onDelete,
  onManageUsers,
  onToggleStatus,
}: UseOrganizationTableColumnsProps): ColumnDef<OrganizationWithStats>[] {
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
      cell: ({ row }) => {
        const organization = row.original;
        const isSystemOrg = organization.slug === 'default-org' || organization.name === 'Default Organization';
        
        return (
          <SampleCheckbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            disabled={isSystemOrg} // Prevent selecting system default organization
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    // Organization name column
    {
      accessorKey: "name",
      header: "Organization",
      cell: ({ row }) => {
        const organization = row.original;
        const isSystemOrg = organization.slug === 'default-org' || organization.name === 'Default Organization';
        
        return (
          <div className="flex items-center space-x-3">
            {organization.logoUrl ? (
              <img 
                src={organization.logoUrl} 
                alt={`${organization.name} logo`}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{organization.name}</span>
                {isSystemOrg && (
                  <Badge variant="outline" className="text-xs">
                    System
                  </Badge>
                )}
              </div>
              {organization.slug && (
                <span className="text-xs text-muted-foreground">/{organization.slug}</span>
              )}
            </div>
          </div>
        );
      },
    },
    // Description column
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null;
        if (!description) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <span className="text-sm max-w-xs truncate" title={description}>
            {description}
          </span>
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
    // User count column
    {
      accessorKey: "userCount",
      header: "Users",
      cell: ({ row }) => {
        const organization = row.original;
        const { userCount, activeUserCount } = organization;
        
        return (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {userCount} total
              </span>
              {userCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {activeUserCount} active
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    // Website column
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => {
        const website = row.getValue("website") as string | null;
        if (!website) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a 
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs"
              title={website}
            >
              {website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        );
      },
    },
    // Business address column
    {
      accessorKey: "businessAddress",
      header: "Address",
      cell: ({ row }) => {
        const address = row.getValue("businessAddress") as string | null;
        if (!address) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate max-w-xs" title={address}>
              {address}
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
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
        );
      },
    },
    // Actions column
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const organization = row.original;
        const isSystemOrg = organization.slug === 'default-org' || organization.name === 'Default Organization';

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
              <DropdownMenuItem onClick={() => onEdit(organization)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Organization
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageUsers(organization)}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isSystemOrg && (
                <>
                  <DropdownMenuItem 
                    onClick={() => onToggleStatus(organization)}
                    className={organization.isActive ? "text-orange-600" : "text-green-600"}
                  >
                    {organization.isActive ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(organization)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Organization
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}