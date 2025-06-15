# Rule Sets Implementation Plan

## Overview
Rule Sets are collections of conditional logic steps that can be executed in sequence to make complex decisions. They follow the same lifecycle as Variables and Lookup Tables (Draft → Published → Deprecated).

## Phase 7: Rule Sets Implementation

### Backend Implementation (rule-set.router.ts)

**Core Features:**
- CRUD operations for rule sets
- Step management (nested router for rule set steps)
- Publishing lifecycle management
- Validation and error handling
- Multi-tenant support

**API Endpoints:**
- `getAll` - List all rule sets
- `getByUuid` - Get single rule set with steps
- `create` - Create new rule set
- `update` - Update existing rule set
- `delete` - Delete rule set (drafts only)
- `publish` - Publish draft rule set
- `deprecate` - Deprecate published rule set
- `getPublishedForSelection` - Get published rule sets for workflow use
- `steps.create` - Add rule set step
- `steps.update` - Update rule set step
- `steps.delete` - Delete rule set step
- `steps.reorder` - Reorder rule set steps

**Rule Set Step Types:**
1. **Condition** - If/then logic with variable comparisons
2. **Assignment** - Set variable values
3. **Lookup** - Reference lookup table values
4. **Formula** - Execute formula calculations
5. **Decision** - Final decision output

### Frontend Implementation

**Pages:**
- `/decisioning/rule-sets` - Main listing page
- `/decisioning/rule-sets/[uuid]` - Rule set detail page with step builder

**Components:**
- `RuleSetsList` - Table/card view component
- `RuleSetsSummary` - Statistics cards
- `RuleSetStepBuilder` - Visual step builder interface
- `StepEditor` - Individual step editing component

**Features:**
- Visual step builder with drag-and-drop
- Step type selection and configuration
- Variable and lookup table integration
- Test execution interface
- Export/import capabilities

## Database Schema (Already Created)

```sql
-- Rule Sets table
CREATE TABLE rule_sets (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  published_by INTEGER,
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rule Set Steps table
CREATE TABLE rule_set_steps (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() UNIQUE,
  rule_set_id INTEGER REFERENCES rule_sets(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) NOT NULL, -- 'condition', 'assignment', 'lookup', 'formula', 'decision'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL, -- Step-specific configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Steps

### Step 1: Backend Router
1. Create `rule-set.router.ts` with full CRUD operations
2. Implement step management nested router
3. Add validation schemas for different step types
4. Integrate with root tRPC router

### Step 2: Frontend UI
1. Create main rule sets listing page
2. Implement rule set detail page with step builder
3. Create step editing components
4. Add visual step builder interface

### Step 3: Integration
1. Connect with Variables and Lookup Tables
2. Add rule set execution engine
3. Implement test interface
4. Add export/import functionality

## Next Steps
After Rule Sets completion, we'll move to:
1. Workflow Integration (Phase 8)
2. Testing Framework (Phase 9)
3. Advanced Features (Phase 10) 