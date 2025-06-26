# AI Inference Processing - System Architecture Documentation

## Overview

This document provides a comprehensive overview of the AI inference processing system, detailing all components, data flow paths, and architectural patterns involved in processing AI model inference requests.

## System Architecture

The AI inference system supports two primary processing paths:

1. **Traditional Model Inference**: Processing through external model services (custom ML models)
2. **LLM Provider Inference**: Processing through various AI/LLM providers (OpenAI, Anthropic, etc.)

## Core Components & Files

### 1. Frontend Components

#### `src/components/dialog/RunInference.tsx`
- **Purpose**: Primary UI component for initiating inference requests
- **Key Features**:
  - Dynamic form generation based on model input schema
  - JSON input support
  - Real-time result visualization with feature contributions
  - Support for both credit scoring and generic model types
- **Flow**: User Input → Form Validation → API Call → Result Display

### 2. API Routes & Controllers

#### `src/app/api/inference/[modelId]/route.ts`
- **Purpose**: Main inference API endpoint for traditional ML models
- **Authentication**: Uses `withApiAuth` with `model:inference` permission
- **Process Flow**:
  1. Extract modelId from URL path
  2. Parse request payload (JSON)
  3. Verify model access with org isolation
  4. Forward request to external model service
  5. Store inference results in database
  6. Return response to client

#### External Service Integration
- **External URL**: `process.env.INFERENCE_URL` (e.g., `http://221.215.44.18:20002/{model_uuid}/predict`)
- **Authentication**: Custom headers with `MODEL_SERVICE_ACCESS_ID_KEY` and `MODEL_SERVICE_SECRET_KEY`
- **Request Format**: 
  ```javascript
  {
    baseURL: process.env.INFERENCE_URL?.replace("{model_uuid}", modelId),
    method: "POST",
    params: {
      model_path: model.fileKey,
      metadata_path: model.metadataFileKey,
    },
    data: { ...userInputPayload }
  }
  ```

### 3. tRPC Routers

#### `src/server/api/routers/provider.router.ts`
- **Purpose**: Handles LLM provider inference requests
- **Key Endpoints**:
  - `inference`: Direct provider inference with specified provider
  - `autoInference`: Automatic provider selection for inference
  - `healthCheck`: Provider health monitoring

#### `src/server/api/routers/inference-table.router.ts`
- **Purpose**: Manages dedicated inference tables for ModelGroups (Champion/Challenger strategy)
- **Key Features**:
  - Dynamic table provisioning per ModelGroup
  - Inference record insertion with enhanced metadata
  - Analytics and querying capabilities
  - Table lifecycle management

### 4. Services Layer

#### `src/services/provider.service.ts`
- **Purpose**: Central service for managing LLM providers
- **Key Methods**:
  - `performInference()`: Execute inference with specific provider
  - `performInferenceAuto()`: Auto-select best provider for inference
  - `checkProviderHealth()`: Monitor provider availability
- **Provider Types**: OpenAI, Anthropic, Google, HuggingFace, Together, Mistral, Cohere, Perplexity, Custom

#### `src/services/inference-table-provisioning.service.ts`
- **Purpose**: Manages dedicated inference tables for advanced model management
- **Key Features**:
  - Auto-provision inference tables for ModelGroups
  - Enhanced schema with XAI data, audit trails, performance tracking
  - Table partitioning for large-scale data
  - Champion/Challenger routing support

### 5. Data Models & Schemas

#### Database Tables

