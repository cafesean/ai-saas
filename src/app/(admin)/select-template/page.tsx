"use client";

import { api, useUtils } from "@/utils/trpc";
import React from "react";
import BlockList from "./components/BlockList/BlockList";
import type { TemplateBlockView } from "@/framework/types/template";
import { dbToTemplateBlock } from "@/framework/types/template";
import { TemplateStatus } from "@/constants/general";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/constants/routes";
import { Route } from "next";
const SelectTemplatePage: React.FC = () => {
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  // tRPC hooks
  const utils = useUtils();
  const templates = api.template.getAllByStatus.useQuery({ status: TemplateStatus.ACTIVE });
  const createWorkflow = api.workflow.create.useMutation({
    onSuccess: (data) => {
      utils.workflow.getAll.invalidate();
      router.push((`${AppRoutes.workflows}/${data?.uuid}`) as Route);
    },
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleBlockSelect = async (block: TemplateBlockView) => {
    const workflowName = `${block.name} - workflow`;
    await createWorkflow.mutateAsync({
      name: workflowName,
      template: block,
    });
  };

  if (templates.isLoading) {
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

  if (templates.error) {
    console.error("Roles query error:", templates.error);
    return (
      <div className="text-red-500">
        <h2 className="text-lg font-semibold mb-2">Error loading templates</h2>
        <p className="mb-2">{templates.error.message}</p>
        <div className="text-sm bg-red-50 p-4 rounded">
          {templates.error.data && JSON.stringify(templates.error.data.zodError, null, 2)}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-center my-8">Select a Template</h1>
        </div>
        {isClient && <BlockList blocks={templates.data?.map(dbToTemplateBlock) ?? []} onSelect={handleBlockSelect} />}
      </div>
      {createWorkflow.isLoading && <FullScreenLoading />}
    </>
  );
};

export default SelectTemplatePage;
