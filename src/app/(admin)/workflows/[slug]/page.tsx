"use client";

import { Button } from "@/components/form/Button";
import { api, useUtils } from "@/utils/trpc";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/form/Input";
import UploadCmp from "@/components/ui/Upload";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { FlowNameTypes, WidgetTypes } from "@/constants/nodes";
import { WorkflowStatus } from "@/constants/general";
import { GoogleDriveUploader } from "@/components/ui/google-drive/GoogleDriveUploader";
import { toast } from "sonner";
import Preview from "./components/Preview";

export default function WorkflowDetailPage() {
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [name, setName] = useState("");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [userInputs, setUserInputs] = useState<Record<string, any>>([]);
  const [fileFetching, setFileFetching] = React.useState(false);

  const checkDuplicateFile = (file: { base64file: string; name: string }) => {
    const isDuplicate = datasets.some((existingFile) => existingFile.base64file === file.base64file);
    if (isDuplicate) {
      toast.warning(`File "${file.name}" already exists, skipped adding`);
    }
    return isDuplicate;
  };

  // tRPC hooks
  const utils = useUtils();
  let workflow = api.workflow.getByUUID.useQuery({ uuid: slug });
  const publish = api.workflow.publish.useMutation({
    onSuccess: (data) => {
      utils.workflow.getAll.invalidate();
      utils.workflow.getByUUID.invalidate({ uuid: slug });
      setDatasets([]);
      toast.success("Workflow published successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const update = api.workflow.update.useMutation({
    onSuccess: (data) => {
      utils.workflow.getAll.invalidate();
      utils.workflow.getByUUID.invalidate({ uuid: slug });
      setDatasets([]);
      toast.success("Workflow updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
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
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64Result = reader.result as string;
        const fileData = {
          name: file.name,
          type: file.type,
          base64file: base64Result,
        };

        if (!checkDuplicateFile(fileData)) {
          setDatasets((prev) => [...prev, fileData]);
        }
      };
      reader.onerror = (error) => {
        toast.error("Error converting file to Base64");
        console.error("Error converting file to Base64:", error);
      };
    }
  };

  const publishWorkflow = () => {
    if (!name) {
      toast.error("Name is required!");
    } else {
      if (workflow.data?.[0]?.status === WorkflowStatus.ACTIVE) {
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
        <h2 className="text-lg font-semibold mb-2">Error loading Workflow.</h2>
        <p className="mb-2">{workflow.error.message}</p>
        <div className="text-sm bg-red-50 p-4 rounded">
          {workflow.error.data && JSON.stringify(workflow.error.data.zodError, null, 2)}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col grow space-x-4 md:px-0">
      {isClient && (
        <div className="flex grow h-0">
          <div className="flex flex-col flex-2 bg-white grow mr-4">
            <div className="flex flex-col direct justify-start items-start bg-white p-4 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                <div>
                  <Input label="Workflow Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                {userInputs.map((userInput: any, n: number) =>
                  userInput.showInUI && userInput.flowNodeName === FlowNameTypes.webhookInputFormData ? (
                    <div key={n} className="space-y-4">
                      <UploadCmp addFiles={addFiles} />
                      <div className="relative my-4">
                        <hr className="border-gray-200" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
                          Or
                        </div>
                      </div>
                      <div className="flex justify-center w-full">
                        <GoogleDriveUploader
                          setFileFetching={setFileFetching}
                          onFilesSelected={(files) => {
                            const newFiles = files.filter((file) => !checkDuplicateFile(file));
                            setDatasets((prev) => [...prev, ...newFiles]);
                          }}
                        />
                      </div>
                      {datasets.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Selected files</div>
                          <div className="space-y-2">
                            {datasets.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{file.type}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setDatasets((prev) => prev.filter((_, i) => i !== index));
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <img src="/ui/delete.svg" alt="delete" className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null
                )}
                <div>Status: {workflow.data?.[0]?.status}</div>
                {workflow.data?.[0]?.endpoint && (
                  <div>
                    <p>
                      <b>Endpoint:</b>
                    </p>
                    <div>
                      <p>Headers:</p>
                      <p>- x-ai-saas-client-id: {workflow.data?.[0]?.endpoint?.clientId}</p>
                      <p>- x-ai-saas-client-secret: {workflow.data?.[0]?.endpoint?.clientSecret}</p>
                      <p>URI: {`${process.env.NEXT_PUBLIC_AI_SASS_ENDPOINT_BASE_URL}${workflow.data?.[0]?.endpoint?.uri}`}</p>
                      <p>Method: {workflow.data?.[0]?.endpoint?.method}</p>
                      <p>Payload: {JSON.stringify(workflow.data?.[0]?.endpoint?.payload)}</p>
                    </div>
                  </div>
                )}
                {workflow.data?.[0]?.widgets &&
                  workflow.data?.[0]?.widgets.map((widget: any) => {
                    switch (widget.type) {
                      case WidgetTypes.chat: {
                        return (
                          <div key={`widget-${widget.uuid}`}>
                            <p>
                              <b>{widget.name}:</b>
                            </p>
                            <h2>Embed into site</h2>
                            <div className="w-full bg-background-section border-[0.5px] border-components-panel-border rounded-lg flex-col justify-start items-start inline-flex mt-2 bg-[#f9fafb]">
                              <p className="p-2 bg-[#f2f4f7]">
                                To add the chat widget any where on your website, add this iframe to your html code.
                              </p>
                              <div className="flex items-start justify-start w-full gap-2 p-3">
                                <div className="grow shrink basis-0 text-text-secondary text-[13px] leading-tight font-mono">
                                  <pre
                                    className="select-text"
                                    dangerouslySetInnerHTML={{
                                      __html: `&lt;iframe\n src="${process.env.NEXT_PUBLIC_AI_SASS_CHAT_WIDGET_URL}${widget.code}"\n style="width: 100%; height: 100%; min-height: 700px"\n frameborder="0"\n allow="microphone"&gt;\n&lt;/iframe&gt;`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-background-section border-[0.5px] border-components-panel-border rounded-lg flex-col justify-start items-start inline-flex mt-2 bg-[#f9fafb]">
                              <p className="p-2 bg-[#f2f4f7]">
                                To add a chat app to the bottom right of your website add this code to your html.
                              </p>
                              <div className="flex items-start justify-start w-full gap-2 p-3">
                                <div className="grow shrink basis-0 text-text-secondary text-[13px] leading-tight font-mono">
                                  <pre
                                    className="select-text"
                                    dangerouslySetInnerHTML={{
                                      __html: `&lt;script&gt;\n window.aiSAASChatbotConfig = {\n  code: '${widget.code}'\n }\n&lt;/script&gt;\n&lt;script\n src="${process.env.NEXT_PUBLIC_AI_SASS_CHAT_EMBED_MIN_PATH}"\n id="${widget.code}"\n defer&gt;\n&lt;/script&gt;\n&lt;style&gt;\n  #ai-saas-chatbot-bubble-button {\n    background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1)) !important;\n  }\n  #ai-saas-chatbot-bubble-window {\n    width: 24rem !important;\n    height: 40rem !important;\n  }\n&lt;/style&gt;`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      default:
                        break;
                    }
                  })}
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
          </div>
          <div className="flex flex-col grow flex-1">
            <Preview endpoint={workflow.data?.[0]?.endpoint} />
          </div>
        </div>
      )}
      {(publish.isLoading || update.isLoading || fileFetching) && <FullScreenLoading />}
    </div>
  );
}
