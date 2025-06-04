## Epic: Enhanced Model Detail & Inference Capabilities

**Goal:** To provide users with comprehensive insights into their machine learning models, including detailed performance metrics, feature analysis, and the ability to run real-time inferences with dynamic inputs.

## User Stories (Model Inference)

**Epic: Interactive Model Inference**

**As a Data Scientist / Business User, I want to:**

1.  **US-I01: Input Data via a Dynamic Form:**
    *   Be presented with an input form in the "Run Inference" dialog that is dynamically generated based on the model's `inference.input_schema`.
    *   See clear labels, input types (number, string, select for `allowed_values`), and descriptions for each input field.
    *   Be informed about which fields are required.
2.  **US-I02: Load Example Payload:**
    *   Have an option to easily load the `inference.example_payload` into the inference form to see a working example.
3.  **US-I03: Submit Input for Prediction:**
    *   Submit the form data to get a real-time prediction from the model.
4.  **US-I04: View Clear Prediction Results:**
    *   See the raw model output (e.g., probability score).
    *   See an interpreted result based on the `inference.output.thresholds` (e.g., "Low Risk", "High Risk").
    *   See the input values I submitted that led to the prediction.
5.  **US-I05: Input Data via JSON:**
    *   Have an alternative tab in the "Run Inference" dialog to paste input data directly as a JSON object.
    *   Changes in the JSON tab should reflect in the form tab and vice-versa (if feasible, or at least one-way from JSON to form).

---

**Phase 1: Model Inference Dialog**

1.  **TS-FE13:** Enhance `RunInferenceDialog.tsx`:
    *   Dynamically generate form fields based on `model.defineInputs` (which stores `inference.input_schema`).
        *   Use `name`, `type` (map to HTML input types), `required`.
        *   If `allowed_values` exists, render a `<select>` element.
        *   Use `description` as a placeholder or help text.
    *   Implement "Load Example Payload" button to populate the form using `model.metrics[0].feature_analysis.inference.example_payload` (this implies storing `example_payload` within the `feature_analysis` JSONB or another dedicated field).
        *   **Correction:** `example_payload` is directly under `inference` in the metadata. It should be stored alongside `input_schema` perhaps in `defineInputs` or its own JSONB column in `models` table. For simplicity, let's assume it gets stored in `models.defineInputs` as `{ schema: [...], example: {...} }`.
2.  **TS-API02:** Ensure `/api/inference/[modelId]` route:
    *   Correctly receives and processes the dynamic input payload.
    *   Returns the raw prediction and probability as per the current implementation.
3.  **TS-FE14:** Update `RunInferenceDialog.tsx` result display:
    *   Show raw score/probability.
    *   Interpret the raw score using `model.metrics[0].outputs.thresholds` (e.g., `low_risk`, `high_risk`).
4.  **TS-FE15:** Implement JSON input tab in `RunInferenceDialog`.
    *   Allow pasting JSON.
    *   On valid JSON, attempt to populate the form fields (one-way sync for simplicity).
