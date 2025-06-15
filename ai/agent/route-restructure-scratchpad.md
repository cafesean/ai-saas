# Route Restructuring Task

## Task Overview
Restructure routes by moving directories from app/(admin) to different route groups:

### Moves Required:
1. **To app/(app):**
   - models → app/(app)/models
   - rules → app/(app)/rules
   - workflows → app/(app)/workflows
   - knowledge-bases → app/(app)/knowledge-bases
   - widgets → app/(app)/widgets

2. **To app/(backend):**
   - permissions → app/(backend)/permissions

3. **To app/(demo):**
   - levels → app/(demo)/levels
   - templates → app/(demo)/templates

## Steps to Complete:
[ ] 1. Examine current navigation components and route references
[ ] 2. Create missing route group directories if needed
[ ] 3. Move directories to new locations
[ ] 4. Update navigation components with new routes
[ ] 5. Update any internal links and references
[ ] 6. Update middleware/auth configurations if needed
[ ] 7. Test that all routes work properly

## Notes:
- Need to preserve all component functionality
- Ensure navigation updates reflect new structure
- Check for any hardcoded paths that need updating
- Verify auth/middleware still protects routes correctly

## Findings:
- app/(app) directory exists but is empty
- app/(backend) and app/(demo) directories don't exist yet
- Need to create missing route group directories
- Found routes constants file: src/constants/routes.ts
- Found main navigation in: src/components/Sidebar/Sidebar.tsx
- Found test files with hardcoded paths that need updating

## Progress:
[X] 1. Examine current navigation components and route references
[X] 2. Create missing route group directories if needed
[X] 3. Move directories to new locations
[X] 4. Update navigation components with new routes
[ ] 5. Update any internal links and references
[ ] 6. Update middleware/auth configurations if needed
[ ] 7. Test that all routes work properly

## Current Status:
- Moved directories successfully
- Created layout files for (app), (backend), (demo)
- Updated routes constants and Sidebar navigation
- Fixed knowledge-bases component import
- Updated route references in moved directories
- **COMPLETED**: Moved api-docs, content-repo, decisioning to (app)
- Updated all route references and navigation links 