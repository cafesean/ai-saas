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
  Key,
  Calculator,
  Table,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SampleButton } from "@/components/ui/sample-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/framework/lib/utils";
import { WithPermission } from "@/components/auth/WithPermission";
import { OrgSwitcher } from "@/components/auth/OrgSwitcher";

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
function NavItemComponent({ item, pathname, expanded, toggleExpanded, isBottomMenu = false }: {
  item: NavItem;
  pathname: string;
  expanded: Record<string, boolean>;
  toggleExpanded: (key: string) => void;
  isBottomMenu?: boolean;
}) {
  const permissionProps = {
    permission: item.permission,
    permissions: item.permissions,
    anyPermissions: item.anyPermissions,
    role: item.role,
  };

  const content = item.children ? (
    <div className={cn("flex flex-col", isBottomMenu && "relative")}>
      {/* For bottom menu, render submenu first (above the button) */}
      {isBottomMenu && expanded[item.title.toLowerCase()] && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border rounded-md">
          <div className="p-2 flex flex-col gap-1">
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
        </div>
      )}
      
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
            expanded[item.title.toLowerCase()] && (isBottomMenu ? "rotate-0" : "rotate-180"),
          )}
        />
      </SampleButton>
      
      {/* For top/regular menu, render submenu after the button (below) */}
      {!isBottomMenu && expanded[item.title.toLowerCase()] && (
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
    decisioning: false,
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
      anyPermissions: ["model:read", "model:create", "model:update", "model:delete"],
      children: [
        {
          title: "All Models",
          href: "/models",
          icon: Brain,
          permission: "model:read",
        },
        {
          title: "Model Registry",
          href: "/models/registry",
          icon: Database,
          permission: "model:create",
        },
      ],
    },
    {
      title: "Workflows",
      href: "/workflows",
      icon: GitBranch,
      permission: "workflow:read",
    },
    {
      title: "Decisioning",
      icon: FileText,
      anyPermissions: ["rules:read", "decisioning:variable:read", "decisioning:lookup:read", "decisioning:ruleset:read"],
      children: [
        {
          title: "Decision Tables",
          href: "/decisioning",
          icon: FileText,
          permission: "rules:read",
        },
        {
          title: "Variables",
          href: "/decisioning/variables",
          icon: Calculator,
          permission: "decisioning:variable:read",
        },
        {
          title: "Lookup Tables",
          href: "/decisioning/lookup-tables",
          icon: Table,
          permission: "decisioning:lookup:read",
        },
        {
          title: "Rule Sets",
          href: "/decisioning/rule-sets",
          icon: GitBranch,
          permission: "decisioning:ruleset:read",
        },
      ],
    },
    {
      title: "Knowledge Bases",
      href: "/knowledge-bases",
      icon: Database,
      permission: "bases:read",
    },
    {
      title: "AI Docs",
      href: "/documents",
      icon: File,
      adminOnly: true,
    },
    {
      title: "Content Repo",
      href: "/content-repo",
      icon: File,
      adminOnly: true,
    },
    {
      title: "Widgets",
      href: "/widgets",
      icon: Layout,
      adminOnly: true,
    },
    {
      title: "API Docs",
      href: "/api-docs",
      icon: Code,
      // API docs accessible to all users
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      title: "Settings",
      icon: Settings,
      children: [
        {
          title: "Organizations",
          href: "/organizations",
          icon: Building,
          permission: "orgs:read",
        },
        {
          title: "Role Management",
          href: "/roles",
          icon: Shield,
          permission: "roles:read",
        },
        {
          title: "Permission Management",
          href: "/permissions", 
          icon: Key,
          // TODO: Restore admin-only access after debugging
          // role: "Admin",
        },
        {
          title: "User Management", 
          href: "/users",
          icon: Users,
          permission: "users:read",
        },
      ],
    },
  ];

  return (
    // Make sidebar fixed/sticky and full height - hide on mobile when setOpen is available (mobile context)
    <div className={cn(
      "w-64 flex flex-col border-r bg-background",
      setOpen ? "relative h-screen" : "fixed top-16 bottom-0 left-0 z-40 h-[calc(100vh-4rem)]"
    )}>
      {/* Org Switcher at the top */}
      <div className="px-3 py-4 border-b">
        <OrgSwitcher />
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
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
        </nav>
      </ScrollArea>
      
      {/* Settings docked to bottom */}
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
                isBottomMenu={true}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
