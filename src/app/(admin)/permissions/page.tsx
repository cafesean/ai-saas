'use client';

import { useState } from 'react';
import { api } from '@/utils/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Users, Shield, BarChart3 } from 'lucide-react';
import { WithPermission } from '@/components/auth/WithPermission';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch permissions with usage statistics
  const { data: permissions, isLoading: permissionsLoading } = api.permission.getAllWithUsage.useQuery();
  const { data: categories } = api.permission.getCategoriesWithCounts.useQuery();
  const { data: stats } = api.permission.getStats.useQuery();

  // Filter permissions based on search and category
  const filteredPermissions = permissions?.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Export functionality
  const handleExport = () => {
    if (!permissions) return;

    const csvContent = [
      ['Slug', 'Name', 'Category', 'Description', 'Role Count', 'Roles'],
      ...permissions.map(p => [
        p.slug,
        p.name,
        p.category || '',
        p.description || '',
        p.roleCount.toString(),
        p.roles.map(r => r.roleName).join('; ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permissions-catalogue-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (permissionsLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    // TODO: Restore admin-only access after debugging
    // <RouteGuard role="Admin" showAccessDenied={true}>
    <div>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permission Management</h1>
          <p className="text-muted-foreground mt-2">
            View and analyze system permissions and their role assignments
          </p>
        </div>
        <WithPermission permission="permission:export">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </WithPermission>
      </div>

      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions by name, slug, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">All Categories</option>
              {categories?.map(cat => (
                <option key={cat.category || ''} value={cat.category || ''}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Permissions Grid */}
          <div className="grid gap-4">
            {filteredPermissions?.map(permission => (
              <Card key={permission.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{permission.name}</CardTitle>
                      <CardDescription className="font-mono text-sm">
                        {permission.slug}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {permission.category}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {permission.roleCount} roles
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {permission.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {permission.description}
                    </p>
                  )}
                  {permission.roles.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Used by roles:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {permission.roles.map(role => (
                          <Badge 
                            key={role.roleId} 
                            variant={role.isSystemRole ? "default" : "outline"}
                            className="text-xs"
                          >
                            {role.roleName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPermissions?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No permissions found matching your search criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Permissions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPermissions}</div>
                  <p className="text-xs text-muted-foreground">
                    Active permissions in the system
                  </p>
                </CardContent>
              </Card>

              {/* Categories Breakdown */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Permissions by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {stats.categoryCounts.map(cat => (
                      <div key={cat.category} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{cat.category}</span>
                        <Badge variant="secondary">{cat.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Most Used Permissions */}
              <Card className="md:col-span-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Most Used Permissions</CardTitle>
                  <CardDescription>
                    Permissions assigned to the most roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.mostUsedPermissions.slice(0, 10).map((perm, index) => (
                      <div key={perm.permissionId} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <span className="font-medium text-sm">{perm.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({perm.slug})</span>
                        </div>
                        <Badge variant="outline">{perm.roleCount} roles</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
    // </RouteGuard>
  );
}