---
description: 
globs: 
---
# NextJS TanStack Table Standards

You are an expert in implementing TanStack Table (React Table) in NextJS applications. Follow these standards for consistent, performant table implementations.

## Table Hook Organization

### Core Table Hooks
1. useTableColumns
```typescript
interface UseTableColumnsProps<T> {
  columns: Array<{
    key: keyof T;
    header: string;
    cell?: (info: { getValue: () => any }) => React.ReactNode;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    width?: number;
  }>;
}
```

2. useTableSort
```typescript
interface UseTableSortProps<T> {
  initialSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}
```

3. useTablePagination
```typescript
interface UseTablePaginationProps {
  initialPageIndex?: number;
  initialPageSize?: number;
  totalItems: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}
```

4. useTableSearch
```typescript
interface UseTableSearchProps<T> {
  data: T[];
  searchableColumns: Array<keyof T>;
  initialSearchTerm?: string;
}
```

### Hook Implementation Guidelines
- Keep hooks focused on single responsibility
- Implement memoization for performance
- Provide TypeScript types
- Include default values
- Handle edge cases
- Support customization

## Column Definitions

### Standard Column Structure
```typescript
{
  key: 'name',
  header: 'Name',
  cell: ({ getValue }) => (
    <button 
      onClick={() => handleClick(getValue())}
      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
    >
      {getValue()}
    </button>
  ),
  enableSorting: true,
  enableFiltering: true,
}
```

### Column Features
- Consistent styling
- Click handlers for interactive cells
- Sorting capabilities
- Filtering options
- Custom cell rendering
- Width control
- Mobile responsiveness

## Table Features Implementation

### 1. Sorting
- Client-side sorting
- Multi-column sort support
- Sort direction indicators
- Custom sort functions
- Preserve sort state

### 2. Filtering
- Text-based filtering
- Column-specific filters
- Multiple filter support
- Custom filter functions
- Filter state management

### 3. Search
- Global search
- Column-specific search
- Debounced search
- Highlight matches
- Case-insensitive search

### 4. Pagination
- Page size options
- Page navigation
- Total items display
- Hide on single page
- Maintain state

## Mobile Responsiveness

### Strategies
1. Horizontal scrolling for wide tables
2. Stack columns on mobile
3. Hide less important columns
4. Adjust cell content
5. Touch-friendly controls

### Implementation
```typescript
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

## Loading States

### Implementation
```typescript
{loading ? (
  <TableSkeleton columns={visibleColumns.length} rows={5} />
) : (
  <Table data={data} columns={columns} />
)}
```

### Features
- Skeleton loading
- Loading indicators
- Maintain layout
- Disable interactions
- Smooth transitions

## Row Actions

### Implementation
```typescript
{
  key: 'actions',
  header: '',
  cell: ({ row }) => (
    <div className="flex justify-end space-x-2">
      <EditButton onClick={() => handleEdit(row.original)} />
      <DeleteButton onClick={() => handleDelete(row.original)} />
    </div>
  ),
}
```

### Guidelines
- Consistent positioning
- Clear icons/labels
- Confirmation dialogs
- Mobile-friendly targets
- Keyboard accessibility

## Best Practices

### Performance
1. Virtual scrolling for large datasets
2. Memoized components
3. Debounced search/filter
4. Optimized re-renders
5. Lazy loading data

### Accessibility
1. Proper ARIA labels
2. Keyboard navigation
3. Focus management
4. Screen reader support
5. High contrast support

### State Management
1. URL state synchronization
2. Persistent preferences
3. Reset capabilities
4. State initialization
5. Error handling

## Implementation Steps
1. Define table requirements
2. Create type definitions
3. Implement core hooks
4. Add basic table structure
5. Implement features incrementally
6. Add loading states
7. Optimize for mobile
8. Test edge cases

## Testing Strategy
1. Unit test hooks
2. Integration test features
3. Test responsive behavior
4. Accessibility testing
5. Performance testing
6. Error scenario testing
7. Browser compatibility 