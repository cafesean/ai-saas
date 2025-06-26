# AI Inference Processing - Complete File Inventory

## Frontend Components
- `src/components/dialog/RunInference.tsx` - Primary UI for inference requests
- `src/app/(app)/models/[slug]/page.tsx` - Model details page with inference interface

## API Routes
- `src/app/api/inference/[modelId]/route.ts` - Main inference endpoint for traditional ML models

## tRPC Routers
- `src/server/api/routers/provider.router.ts` - LLM provider inference endpoints
- `src/server/api/routers/inference-table.router.ts` - Advanced inference table management
- `src/server/api/routers/model-group.router.ts` - Champion/Challenger model management
- `src/server/api/root.ts` - Router configuration

## Services Layer
- `src/services/provider.service.ts` - LLM provider management and inference
- `src/services/inference-table-provisioning.service.ts` - Dynamic inference table provisioning
- `src/services/provider-configurations.service.ts` - Provider configurations and templates

## Database Schema
- `src/db/schema/model.ts` - Model and inference table definitions
- `src/db/schema/index.ts` - Schema exports and relations

## Type Definitions & Schemas
- `src/types/provider.types.ts` - Provider interface contracts
- `src/schemas/provider.schema.ts` - Provider validation schemas
- `src/schemas/model.schema.ts` - Model inference request schemas
- `src/schemas/inference-table.schema.ts` - Advanced inference table schemas

## Authentication & Authorization
- `src/lib/api-auth.ts` - API authentication wrapper
- `src/constants/permissions.ts` - Permission definitions (model:inference)

## Framework & Utilities
- `src/utils/trpc.ts` - tRPC inference helpers
- `src/framework/store/model.store.ts` - Model state management

## Configuration
- `.env.local` - Environment variables for inference endpoints
- `src/constants/general.ts` - General configuration constants

## Total Files: 18 primary files involved in AI inference processing

### Key External Dependencies:
- External Model Service: `INFERENCE_URL` (HTTP API for ML models)
- LLM Providers: OpenAI, Anthropic, Google, HuggingFace, etc.
- Database: PostgreSQL with dynamic table creation
- Authentication: NextAuth with RBAC permissions 