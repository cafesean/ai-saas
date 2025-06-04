## Epic: Enhanced Model Detail & Inference Capabilities (SAAS-1)

**Goal:** To provide users with comprehensive insights into their machine learning models, including detailed performance metrics, feature analysis, and the ability to run real-time inferences with dynamic inputs.

---

## User Stories (Metrics & Visualizations)

**Epic: Model Insights & Visualizations**

**As a Data Scientist / Model Owner, I want to:**

1.  **US-M01: View Core Model Information:** (SAAS-2)
    *   See the model's name, type (e.g., LogisticRegression), version, training date, number of training/test rows, feature count, and target variable details (`model_info`).
    *   Understand the data split strategy used during training (`model_info.split`).
2.  **US-M02: View Summary Performance Metrics:** (SAAS-3)
    *   See key scalar performance metrics like AUC (Train & Test), Gini (Train & Test), KS Statistic, and PSI from the `metrics.summary` section.
3.  **US-M03: View Global Feature Importances:** (SAAS-4)
    *   See a list of all input features ranked by their absolute importance (derived from `feature_analysis.global_importance.abs_coefficient`).
    *   Visualize the relative importance of features (e.g., using a bar chart or the pie/radial chart shown in the image).
    *   See the direction of impact (coefficient) for each feature.
4.  **US-M04: Analyze Numerical Feature Statistics:** (SAAS-5)
    *   For any numerical input feature listed in `feature_analysis.numerical_stats`, view its statistical summary (mean, min, max, median) broken down by the target variable's positive and negative classes (e.g., 'good\_class', 'bad\_class').
5.  **US-M05: Analyze Categorical Feature Insights (Initial Scope):** (SAAS-6)
    *   For categorical input features, view their Information Value (IV) from `feature_analysis.categorical_analysis.[feature_name].information_value`.
    *   *(Future Enhancement: Display Weight of Evidence (WoE) bins).*
6.  **US-M06: View Detailed Performance Charts:** (SAAS-7)
    *   View dynamic visualizations for all charts provided in the `metrics.charts` array, including:
        *   ROC Curve
        *   Confusion Matrix (raw counts & normalized percentages)
        *   Lift Chart
        *   K-S Curve
        *   Calibration Curve
        *   Precision vs. Threshold
        *   Recall vs. Threshold
    *   Be able to switch between raw counts and normalized views for the Confusion Matrix.
7.  **US-M07: View Model Input Feature Definitions:** (SAAS-8)
    *   See a list of all features used during model training (`features` array), including their original data type and encoding method.
8.  **US-M08: View Model Inference Output Schema:** (SAAS-9)
    *   Understand the structure and interpretation of the model's prediction output, including score type, range, and defined thresholds (`inference.output`).
9.  **US-M09: Access Model Version History:** (SAAS-10)
    *   (Existing functionality) View different versions of the model and their associated metrics.


## Technical Stories

**Phase 1: Data Layer & Core Display**

1.  **TS-DB01:** Modify `model_metrics` Drizzle schema: (SAAS-11)
    *   Add `charts_data: jsonb` column (for `metrics.charts`).
    *   Add `feature_analysis: jsonb` column (for `feature_analysis` object).
    *   Add `model_info_details: jsonb` (to store the entire `model_info` object for flexibility, simpler than many individual columns initially).
    *   Ensure `define_inputs` in `models` table stores `inference.input_schema`.
    *   Ensure `outputs` in `model_metrics` table stores `inference.output`.
    *   Update `modelSchema` in `model.router.ts` to include these new fields.
2.  **TS-API01:** Enhance `create` and `update` tRPC mutations in `model.router.ts`: (SAAS-12)
    *   Accept the full parsed metadata structure.
    *   Correctly map and store `model_info`, `features` (from metadata root), `inference.input_schema`, `inference.output`, `metrics.summary`, `metrics.charts`, and `feature_analysis` into the respective database columns.
