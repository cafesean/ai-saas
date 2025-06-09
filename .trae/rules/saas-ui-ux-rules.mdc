---
description: 
globs: 
---
# SaaS UI/UX Standards and Patterns

You are an expert UI/UX developer specializing in SaaS applications. Follow these standards for consistent, professional user experiences.

## Modal Patterns
- Use two-step confirmation for important actions (create/edit/delete)
- First step: Show form or confirmation message
- Second step: Show summary and confirm
- Include clear titles indicating the current step
- Provide back/cancel options at each step
- Use consistent modal sizes and padding

Example modal structure:
```tsx
<Dialog>
  <DialogContent className="modal-content">
    <DialogHeader className="modal-header">
      <DialogTitle className="modal-title">
        {isConfirming ? 'Confirm Details' : 'Add New Item'}
      </DialogTitle>
    </DialogHeader>
    {isConfirming ? (
      <ConfirmationStep />
    ) : (
      <FormStep />
    )}
    <DialogFooter className="modal-footer">
      <BackButton />
      <ConfirmButton />
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Button Hierarchy
- Primary: Main actions (Create, Save, Confirm)
- Secondary: Alternative actions (Cancel, Back)
- Danger: Destructive actions (Delete)
- Use consistent sizing:
  ```css
  .modal-button {
    @apply h-7 px-2 text-xs font-bold;
  }
  ```

## Form Layouts
- Single column for mobile
- Multi-column for desktop where appropriate
- Consistent spacing between fields
- Clear labels and error messages
- Required field indicators
- Validation feedback on blur
- Group related fields

Example form structure:
```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Name" required error={getFieldError('name')} />
    <Input label="Code" required error={getFieldError('code')} />
  </div>
</form>
```

## Loading States
- Use skeletons for initial loading
- Show loading indicators for actions
- Maintain layout during loading
- Disable interactions while loading
- Provide feedback for long operations

Example loading state:
```tsx
{isLoading ? (
  <div className="animate-pulse space-y-2">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-12 bg-gray-200 rounded w-full"></div>
  </div>
) : (
  <Content />
)}
```

## Typography
- Use consistent font sizes:
  - Headers: text-2xl
  - Subheaders: text-xl
  - Body: text-sm
  - Labels: text-xs
- Maintain consistent line heights
- Use appropriate font weights
- Ensure sufficient contrast

## Color System
- Use semantic colors:
  ```css
  :root {
    --primary: 221.2 83.2% 53.3%;
    --secondary: 210 40% 96.1%;
    --destructive: 0 84.2% 60.2%;
    --muted: 210 40% 96.1%;
  }
  ```
- Consistent hover/active states
- Accessible contrast ratios
- Clear visual hierarchy

## Mobile Responsiveness
- Mobile-first approach
- Responsive paddings and margins
- Stack elements on smaller screens
- Adjust font sizes for readability
- Handle touch interactions
- Consider viewport limitations

## Error Handling
- Clear error messages
- Consistent error styling
- Form-level and field-level errors
- Non-intrusive notifications
- Recovery options
- Maintain context after errors

## Best Practices
1. Consistent spacing using Tailwind's spacing scale
2. Predictable interaction patterns
3. Immediate feedback for user actions
4. Accessible focus management
5. Clear visual hierarchy
6. Progressive enhancement
7. Performance optimization

## Implementation Methodology
1. Start with mobile layout
2. Add responsive breakpoints
3. Implement loading states
4. Add error handling
5. Enhance with animations
6. Test across devices
7. Validate accessibility

## Component Organization
- Maintain a UI component library
- Use composition for complex components
- Share styles through CSS classes
- Keep components focused and reusable
- Document component APIs
- Include usage examples 