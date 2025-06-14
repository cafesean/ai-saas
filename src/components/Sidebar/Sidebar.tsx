"use client";

import type React from "react";
import { Route } from "next";
import {
  BarChart3,
  Brain,
  Building,
  ChevronDown,
  Code,
  Database,
  File,
  FileText,
  GitBranch,
  Home,
  Layout,
  Settings,
  User,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SampleButton } from "@/components/ui/sample-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AdminRoutes } from "@/constants/routes";
import { WithPermission } from "@/components/auth/WithPermission";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  // Permission requirements for visibility
  permission?: string;
  permissions?: string[];
  anyPermissions?: string[];
  role?: string | string[];
  // Whether this item is admin-only
  adminOnly?: boolean;
}

// Helper component to render navigation item with permission gating
function NavItemComponent({ item, pathname, expanded, toggleExpanded }: {
  item: NavItem;
  pathname: string;
  expanded: Record<string, boolean>;
  toggleExpanded: (key: string) => void;
}) {
  const permissionProps = {
    permission: item.permission,
    permissions: item.permissions,
    anyPermissions: item.anyPermissions,
    role: item.role,
  };

  const content = item.children ? (
    <div className="flex flex-col">
      <SampleButton
        variant="ghost"
        className={cn(
          "w-full justify-start text-left font-normal",
          item.href &&
            pathname.startsWith(item.href) &&
            "bg-muted font-medium",
        )}
        onClick={() => toggleExpanded(item.title.toLowerCase())}
      >
        <item.icon className="mr-2 h-4 w-4" />
        {item.title}
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 transition-transform",
            expanded[item.title.toLowerCase()] && "rotate-180",
          )}
        />
      </SampleButton>
      {expanded[item.title.toLowerCase()] && (
        <div className="ml-4 mt-1 flex flex-col gap-1">
          {item.children.map((child, childIndex) => (
            <NavItemComponent
              key={childIndex}
              item={child}
              pathname={pathname}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  ) : (
    <SampleButton
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start text-left font-normal",
        pathname === item.href && "bg-muted font-medium",
      )}
    >
      <Link href={item.href as Route}>
        <item.icon className="mr-2 h-4 w-4" />
        {item.title}
      </Link>
    </SampleButton>
  );

  // If no permission requirements, show to everyone
  if (!item.permission && !item.permissions && !item.anyPermissions && !item.role && !item.adminOnly) {
    return content;
  }

  // Use admin-only shortcut if specified
  if (item.adminOnly) {
    return (
      <WithPermission role={["Admin", "Super Admin"]} hideWhenUnauthorized>
        {content}
      </WithPermission>
    );
  }

  // Use WithPermission component for gating
  return (
    <WithPermission {...permissionProps} hideWhenUnauthorized>
      {content}
    </WithPermission>
  );
}

export function Sidebar({ setOpen }: { setOpen?: (open: boolean) => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    models: false,
    workflows: false,
    organizations: false,
    settings: false,
  });

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      // Dashboard accessible to all authenticated users
    },
    {
      title: "Models",
      icon: Brain,
      permission: "models:read", // Requires model read permission
      children: [
        {
          title: "All Models",
          href: AdminRoutes.models,
          icon: Brain,
          permission: "models:read",
        },
        {
          title: "Model Registry",
          href: AdminRoutes.modelRegistry,
          icon: Database,
          permission: "models:manage", // Higher permission for registry
        },
      ],
    },
    {
      title: "Workflows",
      href: AdminRoutes.workflows,
      icon: GitBranch,
      permission: "workflow:read", // Basic workflow access
    },
    {
      title: "Decisioning",
      href: AdminRoutes.decisionTables,
      icon: FileText,
      permission: "decisioning:read", // Decision table access
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      anyPermissions: ["analytics:read", "admin:full_access"], // Analytics or admin access
    },
    {
      title: "Knowledge Bases",
      href: AdminRoutes.knowledgebase,
      icon: Database,
      permission: "knowledge_bases:read",
    },
    {
      title: "AI Docs",
      href: "/documents",
      icon: File,
      permission: "documents:read",
    },
    {
      title: "Content Repo",
      href: "/content-repo",
      icon: File,
      permission: "content:read",
    },
    {
      title: "Widgets",
      href: "/widgets",
      icon: Layout,
      permission: "widgets:read",
    },
    {
      title: "API Docs",
      href: "/api-docs",
      icon: Code,
      // API docs accessible to all users
    },
  ];

  // Add role management to main nav for admins
  const adminNavItems: NavItem[] = [
    {
      title: "Role Management",
      href: "/roles",
      icon: Shield,
      permission: "admin:role_management",
    },
    {
      title: "User Management", 
      href: "/users",
      icon: Users,
      permission: "admin:user_management",
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      children: [
        {
          title: "General",
          href: "/settings/general",
          icon: Settings,
          // General settings accessible to all users
        },
        {
          title: "Organizations",
          href: "/settings/organizations",
          icon: Building,
          permission: "organization:manage",
        },
        {
          title: "Users",
          href: "/settings/users",
          icon: User,
          permission: "admin:user_management",
        },
        {
          title: "API Keys",
          href: "/settings/api-keys",
          icon: Code,
          permission: "api_keys:manage",
        },
        {
          title: "Templates",
          href: "/settings/templates",
          icon: FileText,
          permission: "workflow:manage_templates",
        },
      ],
    },
  ];

  return (
    // Restore the outer flex container to serve as the single parent element
    <div className="flex h-full flex-col">
      {/* Keep the top empty div removed */}
      {/* <div className="flex h-14 items-center border-b px-4"> ... </div> */}
      <ScrollArea className="flex-1 px-2 py-4">
        {" "}
        {/* Use flex-1 for ScrollArea */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <NavItemComponent
              key={index}
              item={item}
              pathname={pathname}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
            />
          ))}
          
          {/* Admin navigation section with visual separator */}
          <WithPermission anyPermissions={["admin:role_management", "admin:user_management"]} hideWhenUnauthorized>
            <div className="my-2 border-t border-border pt-2">
              <div className="px-3 pb-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Administration
                </h4>
              </div>
              {adminNavItems.map((item, index) => (
                <NavItemComponent
                  key={`admin-${index}`}
                  item={item}
                  pathname={pathname}
                  expanded={expanded}
                  toggleExpanded={toggleExpanded}
                />
              ))}
            </div>
          </WithPermission>
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t">
        <div className="px-2 py-4">
          <nav className="flex flex-col gap-1">
            {bottomNavItems.map((item, index) => (
              <NavItemComponent
                key={`bottom-${index}`}
                item={item}
                pathname={pathname}
                expanded={expanded}
                toggleExpanded={toggleExpanded}
              />
            ))}
          </nav>
        </div>
        {/* Remove the user profile section from the bottom */}
        {/* <div className="flex items-center gap-2 p-4 border-t"> ... </div> */}
      </div>
    </div> // Restore outer div closing tag
  );
}
