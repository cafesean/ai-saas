# Current Task: Create tRPC + Drizzle + Zod Sample

## Requirements
- Full-stack implementation
- Type-safe API layer with tRPC
- Database operations with Drizzle
- Schema validation with Zod
- Follow established patterns

## Plan
[X] Review standards and rules
[ ] Create sample structure
  [ ] Database schema and migrations
  [ ] tRPC router setup
  [ ] API implementation
  [ ] Frontend components
[ ] Add documentation

## Implementation Areas
1. User Management Feature
   - User schema with Drizzle
   - CRUD operations
   - Form validation
   - Error handling
   - Type safety

## Structure
```
api-patterns/
├── src/
│   ├── app/
│   │   └── users/              # User management page
│   ├── server/
│   │   ├── db/                 # Database configuration
│   │   └── api/                # tRPC routers
│   └── components/
│       └── users/              # User-specific components
```

## Code Sample Structure Analysis

### Correct Structure
```
table-features/
├── src/
│   ├── app/
│   │   └── table-example/              # Page folder (kebab-case)
│   │       ├── components/             # Page-specific components
│   │       │   ├── DataTable.tsx      # Component (PascalCase)
│   │       │   └── TableSkeleton.tsx  # Component (PascalCase)
│   │       └── page.tsx               # Page file
│   ├── hooks/
│   │   └── useTableColumns.ts         # Hook (camelCase)
│   └── types/
│       └── index.ts                   # Shared types
```

### Key Differences Found
1. File Naming:
   - Hooks use camelCase (useTableColumns.ts), not kebab-case
   - Components use PascalCase consistently

2. Import Paths:
   - Use relative paths for page-specific imports
   - Use absolute paths only for shared utilities

3. Component Organization:
   - Page-specific components stay in page folder
   - Only truly shared components go in global components

4. State Management:
   - Use local state over global store when possible
   - Removed unnecessary Zustand store

5. File Structure:
   - Flatter structure within page folder
   - Clearer separation of page-specific vs shared code

## Lessons Learned
1. File/Folder Naming:
   - Page folders: kebab-case
   - Component files: PascalCase
   - Hook files: camelCase with 'use' prefix
   - Type files: camelCase

2. Code Organization:
   - Keep components close to usage
   - Minimize global shared code
   - Use local state by default
   - Clear separation of concerns

3. Import Conventions:
   - Relative imports for page-specific
   - Absolute imports for shared utilities
   - Consistent import ordering

## Next Steps
1. Update modal patterns sample with correct structure
2. Update state management sample with correct structure
3. Add example usage documentation
4. Add README for each sample 