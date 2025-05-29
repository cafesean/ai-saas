export const ModelMetric = {
  ks: {
    label: "K-S",
    chart: {
      type: "Line",
      trend: "Upward",
      description:
        "K-S (Kolmogorov-Smirnov) measures the maximum difference between cumulative distributions. Higher values indicate better separation between positive and negative classes.",
    },
  },
  accuracy: {
    label: "Accuracy",
    chart: {
      type: "Bar",
      trend: "Stable",
      description:
        "Accuracy represents the proportion of correct predictions among the total number of cases examined.",
    },
  },
  gini: {
    label: "Gini",
    chart: {
      type: "Area",
      trend: "Upward",
      description:
        "Gini coefficient measures the inequality among values of a frequency distribution. In modeling, higher values indicate better discrimination.",
    },
  },
  aucroc: {
    label: "AUC-ROC",
    chart: {
      type: "ROC Curve",
      trend: "Stable",
      description:
        "Area Under the ROC Curve measures the model's ability to discriminate between positive and negative classes. Values closer to 1 indicate better performance.",
    },
  },
};

export enum ModelInputType {
  upload = "upload",
  path = "path",
}

export const ModelTypes = [
  {
    label: "Owned",
    value: "Owned",
  },
  {
    label: "Third Party",
    value: "Third Party",
  },
];

export const ThirdPartyModels = [
  {
    uuid: "third-party-model-1",
    name: "Google Gemini 2.0 Flash",
    value: "gemini-2.0-flash",
    free: true,
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    auth: {
      name: "Authorization",
      value: `Bearer ${process.env.GOOGLE_GEMINI_API_KEY}`,
    },
  },
];
