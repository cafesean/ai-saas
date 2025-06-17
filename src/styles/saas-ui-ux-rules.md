# SaaS UI/UX Standards and Patterns

You are an expert UI/UX developer specializing in SaaS applications. Follow these standards for consistent, professional user experiences based on our established design system.

## Page Layout Patterns

### Full-Screen Editor Layout
Use this pattern for complex editing interfaces (like decisioning tables, lookup tables):

```tsx
import { pageStyles, headerStyles, tabStyles, buttonStyles } from '@/lib/shared-styles'

function EditorPage() {
  return (
    <div className={pageStyles.container}>
      {/* Breadcrumbs with Actions */}
      <Breadcrumbs rightChildren={<ActionButtons />} />
      
      {/* Header Section */}
      <div className={headerStyles.section}>
        <div className={headerStyles.container}>
          <div className={headerStyles.layout}>
            <div>
              <h2 className={headerStyles.title}>Page Title</h2>
              <div className={headerStyles.subtitle}>Metadata • Last updated 2 hours ago</div>
            </div>
            <div className={headerStyles.actions}>
              <StatusToggle />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className={pageStyles.main}>
        <Tabs>
          <TabsList className={tabStyles.list}>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className={tabStyles.content}>
            {/* Editor content */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
```

**When to use:**
- Complex data editing interfaces
- Multi-tab workflows
- When users need context about the item being edited
- Forms that require significant screen real estate

### Minimal Info Headers
For editor interfaces, keep basic information compact and non-intrusive:

```tsx
function MinimalInfoHeader({ variables, itemCount, lastUpdated }) {
  return (
    <div className="border-b bg-muted/30 px-6 py-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="font-medium">Input:</span> {variables.input1?.name}
            {variables.input2 && <>, {variables.input2.name}</>}
          </div>
          <div>
            <span className="font-medium">Output:</span> {variables.output?.name}
          </div>
        </div>
        <div className="text-muted-foreground">
          {itemCount} items • Updated {lastUpdated}
        </div>
      </div>
    </div>
  )
}
```

**When to use:**
- Above main editor content
- When variable information is contextual but not primary focus
- To save vertical space for main content

## Button Hierarchy & State Management

### Save Button States
Implement smart save button behavior:

```tsx
function SaveButton({ hasChanges, isSaving, onSave }) {
  return (
    <Button 
      onClick={onSave}
      disabled={!hasChanges || isSaving}
      className={cn(
        buttonStyles.iconWithMargin,
        hasChanges ? "bg-primary" : "bg-muted"
      )}
    >
      <Save className={buttonStyles.icon} />
      {isSaving ? "Saving..." : "Save Changes"}
    </Button>
  )
}
```

**Rules:**
- Only active when form has changes
- Show loading state during save
- Provide visual feedback for unsaved changes
- Alert user when leaving with unsaved changes

### Action Button Placement
```tsx
function ActionButtons() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className={buttonStyles.iconWithMargin} />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Secondary actions */}
        </DropdownMenuContent>
      </DropdownMenu>
      <SaveButton />
    </>
  )
}
```

**Hierarchy:**
1. **Primary Action** (Save, Create) - Prominent button
2. **Secondary Actions** (Export, Import) - Dropdown menu
3. **Tertiary Actions** (Help, Settings) - Icon buttons

## Tab Navigation Patterns

### Standard Tab Structure
```tsx
function TabNavigation() {
  return (
    <Tabs defaultValue="editor">
      <TabsList className={tabStyles.list}>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="versions">Versions</TabsTrigger>
        <TabsTrigger value="history">Test History</TabsTrigger>
      </TabsList>
      <TabsContent value="editor" className={tabStyles.content}>
        {/* Main editing interface */}
      </TabsContent>
    </Tabs>
  )
}
```

**Tab Types:**
- **Editor**: Primary content editing
- **Versions**: Version history and management
- **History**: Activity logs, test results
- **Settings**: Configuration (when necessary)

**When to use tabs:**
- Multiple related views of the same data
- Complex interfaces that need organization
- When content sections are too large for single page

## Status & State Indicators

