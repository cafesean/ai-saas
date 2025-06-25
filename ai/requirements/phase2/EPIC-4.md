### **4. Models**

This section details the **new features and architectural enhancements** required to transform the "Models" module from a passive display for pre-built models into a comprehensive, enterprise-grade Model Management and Operations hub. The vision is to support the full lifecycle of a model: from flexible importing and training to robust A/B testing, secure deployment, and transparent monitoring.

---

#### **4.1. Flexible Model Ingestion & Training**

*   **Current State:** The platform can only import models via a rigid JSON structure that breaks easily. The "Build a Model" and "Connect External Models" features are non-functional placeholders.
*   **New Requirement:** Implement a robust and flexible model import process powered by AI, and build out the functionality for connecting to external model providers and initiating training/fine-tuning jobs.
*   **Justification:** Enterprises have diverse model ecosystems. A modern AI platform cannot be a walled garden; it must seamlessly integrate with models from various sources and in various formats. Providing flexible ingestion and pathways for retraining is fundamental to being a central hub for an organization's AI assets.
*   **End-to-End Scenario 1: AI-Powered Flexible Model Import**
    1.  **Initiation:** A data scientist uploads a `model.json` file from their training environment. The file's structure is valid but uses different key names than our internal schema (e.g., `model_performance` instead of `metrics`).
    2.  **AI Transformation Request:** The client calls a tRPC mutation, sending the raw JSON to the backend.
    3.  **Backend AI Translation:** The backend procedure prompts a powerful LLM with both the user's JSON and the platform's target Zod schema. The prompt is direct: "You are a data transformation service. Remap the source JSON object to perfectly validate against this target schema. Intelligently map keys like `model_performance` to `metrics`."
    4.  **Validation and Import:** The backend validates the LLM's restructured output against the Zod schema. If it passes, the model metadata (features, metrics, charts) is saved to the database. The import process is now resilient and user-friendly.
*   **End-to-End Scenario 2: Connecting and Fine-Tuning a Base Model**
    1.  **Connect External LLMs:** A new "Connectors" or "Providers" section in the settings will allow admins to securely input API keys for external services like OpenAI, Anthropic, and Google Gemini.
    2.  **"Build a Model" Redefined:** The "Build a Model" flow is redefined as a "Fine-Tuning Job." A user selects a compatible base model (e.g., a platform-provided Preset Model or a connected external model).
    3.  **Job Configuration:** The user configures the job by selecting a training dataset (e.g., the "Decision Log" from a specific Rule Set) and setting key hyperparameters.
    4.  **Asynchronous Training:** Upon submission, the platform dispatches a fine-tuning job to the asynchronous worker infrastructure. The user can monitor the job's progress from the UI.
    5.  **New Custom Model:** Once the job is complete, a new, fine-tuned custom model artifact appears in the user's Model Hub, ready for testing and deployment.

#### **4.2. Champion/Challenger Framework & Model Groups**

*   **Current State:** Each model exists in isolation. There is no native support for A/B testing or comparing model versions, which is a standard MLOps practice.
*   **New Requirement:** Introduce the concept of "Model Groups," a first-class feature for managing and comparing a "Champion" model against one or more "Challenger" versions in a live production environment.
*   **Justification:** The only way to truly know if a new model is better is to test it on live production data against the current best. A Champion/Challenger framework provides the controlled, measurable, and safe environment needed to validate new models, mitigate risk, and drive continuous performance improvement.
*   **End-to-End Scenario: Running an A/B Test on a New Credit Scoring Model**
    1.  **Group Creation:** A user has a live "Credit Scoring v1.2" (the Champion). They have just created a new "Credit Scoring v1.3" with updated features. They create a new "Model Group" called "Live Credit Scoring."
    2.  **Assigning Roles:** Inside the group's configuration, they designate v1.2 as the "Champion" and v1.3 as the "Challenger." They configure the traffic split, for example, sending 90% of live inference requests to the Champion and 10% to the Challenger.
    3.  **Unified Endpoint:** The Model Group is exposed via a single, stable API endpoint within a workflow. When the workflow calls this endpoint, the platform's internal routing logic handles the 90/10 traffic split automatically.
    4.  **Comparative Analytics:** A new "Comparative View" tab appears within the Model Group's page. This dashboard displays key performance metrics (like accuracy, AUC-ROC, average prediction scores) side-by-side for both the Champion and the Challenger, updated in real-time as live inferences are processed.
    5.  **Promoting a New Champion:** After a week of testing, the analytics clearly show that v1.3 is outperforming v1.2. With a single click on a "Promote to Champion" button, the user designates v1.3 as the new Champion. The system can then automatically re-route 100% of traffic to the new Champion, completing the validation lifecycle without any downtime or API changes.

