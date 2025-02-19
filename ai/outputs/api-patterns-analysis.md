# API Patterns Code Sample Analysis

## Key Differences Found

1. Router Naming & Imports
   - Original: Used renamed procedures (getAll, createUser, etc.)
   - Correct: Keep standard CRUD names (list, create, update, delete)
   - Original: Used @/ imports
   - Correct: Use relative imports for server code

2. tRPC Client Usage
   - Original: Used `api.useContext()` and `useQueryClient`
   - Correct: Use `api.useUtils()` for cache invalidation
   - Original: Used `getQueryKey()` pattern
   - Correct: Use direct invalidation with `utils.user.list.invalidate()`

3. Provider Structure
   - Original: Had provider in app/providers.tsx
   - Correct: Provider should be in providers/TRPCProvider.tsx
   - Original: Used default export
   - Correct: Used named export for provider

4. Type Safety
   - Original: Used custom type imports
   - Correct: Leverage RouterInputs/RouterOutputs from trpc utils
   - Original: Had redundant type definitions
   - Correct: Reuse types from schema and router outputs

## Best Practices Learned

1. Router Naming:
   - Use standard CRUD operation names
   - Avoid renaming basic operations
   - Keep procedure names simple and consistent

2. Import Patterns:
   - Use relative imports for server code
   - Use absolute imports for shared utilities
   - Keep imports organized and consistent

3. tRPC Utilities:
   - Use `api.useUtils()` for cache management
   - Direct invalidation is preferred
   - Keep mutation patterns consistent

4. Type Safety:
   - Leverage tRPC's type inference
   - Reuse types from schema definitions
   - Maintain consistent type naming

## Implementation Notes

1. Cache Invalidation:
```typescript
// Correct
const utils = api.useUtils()
utils.user.list.invalidate()

// Incorrect
const queryClient = api.useQueryClient()
queryClient.invalidateQueries(api.user.list.getQueryKey())
```

2. Router Definition:
```typescript
// Correct
export const userRouter = createTRPCRouter({
  list: publicProcedure,
  create: publicProcedure,
  update: publicProcedure,
  delete: publicProcedure,
})

// Incorrect
export const userRouter = createTRPCRouter({
  getAll: publicProcedure,
  createUser: publicProcedure,
  updateUser: publicProcedure,
  deleteUser: publicProcedure,
})
```

3. Import Patterns:
```typescript
// Correct
import { insertUserSchema, users } from "../../../server/db/schema"

// Incorrect
import { insertUserSchema } from "@/server/db/schema"
``` 