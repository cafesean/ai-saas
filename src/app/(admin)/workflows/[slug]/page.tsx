"use client";

import { Button } from "@/components/form/Button";
import { DataTable } from "@/components/ui/table/DataTable";
import { useTableColumns } from "@/framework/hooks/useTableColumn";
import type { WorkflowView } from "@/framework/types/workflow";
import { api, useUtils } from "@/utils/trpc";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Route } from "next";
import { AdminRoutes } from "@/constants/routes";
import { Input } from "@/components/form/Input";
import UploadCmp from "@/components/ui/Upload";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { FlowNameTypes } from "@/constants/nodes";
import { WorkflowStatus } from "@/constants/general";

export default function WorkflowDetailPage() {
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [name, setName] = useState("");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [userInputs, setUserInputs] = useState<Record<string, any>>([]);

  // tRPC hooks
  const utils = useUtils();
  let workflow = api.workflow.getByUUID.useQuery({ uuid: slug });
  const publish = api.workflow.publish.useMutation({
    onSuccess: (data) => {
      utils.workflow.getAll.invalidate();
      utils.workflow.getByUUID.invalidate({ uuid: slug });
      setDatasets([]);
      console.log(data);
    },
    onError: (error) => {
      setDatasets([]);
    },
  });

  const update = api.workflow.update.useMutation({
    onSuccess: (data) => {
      utils.workflow.getAll.invalidate();
      utils.workflow.getByUUID.invalidate({ uuid: slug });
      setDatasets([]);
      console.log(data);
    },
    onError: (error) => {
      setDatasets([]);
    },
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (workflow && !workflow.isLoading && workflow.data) {
      setName(workflow.data[0]?.name ?? "");
      setUserInputs(workflow.data[0]?.userInputs?.userInputs ?? []);
    }
  }, [workflow.isLoading]);

  const addFiles = (datasets: File[]) => {
    convertToBase64(datasets);
  };

  const convertToBase64 = (files: File[]) => {
    for (const file of files) {
      console.log("file", file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const newDataset = {
          name: file.name,
          type: file.type,
          base64file: reader.result as string,
        }
        setDatasets((prev) => [...prev, newDataset]);
      };
      reader.onerror = (error) => {
        console.error("Error converting file to Base64:", error);
      };
    }
  };

  const publishWorkflow = () => {
    if (!name) {
      alert("Name is required!");
    } else {
      if (workflow.data?.[0]?.status === WorkflowStatus.ACTIVE) {
        console.log(workflow.data?.[0]);
        update.mutate({
          uuid: slug,
          name: name ?? "",
          userInputs: workflow.data?.[0]?.userInputs ?? {},
          workflowJson: workflow.data?.[0]?.workflowJson ?? {},
          datasets,
        });
      } else {
        publish.mutate({
          uuid: slug,
          name: name ?? "",
          userInputs: workflow.data?.[0]?.userInputs ?? {},
          workflowJson: workflow.data?.[0]?.workflowJson ?? {},
          datasets,
        });
      }
    }
  };

  if (workflow.isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (workflow.error) {
    console.error("Roles query error:", workflow.error);
    return (
      <div className="text-red-500">
        <h2 className="text-lg font-semibold mb-2">Error loading roles</h2>
        <p className="mb-2">{workflow.error.message}</p>
        <div className="text-sm bg-red-50 p-4 rounded">
          {workflow.error.data && JSON.stringify(workflow.error.data.zodError, null, 2)}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 max-w-[100vw] px-4 md:px-6">
      {isClient && (
        <div className="flex flex-col direct justify-start items-start bg-white p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <div>
              <Input label="Workflow Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {userInputs &&
              userInputs.map((userInput: any, n: number) => {
                if (userInput.showInUI) {
                  switch (userInput.flowNodeName) {
                    case FlowNameTypes.webhookInputFormData: {
                      return <UploadCmp key={n} addFiles={addFiles} />;
                    }
                  }
                }
              })}
            <div>Status: {workflow.data?.[0]?.status}</div>
            {workflow.data?.[0]?.endpoint && (
              <div>
                <p>Endpoint:</p>
                <div>
                  <p>URI: {`http://localhost:3000/api/endpoint/${workflow.data?.[0]?.endpoint?.uri}`}</p>
                  <p>Method: {workflow.data?.[0]?.endpoint?.method}</p>
                  <p>Payload: {JSON.stringify(workflow.data?.[0]?.endpoint?.payload)}</p>
                  <p>Client ID: {workflow.data?.[0]?.endpoint?.clientId}</p>
                  <p>Client Secret: {workflow.data?.[0]?.endpoint?.clientSecret}</p>
                </div>
              </div>
            )}
            <div>
              {workflow.data?.[0]?.status === WorkflowStatus.ACTIVE ? (
                <Button type="button" variant="primary" onClick={publishWorkflow}>
                  Update
                </Button>
              ) : (
                <Button type="button" variant="primary" onClick={publishWorkflow}>
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      {(publish.isLoading || update.isLoading) && <FullScreenLoading />}
    </div>
  );
}
