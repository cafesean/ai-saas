# Critical Learnings for Future Development

## 🔥 **Most Likely to Recur**

### 1. **Schema Mismatch Between Frontend & Backend**
**Problem:** Form sends fields that don't exist in API schema (e.g., `organizationId` in user update)
**Learning:** Always verify frontend form data matches backend schema exactly
**Prevention:** 
- Check API schema before adding new form fields
- Exclude UI-only fields from API calls
- Use TypeScript types to catch mismatches early

### 2. **React Hook Form Value/OnChange Conflicts**
**Problem:** Custom `value`/`onChange` handlers prevent users from typing in form fields
**Learning:** Let react-hook-form manage field state; avoid manual overrides
**Prevention:**
- Use `register()` for standard fields
- Use `setValue()` for programmatic updates only
- Don't mix controlled/uncontrolled patterns

### 3. **Component Prop Interface Mismatches**
**Problem:** Calling components with wrong prop names (`onClose` vs `onOpenChange`)
**Learning:** Component interfaces must match exactly between definition and usage
**Prevention:**
- Use TypeScript strictly
- Check component props when refactoring
- Use consistent naming patterns across similar components

### 4. **Foreign Key Constraint Errors with Mock Data**
**Problem:** Using hardcoded IDs that don't exist in database
**Learning:** Always use real database data or ensure test data exists
**Prevention:**
- Create proper seed data for development
- Use API calls to fetch real options for dropdowns
- Validate foreign key relationships before insertion

### 5. **Dynamic Form Validation Requirements**
**Problem:** Password required in create mode but optional in edit mode
**Learning:** Form validation often needs to be dynamic based on component state
**Prevention:**
- Create validation schemas that accept state parameters
- Handle different modes (create/edit) explicitly
- Test validation in all component states

## 💡 **Quick Reference Rules**

1. **Always match frontend form fields to backend schema**
2. **Let react-hook-form manage field state naturally**
3. **Verify component prop interfaces match exactly**
4. **Use real database data, not mock hardcoded values**
5. **Make form validation dynamic when business logic requires it**

These patterns will likely appear in every form-heavy feature and should be checked systematically.