"use client"

import { useState } from "react"
import { SampleButton } from "@/components/ui/sample-button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { MetadataGrid } from "@/components/ui/MetadataGrid"

interface MetadataItem {
  label: string;
  value: string | number | object | null | undefined;
  className?: string;
}

interface InferenceDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inference: any
}

export default function InferenceDetail({ open, onOpenChange, inference }: InferenceDetailProps) {
  const [activeTab, setActiveTab] = useState("input-output")

  if (!inference) return null

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  // Prepare metadata items for the MetadataGrid
  const metadataItems: MetadataItem[] = [
    { label: "Request ID", value: inference.id },
    { label: "Timestamp", value: inference.timestamp },
    { label: "Model Version", value: inference.modelVersion },
    { label: "Environment", value: inference.environment || "Production" },
    { label: "Client", value: inference.client || "API" },
    { label: "IP Address", value: inference.ipAddress },
    { label: "Request Headers", value: inference.headers || "None" },
    { label: "Response Code", value: inference.responseCode || "200" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Inference Request Details</DialogTitle>
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm text-muted-foreground">
              ID: {inference.id} • {inference.timestamp}
            </p>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(inference.status)}
            <Badge
              variant={
                inference.status === "Success" ? "default" : inference.status === "Error" ? "destructive" : "outline"
              }
            >
              {inference.status || "Unknown"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              Confidence: <span className="font-medium">{inference.confidence}</span>
            </div>
            <div>
              Latency: <span className="font-medium">{inference.latency}</span>
            </div>
            <div>
              User: <span className="font-medium">{typeof inference.user === 'object' ? JSON.stringify(inference.user) : inference.user}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="input-output" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input-output">Input/Output</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          <TabsContent value="input-output" className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Input</h3>
              <div className="rounded-md border bg-muted/40 p-4">
                {typeof inference.input === "object" ? (
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(inference.input, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm">{inference.input || "No input data available"}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Output</h3>
              <div className="rounded-md border bg-muted/40 p-4 max-h-[300px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {typeof inference.output === "object"
                    ? JSON.stringify(inference.output, null, 2)
                    : inference.output || "No output data available"}
                </pre>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="logs" className="py-4">
            <div className="rounded-md border bg-black text-white p-4 font-mono text-sm max-h-[400px] overflow-auto">
              {inference.logs ? (
                <pre>{inference.logs}</pre>
              ) : (
                <p className="text-gray-400">No logs available for this inference request.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="metadata" className="py-4">
            <div className="rounded-md border p-4 max-h-[400px] overflow-auto">
              <MetadataGrid items={metadataItems} columns={2} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <SampleButton variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </SampleButton>
          <SampleButton>Rerun Inference</SampleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 