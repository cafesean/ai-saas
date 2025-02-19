# N8N Workflow Parser Documentation

## Overview
The N8N Workflow Parser is a system for processing N8N workflow definitions, extracting user inputs, and managing node type configurations. It provides both REST and tRPC APIs for template management and node type configuration.

## Features
- Parse N8N workflow JSON
- Extract user inputs based on node types
- Manage node type configurations
- Store workflow templates
- Admin interface for configuration

## API Endpoints

### REST API

#### POST /api/n8n/templates
Creates a new template from an N8N workflow definition.

**Request Body:**
```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": {},
      "id": "node-id",
      "name": "Node Name",
      "type": "node-type",
      "position": [x, y],
      "typeVersion": 1
    }
  ],
  "versionId": "version-id",
  "meta": {
    "templateId": "template-id",
    "instanceId": "instance-id"
  },
  "id": "workflow-id"
}
```

**Response:**
```json
{
  "id": "uuid",
  "template_id": "template-id",
  "version_id": "version-id",
  "instance_id": "instance-id",
  "user_inputs": {
    "node-id": {
      "category": "node-category",
      "parameters": {}
    }
  },
  "workflow_json": {}
}
```

### tRPC API

#### n8n.createTemplate
Creates a new template.
```typescript
const template = await api.n8n.createTemplate.mutate(workflowJson);
```

#### n8n.listNodeTypes
Lists all configured node types.
```typescript
const nodeTypes = await api.n8n.listNodeTypes.query();
```

#### n8n.createNodeType
Creates a new node type configuration.
```typescript
const nodeType = await api.n8n.createNodeType.mutate({
  type: "node-type",
  category: "category",
  description: "description"
});
```

#### n8n.updateNodeType
Updates an existing node type configuration.
```typescript
const nodeType = await api.n8n.updateNodeType.mutate({
  id: "node-type-id",
  type: "node-type",
  category: "category",
  description: "description"
});
```

#### n8n.deleteNodeType
Deletes a node type configuration.
```typescript
await api.n8n.deleteNodeType.mutate("node-type-id");
```

## Node Type Categories
The system supports the following node type categories:

### document
For nodes that handle document loading and processing.
```json
{
  "dataType": "binary|text",
  "binaryMode": "specificField",
  "options": {}
}
```

### text-splitter
For nodes that split text into chunks.
```json
{
  "chunkSize": number,
  "chunkOverlap": number,
  "options": {}
}
```

### social-auth
For nodes that handle social media authentication.
```json
{
  "authType": "string",
  "credentials": {},
  "options": {}
}
```

## Database Schema

### templates
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(256) NOT NULL,
  version_id VARCHAR(256) NOT NULL,
  instance_id VARCHAR(256) NOT NULL,
  user_inputs JSONB NOT NULL,
  workflow_json JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### node_types
```sql
CREATE TABLE node_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(256) NOT NULL,
  category VARCHAR(256) NOT NULL,
  description VARCHAR(1024),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Admin Interface
The admin interface is available at `/admin/templates/node-types` and provides:
- List of configured node types
- Create/Edit/Delete node types
- Category assignment
- Description management

## Error Handling
The system provides proper error handling for:
- Invalid workflow JSON
- Missing required fields
- Database errors
- Validation errors

## Testing
The system includes comprehensive tests for:
- Workflow parsing
- Parameter extraction
- API endpoints
- Error cases

## Future Enhancements
Planned enhancements include:
- Search and filtering for node types
- Pagination support
- Bulk operations
- Additional node type categories 