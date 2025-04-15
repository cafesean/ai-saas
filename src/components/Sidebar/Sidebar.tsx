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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SampleButton } from "@/components/ui/sample-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AdminRoutes } from "@/constants/routes";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export function Sidebar({ setOpen }: { setOpen?: (open: boolean) => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    models: false,
    workflows: false,
    organizations: false,
  });

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "Models",
      icon: Brain,
      children: [
        {
          title: "All Models",
          href: AdminRoutes.models,
          icon: Brain,
        },
        {
          title: "Model Registry",
          href: AdminRoutes.modelRegistry,
          icon: Database,
        },
      ],
    },
    {
      title: "Workflows",
      href: AdminRoutes.workflows,
      icon: GitBranch,
    },
    {
      title: "Decisioning",
      href: AdminRoutes.decisionTables,
      icon: FileText,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Knowledge Bases",
      href: "/knowledge-bases",
      icon: Database,
    },
    {
      title: "AI Docs",
      href: "/documents",
      icon: File,
    },
    {
      title: "Content Repo",
      href: "/content-repo",
      icon: File,
    },
    {
      title: "Widgets",
      href: "/widgets",
      icon: Layout,
    },
    {
      title: "API Docs",
      href: "/api-docs",
      icon: Code,
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
        },
        {
          title: "Organizations",
          href: "/settings/organizations",
          icon: Building,
        },
        {
          title: "Users",
          href: "/settings/users",
          icon: User,
        },
        {
          title: "API Keys",
          href: "/settings/api-keys",
          icon: Code,
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
            <div key={index}>
              {item.children ? (
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
                        <SampleButton
                          key={childIndex}
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            pathname === child.href && "bg-muted font-medium",
                          )}
                        >
                          <Link href={child.href as Route}>
                            <child.icon className="mr-2 h-4 w-4" />
                            {child.title}
                          </Link>
                        </SampleButton>
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
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t">
        <div className="px-2 py-4">
          <nav className="flex flex-col gap-1">
            {bottomNavItems.map((item, index) => (
              <div key={index}>
                {item.children ? (
                  <div className="flex flex-col">
                    <SampleButton
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        pathname.startsWith(item.href || "") &&
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
                          <SampleButton
                            key={childIndex}
                            variant="ghost"
                            asChild
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              pathname === child.href && "bg-muted font-medium",
                            )}
                          >
                            <Link href={child.href as Route}>
                              <child.icon className="mr-2 h-4 w-4" />
                              {child.title}
                            </Link>
                          </SampleButton>
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
                )}
              </div>
            ))}
          </nav>
        </div>
        {/* Remove the user profile section from the bottom */}
        {/* <div className="flex items-center gap-2 p-4 border-t"> ... </div> */}
      </div>
    </div> // Restore outer div closing tag
  );
}