### Status Toggle Pattern
```tsx
function StatusToggle({ status, onToggle, isLoading }) {
  return (
    <div className={headerStyles.statusToggle}>
      <Label htmlFor="status-toggle">Active</Label>
      <Switch
        id="status-toggle"
        checked={status === "published"}
        onCheckedChange={onToggle}
        disabled={isLoading}
      />
    </div>
  )
}
```

### Status Badge Colors
Use `getStatusColor()` utility for consistency:
```tsx
function StatusBadge({ status }) {
  return (
    <Badge className={getStatusColor(status)}>
      {status}
    </Badge>
  )
}
```

## Form Layout Patterns

### Compact Variable Display
For editor interfaces where variables are contextual:

```tsx
function VariableDisplay({ inputVars, outputVar }) {
  return (
    <div className="border-b bg-muted/30 px-6 py-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Input 1</Label>
          <p className="font-medium">{inputVars.primary?.name}</p>
        </div>
        {inputVars.secondary && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Input 2</Label>
            <p className="font-medium">{inputVars.secondary.name}</p>
          </div>
        )}
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Output</Label>
          <p className="font-medium">{outputVar?.name}</p>
        </div>
      </div>
    </div>
  )
}
```

### Full-Width Editor Areas
Give maximum space to the primary editing interface:

```tsx
function EditorArea({ children }) {
  return (
    <div className="flex-1">
      <div className={tabStyles.sectionHeader}>
        <h3 className={tabStyles.sectionTitle}>Matrix Editor</h3>
        {/* Remove redundant action buttons from here */}
      </div>
      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}
```

## Loading States & Feedback

### Unsaved Changes Warning
```tsx
function useUnsavedChanges(hasChanges) {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])
}
```

### Loading States
```tsx
function LoadingState() {
  return (
    <div className={pageStyles.loadingContainer}>
      <Loader2 className={buttonStyles.spinner} />
      <span className="ml-2">Loading...</span>
    </div>
  )
}
```

## Grid & Layout Patterns

### Editor Grid Layouts
```tsx
// Two-column layout for schema/settings
<div className={gridStyles.twoColumn}>
  <ConfigPanel />
  <PreviewPanel />
</div>

// Three-column layout with sidebar
<div className={gridStyles.main}>
  <div className="lg:col-span-2">
    <MainContent />
  </div>
  <div>
    <Sidebar />
  </div>
</div>
```

## Responsive Design Rules

### Mobile-First Approach
```tsx
// Responsive tab list
<TabsList className={tabStyles.list}>
  {/* Automatically handles mobile stacking */}
</TabsList>

// Responsive header
<div className={headerStyles.layout}>
  {/* Stacks on mobile, row on desktop */}
</div>
```

### Content Padding
- Use `pageStyles.main` for consistent content padding
- Use `headerStyles.container` for header content
- Apply responsive padding automatically

## Implementation Guidelines

### 1. Start with Shared Styles
Always import and use shared styles first:
```tsx
import { 
  pageStyles, 
  headerStyles, 
  tabStyles, 
  buttonStyles,
  getStatusColor 
} from '@/lib/shared-styles'
```

### 2. Follow the Layout Hierarchy
1. Page container (`pageStyles.container`)
2. Breadcrumbs with actions
3. Header section with title and status
4. Main content with tabs
5. Tab content with proper spacing

### 3. State Management Patterns
- Track form changes for save button state
- Implement unsaved changes warnings
- Use proper loading states
- Provide immediate feedback

### 4. Content Organization
- **Minimize** non-essential info in headers
- **Maximize** space for primary content
- **Remove** redundant actions
- **Group** related functionality

### 5. Accessibility & UX
- Maintain focus management
- Provide clear visual hierarchy
- Use semantic HTML
- Test keyboard navigation
- Ensure sufficient contrast

## When to Apply These Patterns

### Use Full Editor Layout for:
- Complex data editing (decision tables, lookup tables)
- Multi-step workflows
- Interfaces requiring context about the edited item

### Use Minimal Headers for:
- Editors where variables are contextual
- When screen real estate is precious
- Content-focused interfaces

### Use Tab Navigation for:
- Related views of the same data
- Historical/versioning information
- Configuration that's separate from main content

### Avoid:
- Redundant buttons or actions
- Overly complex information hierarchies
- Save buttons that are always active
- Leaving users without unsaved changes warnings 