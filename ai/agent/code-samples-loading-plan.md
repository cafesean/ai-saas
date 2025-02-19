# Code Samples Loading Plan

## Current Structure
```
code-samples/
├── api-patterns/
│   └── src/
│       ├── app/
│       ├── server/
│       └── utils/
├── modal-patterns/
│   └── src/
│       ├── app/
│       └── components/
├── state-management/
│   └── src/
│       ├── app/
│       └── store/
└── table-features/
    └── src/
        ├── app/
        ├── hooks/
        └── components/
```

## Implementation Plan

1. Update Sample Page Component
```typescript
// src/app/code-samples/[sample]/page.tsx
import { TableExample } from "@/code-samples/table-features/src/app/table-example/page"
import { ModalExample } from "@/code-samples/modal-patterns/src/app/modal-example/page"
import { StateExample } from "@/code-samples/state-management/src/app/store-example/page"
import { ApiExample } from "@/code-samples/api-patterns/src/app/users/page"

export default function SamplePage({ params }: { params: { sample: string } }) {
  const sample = samplesNav.find(item => 
    item.href.endsWith(params.sample)
  )

  if (!sample) {
    notFound()
  }

  const SampleComponent = () => {
    switch (params.sample) {
      case 'table-features':
        return <TableExample />
      case 'modal-patterns':
        return <ModalExample />
      case 'state-patterns':
        return <StateExample />
      case 'api-patterns':
        return <ApiExample />
      default:
        return notFound()
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">{sample.title}</h1>
      <p className="text-muted-foreground mb-8">{sample.description}</p>
      <SampleComponent />
    </div>
  )
}
```

2. Export Sample Components
- Each sample page needs to be exported properly
- Remove any page-specific providers that should be at the root
- Ensure all dependencies are available

3. Update tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/code-samples/*": ["./code-samples/*"]
    }
  }
}
```

4. Implementation Steps
[ ] Export each sample component properly
[ ] Add necessary providers to layout
[ ] Update path aliases
[ ] Test each sample individually
[ ] Add error boundaries for each sample
[ ] Add loading states

## Sample-Specific Requirements

1. Table Features
- Ensure TanStack Table is available
- Move state to component level
- Add sample data

2. Modal Patterns
- Include all UI components
- Handle dialog state properly
- Add sample interactions

3. State Management
- Include Zustand store
- Add persistence if needed
- Include sample state operations

4. API Patterns
- Mock tRPC endpoints
- Include sample data
- Handle loading/error states

## Next Steps
1. Start with table features as it's the simplest
2. Add each sample one by one
3. Test integration
4. Add error handling
5. Add loading states 