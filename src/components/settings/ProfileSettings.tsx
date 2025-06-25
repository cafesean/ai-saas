"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/utils/trpc";
import {
  userProfileSchema,
  type UserProfileFormData,
} from "@/schemas/settings.schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/form/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone } from "lucide-react";

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);

  // Get current user settings
  const { data: userSettings, isLoading: settingsLoading, refetch } = 
    api.user.getCurrentUserSettings.useQuery();

  // Update user profile mutation (we'll need to add this to the user router)
  const updateProfile = api.user.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    values: {
      name: userSettings?.name || "",
      email: userSettings?.email || "",
      phone: userSettings?.phone || "",
    },
  });

  const onSubmit = async (data: UserProfileFormData) => {
    if (!userSettings?.id) return;
    
    setIsLoading(true);
    try {
      await updateProfile.mutateAsync({
        id: userSettings.id,
        ...data,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      disabled={isLoading || updateProfile.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed throughout the platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                      disabled={isLoading || updateProfile.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Your email address is used for account recovery and notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number (optional)"
                      {...field}
                      disabled={isLoading || updateProfile.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional. Used for account security and notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading || updateProfile.isPending}
              >
                {isLoading || updateProfile.isPending
                  ? "Updating..."
                  : "Update Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}