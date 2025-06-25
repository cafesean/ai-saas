"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/utils/trpc";
import {
  sessionPreferenceSchema,
  sessionTimeoutOptions,
  type SessionPreferenceFormData,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/form/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Shield } from "lucide-react";

export function SessionManagement() {
  const [isLoading, setIsLoading] = useState(false);

  // Get current user settings
  const { data: userSettings, isLoading: settingsLoading, refetch } = 
    api.user.getCurrentUserSettings.useQuery();

  // Update session preference mutation
  const updateSessionPreference = api.user.updateSessionPreference.useMutation({
    onSuccess: () => {
      toast.success("Session preference updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update session preference: ${error.message}`);
    },
  });

  const form = useForm<SessionPreferenceFormData>({
    resolver: zodResolver(sessionPreferenceSchema),
    values: {
      sessionTimeoutMinutes: userSettings?.sessionTimeoutPreference || 1440,
    },
  });

  const onSubmit = async (data: SessionPreferenceFormData) => {
    setIsLoading(true);
    try {
      await updateSessionPreference.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
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
          <Clock className="h-5 w-5" />
          Session Management
        </CardTitle>
        <CardDescription>
          Configure how long you want to stay signed in to the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sessionTimeoutMinutes"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Session Duration
                  </FormLabel>
                  <FormDescription>
                    Choose how long your session should remain active. For better security, 
                    shorter timeouts are recommended.
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      className="space-y-3"
                    >
                      {sessionTimeoutOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={option.value.toString()}
                            id={`timeout-${option.value}`}
                          />
                          <label
                            htmlFor={`timeout-${option.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading || updateSessionPreference.isPending}
              >
                {isLoading || updateSessionPreference.isPending
                  ? "Updating..."
                  : "Update Session Preference"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Note
          </h4>
          <p className="text-xs text-muted-foreground">
            Your session will automatically expire after the selected duration of inactivity. 
            For enhanced security in shared environments, choose shorter timeout periods.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}