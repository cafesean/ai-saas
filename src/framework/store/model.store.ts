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
  encoding?: string;
}

export interface Inference {
  id: string;
  timestamp: string;
  result: string;
  confidence: number;
}

// Enhanced interfaces for new model metadata structure
export interface ModelInfo {
  name: string;
  type: string;
  version: string;
  trained_on: string;
  training_rows: number;
  test_rows: number;
  feature_count: number;
  target: {
    name: string;
    positive_class: number;
    negative_class: number;
  };
  split: {
    train_pct: number;
    cv_strategy: string;
    folds: number;
    repeats: number;
  };
}

export interface InferenceSchema {
  input_schema?: Array<{
    name: string;
    required?: boolean;
    description?: string;
    type: string;
    allowed_values?: string[];
  }>;
  example_payload?: Record<string, any>;
  output?: {
    score_type: string;
    range: [number, number];
    thresholds: Record<string, string>;
  };
}

export interface WoeTransformer {
  feature_names: string[];
  woe_mappings: Record<string, Record<string, number>>;
  bin_edges: Record<string, number[]>;
  information_values: Record<string, number>;
  feature_types: Record<string, string>;
}

export interface FeatureAnalysis {
  numerical_analysis?: Record<string, Record<'good_class' | 'bad_class', {
    mean: number;
    min: number;
    max: number;
    median: number;
  }>>;
  categorical_analysis?: Record<string, {
    information_value: number;
    woe_bins: Record<string, number>;
  }>;
}

export interface MetricsChart {
  name: string;
  type: string;
  x_axis: string;
  y_axis: string;
  data: Array<Record<string, number>>;
}

export interface EnhancedMetrics {
  version: string;
  // Legacy fields (kept for backward compatibility)
  ks: string | null;
  auroc: string | null;
  gini: string | null;
  accuracy: string | null;
  precision?: string | null;
  recall?: string | null;
  f1?: string | null;
  brier_score?: string | null;
  log_loss?: string | null;
  ksChart: string | null;
  aurocChart: string | null;
  giniChart: string | null;
  accuracyChart: string | null;
  features?: any;
  outputs?: any;
  inference?: any;
  
  // New enhanced fields from SAAS-11
  charts_data?: MetricsChart[];
  feature_analysis?: FeatureAnalysis;
  model_info_details?: ModelInfo;
  
  // Additional metrics from new structure
  woe_transformer?: WoeTransformer;
  inference_schema?: InferenceSchema;
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
  metrics?: EnhancedMetrics[] | null;
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
