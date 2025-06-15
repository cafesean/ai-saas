"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  Building2, 
  Globe,
  MapPin,
  Link2,
  Hash
} from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { type OrganizationWithStats } from "@/types/organization";

// Form validation schema
const organizationFormSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  slug: z
    .string()
    .max(255, "Slug must be less than 255 characters")
    .regex(/^[a-z0-9-]*$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  logoUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  businessAddress: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  isActive: z.boolean().default(true),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

interface OrganizationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  organization?: OrganizationWithStats | null;
  mode: "create" | "edit";
}

export function OrganizationFormDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  organization,
  mode 
}: OrganizationFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<OrganizationFormData>({
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

  // API mutations
  const createMutation = api.tenant.create.useMutation();
  const updateMutation = api.tenant.update.useMutation();
  const utils = api.useUtils();

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const isCreateMode = mode === "create";
  const isSystemOrg = organization?.slug === 'default-org' || organization?.name === 'Default Organization';

  // Auto-generate slug from name
  useEffect(() => {
    if (autoGenerateSlug && watchedName && isCreateMode) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [watchedName, autoGenerateSlug, isCreateMode, setValue]);

  // Pre-populate form when organization changes
  useEffect(() => {
    if (organization && open && mode === "edit") {
      reset({
        name: organization.name,
        description: organization.description || "",
        slug: organization.slug || "",
        logoUrl: organization.logoUrl || "",
        website: organization.website || "",
        businessAddress: organization.businessAddress || "",
        isActive: organization.isActive,
      });
      // Disable auto-generation for existing organizations
      setAutoGenerateSlug(false);
    } else if (isCreateMode && open) {
      reset({
        name: "",
        description: "",
        slug: "",
        logoUrl: "",
        website: "",
        businessAddress: "",
        isActive: true,
      });
      setAutoGenerateSlug(true);
    }
  }, [organization, open, mode, reset]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAutoGenerateSlug(true);
    }
  }, [open]);

  // Form submission
  const onSubmit = async (data: OrganizationFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare data - remove empty strings
      const submitData = {
        name: data.name,
        description: data.description || undefined,
        slug: data.slug || undefined,
        logoUrl: data.logoUrl || undefined,
        website: data.website || undefined,
        businessAddress: data.businessAddress || undefined,
        isActive: data.isActive,
      };

      if (isCreateMode) {
        await createMutation.mutateAsync(submitData);
        toast.success("Organization created successfully!");
      } else {
        await updateMutation.mutateAsync({
          id: organization!.id,
          ...submitData,
        });
        toast.success("Organization updated successfully!");
      }

      // Invalidate and refetch relevant queries
      await Promise.all([
        utils.tenant.getAllWithStats.invalidate(),
        utils.tenant.getAll.invalidate(),
        utils.tenant.getById.invalidate(),
      ]);

      // Close dialog and notify parent
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save organization"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle manual slug editing
  const handleSlugChange = (value: string) => {
    setAutoGenerateSlug(false);
    setValue("slug", value, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isCreateMode ? "Create New Organization" : `Edit Organization: ${organization?.name}`}
            {isSystemOrg && (
              <span className="text-sm text-muted-foreground ml-2">(System Organization)</span>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode 
              ? "Create a new organization to manage users and resources."
              : "Update organization information and settings."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Acme Corporation"
              {...register("name")}
              disabled={isSubmitting || isSystemOrg}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the organization..."
              rows={3}
              {...register("description")}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              URL Slug
              {isCreateMode && autoGenerateSlug && (
                <span className="text-xs text-muted-foreground">(auto-generated)</span>
              )}
            </Label>
            <Input
              id="slug"
              placeholder="organization-url-slug"
              value={watchedSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={isSubmitting || isSystemOrg}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Used in URLs and API endpoints. Leave empty to auto-generate from name.
            </p>
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Logo URL
            </Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              {...register("logoUrl")}
              disabled={isSubmitting}
            />
            {errors.logoUrl && (
              <p className="text-sm text-destructive">{errors.logoUrl.message}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.example.com"
              {...register("website")}
              disabled={isSubmitting}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          {/* Business Address */}
          <div className="space-y-2">
            <Label htmlFor="businessAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Business Address
            </Label>
            <Textarea
              id="businessAddress"
              placeholder="123 Business St, City, State, Country"
              rows={2}
              {...register("businessAddress")}
              disabled={isSubmitting}
            />
            {errors.businessAddress && (
              <p className="text-sm text-destructive">{errors.businessAddress.message}</p>
            )}
          </div>

          {/* Active Status */}
          {!isSystemOrg && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <div className="text-sm text-muted-foreground">
                  Inactive organizations cannot be accessed by users
                </div>
              </div>
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
                disabled={isSubmitting}
              />
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreateMode ? "Create Organization" : "Update Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}