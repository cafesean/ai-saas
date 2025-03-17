"use client";

import { useEffect, useState } from "react";
import { api, useUtils } from "@/utils/trpc";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import RuleFormBase from "../components/RuleFormBase";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import SkeletonLoading from "@/components/ui/skeleton-loading";

const EditRule = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const params = useParams();
  const slug = params.slug as string;
  const utils = useUtils();
  let rule = api.rule.getByUUID.useQuery({ uuid: slug });
  const update = api.rule.update.useMutation({
    onSuccess: (data) => {
      utils.rule.getAll.invalidate();
      utils.rule.getByUUID.invalidate({ uuid: slug });
      toast.success("Rule updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUpdateRule = (rule: any) => {
    update.mutate(rule);
  };

  if (rule.isLoading) {
    return (
      <SkeletonLoading />
    );
  }

  if (rule.error) {
    console.error("Roles query error:", rule.error);
    return (
      <div className="text-red-500">
        <h2 className="text-lg font-semibold mb-2">Error loading templates</h2>
        <p className="mb-2">{rule.error.message}</p>
        <div className="text-sm bg-red-50 p-4 rounded">
          {rule.error.data && JSON.stringify(rule.error.data.zodError, null, 2)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow space-x-4 md:px-0">
      <div className="flex grow h-0">
        <div className="flex flex-col flex-2 bg-white grow">
          {isClient && <RuleFormBase rule={rule.data} handleUpdateRule={handleUpdateRule} />}
        </div>
      </div>
      {update.isLoading && <FullScreenLoading />}
    </div>
  );
};

export default EditRule;
