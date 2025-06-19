# UI/UX Architecture Standards - AI SaaS Platform

**Document Type:** UI/UX Implementation Standards  
**Audience:** Frontend Developers, UI/UX Designers, Product Team  
**Purpose:** Complete guide to design system, component library, and user interaction patterns

## Table of Contents

1. [Design System Foundation](#design-system-foundation)
2. [Component Library Standards](#component-library-standards)
3. [Tailwind CSS Standards](#tailwind-css-standards)
4. [Responsive Design Patterns](#responsive-design-patterns)
5. [UI Interaction Patterns](#ui-interaction-patterns)
6. [Accessibility Standards](#accessibility-standards)
7. [Table Components (TanStack)](#table-components-tanstack)

---

## Overview & Purpose

This document defines the comprehensive UI/UX implementation standards for the AI SaaS platform. Built on Tailwind CSS, Radix UI primitives, and React Hook Form, the design system ensures consistent, accessible, and performant user interfaces across all application features.

## Where to Find Logic

### Design System Foundation
- **Global Styles:** `src/app/globals.css` - CSS variables, color system, animations
- **Tailwind Config:** `tailwind.config.js` - Design tokens, breakpoints, utilities
- **Shared Styles:** `src/styles/shared.css` - Common component styles
- **Theme Provider:** `src/components/theme-provider.tsx` - Dark/light mode handling

### Component Library
- **UI Components:** `src/components/ui/` - Atomic design components (40+ components)
- **Form Components:** `src/components/form/` - Specialized form controls
- **Dialog Components:** `src/components/dialog/` - Modal and dialog patterns
- **Feature Components:** `src/components/feature/` - Domain-specific components
- **Layout Components:** `src/components/` - Navigation, sidebars, layouts

### Design Patterns
- **Modal Patterns:** Dialog components with two-step confirmation flows
- **Form Patterns:** React Hook Form integration with validation
- **Loading States:** Skeleton components and loading indicators
- **Responsive Design:** Mobile-first responsive grid systems
- **Navigation:** Sidebar, mobile nav, breadcrumbs

## Current Architecture Patterns

### 1. Design Token System
```css
/* Color system from globals.css */
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --success: 142.1 76.2% 36.3%;
  --warning: 38 92% 50%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

/* Dark mode variants */
.dark {
  --primary: 217.2 91.2% 59.8%;
  --destructive: 0 62.8% 30.6%;
  /* ... other dark mode colors */
}
```

### 2. Component Variant System
```typescript
// Pattern from button.tsx using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### 3. Modal Dialog Patterns
```typescript
// Standard modal pattern from dialog.tsx
<Dialog>
  <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200">
    <DialogHeader className="flex flex-col space-y-1.5 text-center sm:text-left">
      <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
        {isConfirming ? 'Confirm Details' : 'Add New Item'}
      </DialogTitle>
    </DialogHeader>
    
    {/* Modal content */}
    
    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4. Form Validation Patterns
```typescript
// Form pattern using React Hook Form
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### 5. Responsive Grid Patterns
```typescript
// Common responsive patterns found in codebase
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards or content */}
</div>

<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  {/* Header content with responsive stacking */}
</div>

<TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-none md:flex p-1 h-8">
  {/* Responsive tab layout */}
</TabsList>
```

## Component Library Standards

### Atomic Design Structure ✅
- **Atoms:** Button, Input, Label, Badge, Skeleton
- **Molecules:** FormField, Card, DialogHeader, TabsList
- **Organisms:** Dialog, Table, Form, Navigation
- **Templates:** Page layouts, modal templates
- **Pages:** Complete page implementations

### Accessibility Implementation ✅
```typescript
// Accessibility patterns from components
<FormControl>
  <Slot
    ref={ref}
    id={formItemId}
    aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
    aria-invalid={!!error}
    {...props}
  />
</FormControl>

// Screen reader support
<span className="sr-only">Close</span>

// Focus management
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### Animation System ✅
```css
/* Micro-animations from globals.css */
.animate-pulse-subtle {
  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* State transitions with Radix UI */
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
```

---

## Tailwind CSS Standards

### Class Organization Principles

**Group by Function (Required Pattern):**
```typescript
// ✅ Good - Logical grouping
<div className="
  flex items-center justify-between
  p-4 mx-auto max-w-lg
  bg-white border border-gray-200 rounded-lg
  shadow-sm hover:shadow-md
  transition-all duration-200
  sm:p-6 sm:max-w-xl
">

// ❌ Avoid - Random order
<div className="shadow-sm p-4 transition-all border-gray-200 flex bg-white rounded-lg">
```

**Function Groups (In Order):**
1. **Layout:** `flex`, `grid`, `block`, `inline`, positioning
2. **Spacing:** `p-*`, `m-*`, `space-*`, `gap-*`
3. **Sizing:** `w-*`, `h-*`, `max-w-*`, `min-h-*`
4. **Colors:** `bg-*`, `text-*`, `border-*`
5. **Typography:** `font-*`, `text-*`, `leading-*`
6. **Borders:** `border-*`, `rounded-*`
7. **Effects:** `shadow-*`, `opacity-*`
8. **Transitions:** `transition-*`, `animate-*`
9. **Responsive:** `sm:*`, `md:*`, `lg:*`, `xl:*`

### Custom Design Tokens

**Color System (CSS Variables):**
```css
/* From globals.css - Required color usage */
:root {
  --primary: 221.2 83.2% 53.3%;          /* Blue brand color */
  --secondary: 210 40% 96.1%;            /* Light gray */
  --destructive: 0 84.2% 60.2%;          /* Red for errors */
  --success: 142.1 76.2% 36.3%;          /* Green for success */
  --warning: 38 92% 50%;                 /* Yellow for warnings */
  --muted: 210 40% 96.1%;                /* Subtle backgrounds */
  --border: 214.3 31.8% 91.4%;           /* Default borders */
  --input: 214.3 31.8% 91.4%;            /* Input borders */
  --ring: 221.2 83.2% 53.3%;             /* Focus rings */
  --radius: 0.5rem;                      /* Default border radius */
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --destructive: 0 62.8% 30.6%;
  /* Dark mode variants */
}
```

**Color Usage Patterns:**
```typescript
// ✅ Good - Use semantic color names
<div className="bg-primary text-primary-foreground">
<Button className="bg-destructive hover:bg-destructive/90">
<div className="border-border bg-muted">

// ❌ Avoid - Hard-coded color values
<div className="bg-blue-600 text-white">
<Button className="bg-red-500">
```

### Responsive Breakpoints

**Standard Breakpoints:**
```typescript
// Tailwind default breakpoints (from config)
sm: '640px',   // Small devices (phones)
md: '768px',   // Medium devices (tablets)
lg: '1024px',  // Large devices (desktops)
xl: '1280px',  // Extra large devices
2xl: '1536px'  // 2x Extra large devices

// Usage patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
<nav className="hidden md:flex lg:space-x-8">
<aside className="w-full lg:w-64 xl:w-72">
```

### Component-Specific Patterns

**Button Classes:**
```typescript
// Base button classes (from button.tsx)
const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

// Variant patterns
variants: {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90", 
  outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline"
}
```

**Card Classes:**
```typescript
// Standard card pattern
<div className="
  rounded-lg border bg-card text-card-foreground shadow-sm
  hover:shadow-md transition-shadow duration-200
  p-6 space-y-4
">
```

**Form Classes:**
```typescript
// Input styling
<input className="
  flex h-9 w-full rounded-md border border-input 
  bg-transparent px-3 py-1 text-sm shadow-sm 
  transition-colors placeholder:text-muted-foreground 
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
  disabled:cursor-not-allowed disabled:opacity-50
">

// Label styling
<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">

// Error message styling
<p className="text-[0.8rem] font-medium text-destructive">
```

---

## Table Components (TanStack)

### TanStack Table Implementation Standards

**Required Setup Pattern:**
```typescript
// Standard table hook pattern
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });
}
```

**Column Definition Patterns:**
```typescript
// Standard column definitions
const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
```

**Table Component Structure:**
```typescript
// Required table JSX structure
<div className="space-y-4">
  {/* Toolbar */}
  <div className="flex items-center justify-between">
    <div className="flex flex-1 items-center space-x-2">
      <Input
        placeholder={`Filter ${filterColumn}...`}
        value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn(filterColumn)?.setFilterValue(event.target.value)
        }
        className="h-8 w-[150px] lg:w-[250px]"
      />
    </div>
    <DataTableViewOptions table={table} />
  </div>

  {/* Table */}
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())
                }
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>

  {/* Pagination */}
  <DataTablePagination table={table} />
</div>
```

**Table Feature Standards:**

1. **Selection:** Always include row selection with checkbox column
2. **Sorting:** Use Button component with ArrowUpDown icon for sortable headers
3. **Filtering:** Include search input for primary filter column
4. **Pagination:** Use DataTablePagination component
5. **Actions:** Include action column with dropdown menu
6. **Empty State:** Show "No results" message when data is empty
7. **Loading State:** Use skeleton rows during data loading

**Pagination Component:**
```typescript
function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## UI Interaction Patterns

### Modal Dialog Standards

**Two-Step Confirmation Flow:**
```typescript
// Standard confirmation pattern
function ConfirmationModal({ isOpen, onConfirm, itemName }: ConfirmationModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isConfirming ? 'Confirm Deletion' : 'Delete Item'}
          </DialogTitle>
          <DialogDescription>
            {isConfirming 
              ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
              : `You are about to delete "${itemName}".`
            }
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsConfirming(false)}>
            Cancel
          </Button>
          {isConfirming ? (
            <Button variant="destructive" onClick={onConfirm}>
              Delete Permanently
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setIsConfirming(true)}>
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Form Validation Patterns

**React Hook Form Integration:**
```typescript
// Standard form setup with validation
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: '',
    email: '',
    role: 'user',
  },
});

// Form submission with error handling
const onSubmit = async (data: FormData) => {
  try {
    await createUser.mutateAsync(data);
    toast.success('User created successfully');
    form.reset();
  } catch (error) {
    toast.error('Failed to create user');
  }
};
```

### Loading States

**Skeleton Components:**
```typescript
// Standard skeleton patterns
function UserCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-24" />
      </div>
    </Card>
  );
}

// Table skeleton
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
```

---

## Design System Compliance ✅

**Implementation Status:**
1. **Modal Patterns:** ✅ Two-step confirmation flows implemented
2. **Button Hierarchy:** ✅ Primary, secondary, destructive variants with proper hover states
3. **Form Layouts:** ✅ Responsive grid layouts with consistent spacing
4. **Loading States:** ✅ Skeleton components and loading indicators
5. **Color System:** ✅ Semantic color tokens with dark mode support
6. **Typography:** ✅ Consistent font weights and sizes
7. **Spacing:** ✅ 4px grid system using Tailwind spacing
8. **Accessibility:** ✅ ARIA labels, focus management, keyboard navigation
9. **Responsive Design:** ✅ Mobile-first approach with logical breakpoints
10. **Table Features:** ✅ TanStack tables with sorting, filtering, pagination

**Quality Standards:**
- All components tested for accessibility compliance
- Responsive design tested across device sizes
- Dark mode compatibility for all components  
- Performance optimized with proper React patterns
- Type-safe props and component APIs
5. **Typography:** ✅ Consistent font sizes and hierarchy
6. **Color System:** ✅ Semantic color tokens with dark mode
7. **Mobile Responsiveness:** ✅ Mobile-first responsive design
8. **Error Handling:** ✅ Form validation and error messaging

### Typography Scale ✅
```css
/* Typography implementation found in components */
.text-2xl    /* Headers */
.text-xl     /* Subheaders */  
.text-lg     /* Dialog titles */
.text-sm     /* Body text, form inputs */
.text-xs     /* Labels, small text */

/* Font weights */
.font-medium    /* Form messages */
.font-semibold  /* Dialog titles */
.font-bold      /* Button text */
```

### Responsive Breakpoints ✅
```css
/* Tailwind breakpoints used throughout codebase */
sm: 640px    /* Small tablets */
md: 768px    /* Tablets */
lg: 1024px   /* Laptops */
xl: 1280px   /* Desktops */

/* Common responsive patterns */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
flex-col md:flex-row
hidden md:block
w-full md:w-auto
```

## Templates & Usage Examples

### 1. Standard Modal Template
```typescript
// Template for consistent modal implementation
export function StandardModal({ 
  title, 
  children, 
  onConfirm, 
  onCancel,
  isConfirming = false 
}) {
  return (
    <Dialog>
      <DialogContent className="modal-content">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">
            {isConfirming ? `Confirm ${title}` : title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="modal-body">
          {children}
        </div>
        
        <DialogFooter className="modal-footer">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            {isConfirming ? 'Confirm' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Responsive Card Grid Template
```typescript
// Template for responsive card layouts
export function CardGrid({ 
  children, 
  cols = "1 md:2 lg:3",
  gap = "6" 
}) {
  return (
    <div className={`grid grid-cols-${cols} gap-${gap}`}>
      {children}
    </div>
  );
}

// Usage
<CardGrid cols="1 sm:2 lg:3" gap="4">
  {items.map(item => (
    <Card key={item.id} className="card-hover">
      {/* Card content */}
    </Card>
  ))}
</CardGrid>
```

### 3. Form Field Template
```typescript
// Template for consistent form fields
export function StandardFormField({ 
  name, 
  label, 
  type = "text", 
  required = false,
  description,
  placeholder 
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input 
              type={type}
              placeholder={placeholder}
              {...field} 
            />
          </FormControl>
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

### 4. Loading State Template
```typescript
// Template for consistent loading states
export function LoadingState({ 
  type = "skeleton", 
  rows = 3,
  className 
}) {
  if (type === "skeleton") {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
```

## Anti-Patterns & Common Mistakes

### ❌ Design Anti-Patterns
1. **Inconsistent Spacing** - Not using Tailwind's spacing scale
2. **Custom Colors** - Bypassing the design token system
3. **Hard-coded Breakpoints** - Not using responsive utilities
4. **Missing Focus States** - Poor keyboard navigation

### ❌ Component Anti-Patterns
```typescript
// ❌ Don't: Inline styles bypassing design system
<div style={{ color: '#ff0000', marginTop: '15px' }}>
  Error message
</div>

// ✅ Do: Use design tokens and utility classes
<div className="text-destructive mt-4">
  Error message
</div>

// ❌ Don't: Non-responsive layouts
<div className="grid grid-cols-3">
  {/* Always 3 columns, breaks on mobile */}
</div>

// ✅ Do: Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>

// ❌ Don't: Missing accessibility attributes
<button onClick={handleClick}>×</button>

// ✅ Do: Include proper accessibility
<button 
  onClick={handleClick}
  aria-label="Close dialog"
  className="focus-visible:outline-none focus-visible:ring-2"
>
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</button>
```

### ❌ Form Anti-Patterns
```typescript
// ❌ Don't: Manual form validation without error display
const [errors, setErrors] = useState({});

// ✅ Do: Use React Hook Form with integrated validation
const form = useForm({
  resolver: zodResolver(schema),
});
```

## Architecture Issues Found

### 🚨 Critical Issues

1. **Multiple Button Implementations**
   - **Files:** `ui/button.tsx`, `form/Button.tsx`, `ui/sample-button.tsx`
   - **Issue:** Three different button components with overlapping functionality
   - **Impact:** Inconsistent styling and behavior
   - **Solution:** Consolidate to single button component

2. **Inconsistent Component Import Paths**
   ```typescript
   // Found inconsistent imports:
   import { Button } from "@/components/ui/button";     // Some files
   import { Button } from "@/components/form/Button";   // Other files
   ```
   - **Impact:** Component version inconsistency
   - **Solution:** Standardize on single button component

### ⚠️ Medium Priority Issues

1. **Missing Component Documentation**
   - **Issue:** No storybook or component documentation
   - **Impact:** Difficult for developers to know which components to use
   - **Solution:** Add component documentation and usage examples

2. **Inconsistent Modal Sizes**
   - **Pattern:** Some modals use `max-w-lg`, others use custom sizes
   - **Solution:** Standardize modal size variants

3. **Theme Switching Implementation**
   - **Location:** `theme-provider.tsx` only 8 lines
   - **Issue:** Minimal theme switching implementation
   - **Enhancement:** Add system theme detection and persistence

### ℹ️ Low Priority Improvements

1. **Animation Library Integration** - Consider Framer Motion for complex animations
2. **Component Testing** - Add visual regression testing
3. **Design Tokens Export** - Export tokens for design tools
4. **Performance Optimization** - Lazy load heavy components

## Performance & Optimization

### Current Optimizations ✅
1. **CSS-in-JS Avoidance:** Using Tailwind for performance
2. **Responsive Images:** Using Next.js Image optimization
3. **Component Splitting:** Atomic design structure
4. **Animation Performance:** CSS transforms over layout properties

### Animation Performance ✅
```css
/* Hardware accelerated animations */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  will-change: transform;
}

/* Efficient keyframe animations */
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

## Accessibility Standards

### Current Implementation ✅
1. **Keyboard Navigation:** Focus management with focus-visible
2. **Screen Readers:** ARIA labels and semantic HTML
3. **Color Contrast:** Design tokens ensure accessible contrast ratios
4. **Form Accessibility:** Proper labeling and error messaging

### Accessibility Patterns ✅
```typescript
// Form accessibility from form.tsx
aria-describedby={
  !error 
    ? formDescriptionId 
    : `${formDescriptionId} ${formMessageId}`
}
aria-invalid={!!error}

// Dialog accessibility from dialog.tsx
<DialogPrimitive.Close className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>
```

## Testing Patterns

### Component Testing Template
```typescript
// Template for component testing
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-destructive');
  });
  
  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Visual Regression Testing
```typescript
// Template for visual testing with Storybook
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export const AllVariants = () => (
  <div className="space-x-4">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
  </div>
);
```

## Migration & Upgrade Strategies

### Component Consolidation Plan
1. **Audit Current Components** - Identify duplicate implementations
2. **Create Unified Components** - Merge functionality from multiple versions
3. **Update Import Paths** - Standardize import statements
4. **Add Deprecation Warnings** - Gradual migration path
5. **Remove Legacy Components** - Clean up after migration

### Design System Evolution
1. **Token Standardization** - Ensure all components use design tokens
2. **Component Documentation** - Add Storybook stories
3. **Accessibility Audit** - Comprehensive accessibility review
4. **Performance Review** - Component bundle size analysis

## Changelog

### v1.0.0 - Current Implementation
- ✅ Comprehensive UI component library (40+ components)
- ✅ Design token system with dark/light modes
- ✅ Responsive design patterns with mobile-first approach
- ✅ Form validation with React Hook Form integration
- ✅ Modal patterns with two-step confirmation flows
- ✅ Animation system with micro-interactions
- ✅ Accessibility implementation with ARIA support
- ⚠️ Multiple button component implementations (needs consolidation)
- ⚠️ Inconsistent component import paths (needs standardization)
- ⚠️ Missing component documentation (needs Storybook)

### Next Version (Planned)
- 🔄 Consolidate duplicate component implementations
- 🔄 Standardize component import paths and usage
- 🔄 Add comprehensive component documentation
- 🔄 Enhance theme switching implementation
- 🔄 Add visual regression testing
- 🔄 Performance optimization for large component trees 