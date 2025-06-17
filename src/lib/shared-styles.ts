/**
 * Shared Tailwind CSS styles for consistent UX across the application
 * These styles are based on patterns found in the decisioning and lookup tables pages
 */

// Page Layout Styles
export const pageStyles = {
  // Full screen page container
  container: "flex min-h-screen w-full flex-col bg-background",
  
  // Main content area with proper spacing
  main: "flex-1 p-6 space-y-8",
  
  // Content with responsive padding
  content: "flex-1 p-4 md:p-6",
  
  // Centered loading container
  loadingContainer: "flex items-center justify-center py-12",
  
  // Error container
  errorContainer: "container mx-auto py-6",
} as const

// Header Section Styles
export const headerStyles = {
  // Header section below breadcrumbs
  section: "border-b",
  
  // Header content container
  container: "py-4 md:p-6",
  
  // Header flex layout
  layout: "flex flex-col md:flex-row md:items-center justify-between gap-4",
  
  // Title section
  titleSection: "",
  
  // Title with icon gap
  titleWithIcon: "flex items-center gap-2",
  
  // Main title
  title: "text-2xl font-bold",
  
  // Subtitle/metadata
  subtitle: "text-muted-foreground mt-1",
  
  // Actions section (right side)
  actions: "flex items-center gap-4",
  
  // Status toggle section
  statusToggle: "flex items-center gap-2",
} as const

// Breadcrumbs Styles
export const breadcrumbStyles = {
  // Action buttons in breadcrumbs
  actionButton: "variant-outline size-sm",
  
  // Back button
  backButton: "variant-outline",
  
  // Dropdown menu trigger
  dropdownTrigger: "variant-outline size-sm",
  
  // Save button
  saveButton: "",
} as const

// Tab Styles
export const tabStyles = {
  // Tab list responsive grid
  list: "grid w-full md:w-auto grid-cols-3 md:grid-cols-none md:flex",
  
  // Tab content with spacing
  content: "space-y-6 pt-4",
  
  // Tab section header
  sectionHeader: "flex justify-between items-center",
  
  // Tab section title
  sectionTitle: "text-lg font-medium",
} as const

// Card Styles
export const cardStyles = {
  // Standard card
  card: "",
  
  // Card with border
  bordered: "border rounded-md",
  
  // Details card (sidebar)
  details: "space-y-6",
  
  // Content card (main area)
  content: "lg:col-span-2 space-y-6",
} as const

// Grid Styles
export const gridStyles = {
  // Main content grid
  main: "grid grid-cols-1 lg:grid-cols-3 gap-6",
  
  // Two column grid
  twoColumn: "grid gap-6 md:grid-cols-2",
  
  // Schema panel grid
  schemaPanel: "grid gap-6 md:grid-cols-2",
} as const

// Button Styles
export const buttonStyles = {
  // Add button with icon
  add: "mr-2 h-4 w-4",
  
  // Action button with icon
  action: "mr-2 h-4 w-4",
  
  // Icon classes for consistent sizing
  icon: "h-4 w-4",
  iconWithMargin: "mr-2 h-4 w-4",
  
  // Loading spinner
  spinner: "h-8 w-8 animate-spin",
} as const

// Status Badge Styles
export const statusStyles = {
  published: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  inactive: "bg-yellow-100 text-yellow-800",
  deprecated: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
} as const

// Spacing Styles
export const spacingStyles = {
  // Vertical spacing
  sectionGap: "space-y-6",
  itemGap: "space-y-4",
  smallGap: "space-y-2",
  
  // Content padding
  contentPadding: "p-6",
  smallPadding: "p-4",
  
  // Margin utilities
  topMargin: "mt-1",
  bottomMargin: "mb-2",
} as const

// Form Styles
export const formStyles = {
  // Form field spacing
  field: "space-y-2",
  
  // Form section
  section: "space-y-4",
  
  // Form grid
  grid: "grid gap-4",
  
  // Label
  label: "text-sm font-medium",
  
  // Help text
  helpText: "text-sm text-muted-foreground mt-1",
  
  // Error text
  errorText: "text-sm text-destructive mt-1",
} as const

// Table Styles
export const tableStyles = {
  // Table container
  container: "border rounded-md",
  
  // Table wrapper for overflow
  wrapper: "overflow-x-auto",
  
  // Cell padding
  cell: "p-3",
  
  // Header cell
  headerCell: "p-3 font-medium",
} as const

// Loading Styles
export const loadingStyles = {
  // Loading spinner
  spinner: "h-8 w-8 animate-spin",
  
  // Loading text
  text: "ml-2",
  
  // Full screen loading backdrop
  backdrop: "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
} as const

// Alert Styles
export const alertStyles = {
  // Error variant
  error: "variant-destructive",
  
  // Warning variant  
  warning: "variant-warning",
  
  // Info variant
  info: "variant-default",
  
  // Success variant
  success: "variant-success",
} as const

// Utility function to get status color
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "published":
    case "active":
      return statusStyles.published
    case "draft":
    case "inactive":
      return statusStyles.draft
    case "deprecated":
      return statusStyles.deprecated
    default:
      return statusStyles.default
  }
}

// Utility function to create consistent page layout
export const createPageLayout = {
  container: pageStyles.container,
  main: pageStyles.main,
  header: {
    section: headerStyles.section,
    container: headerStyles.container,
    layout: headerStyles.layout,
  },
} as const

// Export commonly used combinations
export const commonLayouts = {
  // Full page with header
  fullPageWithHeader: `${pageStyles.container}`,
  
  // Main content area
  mainContent: `${pageStyles.main}`,
  
  // Header section
  headerSection: `${headerStyles.section} ${headerStyles.container}`,
  
  // Tab content
  tabContent: `${tabStyles.content}`,
  
  // Two column grid
  twoColumnGrid: `${gridStyles.twoColumn}`,
  
  // Card grid
  cardGrid: `${gridStyles.main}`,
} as const 