"use client";

import { useEffect, useState } from "react";
import { api, useUtils } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { Route } from "next";
import { toast } from "sonner";

import RuleFormBase from "../components/RuleFormBase";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { AdminRoutes } from "@/constants/routes";

const CreateRule = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const utils = useUtils();
  const createRule = api.rule.create.useMutation({
    onSuccess: (data) => {
      utils.rule.getAll.invalidate();
      toast.success("Rule created successfully");
      router.push((`${AdminRoutes.rules}`) as Route);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateRule = (rule: any) => {
    createRule.mutate(rule);
  };

  return (
    <div className="flex flex-col grow space-x-4 md:px-0">
      <div className="flex grow h-0">
        <div className="flex flex-col flex-2 bg-white grow">
          {isClient && <RuleFormBase handleCreateRule={handleCreateRule} />}
        </div>
      </div>
      {createRule.isLoading && <FullScreenLoading />}
    </div>
  );
};

export default CreateRule;
