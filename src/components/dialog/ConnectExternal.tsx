"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SampleButton } from "@/components/ui/sample-button";
import { SampleInput } from "@/components/ui/sample-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { Link2 } from "lucide-react";
import {
  ConnectModelFormValues,
  connectModelSchema,
} from "@/framework/types/model";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ConnectExternalModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (modelData: ConnectModelFormValues) => void;
}

export function ConnectExternalModelDialog({
  open,
  onOpenChange,
  onConnect,
}: ConnectExternalModelDialogProps) {
  const [activeTab, setActiveTab] = useState<"rest">("rest");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const methods = useForm<ConnectModelFormValues>({
    resolver: zodResolver(connectModelSchema),
    defaultValues: {
      name: "",
      endpoint: "",
      authType: "",
      requestFormat: "",
      connectionType: "rest",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue,
  } = methods;

  const watchedName = watch("name");
  const watchedEndpoint = watch("endpoint");

  const onSubmit = (data: ConnectModelFormValues) => {
    const finalData = { ...data, connectionType: activeTab };
    onConnect(finalData);
    reset();
    setTestResult(null);
    onOpenChange(false);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    console.log("Testing connection to:", watchedEndpoint);
    setTimeout(() => {
      setIsTestingConnection(false);
      if (watchedEndpoint) {
        setTestResult({
          success: true,
          message: "Connection successful! Simulated 200 OK.",
        });
      } else {
        setTestResult({
          success: false,
          message: "Connection failed! Endpoint is missing.",
        });
      }
    }, 1500);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
          setTestResult(null);
          setActiveTab("rest");
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Connect External Model</DialogTitle>
          <DialogDescription>
            Connect to an externally hosted model via REST API.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "rest")}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="rest">REST API</TabsTrigger>
              </TabsList>

              <TabsContent value="rest" className="space-y-4 py-4 max-h-[400px] overflow-scroll">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <FormControl>
                        <SampleInput placeholder="Enter model name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Endpoint URL</FormLabel>
                      <FormControl>
                        <SampleInput
                          placeholder="https://api.example.com/model"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The URL where the external model can be accessed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="authType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select authentication type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="api-key">API Key</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                          <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="requestFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Format (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{\n  "data": [...],
  "parameters": {...}\n}'
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Example JSON structure for the request payload.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SampleButton
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={testConnection}
                  disabled={
                    !!errors.endpoint || !watchedEndpoint || isTestingConnection
                  }
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  {isTestingConnection ? "Testing..." : "Test Connection"}
                </SampleButton>

                {testResult && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      testResult.success
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <SampleButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SampleButton>
              <SampleButton type="submit" disabled={!isValid}>
                Connect Model
              </SampleButton>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
