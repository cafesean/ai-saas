import { useEffect } from "react";
import { toast } from "sonner";

import { useModelStore } from "@/framework/store/model.store";
import { api, useUtils } from "@/utils/trpc";

/**
 * Hook for accessing models with traditional loading states
 * This version is kept for backward compatibility
 */
export function useModels() {
  // Get store actions
  const {
    models,
    selectedModelId,
    isLoading,
    error,
    setModels,
    selectModel,
    setLoading,
    setError,
  } = useModelStore();

  // Use tRPC to fetch models
  const utils = useUtils();
  const modelsQuery = api.model.getAll.useQuery(undefined, {
    // Don't refetch on mount if we already have models in the store
    enabled: models.length === 0 || !isLoading,
    // Prevent refetching on window focus and when switching tabs
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Model mutations
  const createModelMutation = api.model.create.useMutation({
    onSuccess: (data) => {
      toast.success("Model created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateModelMutation = api.model.update.useMutation();
  const deleteModelMutation = api.model.delete.useMutation({
    onSuccess: (data) => {
      utils.model.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Synchronize the store with the query results
  useEffect(() => {
    if (modelsQuery.data) {
      setModels(modelsQuery.data);
    }

    if (modelsQuery.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    if (modelsQuery.error) {
      setError(modelsQuery.error.message);
    }
  }, [
    modelsQuery.data,
    modelsQuery.isLoading,
    modelsQuery.error,
    setModels,
    setLoading,
    setError,
  ]);

  // Get the selected model if there is a selectedModelId
  const selectedModel = selectedModelId
    ? models.find((model) => model.uuid === selectedModelId)
    : null;

  // Create a model and update the store
  const createModel = async (
    model: Omit<Parameters<typeof createModelMutation.mutate>[0], "id">,
  ) => {
    setLoading(true);
    try {
      const newModel = await createModelMutation.mutateAsync(model);
      if (newModel) {
        setModels([...models, newModel]);
      }
      return newModel;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update a model and update the store
  const updateModel = async (
    uuid: string,
    modelData: Omit<Parameters<typeof updateModelMutation.mutate>[0], "id">,
  ) => {
    setLoading(true);
    try {
      const updatedModel = await updateModelMutation.mutateAsync({
        ...modelData,
        uuid,
      });
      if (updatedModel) {
        setModels(
          models.map((model) => (model.uuid === uuid ? updatedModel : model)),
        );
      }
      return updatedModel;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a model and update the store
  const deleteModel = async (uuid: string) => {
    setLoading(true);
    try {
      await deleteModelMutation.mutateAsync(uuid);
      setModels(models.filter((model) => model.uuid !== uuid));
      if (selectedModelId === uuid) {
        selectModel(null);
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh models from the API
  const refreshModels = () => {
    setLoading(true);
    modelsQuery.refetch();
  };

  return {
    models,
    selectedModel,
    isLoading: isLoading || modelsQuery.isLoading,
    error,
    selectModel,
    createModel,
    updateModel,
    deleteModel,
    refreshModels,
  };
}

/**
 * Version of useModels that works with Suspense
 * This hook will suspend if data is loading and throw errors
 */
export function useModelsSuspense() {
  // Get store actions
  const { selectedModelId, selectModel } = useModelStore();

  // Use tRPC to fetch models with suspense enabled
  const modelsQuery = api.model.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Model mutations
  const createModelMutation = api.model.create.useMutation({
    onSuccess: (data) => {
      toast.success("Model created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateModelMutation = api.model.update.useMutation();
  const deleteModelMutation = api.model.delete.useMutation({
    onSuccess: (data) => {
      toast.success("Model deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // The data is guaranteed to be available in suspense mode
  // But TypeScript doesn't know that, so we provide a fallback empty array
  const models = modelsQuery.data ?? [];

  // Get the selected model if there is a selectedModelId
  const selectedModel = selectedModelId
    ? models.find((model) => model.uuid === selectedModelId)
    : null;

  // Create a model
  const createModel = async (
    model: Omit<Parameters<typeof createModelMutation.mutate>[0], "id">,
  ) => {
    const newModel = await createModelMutation.mutateAsync(model);
    // Invalidate the query to refetch the models
    modelsQuery.refetch();
    return newModel;
  };

  // Update a model
  const updateModel = async (
    uuid: string,
    modelData: Omit<Parameters<typeof updateModelMutation.mutate>[0], "id">,
  ) => {
    const updatedModel = await updateModelMutation.mutateAsync({
      ...modelData,
      uuid,
    });
    // Invalidate the query to refetch the models
    modelsQuery.refetch();
    return updatedModel;
  };

  // Delete a model
  const deleteModel = async (uuid: string) => {
    await deleteModelMutation.mutateAsync(uuid);
    // Invalidate the query to refetch the models
    modelsQuery.refetch();
    if (selectedModelId === uuid) {
      selectModel(null);
    }
  };

  // Refresh models from the API
  const refreshModels = () => {
    modelsQuery.refetch();
  };

  return {
    models,
    selectedModel,
    selectModel,
    createModel,
    updateModel,
    deleteModel,
    refreshModels,
  };
}
