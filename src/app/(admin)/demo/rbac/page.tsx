"use client";

import { useState } from "react";
import { 
  Shield, 
  User, 
  Settings, 
  Database, 
  FileText, 
  GitBranch, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

import { WithPermission, AdminOnly, SuperAdminOnly, RequirePermissions } from "@/components/auth/WithPermission";
import { useAuthSession, usePermission, usePermissions } from "@/framework/hooks/useAuthSession";
import { SampleButton } from "@/components/ui/sample-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

/**
 * RBAC Demo Page
 * 
 * This page demonstrates the various role-based access control (RBAC) UI gating 
 * components and patterns implemented for the AI SaaS platform.
 */
export default function RBACDemoPage() {
  const { isLoading, isAuthenticated, user, role, permissions } = useAuthSession();
  const [selectedPermission, setSelectedPermission] = useState<string>("workflow:create");

  // Example permission checks using hooks
  const canCreateWorkflows = usePermission("workflow:create");
  const canManageUsers = usePermission("admin:user_management");
  const { hasAll: hasAllAdminPerms, hasAny: hasAnyAdminPerms } = usePermissions([
    "admin:role_management",
    "admin:user_management",
    "admin:full_access"
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading RBAC demo...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please log in to view the RBAC demo page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex flex-col gap-6 p-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", link: "/" },
          ]}
          title="RBAC Demo"
        />
        <p className="text-muted-foreground mb-4">Role-Based Access Control UI Gating Demonstration</p>

        {/* User Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-muted-foreground">{user?.name || "No name set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Badge variant="secondary">{role?.name || "No role assigned"}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Permissions ({permissions.length})</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permission Hook Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Permission Hook Examples
            </CardTitle>
            <CardDescription>
              Examples of using permission hooks in components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Single Permission Check</p>
                <p className="text-xs text-muted-foreground mb-2">
                  <code>usePermission("workflow:create")</code>
                </p>
                <div className="flex items-center gap-2">
                  {canCreateWorkflows ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Can Create Workflows
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Cannot Create Workflows
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Multiple Permission Check</p>
                <p className="text-xs text-muted-foreground mb-2">
                  <code>usePermissions([...adminPermissions])</code>
                </p>
                <div className="space-y-1">
                  <Badge variant={hasAllAdminPerms ? "default" : "secondary"} className="text-xs block w-fit">
                    Has All Admin Perms: {hasAllAdminPerms ? "Yes" : "No"}
                  </Badge>
                  <Badge variant={hasAnyAdminPerms ? "default" : "secondary"} className="text-xs block w-fit">
                    Has Any Admin Perms: {hasAnyAdminPerms ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic WithPermission Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Basic Permission Gating
            </CardTitle>
            <CardDescription>
              Components that show/hide based on permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <WithPermission permission="workflow:create">
                <SampleButton className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </SampleButton>
              </WithPermission>

              <WithPermission permission="workflow:update">
                <SampleButton variant="secondary" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Workflow
                </SampleButton>
              </WithPermission>

              <WithPermission permission="workflow:delete">
                <SampleButton variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Workflow
                </SampleButton>
              </WithPermission>

              <WithPermission permission="admin:user_management">
                <SampleButton variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  Manage Users
                </SampleButton>
              </WithPermission>

              <WithPermission permission="models:read">
                <SampleButton variant="outline" className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  View Models
                </SampleButton>
              </WithPermission>

              <WithPermission permission="decisioning:read">
                <SampleButton variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View Decisions
                </SampleButton>
              </WithPermission>
            </div>
          </CardContent>
        </Card>

        {/* WithPermission with Fallback */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Gating with Fallback Content</CardTitle>
            <CardDescription>
              Components that show alternative content when permission is denied
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <WithPermission
              permission="admin:full_access"
              fallback={
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    You need full admin access to view this section.
                  </p>
                </div>
              }
            >
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />
                  Welcome to the admin-only section! You have full access.
                </p>
              </div>
            </WithPermission>
          </CardContent>
        </Card>

        {/* Role-Based Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Role-Based Access Control</CardTitle>
            <CardDescription>
              Components that show/hide based on user roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <AdminOnly
                fallback={
                  <div className="p-3 border border-orange-200 bg-orange-50 rounded">
                    <p className="text-sm text-orange-700">Admin-only content hidden</p>
                  </div>
                }
              >
                <div className="p-3 border border-blue-200 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700">
                    <Shield className="w-4 h-4 inline mr-2" />
                    This content is only visible to Admins
                  </p>
                </div>
              </AdminOnly>

              <SuperAdminOnly
                fallback={
                  <div className="p-3 border border-orange-200 bg-orange-50 rounded">
                    <p className="text-sm text-orange-700">Super Admin-only content hidden</p>
                  </div>
                }
              >
                <div className="p-3 border border-purple-200 bg-purple-50 rounded">
                  <p className="text-sm text-purple-700">
                    <Shield className="w-4 h-4 inline mr-2" />
                    This content is only visible to Super Admins
                  </p>
                </div>
              </SuperAdminOnly>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Permission Combinations */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Permission Patterns</CardTitle>
            <CardDescription>
              Complex permission combinations and custom logic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Multiple permissions - ALL required */}
              <WithPermission
                permissions={["workflow:create", "workflow:update"]}
                fallback={<p className="text-sm text-muted-foreground">Need both create AND update permissions</p>}
              >
                <div className="p-3 border border-green-200 bg-green-50 rounded">
                  <p className="text-sm text-green-700">You can create AND update workflows</p>
                </div>
              </WithPermission>

              {/* Multiple permissions - ANY required */}
              <WithPermission
                anyPermissions={["workflow:read", "workflow:create", "workflow:update"]}
                fallback={<p className="text-sm text-muted-foreground">Need at least one workflow permission</p>}
              >
                <div className="p-3 border border-blue-200 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700">You have at least one workflow permission</p>
                </div>
              </WithPermission>

              {/* Custom check */}
              <WithPermission
                customCheck={(user, role, permissions) => {
                  // Custom logic: user must have admin role AND workflow permissions
                  const isAdmin = role?.name === "Admin" || role?.name === "Super Admin";
                  const hasWorkflowPerms = permissions.some(p => p.startsWith("workflow:"));
                  return isAdmin && hasWorkflowPerms;
                }}
                fallback={<p className="text-sm text-muted-foreground">Need admin role with workflow permissions</p>}
              >
                <div className="p-3 border border-purple-200 bg-purple-50 rounded">
                  <p className="text-sm text-purple-700">You are an admin with workflow permissions!</p>
                </div>
              </WithPermission>
            </div>
          </CardContent>
        </Card>

        {/* Utility Components Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Utility Components</CardTitle>
            <CardDescription>
              Pre-built components for common permission patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RequirePermissions
                permissions="workflow:create"
                fallback={<p className="text-sm text-muted-foreground">Cannot create workflows</p>}
              >
                <SampleButton className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Workflow
                </SampleButton>
              </RequirePermissions>

              <RequirePermissions
                permissions={["admin:user_management", "admin:role_management"]}
                fallback={<p className="text-sm text-muted-foreground">Need admin permissions</p>}
              >
                <SampleButton variant="secondary" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </SampleButton>
              </RequirePermissions>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 