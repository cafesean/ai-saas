"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Checkbox from "@/components/ui/checkbox";
import { 
  Loader2, 
  User, 
  Shield, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Plus,
  X,
  Building2,
  Key,
  Check
} from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type UserWithStats } from "@/types/user";

// Form validation schema - dynamic based on mode
const createUserFormSchema = (isCreateMode: boolean, changePassword: boolean) => {
  const baseSchema = z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    firstName: z
      .string()
      .max(50, "First name must be less than 50 characters")
      .optional(),
    lastName: z
      .string()
      .max(50, "Last name must be less than 50 characters")
      .optional(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(255, "Email must be less than 255 characters"),
    phone: z
      .string()
      .max(20, "Phone number must be less than 20 characters")
      .optional(),
    username: z
      .string()
      .max(50, "Username must be less than 50 characters")
      .optional(),
    isActive: z.boolean().default(true),
    organizationId: z.number().min(1, "Organization is required"),
  });

  if (isCreateMode || changePassword) {
    return baseSchema.extend({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be less than 128 characters"),
    });
  } else {
    return baseSchema.extend({
      password: z.string().optional(),
    });
  }
};

type UserFormData = z.infer<ReturnType<typeof createUserFormSchema>>;

interface UserRoleAssignment {
  orgId: number;
  orgName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  user?: UserWithStats | null;
  mode: "create" | "edit";
}

