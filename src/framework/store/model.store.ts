import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ModelStatus =
  | "champion"
  | "challenger"
  | "published"
  | "draft"
  | string;

export interface Feature {
  name: string;
  type: string;
  description: string;
}

export interface Inference {
  id: string;
  timestamp: string;
  result: string;
  confidence: number;
}

export interface Model {
  id?: number;
  uuid: string;
  name: string;
  status: ModelStatus;
  framework: string | null;
  type: string | null;
  description: string | null;
  fileName: string;
  fileKey: string;
  metadataFileName: string | null;
  metadataFileKey: string | null;
  defineInputs?: any;
  createdAt: Date | string;
  updatedAt: Date | string;
  metrics?: {
    version: string;
    ks: string | null;
    auroc: string | null;
    gini: string | null;
    accuracy: string | null;
    ksChart: string | null;
    aurocChart: string | null;
    giniChart: string | null;
    accuracyChart: string | null;
    features?: any;
  }[] | null;
}

interface ModelState {
  models: Model[];
  selectedModelId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setModels: (models: Model[]) => void;
  selectModel: (uuid: string | null) => void;
  addModel: (model: Model) => void;
  updateModel: (uuid: string, data: Partial<Model>) => void;
  deleteModel: (uuid: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      models: [],
      selectedModelId: null,
      isLoading: false,
      error: null,

      setModels: (models) => set({ models }),
      selectModel: (uuid) => set({ selectedModelId: uuid }),
      addModel: (model) =>
        set((state) => ({ models: [...state.models, model] })),
      updateModel: (uuid, data) =>
        set((state) => ({
          models: state.models.map((model) =>
            model.uuid === uuid ? { ...model, ...data } : model,
          ),
        })),
      deleteModel: (uuid) =>
        set((state) => ({
          models: state.models.filter((model) => model.uuid !== uuid),
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "model-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
