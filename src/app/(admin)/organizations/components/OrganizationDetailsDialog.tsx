"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Users, 
  Save, 
  UserPlus, 
  UserMinus, 
  Search,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type OrganizationWithStats } from "@/types/organization";
import { FormSubmissionProvider, useFormSubmission } from "@/contexts/FormSubmissionContext";

// Organization form schema
const organizationFormSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),
  slug: z.string().min(1, "URL slug is required"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  businessAddress: z.string().optional(),
  isActive: z.boolean(),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

interface OrganizationDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organization: OrganizationWithStats | null;
  mode: "create" | "edit";
}

function OrganizationDetailsDialogContent({
  open,
  onClose,
  onSuccess,
  organization,
  mode,
}: OrganizationDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const { setIsSubmitting } = useFormSubmission();

  // Organization form
  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      logoUrl: "",
      website: "",
      businessAddress: "",
      isActive: true,
    },
  });

  // Reset form when organization changes or dialog opens
  useEffect(() => {
    if (open) {
      if (organization && mode === "edit") {
        form.reset({
          name: organization.name,
          description: organization.description || undefined,
          slug: organization.slug || "",
          logoUrl: organization.logoUrl || "",
          website: organization.website || "",
          businessAddress: organization.businessAddress || undefined,
          isActive: organization.isActive,
        });
      } else if (mode === "create") {
        form.reset({
          name: "",
          description: "",
          slug: "",
          logoUrl: "",
          website: "",
          businessAddress: "",
          isActive: true,
        });
      }
    }
  }, [organization, mode, form, open]);

  // Auto-generate slug from name
  const watchedName = form.watch("name");
  useEffect(() => {
    if (watchedName && mode === "create") {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    } else if (!watchedName && mode === "create") {
      // Clear slug when name is empty in create mode
      form.setValue("slug", "");
    }
  }, [watchedName, mode, form]);

  // API queries and mutations
  const createMutation = api.org.create.useMutation({
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      toast.success("Organization created successfully");
      // Reset form to clear values after successful creation
      form.reset({
        name: "",
        description: "",
        slug: "",
        logoUrl: "",
        website: "",
        businessAddress: "",
        isActive: true,
      });
      onSuccess();
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(`Failed to create organization: ${error.message}`);
    },
  });

  const updateMutation = api.org.update.useMutation({
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      toast.success("Organization updated successfully");
      onSuccess();
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(`Failed to update organization: ${error.message}`);
    },
  });

  // User management queries
  const { data: organizationData, refetch: refetchUsers } = api.org.getById.useQuery(
    organization?.id ? Number(organization.id) : 0,
    { 
      enabled: !!organization?.id && mode === "edit" && open,
    }
  );

  const organizationUsers = organizationData?.users || [];

  const { data: availableUsers } = api.user.getAll.useQuery(
    {
      search: userSearchQuery,
      limit: 20,
    },
    { 
      enabled: mode === "edit" && userSearchQuery.length > 0,
    }
  );

  const addUserMutation = api.org.addUser.useMutation({
    onSuccess: () => {
      toast.success("User added to organization");
      refetchUsers();
      setUserSearchQuery("");
    },
    onError: (error) => {
      toast.error(`Failed to add user: ${error.message}`);
    },
  });

  const removeUserMutation = api.org.removeUser.useMutation({
    onSuccess: () => {
      toast.success("User removed from organization");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Failed to remove user: ${error.message}`);
    },
  });

  const updateUserRoleMutation = api.org.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });

  // Form submission
  const onSubmit = (data: OrganizationFormData) => {
    if (mode === "create") {
      createMutation.mutate(data);
    } else if (organization) {
      updateMutation.mutate({
        id: organization.id,
        ...data,
      });
    }
  };

  // User management handlers
  const handleAddUser = (userId: string) => {
    if (!organization) return;
    
    addUserMutation.mutate({
      orgId: Number(organization.id),
      userId: Number(userId),
      role: selectedRole,
    });
  };

  const handleRemoveUser = (userId: string) => {
    if (!organization) return;
    
    removeUserMutation.mutate({
      orgId: Number(organization.id),
      userId: Number(userId),
    });
  };

  const handleUpdateUserRole = (userId: string, newRole: string) => {
    if (!organization) return;
    
    updateUserRoleMutation.mutate({
      orgId: Number(organization.id),
      userId: Number(userId),
      role: newRole,
    });
  };

  // Check if organization is system default
  const isSystemOrganization = organization?.slug === "default" || organization?.name === "Default Organization";

  // Available roles
  const roles = [
    { value: "admin", label: "Admin", description: "Full access to organization" },
    { value: "manager", label: "Manager", description: "Manage users and settings" },
    { value: "member", label: "Member", description: "Standard access" },
    { value: "viewer", label: "Viewer", description: "Read-only access" },
  ];

  // Filter available users (exclude already added users)
  const filteredAvailableUsers = availableUsers?.users?.filter(
    user => !organizationUsers?.some(orgUser => orgUser.userId === user.id)
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            {mode === "create" ? "Create Organization" : `Manage ${organization?.name}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {mode === "edit" ? (
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details" className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Organization Details</span>
                <span className="sm:hidden">Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 text-sm"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">User Management</span>
                <span className="sm:hidden">Users</span>
                {organization && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {organization.userCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          ) : (
            // No tabs for create mode - just show the content directly
            <div className="mb-4" />
          )}

          {/* Organization Details Tab */}
          <TabsContent value="details">
            <Form {...form}>
              <form 
                key={`${mode}-${organization?.id || 'new'}`}
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-6"
              >
                <div className="max-h-[65vh] overflow-y-auto pr-2 space-y-4">
                {isSystemOrganization && mode === "edit" && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">System Organization</p>
                      <p className="text-xs text-amber-700">Some fields cannot be modified.</p>
                    </div>
                  </div>
                )}

                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Basic Information
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Essential details about your organization</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Organization Name *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter organization name"
                              disabled={isSystemOrganization}
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            URL Slug *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="organization-slug"
                              disabled={isSystemOrganization}
                              className="h-9 font-mono text-sm"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Used in URLs and API endpoints</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe your organization's purpose and activities"
                            rows={3}
                            className="resize-none"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">Optional description visible to users</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Branding & Contact Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      Branding & Contact
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Visual identity and contact information</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Logo URL
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="https://example.com/logo.png"
                              type="url"
                              className="h-9"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Direct link to your organization's logo</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Website
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="https://example.com"
                              type="url"
                              className="h-9"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Your organization's main website</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Business Address
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter your organization's business address"
                            rows={2}
                            className="resize-none"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">Physical address for business correspondence</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Status & Settings
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Organization status and configuration</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Organization Status
                          </FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value ? "true" : "false"}
                            disabled={isSystemOrganization}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="font-medium">Active</p>
                                    <p className="text-xs text-gray-500">Organization is operational</p>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="false">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  <div>
                                    <p className="font-medium">Inactive</p>
                                    <p className="text-xs text-gray-500">Organization is disabled</p>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            {field.value ? "Users can access this organization" : "Access is restricted"}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {organization && mode === "edit" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Organization Stats</label>
                        <div className="p-3 bg-gray-50 rounded-md space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Users:</span>
                            <span className="font-medium">{organization.userCount || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Active Users:</span>
                            <span className="font-medium text-green-600">{organization.activeUserCount || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium">{new Date(organization.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="px-4">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex items-center gap-2 px-4"
                  >
                    <Save className="h-4 w-4" />
                    {mode === "create" ? "Create Organization" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="max-h-[65vh] overflow-y-auto space-y-4">
            {/* Add User Section */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Users
              </h3>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full h-9"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Available Users */}
              {userSearchQuery && (
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                  {filteredAvailableUsers.length > 0 ? (
                    <div className="space-y-2">
                      {filteredAvailableUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {user.name?.charAt(0) || user.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.name || user.email}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddUser(user.id.toString())}
                            disabled={addUserMutation.isPending}
                            className="h-7 px-2 text-xs"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">No users found</p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Current Users Section */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Current Users ({organizationUsers?.length || 0})
              </h3>

              {organizationUsers && organizationUsers.length > 0 ? (
                <div className="space-y-2">
                  {organizationUsers.map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {user.userName?.charAt(0) || user.userEmail.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.userName || user.userEmail}</p>
                          <p className="text-xs text-gray-500">{user.userEmail}</p>
                        </div>
                        <Badge variant={user.userIsActive && user.relationshipIsActive ? "default" : "secondary"} className="text-xs">
                          {user.userIsActive && user.relationshipIsActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={user.orgRole || "member"}
                          onValueChange={(newRole) => handleUpdateUserRole(user.userId.toString(), newRole)}
                          disabled={updateUserRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center gap-2">
                                  <Shield className="h-3 w-3" />
                                  {role.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveUser(user.userId.toString())}
                          disabled={removeUserMutation.isPending}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users assigned to this organization</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function OrganizationDetailsDialog(props: OrganizationDetailsDialogProps) {
  return (
    <FormSubmissionProvider>
      <OrganizationDetailsDialogContent {...props} />
    </FormSubmissionProvider>
  );
}