export function UserFormDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  user,
  mode 
}: UserFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [roleAssignments, setRoleAssignments] = useState<UserRoleAssignment[]>([]);
  const [newAssignment, setNewAssignment] = useState({
    orgId: "",
    roleId: "",
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(createUserFormSchema(mode === "create", changePassword)),
    defaultValues: {
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      isActive: true,
      organizationId: 0,
    },
  });

  // Update form validation when changePassword state changes
  useEffect(() => {
    const newResolver = zodResolver(createUserFormSchema(mode === "create", changePassword));
    // Note: We would need to recreate the form with new resolver, but for now we'll handle validation manually
  }, [mode, changePassword]);

  // API queries
  const { data: roles = [] } = api.role.getAll.useQuery();
  const { data: orgs = [] } = api.org.getAll.useQuery();
  
  // API mutations
  const createUserMutation = api.user.create.useMutation();
  const updateUserMutation = api.user.update.useMutation();
  const assignRoleMutation = api.user.assignRole.useMutation();
  const removeRoleMutation = api.user.removeRole.useMutation();
  const ensureDefaultOrgMutation = api.org.ensureDefaultOrg.useMutation();
  
  const utils = api.useUtils();

  const isActive = watch("isActive");
  const isCreateMode = mode === "create";

  // Ensure default org exists on component mount
  useEffect(() => {
    if (open && orgs.length === 0) {
      ensureDefaultOrgMutation.mutate();
    }
  }, [open, orgs.length, ensureDefaultOrgMutation]);

  // Available orgs and roles for new assignments
  const availableOrgs = useMemo(() => {
    return orgs.filter(org => org.isActive);
  }, [orgs]);

  const availableRoles = useMemo(() => {
    return roles.filter(role => role.isActive);
  }, [roles]);

  // Pre-populate form when user changes
  useEffect(() => {
    if (user && open && mode === "edit") {
      // Get user's primary organization (first active role assignment)
      const primaryOrg = user.roles?.find(role => role.isActive)?.orgId || 0;
      
      reset({
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        phone: user.phone || "",
        username: user.username || "",
        password: "", // Never pre-populate password
        isActive: user.isActive,
        organizationId: primaryOrg,
      });

      // Set role assignments
      const assignments: UserRoleAssignment[] = user.roles?.map(role => ({
        orgId: role.orgId,
        orgName: role.orgName,
        roleId: role.id,
        roleName: role.name,
        isActive: role.isActive,
      })) || [];
      setRoleAssignments(assignments);
      
      // Clear generated password for edit mode
      setGeneratedPassword("");
      setChangePassword(false);
      setIsEditingPassword(false);
    } else if (isCreateMode && open) {
      // Set default organization for create mode
      const defaultOrgId = availableOrgs.length > 0 ? availableOrgs[0]!.id : 0;
      
      reset({
        name: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        isActive: true,
        organizationId: defaultOrgId,
      });
      setRoleAssignments([]);
      setGeneratedPassword("");
      setChangePassword(true); // Always allow password setting in create mode
      setIsEditingPassword(false);
    }
  }, [user, open, mode, reset, availableOrgs]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setActiveTab("basic");
      setShowPassword(false);
      setGeneratedPassword("");
      setRoleAssignments([]);
      setNewAssignment({ orgId: "", roleId: "" });
      setChangePassword(false);
      setIsEditingPassword(false);
    }
  }, [open]);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    setValue("password", password, { shouldValidate: true });
  };

  // Role assignment management
  const handleAddRoleAssignment = () => {
    if (!newAssignment.orgId || !newAssignment.roleId) {
      toast.error("Please select both org and role");
      return;
    }

    const org = orgs.find(t => t.id.toString() === newAssignment.orgId);
    const role = roles.find(r => r.id.toString() === newAssignment.roleId);

    if (!org || !role) {
      toast.error("Invalid org or role selection");
      return;
    }

    // Check for duplicates
    const exists = roleAssignments.some(
      assignment => 
        assignment.orgId.toString() === newAssignment.orgId && 
        assignment.roleId.toString() === newAssignment.roleId
    );

    if (exists) {
      toast.error("This role assignment already exists");
      return;
    }

    const newRoleAssignment: UserRoleAssignment = {
      orgId: org.id,
      orgName: org.name,
      roleId: role.id,
      roleName: role.name,
      isActive: true,
    };

    setRoleAssignments(prev => [...prev, newRoleAssignment]);
    setNewAssignment({ orgId: "", roleId: "" });
  };

  const handleRemoveRoleAssignment = (orgId: number, roleId: number) => {
    setRoleAssignments(prev => 
      prev.filter(assignment => 
        !(assignment.orgId === orgId && assignment.roleId === roleId)
      )
    );
  };

  const handleToggleRoleAssignment = (orgId: number, roleId: number) => {
    setRoleAssignments(prev =>
      prev.map(assignment =>
        assignment.orgId === orgId && assignment.roleId === roleId
          ? { ...assignment, isActive: !assignment.isActive }
          : assignment
      )
    );
  };

  // Form submission
  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      // Validate password requirements
      if (isCreateMode && (!data.password || data.password.trim() === "")) {
        toast.error("Password is required for new users");
        setIsSubmitting(false);
        return;
      }

      if (!isCreateMode && changePassword && (!data.password || data.password.trim() === "")) {
        toast.error("Please enter a new password or cancel password change");
        setIsSubmitting(false);
        return;
      }

      let userId: number;

      if (isCreateMode) {
        // Create user
        const createData = {
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          username: data.username,
          isActive: data.isActive,
          password: data.password!,
        };
        
        const newUser = await createUserMutation.mutateAsync(createData);
        if (!newUser) {
          throw new Error("Failed to create user");
        }
        userId = newUser.id;
        toast.success("User created successfully!");
      } else {
        // Update user
        const updateData: any = {
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          username: data.username,
          isActive: data.isActive,
        };

        // Only include password if it's being changed
        if (changePassword && data.password && data.password.trim() !== "") {
          updateData.password = data.password;
        }

        await updateUserMutation.mutateAsync({
          id: user!.id,
          ...updateData,
        });
        userId = user!.id;
        toast.success("User updated successfully!");
      }

      // Handle role assignments
      if (roleAssignments.length > 0) {
        // Remove existing role assignments
        if (!isCreateMode && user?.roles) {
          for (const existingRole of user.roles) {
            await removeRoleMutation.mutateAsync({
              userId: userId,
              roleId: existingRole.id,
              orgId: existingRole.orgId,
            });
          }
        }

        // Add new role assignments
        for (const assignment of roleAssignments) {
          await assignRoleMutation.mutateAsync({
            userId: userId,
            roleId: assignment.roleId,
            orgId: assignment.orgId,
          });
        }
      }

      // Invalidate and refetch relevant queries
      await Promise.all([
        utils.user.getAll.invalidate(),
        utils.user.getById.invalidate(),
        utils.org.getAll.invalidate(),
      ]);

      // Close dialog and reset form
      onOpenChange(false);
      reset();
      setRoleAssignments([]);
      setGeneratedPassword("");
      setChangePassword(false);
      setIsEditingPassword(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save user"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isCreateMode ? "Create New User" : `Edit User: ${user?.name}`}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode 
              ? "Create a new user account and assign roles across orgs."
              : "Update user information and manage role assignments."
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="roles">Role Assignments</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* First and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register("firstName")}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register("lastName")}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization *</Label>
                <Select
                  value={watch("organizationId")?.toString() || ""}
                  onValueChange={(value) => setValue("organizationId", parseInt(value))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrgs.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {org.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.organizationId && (
                  <p className="text-sm text-destructive">{errors.organizationId.message}</p>
                )}
              </div>

              {/* Phone and Username */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    {...register("phone")}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    {...register("username")}
                    disabled={isSubmitting}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                {!isCreateMode && !isEditingPassword && (
                  <div className="flex items-center justify-between">
                    <Label>Password</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingPassword(true)}
                      disabled={isSubmitting}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                )}
                
                {isCreateMode && (
                  <Label htmlFor="password">Password *</Label>
                )}
                
                {isEditingPassword && !isCreateMode && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">New Password</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingPassword(false);
                          setValue("password", "");
                          setGeneratedPassword("");
                        }}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingPassword(false);
                          setChangePassword(true);
                        }}
                        disabled={isSubmitting}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {(isCreateMode || isEditingPassword) && (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={isCreateMode ? "Enter password" : "Enter new password"}
                          {...register("password")}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                        disabled={isSubmitting}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                    {generatedPassword && (
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                          Generated password: <span className="font-mono font-medium">{generatedPassword}</span>
                        </p>
                        <p className="text-amber-600">
                          Make sure to save this password securely before closing the dialog.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Active users can log in and access the system
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                  disabled={isSubmitting}
                />
              </div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4 mt-4">
              {/* Add New Role Assignment */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Role Assignment
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Org</Label>
                    <Select
                      value={newAssignment.orgId}
                      onValueChange={(value) => 
                        setNewAssignment(prev => ({ ...prev, orgId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select org" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOrgs.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {org.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={newAssignment.roleId}
                      onValueChange={(value) => 
                        setNewAssignment(prev => ({ ...prev, roleId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              {role.name}
                              {role.isSystemRole && (
                                <Badge variant="secondary" className="text-xs">
                                  System
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRoleAssignment}
                  disabled={!newAssignment.orgId || !newAssignment.roleId}
                  className="mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </div>

              {/* Current Role Assignments */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Current Role Assignments</h4>
                {roleAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No role assignments yet. Add some above.
                  </p>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {roleAssignments.map((assignment, index) => (
                        <div
                          key={`${assignment.orgId}-${assignment.roleId}`}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={assignment.isActive}
                              onChange={() => 
                                handleToggleRoleAssignment(assignment.orgId, assignment.roleId)
                              }
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{assignment.orgName}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {assignment.roleName}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!assignment.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => 
                                handleRemoveRoleAssignment(assignment.orgId, assignment.roleId)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCreateMode ? "Create User" : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 