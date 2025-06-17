# Shared Styles System

This directory contains shared Tailwind CSS styles and utilities for consistent UX across the application.

## Files

- `shared.css` - CSS classes using Tailwind utilities
- `../lib/shared-styles.ts` - TypeScript constants for style strings

## Usage

### 1. TypeScript Style Objects (Recommended)

Use the TypeScript constants for better IntelliSense and type safety:

```tsx
import { pageStyles, headerStyles, getStatusColor } from '@/lib/shared-styles'

function MyPage() {
  return (
    <div className={pageStyles.container}>
      <div className={headerStyles.section}>
        <div className={headerStyles.container}>
          <div className={headerStyles.layout}>
            <h1 className={headerStyles.title}>Page Title</h1>
            <div className={headerStyles.actions}>
              {/* Action buttons */}
            </div>
          </div>
        </div>
      </div>
      <main className={pageStyles.main}>
        {/* Content */}
      </main>
    </div>
  )
}
```

### 2. CSS Classes

Import the CSS file and use the predefined classes:

```tsx
// In your main CSS file or layout
import '@/styles/shared.css'

function MyComponent() {
  return (
    <div className="page-container">
      <div className="header-section">
        <div className="header-layout">
          <h1 className="header-title">Page Title</h1>
        </div>
      </div>
      <main className="page-main">
        {/* Content */}
      </main>
    </div>
  )
}
```

### 3. Combining with cn() Utility

For conditional styling, use with the `cn()` utility:

```tsx
import { cn } from '@/lib/utils'
import { pageStyles, getStatusColor } from '@/lib/shared-styles'

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("px-2 py-1 rounded", getStatusColor(status))}>
      {status}
    </span>
  )
}
```

## Style Categories

### Page Layouts
- `pageStyles.container` - Full screen page container
- `pageStyles.main` - Main content area with spacing
- `pageStyles.content` - Content with responsive padding

### Headers
- `headerStyles.section` - Header section with border
- `headerStyles.layout` - Responsive header layout
- `headerStyles.title` - Page title styling
- `headerStyles.actions` - Action buttons container

### Navigation
- `tabStyles.list` - Responsive tab list
- `tabStyles.content` - Tab content with proper spacing

### Cards & Grids
- `gridStyles.main` - Three column responsive grid
- `gridStyles.twoColumn` - Two column grid
- `cardStyles.bordered` - Card with border

### Status & States
- `getStatusColor(status)` - Returns appropriate color for status
- `statusStyles.*` - Individual status colors

### Forms
- `formStyles.field` - Form field spacing
- `formStyles.label` - Consistent label styling
- `formStyles.errorText` - Error message styling

## Common Patterns

### Full Page Layout
```tsx
import { commonLayouts } from '@/lib/shared-styles'

function Page() {
  return (
    <div className={commonLayouts.fullPageWithHeader}>
      {/* Breadcrumbs */}
      <div className={commonLayouts.headerSection}>
        {/* Header content */}
      </div>
      <main className={commonLayouts.mainContent}>
        {/* Page content */}
      </main>
    </div>
  )
}
```

### Tabbed Interface
```tsx
import { tabStyles } from '@/lib/shared-styles'

function TabbedInterface() {
  return (
    <Tabs defaultValue="editor">
      <TabsList className={tabStyles.list}>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="schema">Schema</TabsTrigger>
      </TabsList>
      <TabsContent value="editor" className={tabStyles.content}>
        {/* Tab content */}
      </TabsContent>
    </Tabs>
  )
}
```

### Loading States
```tsx
import { loadingStyles } from '@/lib/shared-styles'

function LoadingSpinner() {
  return (
    <div className={pageStyles.loadingContainer}>
      <Loader2 className={loadingStyles.spinner} />
      <span className={loadingStyles.text}>Loading...</span>
    </div>
  )
}
```

## Best Practices

1. **Use TypeScript constants** for better IntelliSense and refactoring
2. **Combine with cn()** for conditional styling
3. **Follow the established patterns** from decisioning and lookup tables pages  
4. **Use semantic naming** - styles should describe purpose, not appearance
5. **Test responsive behavior** - many styles include responsive breakpoints
6. **Document new patterns** when adding to the shared styles

## Extending the System

When adding new shared styles:

1. Add to the appropriate category in `shared-styles.ts`
2. Add corresponding CSS class in `shared.css` if needed
3. Update this documentation
4. Test across different screen sizes
5. Ensure consistent naming conventions

## Migration Guide

To migrate existing pages to use shared styles:

1. Replace hardcoded Tailwind classes with shared style constants
2. Use `getStatusColor()` for status badges
3. Apply consistent spacing using `spacingStyles`
4. Use responsive grid patterns from `gridStyles`
5. Test that the page maintains the same visual appearance

## Examples

See these pages for reference implementations:
- `src/app/(app)/decisioning/[slug]/page.tsx` - Full pattern implementation
- `src/app/(app)/decisioning/lookup-tables/[uuid]/page.tsx` - Card-based layout 