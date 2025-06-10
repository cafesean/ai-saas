"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SampleButton } from "@/components/ui/sample-button";
import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Check, FileUp, Upload, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getModels } from "@/lib/model-service";

interface WorkflowTestRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: any;
}

export function WorkflowTestRunDialog({
  open,
  onOpenChange,
  workflow,
}: WorkflowTestRunDialogProps) {
  const [tab, setTab] = useState("upload");
  const [payload, setPayload] = useState({});
  const [selectedBaseModel, setSelectedBaseModel] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Workflow Test Run</DialogTitle>
          <DialogDescription>
            Test run the workflow with the provided data and configuration.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="fillPayload">1. Fill Payload</TabsTrigger>
            <TabsTrigger value="response">2. Response</TabsTrigger>
          </TabsList>

          <TabsContent
            value="fillPayload"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="base-model" className="pb-4">
                  Fill Payload
                </Label>
              </div>
              <div className="grid w-full items-center"></div>

              <div className="flex justify-end">
                <SampleButton
                  onClick={() => setTab("upload")}
                  disabled={!selectedBaseModel}
                >
                  Run
                </SampleButton>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="response"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="dataset">Response</Label>
              </div>
              <div className="flex items-center gap-2">
                <pre>{`{
  ${'"feature": <value>'}
}`}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
