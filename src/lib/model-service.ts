// lib/model-service.ts

// Sample model data
const models = [
  {
    id: "model_1",
    name: "Microfinance Risk Predictor v3",
    version: "3.2.1",
    status: "champion",
    lastUpdate: "2 days ago",
    inferences: 1243567,
    creator: "Ahmed Al-Mansouri",
    description: "Predicts risk levels for microfinance loan applications",
    type: "Classification",
    framework: "PyTorch",
    accuracy: "91.2%",
    features: [
      {
        name: "income",
        type: "numeric",
        description: "Monthly income in local currency",
      },
      {
        name: "loan_amount",
        type: "numeric",
        description: "Requested loan amount",
      },
      {
        name: "loan_term",
        type: "numeric",
        description: "Loan term in months",
      },
      { name: "age", type: "numeric", description: "Applicant age in years" },
      {
        name: "employment_years",
        type: "numeric",
        description: "Years at current employment",
      },
      {
        name: "previous_loans",
        type: "numeric",
        description: "Number of previous loans",
      },
      {
        name: "credit_score",
        type: "numeric",
        description: "Internal credit score (0-100)",
      },
    ],
    recentInferences: [
      {
        id: "inf_1",
        timestamp: "2 hours ago",
        result: "Low Risk",
        confidence: 0.92,
      },
      {
        id: "inf_2",
        timestamp: "5 hours ago",
        result: "Medium Risk",
        confidence: 0.78,
      },
      {
        id: "inf_3",
        timestamp: "1 day ago",
        result: "High Risk",
        confidence: 0.95,
      },
    ],
  },
  {
    id: "model_2",
    name: "SME Fraud Detection Engine",
    version: "2.4.0",
    status: "challenger",
    lastUpdate: "5 days ago",
    inferences: 3456789,
    creator: "Fatima Al-Zahrani",
    description: "Detects potential fraud in SME transactions",
    type: "Classification",
    framework: "TensorFlow",
    accuracy: "94.5%",
    features: [
      {
        name: "transaction_amount",
        type: "numeric",
        description: "Transaction amount",
      },
      {
        name: "transaction_time",
        type: "datetime",
        description: "Time of transaction",
      },
      {
        name: "merchant_category",
        type: "categorical",
        description: "Merchant category code",
      },
      {
        name: "location",
        type: "categorical",
        description: "Transaction location",
      },
      {
        name: "device_id",
        type: "categorical",
        description: "Device used for transaction",
      },
    ],
    recentInferences: [
      {
        id: "inf_4",
        timestamp: "1 hour ago",
        result: "Not Fraud",
        confidence: 0.97,
      },
      {
        id: "inf_5",
        timestamp: "3 hours ago",
        result: "Fraud",
        confidence: 0.89,
      },
    ],
  },
  {
    id: "model_3",
    name: "Telecom Churn Predictor",
    version: "1.8.5",
    status: "champion",
    lastUpdate: "1 week ago",
    inferences: 876543,
    creator: "Mohammed Al-Otaibi",
    description: "Predicts customer churn for telecom services",
    type: "Classification",
    framework: "scikit-learn",
    accuracy: "87.9%",
    features: [
      {
        name: "monthly_charges",
        type: "numeric",
        description: "Monthly charges",
      },
      { name: "tenure", type: "numeric", description: "Months as a customer" },
      {
        name: "contract_type",
        type: "categorical",
        description: "Type of contract",
      },
      {
        name: "payment_method",
        type: "categorical",
        description: "Payment method",
      },
      {
        name: "service_usage",
        type: "numeric",
        description: "Service usage metrics",
      },
    ],
    recentInferences: [],
  },
  {
    id: "model_4",
    name: "Salary Prediction Model",
    version: "2.1.3",
    status: "challenger",
    lastUpdate: "3 days ago",
    inferences: 543210,
    creator: "Saeed Al-Ghamdi",
    description: "Predicts salary ranges based on job attributes",
    type: "Regression",
    framework: "XGBoost",
    accuracy: "89.7%",
    features: [
      {
        name: "experience",
        type: "numeric",
        description: "Years of experience",
      },
      {
        name: "education",
        type: "categorical",
        description: "Education level",
      },
      { name: "skills", type: "array", description: "List of skills" },
      { name: "location", type: "categorical", description: "Job location" },
      { name: "industry", type: "categorical", description: "Industry sector" },
    ],
    recentInferences: [],
  },
  {
    id: "model_5",
    name: "Mortgage Default Predictor",
    version: "4.0.2",
    status: "challenger",
    lastUpdate: "1 day ago",
    inferences: 987654,
    creator: "Aisha Al-Farsi",
    description: "Predicts likelihood of mortgage default",
    type: "Classification",
    framework: "LightGBM",
    accuracy: "92.8%",
    features: [
      {
        name: "loan_to_value",
        type: "numeric",
        description: "Loan to value ratio",
      },
      {
        name: "debt_to_income",
        type: "numeric",
        description: "Debt to income ratio",
      },
      { name: "credit_score", type: "numeric", description: "Credit score" },
      {
        name: "employment_status",
        type: "categorical",
        description: "Employment status",
      },
      {
        name: "property_type",
        type: "categorical",
        description: "Type of property",
      },
    ],
    recentInferences: [],
  },
];

export async function getModels() {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return models;
}

export async function getModelById(id: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const model = models.find((m) => m.id === id);
  if (!model) {
    throw new Error(`Model with ID ${id} not found`);
  }

  return model;
}

export async function updateModel(id: string, data: any) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const modelIndex = models.findIndex((m) => m.id === id);
  if (modelIndex === -1) {
    throw new Error(`Model with ID ${id} not found`);
  }

  // Update the model in the array (in a real app, this would be a database update)
  models[modelIndex] = { ...models[modelIndex], ...data };

  return models[modelIndex];
}

export async function deleteModel(id: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const modelIndex = models.findIndex((m) => m.id === id);
  if (modelIndex === -1) {
    throw new Error(`Model with ID ${id} not found`);
  }

  // Delete the model from the array (in a real app, this would be a database delete)
  models.splice(modelIndex, 1);

  return;
}