#### **4.3. Scalable & Auditable Inference Architecture**

*   **Current State:** All inference results from all models are being dumped into a single, massive database table. This is not scalable, makes querying inefficient, and creates a data governance nightmare.
*   **New Requirement:** Redesign the inference storage architecture. Each "Model Group" will have its own dedicated, automatically-generated inference table. Inference logs must be enriched with detailed explainability data.
*   **Justification:** Data isolation is critical for performance and security. Storing related inferences together (e.g., all Champion/Challenger results for one use case) makes analytics dramatically faster and easier. Furthermore, for regulated industries, simply storing the prediction is not enough; we must store the *reason* for the prediction (e.g., feature importance) to ensure full auditability and explainability (XAI).
*   **End-to-End Scenario: Logging an Auditable Inference Request**
    1.  **Table Provisioning:** When a user creates the "Live Credit Scoring" Model Group, the backend automatically provisions a new, dedicated table in the database named `inference_log_live_credit_scoring`.
    2.  **Inference Request:** A workflow sends a request to the Model Group's endpoint with data for a new loan applicant. The request is routed to one of the models (e.g., the Challenger, v1.3).
    3.  **Prediction & Explainability:** The model returns its prediction (e.g., `score: 750`). In the same process, the platform computes and attaches XAI data, such as SHAP values, indicating the feature importance for *this specific prediction* (e.g., `{"income": +0.4, "debt_ratio": -0.2, "age": +0.1}`).
    4.  **Structured Logging:** The system writes a new row to the dedicated `inference_log_live_credit_scoring` table. This row contains not just the input data and the final prediction, but also the model ID that made the prediction (`v1.3`), a request timestamp, and a JSON column containing the full feature importance data.
    5.  **Data Deletion Policy:** If the "Live Credit Scoring" Model Group is ever deleted, the platform will have a clear policy to either delete or archive its associated inference table, ensuring a clean and manageable data lifecycle.

#### **4.4. UI/UX Remediation**

*   **Current State:** The model detail view contains placeholder data, and the user experience for viewing metrics is awkward.
*   **New Requirement:** Connect all UI components to real backend data and streamline the user experience for analyzing model performance.
*   **Justification:** The UI is the window into the model's performance. If it's broken or displays fake data, it undermines the entire purpose of the module and erodes user trust.
*   **Detailed Checklist of Required Fixes & Enhancements:**
    *   **Connect Analytics Tab:** The main analytics tab on the model detail page currently shows placeholder charts and stats. This must be completely rewired to display real, historical performance metrics queried directly from the model's training/validation artifacts stored in the database.
    *   **Integrate Inference View:** The results from the new, dedicated inference tables must be viewable directly within the model detail page, providing an interface to browse, search, and inspect recent live predictions.
    *   **Improve Metrics Display:** The "See all metrics" button, which opens a separate modal, is a poor UX. This modal should be removed. Key performance indicators (KPIs) should be displayed directly on the main analytics page in clear, well-designed cards and charts. More detailed metrics can be organized into collapsible sections or tabs on the same page, eliminating the need for disruptive pop-ups.