3.  **TS-FE01:** Update `models/[slug]/page.tsx` to fetch and pass the new `model_info_details`, `charts_data`, and `feature_analysis` to relevant child components. (SAAS-13)
4.  **TS-FE02:** Create/Update `ModelInfoCard` component: (SAAS-14)
    *   Display details from `model.model_info_details`.
5.  **TS-FE03:** Update `MetricCard` / `AllKPIsDialog`: (SAAS-15)
    *   Display scalar metrics from `model.metrics[0].ks`, `auroc`, etc. (summary section).
6.  **TS-FE04:** Create `GlobalFeatureImportance` component: (SAAS-16)
    *   Input: `model.metrics[0].feature_analysis.global_importance`.
    *   Render a bar chart (or similar) showing `abs_coefficient` (normalized as percentage).
    *   List features with their `coefficient` and `abs_coefficient`.
7.  **TS-FE05:** Update `ModelFeaturesViewer`: (SAAS-17)
    *   Input: `model.metrics[0].features` (from metadata root `features` array).
    *   Display name, original type (`int64`, `object`, `datetime64[ns]`), and encoding.
    *   *Optional: Link or show coefficient from `global_importance` if names match.*
8.  **TS-FE06:** Update `ConfusionMatrix` component: (SAAS-18)
    *   Find the "Confusion Matrix" object within `model.metrics[0].charts_data`.
    *   Pass its `matrix` and `labels` properties.
9.  **TS-FE07:** Update Documentation Tab: (SAAS-19)
    *   Display `inference.input_schema` (from `model.defineInputs`) clearly, showing name, type, required, allowed\_values.
    *   Display `inference.output` (from `model.metrics[0].outputs`) clearly, showing score\_type, range, thresholds.

**Phase 2: Dynamic Charts & Feature Drill-Down**

1.  **TS-FE08:** Implement/Integrate a generic Charting Library (e.g., Recharts, Chart.js). (SAAS-20)
2.  **TS-FE09:** Create dynamic chart components for types specified in `metrics.charts` (line\_chart, bar\_chart). (SAAS-21)
    *   Component should accept `chart.name`, `chart.type`, `chart.x_axis`, `chart.y_axis`, `chart.data`.
    *   Render these charts on the "Performance" tab by iterating through `model.metrics[0].charts_data`.
3.  **TS-FE10:** Implement `NumericalFeatureDetail` component: (SAAS-22)
    *   Input: A specific feature name and `model.metrics[0].feature_analysis.numerical_stats`.
    *   Display: Mean, min, max, median for 'good\_class' and 'bad\_class' for the given feature.
4.  **TS-FE11:** Implement `CategoricalFeatureDetail` component (Initial Scope): (SAAS-23)
    *   Input: A specific feature name and `model.metrics[0].feature_analysis.categorical_analysis`.
    *   Display: Information Value (IV).
5.  **TS-FE12:** Integrate feature drill-down: (SAAS-24)
    *   On the `GlobalFeatureImportance` list or `ModelFeaturesViewer`, clicking a feature should display its `NumericalFeatureDetail` or `CategoricalFeatureDetail` if data exists in `feature_analysis`.

**Clarification from Previous Plan & Image Analysis:**

*   **Feature Importance Display (Image vs. Metadata):**
    *   The `feature_analysis.global_importance` provides `coefficient` and `abs_coefficient`. We will use `abs_coefficient` for the main importance ranking and visualization (like the pie/radial chart). The `coefficient` indicates direction.
    *   The image's detailed breakdown for *individual input features* (like "credit score" with ranges and "% of unpaid") is **not directly supported by the current `model_metadata.json` structure.** The `numerical_stats` gives overall stats per class, not per input value range. The `metrics.charts` like "Lift Chart" or "K-S Curve" analyze model *output scores*, not individual *input features* ranges.
    *   **Decision:** For now, when a numerical feature is selected, we will display the stats from `numerical_stats` (mean, min, max, median for good/bad class). The per-range analysis of input features shown in the image is out of scope unless the metadata format changes to include such pre-calculated data for each feature.