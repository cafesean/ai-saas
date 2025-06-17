# Lookup Table tRPC Validation Error Fix

## Problem
tRPC validation was failing with error:
```
"Expected string, received null" for exactValue field in dimensionBins
```

## Root Cause
The frontend was sending `undefined` values for `exactValue` when `binType` was "range", but these were being converted to `null` somewhere in the data flow, causing tRPC schema validation to fail.

## Solution
Fixed the data transformation in `frontendToBackend()` function to properly handle `exactValue`:

1. **Data Transformers** (`src/app/(app)/decisioning/lookups/lib/data-transformers.ts`):
   - For `binType === 'exact'`: Always send a string (empty string if not set)
   - For `binType === 'range'`: Send `undefined` explicitly
   - This ensures tRPC schema validation passes

2. **Component Initialization** (`src/app/(app)/decisioning/lookups/components/lookup-table-editor.tsx`):
   - Fixed `addRow()`, `addColumn()`, and initial state to always initialize `exactValue` as empty string for all data types
   - This prevents `undefined` values from being created in the first place

## Key Changes
```typescript
// Before
exactValue: bin.exactValue,

// After  
exactValue: bin.binType === 'exact' ? (bin.exactValue || '') : undefined,
```

## Status
✅ Fixed - tRPC validation should now pass correctly 