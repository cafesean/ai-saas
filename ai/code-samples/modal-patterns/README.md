# Modal Patterns Sample

This sample demonstrates common modal patterns in a Next.js application using Radix UI Dialog components.

## Features

- Confirmation dialog pattern
- Loading states
- Error handling
- Accessible dialog implementation
- Type-safe props
- Reusable components

## Key Components

1. `ConfirmDeleteButton`: A button that triggers a confirmation dialog
2. `ConfirmationDialog`: A reusable confirmation dialog component
3. `Button`: A base button component with variants
4. `Dialog`: Base dialog components from Radix UI

## Usage

```tsx
<ConfirmDeleteButton
  itemName="Example Item"
  onConfirm={async () => {
    // Handle delete action
  }}
/>
```

## Implementation Details

- Uses React Server Components where possible
- Client components marked with "use client"
- Local state management with useState
- Proper error handling
- Loading state feedback
- Accessible dialog implementation

## Dependencies

- Next.js 14
- Radix UI Dialog
- Tailwind CSS
- TypeScript 