**`inferences` (Basic inference logging)**
```sql
-- src/db/schema/model.ts
export const inferences = pgTable("inferences", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  modelId: integer("model_id").references(() => models.id),
  input: json("input"),
  output: json("output"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

**Dynamic Inference Tables (Advanced)**
```sql
-- Created per ModelGroup for Champion/Challenger strategy
CREATE TABLE inferences_mg_{orgId}_{modelGroupUuid} (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid(),
  model_group_id INTEGER NOT NULL,
  model_id INTEGER NOT NULL,
  request_id VARCHAR(100) NOT NULL,
  
  -- Core data
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  
  -- Enhanced metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  xai_data JSONB,           -- Explainable AI data
  audit_trail JSONB DEFAULT '{}'::jsonb,
  
  -- Performance tracking
  latency_ms INTEGER,
  model_role VARCHAR(20) CHECK (model_role IN ('champion', 'challenger')),
  traffic_percentage INTEGER DEFAULT 0,
  
  -- Session & tracking
  session_id VARCHAR(100),
  user_id VARCHAR(100),
  correlation_id VARCHAR(100),
  request_source VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Type Definitions

**`src/types/provider.types.ts`**
```typescript
interface ProviderRequest {
  modelId: string;
  input: Record<string, any>;
  metadata?: {
    requestId?: string;
    userId?: string;
    timestamp?: Date;
  };
}

interface ProviderResponse {
  output: {
    text?: string;
    message?: string;
    [key: string]: any;
  };
  metadata: {
    modelId: string;
    providerId: string;
    latency: number;
    tokensUsed?: number;
    cost?: number;
    requestId: string;
    timestamp: Date;
  };
}
```

**`src/schemas/inference-table.schema.ts`**
```typescript
export const InferenceRecordSchema = z.object({
  id: z.number().optional(),
  uuid: z.string().uuid().optional(),
  modelGroupId: z.number(),
  modelId: z.number(),
  requestId: z.string(),
  input: z.record(z.string(), z.any()),
  output: z.record(z.string(), z.any()),
  metadata: InferenceMetadataSchema,
  xaiData: XAIDataSchema,
  auditTrail: AuditTrailSchema,
});
```

### 6. Authentication & Authorization

#### `src/lib/api-auth.ts`
- **Purpose**: API route authentication wrapper
- **Security Features**:
  - CVE-2025-29927 protection against middleware bypass
  - RBAC integration with permission checking
  - Organization isolation
  - Development mock user support
- **Required Permission**: `model:inference` for inference endpoints

## Data Flow Diagrams

### Traditional Model Inference Flow

```
User Interface (RunInference.tsx)
    ↓ [POST /api/inference/{modelId}]
API Route (route.ts)
    ↓ [Authentication & Authorization]
withApiAuth(model:inference)
    ↓ [Model Lookup + Org Isolation]
Database Query (models table)
    ↓ [External Service Call]
External Model Service (INFERENCE_URL)
    ↓ [Response Processing]
Database Insert (inferences table)
    ↓ [Return Results]
Frontend Result Display
```

### LLM Provider Inference Flow

```
Client Application
    ↓ [tRPC call]
provider.inference() or provider.autoInference()
    ↓ [Provider Selection]
ProviderService.performInference()
    ↓ [Provider-specific Processing]
Provider Client (OpenAI/Anthropic/etc.)
    ↓ [Response]
ProviderResponse Object
    ↓ [Return to Client]
```

### Champion/Challenger Inference Flow

```
Model Group Creation
    ↓ [Auto-provision]
InferenceTableProvisioningService.autoProvision()
    ↓ [Create Dedicated Table]
inferences_mg_{orgId}_{modelGroupUuid}
    ↓ [Traffic Routing]
Champion (90%) / Challenger (10%)
    ↓ [Inference Execution]
Multiple Model Inference
    ↓ [Enhanced Logging]
Dedicated Table with XAI/Audit Data
    ↓ [Performance Analysis]
Champion vs Challenger Metrics
```

## Key Environment Variables

```bash
# External Model Service
INFERENCE_URL=http://221.215.44.18:20002/{model_uuid}/predict
MODEL_SERVICE_URL=http://221.215.44.18:20002/{model_uuid}/predict
MODEL_SERVICE_ACCESS_ID_KEY=X-API-Key
MODEL_SERVICE_ACCESS_ID_VALUE=your_api_key
MODEL_SERVICE_SECRET_KEY=X-Secret-Key
MODEL_SERVICE_SECRET_VALUE=your_secret

# Development
NEXT_PUBLIC_MOCK_USER_ID=1
NODE_ENV=development
```

## Permission System

The inference system integrates with the RBAC system:

- **Required Permission**: `model:inference`
- **Permission Slug**: `"model:inference"`
- **Description**: "Execute model inference requests"
- **Scope**: Organization-level isolation

## Error Handling & Monitoring

### Error Types
1. **Authentication Errors**: 401 (unauthorized), 403 (forbidden)
2. **Model Access Errors**: 404 (model not found), 403 (access denied)
3. **External Service Errors**: Network failures, service timeouts
4. **Validation Errors**: Invalid input format, missing required fields
5. **Processing Errors**: Model execution failures, data format issues

### Monitoring Points
1. **API Response Times**: Track inference latency
2. **Success Rates**: Monitor inference success/failure rates
3. **Provider Health**: Regular health checks for LLM providers
4. **Resource Usage**: Monitor token consumption and costs
5. **Error Patterns**: Track and alert on error trends

## Scalability Considerations

### Current Architecture
- **Synchronous Processing**: Direct API calls to external services
- **Single Instance**: No horizontal scaling built-in
- **Database Logging**: All inferences logged to PostgreSQL

### Future Enhancements
- **Async Processing**: Queue-based inference for large requests
- **Caching Layer**: Cache frequent inference patterns
- **Load Balancing**: Multiple external service instances
- **Stream Processing**: Real-time inference analytics
- **Data Partitioning**: Time-based partitioning for inference tables

## Security Features

1. **Authentication**: NextAuth integration with session management
2. **Authorization**: RBAC with granular permissions
3. **Organization Isolation**: Multi-tenant data separation
4. **API Security**: Protected against middleware bypass attacks
5. **Audit Logging**: Comprehensive audit trails for all inferences
6. **Data Validation**: Input sanitization and validation

## Integration Points

### External Dependencies
- **Model Service**: External HTTP service for ML model inference
- **LLM Providers**: OpenAI, Anthropic, Google, HuggingFace APIs
- **Database**: PostgreSQL for persistence
- **Authentication**: NextAuth for session management

### Internal Dependencies
- **tRPC**: Type-safe API layer
- **Drizzle ORM**: Database access layer
- **Zod**: Schema validation
- **React**: Frontend framework
- **TailwindCSS**: UI styling

This documentation provides a complete overview of the AI inference processing system, covering all major components, data flows, and architectural decisions. The system is designed to handle both traditional ML models and modern LLM providers while maintaining security, scalability, and comprehensive audit capabilities. 